const express = require('express');
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tickets
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, category, search } = req.query;
    
    let query = {};
    
    // Build query based on filters
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (category && category !== 'all') query.category = category;
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name username')
      .populate('assignedTo', 'name username')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single ticket
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name username')
      .populate('assignedTo', 'name username')
      .populate('comments.user', 'name username');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create ticket
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const ticket = new Ticket({
      title,
      description,
      category,
      priority,
      createdBy: req.user._id
    });

    await ticket.save();
    await ticket.populate('createdBy', 'name username');

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update ticket
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, category, priority, status, assignedTo } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Update fields
    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (category) ticket.category = category;
    if (priority) ticket.priority = priority;
    if (status) ticket.status = status;
    if (assignedTo) ticket.assignedTo = assignedTo;

    await ticket.save();
    await ticket.populate('createdBy', 'name username');
    await ticket.populate('assignedTo', 'name username');

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete ticket
router.delete('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await ticket.deleteOne();
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment to ticket
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.comments.push({
      user: req.user._id,
      message
    });

    await ticket.save();
    await ticket.populate('comments.user', 'name username');

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 
