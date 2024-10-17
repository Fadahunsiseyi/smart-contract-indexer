# ERC-20 Contract Event Indexer

This project is a backend service that listens to events emitted by an ERC-20 contract deployed on an Ethereum-compatible blockchain. It retrieves `Transfer` and `Approval` events from the blockchain and stores them in a MongoDB database for later processing.

## Features

- Listens to `Transfer` and `Approval` events from an ERC-20 token contract.
- Efficiently retrieves blockchain events using Web3.js.
- Stores the retrieved events in MongoDB, ensuring uniqueness by using an index.
- Tracks the last processed block to ensure that no events are missed between application restarts.
- Provides a polling mechanism to process new blocks and store new events.
- Supports robust error handling and duplicate event detection.

## Prerequisites

Before running this application, ensure you have the following:

- Node.js (v14 or later) installed on your machine.
- MongoDB instance (local or cloud-based).
- An Ethereum-compatible blockchain node (this project uses a custom RPC endpoint).

## Project Structure

The project is divided into several files, each responsible for specific functionality:

- `index.js`: Entry point for the application.
- `db.js`: Handles MongoDB connection and database operations.
- `eventLogs.js`: Handles the fetching and processing of events from the blockchain.
- `.env`: Stores the configuration details like contract address, MongoDB URL, and RPC endpoint.
- `abi.json`: Stores the ABI (Application Binary Interface) of the ERC-20 contract, which allows interaction with the contract.

## How It Works

1. The application connects to the MongoDB database using the connection string provided in the configuration.
2. It fetches the last processed block from the `last_processed_block` collection in MongoDB to ensure no events are missed.
3. It queries the blockchain for all `Transfer` and `Approval` events that have occurred between the last processed block and the latest block.
4. Each event is deserialized and inserted into the `transfer_events_new` collection in MongoDB, ensuring no duplicates by using unique indexing.
5. The application periodically polls the blockchain for new blocks (every 10 seconds) and processes the logs from those blocks.
6. Upon graceful shutdown (e.g., if the app is stopped), the MongoDB connection is closed properly to avoid data corruption or connection leaks.

## Installation and Setup

Follow these steps to set up and run the application:

### 1. Clone the Repository

First, clone the project repository:

```bash
git clone https://github.com/Fadahunsiseyi/smart-contract-indexer.git
cd smart-contract-indexer
```

### 2. Install Dependencies

The project requires several npm packages to run. Install them using the following command:

```bash
npm install
```

This will install the following key dependencies:

- `web3`: A library that allows interaction with Ethereum-based blockchains.
- `mongodb`: MongoDB client for database operations.
- `dotenv`: A package to load environment variables from a `.env` file.


### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```bash
RPC_ENDPOINT=http://your-rpc-endpoint
CONTRACT_ADDRESS=0xYourContractAddress
MONGO_URL=mongodb+srv://your-mongo-credentials
DB_NAME=DATABASENAME
```

Make sure to replace the values with:

- Your Ethereum-compatible RPC endpoint.
- The address of the ERC-20 contract you're indexing events from.
- Your MongoDB connection string and database name.


### 4. Add the Contract ABI

Make sure that your contract ABI (Application Binary Interface) is available in the `abi.json` file in the project root. The ABI is required to interact with the smart contract and listen for events.


### 5. Run the Application

After configuring the project, you can start the application using the following command:

```bash
node index.js
```

If everything is set up correctly, the application will:

- Connect to your MongoDB database.
- Retrieve the last processed block from MongoDB (or start from block 0 if no block is stored).
- Query the blockchain for Transfer and Approval events from the ERC-20 contract.
- Store the events in MongoDB and continue polling the blockchain for new events every 10 seconds.