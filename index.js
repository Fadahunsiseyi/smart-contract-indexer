const { connectToDatabase } = require('./db');
const { pollForEvents } = require('./eventLogs');
require('dotenv').config();

// Start the indexer
async function main() {
    console.log('Starting indexer');
  await connectToDatabase();
  pollForEvents();
}

main().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection');
  if (global.db) {
    await global.db.client.close();
  }
  console.log('Database connection closed');
  process.exit(0);
});
