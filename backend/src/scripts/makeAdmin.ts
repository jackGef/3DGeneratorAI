/**
 * Script to make a user an admin
 * Usage: npx ts-node src/scripts/makeAdmin.ts <email>
 */

import 'dotenv/config';
import { connectDB } from '../services/db.js';
import User from '../models/user.model.js';

const makeAdmin = async (email: string) => {
    try {
        await connectDB();
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`❌ User with email "${email}" not found`);
            return;
        }
        
        // Check if already admin
        if (user.roles.includes('admin')) {
            console.log(`ℹ️  User "${email}" is already an admin`);
            return;
        }
        
        // Add admin role
        user.roles.push('admin');
        await user.save();
        console.log(`✅ Successfully made "${email}" an admin`);
        
    } catch (error) {
        console.error('❌ Error making user admin:', error);
    } finally {
        process.exit(0);
    }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
    console.log('Usage: npx ts-node src/scripts/makeAdmin.ts <email>');
    process.exit(1);
}

makeAdmin(email);
