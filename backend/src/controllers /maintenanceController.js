const Maintenance = require('../models/Maintenance');
const Order = require('../models/Order');

// @desc    Create maintenance request
// @route   POST /api/maintenance
// @access  Private
exports.createMaintenanceRequest = async (req, res) => {
  try {
    const { orderId, productId, issueType, description, priority } = req.body;
    
    // Verify the order belongs to the user
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
      status: 'active',
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found or not active' });
    }
    
    // Check if product is in the order
    const productInOrder = order.products.find(
      (item) => item.product.toString() === productId
    );
    
    if (!productInOrder) {
      return res.status(400).json({ message: 'Product not found in your order' });
    }
    
    const maintenance = new Maintenance({
      user: req.user.id,
      order: orderId,
      product: productId,
      issueType,
      description,
      priority: priority || 'medium',
    });
    
    const createdRequest = await maintenance.save();
    res.status(201).json(createdRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user maintenance requests
// @route   GET /api/maintenance
// @access  Private
exports.getUserMaintenanceRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find({ user: req.user.id })
      .populate('product', 'name images')
      .populate('order', 'status')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all maintenance requests (admin/vendor)
// @route   GET /api/maintenance/all
// @access  Private/Admin/Vendor
exports.getAllMaintenanceRequests = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    let query = {};
    
    // Vendors can only see requests for their products
    if (req.user.role === 'vendor') {
      // This would need product-vendor relationship implementation
      // For now, return all
    }
    
    const requests = await Maintenance.find(query)
      .populate('user', 'name email phone')
      .populate('product', 'name')
      .populate('order', 'status')
      .sort({ priority: -1, createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update maintenance request status
// @route   PUT /api/maintenance/:id
// @access  Private/Admin/Vendor
exports.updateMaintenanceRequest = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { status, resolutionNotes, assignedTo } = req.body;
    const request = await Maintenance.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (status) request.status = status;
    if (resolutionNotes) request.resolutionNotes = resolutionNotes;
    if (assignedTo) request.assignedTo = assignedTo;
    
    request.updatedAt = Date.now();
    
    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};