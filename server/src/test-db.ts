import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGODB_URI || 'MONGODB_URI=mongodb+srv://hoohlala:nRQHDRF0eW8C0wMh@cluster0.mongodb.net/taskflow-cluster?retryWrites=true&w=majority');
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    const TestModel = mongoose.model('Test', TestSchema);
    
    const testDoc = new TestModel({ name: 'Connection Test' });
    await testDoc.save();
    console.log('✅ Successfully created test document!');
    
    // Clean up test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ Test document cleaned up!');
    
    await mongoose.connection.close();
    console.log('✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

testConnection();