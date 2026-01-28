const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['furniture', 'appliance'],
  },
  subcategory: {
    type: String,
    required: [true, 'Please add a subcategory'],
  },
  monthlyRent: {
    type: Number,
    required: [true, 'Please add monthly rent'],
  },
  securityDeposit: {
    type: Number,
    required: [true, 'Please add security deposit'],
  },
  tenureOptions: {
    type: [Number],
    required: true,
    default: [3, 6, 12],
  },
  images: {
    type: [String],
    default: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
  },
  specifications: {
    type: Map,
    of: String,
    default: {},
  },
  availability: {
    type: Boolean,
    default: true,
  },
  stock: {
    type: Number,
    default: 1,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);