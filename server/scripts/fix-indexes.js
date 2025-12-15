// Script to fix MongoDB indexes
// Run this once to remove problematic unique index on webauthnCredentials.credentialID

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/webauthn-demo');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Drop the problematic index
    try {
      await collection.dropIndex('webauthnCredentials.credentialID_1');
      console.log('✅ Dropped problematic index: webauthnCredentials.credentialID_1');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index does not exist, skipping...');
      } else {
        console.error('Error dropping index:', error);
      }
    }

    console.log('✅ Index fix completed');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();
