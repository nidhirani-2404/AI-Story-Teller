import mongoose from 'mongoose';

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Attempt connection using MONGO_URI from env variables
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1); // Stop the server if database connection fails
  }
};

export default connectDB;
