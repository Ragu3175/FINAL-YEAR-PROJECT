const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './Backend/.env') });
const User = require('./Backend/src/models/User');

async function listUsers() {
    try {
        const mongoUri = process.env.MONGO_URI;
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const users = await User.find().select('name email role');
        console.log('\n--- Registered Users ---');
        users.forEach(u => {
            console.log(`Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
        });

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error.message);
        mongoose.connection.close();
    }
}

listUsers();
