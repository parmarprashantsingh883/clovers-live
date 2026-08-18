import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';
import { validateEnv } from './config/env.js';

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    validateEnv();
    await connectDB();
    if (process.env.USE_MEMORY_DB === 'true' || process.env.SEED_ON_BOOT === 'true') {
      const { runSeed } = await import('./seed/seed.js');
      await runSeed({ exitAfter: false });
    }
    const server = app.listen(PORT, () => console.log(`🛒 Clovers API running at http://localhost:${PORT}`));

    let shuttingDown = false;
    const shutdown = (signal) => {
      if (shuttingDown) return;
      shuttingDown = true;
      console.log(`\n${signal} received — shutting down…`);
      server.close(async () => {
        try { await mongoose.connection.close(); } catch { /* ignore */ }
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };
    ['SIGTERM', 'SIGINT'].forEach((sig) => process.on(sig, () => shutdown(sig)));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
