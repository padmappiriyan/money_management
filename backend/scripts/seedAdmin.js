import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { User, USER_ROLES } from '../models/user.model.js';

const seedAdmin = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'System Admin';

    if (!adminEmail || !adminPassword) {
      console.error('Error: Please provide ADMIN_EMAIL and ADMIN_PASSWORD in environment variables.');
      process.exit(1);
    }

    // 2. Check if Admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (existingAdmin) {
      console.log(`Admin user with email ${adminEmail} already exists. Skipping creation.`);
    } else {
      // 3. Create Admin User
      const newAdmin = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: USER_ROLES.ADMIN,
      });

      await newAdmin.save();
      console.log('Admin user created successfully!');
      console.log(`Email: ${adminEmail}`);
      console.log(`Role: ${USER_ROLES.ADMIN}`);
    }

  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  } finally {
    // 4. Close connection
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedAdmin();
