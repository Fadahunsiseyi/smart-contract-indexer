const { MongoClient } = require('mongodb');

require('dotenv').config();

const mongoUrl = process.env.MONGO_URL
const dbName = 'erc20_indexer';

async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(mongoUrl);
    console.log("Connected successfully to MongoDB");
    global.db = client.db(dbName);
    await global.db.collection('transfer_events').createIndex({ blockNumber: 1, transactionIndex: 1, logIndex: 1 }, { unique: true });
    await global.db.collection('last_processed_block').updateOne({}, { $setOnInsert: { blockNumber: "0" } }, { upsert: true });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

async function getLastProcessedBlock() {
  const result = await global.db.collection('last_processed_block').findOne({});
  return result ? BigInt(result.blockNumber) : BigInt(0);
}

async function updateLastProcessedBlock(blockNumber) {
  await global.db.collection('last_processed_block').updateOne({}, { $set: { blockNumber: blockNumber.toString() } }, { upsert: true });
}

module.exports = {
  connectToDatabase,
  getLastProcessedBlock,
  updateLastProcessedBlock
};
