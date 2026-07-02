import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { waitForDb } from './config/db.js';
import { seedIfEmpty } from './seed.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function main(): Promise<void> {
  await waitForDb();
  await seedIfEmpty();

  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}

main().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
