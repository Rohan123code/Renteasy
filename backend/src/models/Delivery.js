const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  type: {
    type: String,
    enum: ['delivery', 'pickup'],
    required: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-transit', 'delivered', 'picked-up', 'cancelled'],
    default: 'scheduled',
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  notes: String,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Delivery', deliverySchema);