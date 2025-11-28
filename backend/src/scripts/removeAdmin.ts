/**
 * Script to remove admin role from a user
 * Usage: npx ts-node src/scripts/removeAdmin.ts <email>
 */

import 'dotenv/config';
import { connectDB } from '../services/db.js';
import User from '../models/user.model.js';

const removeAdmin = async (email: string) => {
    try {
        await connectDB();
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`❌ User with email "${email}" not found`);
            return;
        }
        
        // Check if user has admin role
        if (!user.roles.includes('admin')) {
            console.log(`ℹ️  User "${email}" is not an admin`);
            return;
        }
        
        // Remove admin role
        user.roles = user.roles.filter(role => role !== 'admin');
        await user.save();
        console.log(`✅ Successfully removed admin role from "${email}"`);
        
    } catch (error) {
        console.error('❌ Error removing admin role:', error);
    } finally {
        process.exit(0);
    }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
    console.log('Usage: npx ts-node src/scripts/removeAdmin.ts <email>');
    process.exit(1);
}

removeAdmin(email);
