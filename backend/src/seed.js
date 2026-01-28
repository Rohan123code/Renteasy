const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const sampleProducts = [
  {
    name: 'Queen Size Bed with Mattress',
    description: 'Comfortable queen size bed with memory foam mattress. Perfect for couples or individuals who need extra space.',
    category: 'furniture',
    subcategory: 'bed',
    monthlyRent: 1200,
    securityDeposit: 5000,
    tenureOptions: [3, 6, 12],
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
    specifications: {
      'Size': 'Queen (60" x 80")',
      'Material': 'Wood with foam mattress',
      'Color': 'Brown',
      'Weight': '45 kg'
    },
    stock: 5,
    availability: true
  },
  {
    name: '3-Seater Sofa Set',
    description: 'Modern 3-seater sofa set with comfortable cushions. Adds elegance to your living room.',
    category: 'furniture',
    subcategory: 'sofa',
    monthlyRent: 1500,
    securityDeposit: 8000,
    tenureOptions: [3, 6, 12],
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
    specifications: {
      'Seating Capacity': '3 Persons',
      'Material': 'Fabric',
      'Color': 'Gray',
      'Dimensions': '180cm x 80cm x 90cm'
    },
    stock: 3,
    availability: true
  },
  {
    name: '200L Refrigerator',
    description: 'Energy efficient 200L refrigerator with separate freezer compartment.',
    category: 'appliance',
    subcategory: 'fridge',
    monthlyRent: 1000,
    securityDeposit: 6000,
    tenureOptions: [3, 6, 12],
    images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
    specifications: {
      'Capacity': '200 Liters',
      'Type': 'Single Door',
      'Energy Rating': '3 Star',
      'Color': 'Silver'
    },
    stock: 4,
    availability: true
  },
  {
    name: '32-inch Smart TV',
    description: 'HD Smart TV with built-in streaming apps and voice control.',
    category: 'appliance',
    subcategory: 'tv',
    monthlyRent: 800,
    securityDeposit: 4000,
    tenureOptions: [3, 6, 12],
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
    specifications: {
      'Screen Size': '32 inches',
      'Resolution': 'HD Ready (1366x768)',
      'Smart Features': 'Yes',
      'Connectivity': 'WiFi, HDMI, USB'
    },
    stock: 6,
    availability: true
  },
  {
    name: 'Study Table with Chair',
    description: 'Ergonomic study table with comfortable chair. Perfect for students and professionals.',
    category: 'furniture',
    subcategory: 'table',
    monthlyRent: 600,
    securityDeposit: 3000,
    tenureOptions: [3, 6, 12],
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
    specifications: {
      'Table Dimensions': '120cm x 60cm x 75cm',
      'Material': 'Wood and Metal',
      'Color': 'White and Black',
      'Includes': 'Table and Chair'
    },
    stock: 8,
    availability: true
  },
  {
    name: '7kg Washing Machine',
    description: 'Fully automatic washing machine with multiple wash programs.',
    category: 'appliance',
    subcategory: 'washing-machine',
    monthlyRent: 900,
    securityDeposit: 5000,
    tenureOptions: [3, 6, 12],
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
    specifications: {
      'Capacity': '7 kg',
      'Type': 'Front Load',
      'Energy Rating': '4 Star',
      'Wash Programs': '10'
    },
    stock: 3,
    availability: true
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/renteasy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log('Added sample products to database');

    // Create a test admin user
    const adminUser = await User.findOne({ email: 'admin@renteasy.com' });
    if (!adminUser) {
      await User.create({
        name: 'Admin User',
        email: 'admin@renteasy.com',
        password: 'admin123',
        phone: '9876543210',
        role: 'admin'
      });
      console.log('Created admin user: admin@renteasy.com / admin123');
    }

    // Create a test regular user
    const testUser = await User.findOne({ email: 'user@renteasy.com' });
    if (!testUser) {
      await User.create({
        name: 'Test User',
        email: 'user@renteasy.com',
        password: 'user123',
        phone: '9876543211',
        role: 'user'
      });
      console.log('Created test user: user@renteasy.com / user123');
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();