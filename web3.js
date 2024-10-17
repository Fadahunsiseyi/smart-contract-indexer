const Web3 = require('web3').default;
const contractABI = require('./abi.json');
require('dotenv').config();

// Update contract address and RPC endpoint
const contractAddress = process.env.CONTRACT_ADDRESS;
const rpcEndpoint = process.env.RPC_URL;

const web3 = new Web3(rpcEndpoint);
const contract = new web3.eth.Contract(contractABI, contractAddress);

module.exports = {
  web3,
  contract
};
