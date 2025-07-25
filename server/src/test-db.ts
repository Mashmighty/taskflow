import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Get the MongoDB URI from environment variables
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://hoohlala:nRQHDRF0eW8C0wMh@cluster0.mongodb.net/taskflow-cluster?retryWrites=true&w=majority';
    
    // Log connection string with credentials masked
    console.log('Connection string:', mongoUri.replace(/\/\/.*@/, '//***:***@'));
    
    // Connect to MongoDB Atlas
    await mongoose.connect(mongoUri, {
      // These options help with Atlas connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('✅ Database:', mongoose.connection.db?.databaseName || 'Unknown');
    console.log('✅ Host:', mongoose.connection.host);
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    const TestModel = mongoose.model('Test', TestSchema);
    
    const testDoc = new TestModel({ name: 'Atlas Connection Test' });
    await testDoc.save();
    console.log('✅ Successfully created test document:', testDoc);
    
    // Clean up test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ Test document cleaned up!');
    
    await mongoose.connection.close();
    console.log('✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    
    // Provide more specific error information
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        console.error('💡 Check your internet connection and cluster URL');
      } else if (error.message.includes('authentication failed')) {
        console.error('💡 Check your username and password in the connection string');
      } else if (error.message.includes('IP')) {
        console.error('💡 Make sure your IP address is whitelisted in MongoDB Atlas Network Access');
      }
    }
    
    process.exit(1);
  }
}

testConnection();