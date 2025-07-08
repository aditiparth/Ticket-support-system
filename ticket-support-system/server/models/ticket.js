 
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technical Issue', 'Billing', 'Feature Request', 'Authentication', 'Other']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ticketId: {
    type: String,
    unique: true
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Generate ticket ID before saving
ticketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const count = await this.constructor.countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('ticket', ticketSchema);