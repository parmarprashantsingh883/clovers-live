import mongoose from 'mongoose';

/**
 * Dev convenience: with USE_MEMORY_DB=true (or no MONGO_URI) spin up an
 * in-memory MongoDB so the API runs with zero setup. Production uses MONGO_URI
 * (Atlas). Seed with `npm run seed`, or SEED_ON_BOOT=true to auto-seed.
 */
export async function connectDB() {
  let uri = process.env.MONGO_URI;
  if (!uri || process.env.USE_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    uri = mem.getUri('clovers');
    console.log('🧪 In-memory MongoDB started');
  }
  await mongoose.connect(uri);
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
}
