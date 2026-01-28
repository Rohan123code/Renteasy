const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { products, deliveryAddress, deliveryDate } = req.body;
    
    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No products in order' });
    }
    
    let totalAmount = 0;
    let totalDeposit = 0;
    
    // Process each product
    const orderProducts = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.product);
        
        if (!product || !product.availability || product.stock < item.quantity) {
          throw new Error(`Product ${product?.name || item.product} is not available`);
        }
        
        // Update product stock
        product.stock -= item.quantity;
        if (product.stock <= 0) {
          product.availability = false;
        }
        await product.save();
        
        totalAmount += product.monthlyRent * item.quantity * item.tenure;
        totalDeposit += product.securityDeposit * item.quantity;
        
        return {
          product: product._id,
          quantity: item.quantity,
          tenure: item.tenure,
          monthlyRent: product.monthlyRent,
          securityDeposit: product.securityDeposit,
        };
      })
    );
    
    const order = new Order({
      user: req.user.id,
      products: orderProducts,
      deliveryAddress,
      deliveryDate,
      totalAmount,
      totalDeposit,
      status: 'pending',
    });
    
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('products.product', 'name images')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.product', 'name images category specifications')
      .populate('user', 'name email phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only admin or vendor can update status
    if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    order.status = status;
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Only pending orders can be cancelled
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }
    
    // Return stock to products
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        product.availability = true;
        await product.save();
      }
    }
    
    order.status = 'cancelled';
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};