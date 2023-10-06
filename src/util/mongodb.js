import mongoose from 'mongoose';

const connection = {};

async function connectToDatabase() {
  if (connection.isConnected) {
    return;
  }

  const db = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  connection.isConnected = db.connections[0].readyState;
  console.log('MongoDB Connected');

  return connection;
}

export default connectToDatabase;
