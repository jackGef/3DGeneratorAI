import mongoose from 'mongoose';
import User from '../models/user.model';

/**
 * Script to remove admin role from a user
 * Usage: npx ts-node src/scripts/removeAdmin.ts <email>
 */

const removeAdmin = async (email: string) => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/text-to-3d';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Find user
        const user = await User.findOne({ email });
        
        if (!user) {
            console.error(`❌ User with email "${email}" not found`);
            process.exit(1);
        }

        // Check if user has admin role
        if (!user.roles.includes('admin')) {
            console.log(`ℹ️  User "${email}" is not an admin`);
            console.log(`   Current roles: [${user.roles.join(', ')}]`);
            process.exit(0);
        }

        // Remove admin role
        user.roles = user.roles.filter((role: string) => role !== 'admin');
        await user.save();

        console.log(`✅ Successfully removed admin role from "${email}"`);
        console.log(`   Updated roles: [${user.roles.join(', ')}]`);
        console.log(`   Username: ${user.userName}`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
};

// Get email from command line
const email = process.argv[2];

if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: npx ts-node src/scripts/removeAdmin.ts <email>');
    process.exit(1);
}

removeAdmin(email);
