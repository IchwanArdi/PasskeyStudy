import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const fixCredentialsCounter = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/webauthn-demo');
    console.log('Connected to MongoDB');

    // Find all users with WebAuthn credentials
    const users = await User.find({ webauthnCredentials: { $exists: true, $ne: [] } });

    console.log(`Found ${users.length} users with WebAuthn credentials`);

    let fixedCount = 0;

    for (const user of users) {
      let needsUpdate = false;

      for (const cred of user.webauthnCredentials) {
        // Check if counter is missing or invalid
        if (cred.counter === undefined || cred.counter === null || isNaN(cred.counter)) {
          console.log(`Fixing counter for user ${user.email}, credential ${cred.credentialID?.substring(0, 20)}...`);
          cred.counter = 0;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await user.save();
        fixedCount++;
        console.log(`Fixed credentials for user: ${user.email}`);
      }
    }

    console.log(`\nFixed ${fixedCount} users`);
    console.log('Done!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error fixing credentials:', error);
    process.exit(1);
  }
};

fixCredentialsCounter();
