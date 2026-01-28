const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ==================== CREATE EXPRESS APP ====================
const app = express();

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(cors());

// ==================== DATABASE CONNECTION ====================
mongoose.connect('mongodb://localhost:27017/renteasy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Connection Error:', err));

// ==================== SCHEMAS ====================
// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true, enum: ['furniture', 'appliance'] },
  subcategory: { type: String, required: true },
  monthlyRent: { type: Number, required: true },
  securityDeposit: { type: Number, required: true },
  tenureOptions: { type: [Number], default: [3, 6, 12] },
  images: { type: [String], default: [] },
  specifications: { type: Map, of: String, default: {} },
  availability: { type: Boolean, default: true },
  stock: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    tenure: { type: Number, required: true },
    monthlyRent: { type: Number, required: true },
    securityDeposit: { type: Number, required: true }
  }],
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  deliveryDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalAmount: { type: Number, required: true },
  totalDeposit: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ==================== MODEL METHODS ====================
// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ==================== CREATE MODELS ====================
const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// ==================== MIDDLEWARE FUNCTIONS ====================
// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// ==================== ROUTES ====================

// ========== PUBLIC ROUTES ==========
// Home route
app.get('/', (req, res) => {
  res.json({ message: '🚀 RentEase API is running!' });
});

// ========== AUTH ROUTES ==========
// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '30d' });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '30d' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
app.get('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== PRODUCT ROUTES ==========
// Get all products (public)
app.get('/api/products', async (req, res) => {
  try {
    const { category, subcategory, search, page = 1, limit = 12 } = req.query;
    
    // Build query
    const query = { availability: true };
    
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (search) query.name = { $regex: search, $options: 'i' };
    
    // Execute query
    const products = await Product.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product categories
app.get('/api/products/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const subcategories = await Product.distinct('subcategory');
    
    res.json({
      categories: categories.length ? categories : ['furniture', 'appliance'],
      subcategories: subcategories.length ? subcategories : ['bed', 'sofa', 'table', 'fridge', 'tv', 'washing-machine']
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.json({
      categories: ['furniture', 'appliance'],
      subcategories: ['bed', 'sofa', 'table', 'fridge', 'tv', 'washing-machine']
    });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== ADMIN PRODUCT ROUTES ==========
// Create product (admin only)
app.post('/api/admin/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      monthlyRent,
      securityDeposit,
      tenureOptions = [3, 6, 12],
      images = [],
      specifications = {},
      stock = 1,
      availability = true
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !subcategory || !monthlyRent || !securityDeposit) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      category,
      subcategory,
      monthlyRent,
      securityDeposit,
      tenureOptions,
      images,
      specifications,
      stock,
      availability
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (admin only)
app.put('/api/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product
    Object.keys(req.body).forEach(key => {
      product[key] = req.body[key];
    });

    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (admin only)
app.delete('/api/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products for admin (including unavailable)
app.get('/api/admin/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== ORDER ROUTES ==========
// Create order
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { products, deliveryAddress, deliveryDate } = req.body;
    
    if (!products || !products.length) {
      return res.status(400).json({ message: 'No products in order' });
    }
    
    let totalAmount = 0;
    let totalDeposit = 0;
    const orderProducts = [];
    
    // Calculate totals and validate products
    for (const item of products) {
      const product = await Product.findById(item.product);
      
      if (!product || !product.availability) {
        return res.status(400).json({ message: `Product ${product?.name || item.product} is not available` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      
      // Update product stock
      product.stock -= item.quantity;
      if (product.stock <= 0) {
        product.availability = false;
      }
      await product.save();
      
      // Calculate totals
      const rentTotal = product.monthlyRent * item.tenure * item.quantity;
      const depositTotal = product.securityDeposit * item.quantity;
      
      totalAmount += rentTotal;
      totalDeposit += depositTotal;
      
      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        tenure: item.tenure,
        monthlyRent: product.monthlyRent,
        securityDeposit: product.securityDeposit
      });
    }
    
    // Create order
    const order = await Order.create({
      user: req.user._id,
      products: orderProducts,
      deliveryAddress,
      deliveryDate,
      totalAmount,
      totalDeposit,
      status: 'pending'
    });
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('products.product', 'name images')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.product', 'name images category specifications');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel order
app.put('/api/orders/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
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
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== ADMIN DASHBOARD ROUTES ==========
// Get admin dashboard stats
app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      activeOrders,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'active' }),
      Order.aggregate([
        { $match: { status: { $in: ['active', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);
    
    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        activeOrders,
        revenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (admin)
app.get('/api/admin/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('products.product', 'name')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Admin orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== SEED DATABASE ==========
// Seed database with sample data
app.post('/api/seed', async (req, res) => {
  try {
    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({ email: { $in: ['admin@renteasy.com', 'user@test.com'] } });
    
    // Sample products
    const sampleProducts = [
      {
        name: 'Queen Size Bed with Memory Foam Mattress',
        description: 'Premium queen size bed with orthopedic memory foam mattress for ultimate comfort and support.',
        category: 'furniture',
        subcategory: 'bed',
        monthlyRent: 1200,
        securityDeposit: 5000,
        stock: 5,
        images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        specifications: {
          'Size': 'Queen (60" x 80")',
          'Material': 'Solid Wood with Memory Foam',
          'Color': 'Dark Brown'
        }
      },
      {
        name: '3-Seater Fabric Sofa Set',
        description: 'Modern 3-seater sofa set with soft fabric upholstery and comfortable cushions.',
        category: 'furniture',
        subcategory: 'sofa',
        monthlyRent: 1500,
        securityDeposit: 8000,
        stock: 3,
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        specifications: {
          'Seating Capacity': '3 Persons',
          'Material': 'Premium Fabric',
          'Color': 'Charcoal Gray'
        }
      },
      {
        name: '200L Single Door Refrigerator',
        description: 'Energy-efficient refrigerator with separate freezer compartment.',
        category: 'appliance',
        subcategory: 'fridge',
        monthlyRent: 1000,
        securityDeposit: 6000,
        stock: 4,
        images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        specifications: {
          'Capacity': '200 Liters',
          'Type': 'Single Door',
          'Energy Rating': '3 Star'
        }
      },
      {
        name: '32-inch HD Smart TV',
        description: 'Smart TV with built-in streaming apps like Netflix, Prime Video, and YouTube.',
        category: 'appliance',
        subcategory: 'tv',
        monthlyRent: 800,
        securityDeposit: 4000,
        stock: 6,
        images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        specifications: {
          'Screen Size': '32 inches',
          'Resolution': 'HD Ready (1366x768)',
          'Smart Features': 'WiFi, Netflix, Prime Video'
        }
      }
    ];
    
    // Insert products
    await Product.insertMany(sampleProducts);
    
    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@renteasy.com',
      password: 'admin123',
      phone: '9876543210',
      role: 'admin'
    });
    
    // Create test user
    await User.create({
      name: 'Test User',
      email: 'user@test.com',
      password: 'user123',
      phone: '9876543211'
    });
    
    res.json({ 
      message: '✅ Database seeded successfully!',
      products: sampleProducts.length,
      admin: 'admin@renteasy.com / admin123',
      user: 'user@test.com / user123'
    });
    
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Server error during seeding' });
  }
});

// ========== 404 HANDLER ==========
// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   Home: GET http://localhost:${PORT}/`);
  console.log(`   Products: GET http://localhost:${PORT}/api/products`);
  console.log(`   Categories: GET http://localhost:${PORT}/api/products/categories`);
  console.log(`   Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   Admin Create Product: POST http://localhost:${PORT}/api/admin/products`);
  console.log(`   Admin Products: GET http://localhost:${PORT}/api/admin/products`);
  console.log(`   Orders: GET http://localhost:${PORT}/api/orders`);
  console.log(`   Seed DB: POST http://localhost:${PORT}/api/seed`);
  console.log(`\n👤 Test Credentials:`);
  console.log(`   Admin: admin@renteasy.com / admin123`);
  console.log(`   User: user@test.com / user123`);
});