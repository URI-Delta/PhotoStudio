import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Connects to MongoDB.
 * - If MONGODB_URI is set (e.g. a MongoDB Atlas cluster), it connects there.
 * - Otherwise it spins up an embedded in-memory MongoDB so `npm run dev`
 *   works with zero configuration. Data lives only for this process.
 */
let memoryServer = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    memoryServer = await MongoMemoryServer.create({
      instance: { port: 0, dbName: 'photosphere' },
    });
    const memUri = memoryServer.getUri('photosphere');
    console.log('[db] MONGODB_URI not set — using embedded in-memory MongoDB');
    await mongoose.connect(memUri);
  } else {
    const masked = uri.replace(/:\/\/[^@]*@/, '://***@');
    console.log(`[db] connecting to ${masked}`);
    await mongoose.connect(uri);
  }
  console.log('[db] connected');
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
