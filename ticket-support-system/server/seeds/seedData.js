const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Ticket.deleteMany({});

    // Create default admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      name: 'Admin User',
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created');

    // Create sample tickets
    const sampleTickets = [
      {
        title: 'Unable to login to account',
        description: 'User cannot access their account after password reset',
        category: 'Authentication',
        priority: 'high',
        status: 'open',
        createdBy: adminUser._id
      },
      {
        title: 'Payment processing error',
        description: 'Credit card payment fails during checkout',
        category: 'Billing',
        priority: 'medium',
        status: 'in-progress',
        createdBy: adminUser._id
      },
      {
        title: 'Feature request: Dark mode',
        description: 'User requests dark mode option in settings',
        category: 'Feature Request',
        priority: 'low',
        status: 'resolved',
        createdBy: adminUser._id
      }
    ];

    await Ticket.insertMany(sampleTickets);
    console.log('✅ Sample tickets created');

    console.log('🎉 Database seeded successfully!');
    console.log('Default login credentials:');
    console.log('Username: admin');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData(); 
