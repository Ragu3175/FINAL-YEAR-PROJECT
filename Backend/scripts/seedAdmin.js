require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        // Delete existing admin if any to reset
        await User.deleteOne({ email: 'admin@safedrive.com' });

        const admin = new User({
            name: 'Admin',
            email: 'admin@safedrive.com',
            password: 'Admin123',
            role: 'ADMIN'
        });
        await admin.save();
        console.log('Admin user created/reset successfully');
        process.exit();
    })
    .catch(err => console.error(err));
