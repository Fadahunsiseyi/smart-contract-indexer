const { contract, web3 } = require('./web3');
const { getLastProcessedBlock, updateLastProcessedBlock } = require('./db');

// This will be a function which converts block numbers to hex
function toHex(number) {
  return '0x' + number.toString(16);
}

async function processEvents(fromBlock, toBlock) {
  const [transferEvents, approvalEvents] = await Promise.all([
    contract.getPastEvents('Transfer', {
      fromBlock: toHex(fromBlock),
      toBlock: toHex(toBlock)
    }),
    contract.getPastEvents('Approval', {
      fromBlock: toHex(fromBlock),
      toBlock: toHex(toBlock)
    })
  ]);

  console.log(transferEvents,"================================>>>>>>>>>>>> eventLog 21");

  console.log("BEGIN =====================>>>>>>>>>>>>>>>>")

  console.log(approvalEvents,"================================>>>>>>>>>>>> eventLog 21");



  const allEvents = [...transferEvents, ...approvalEvents];

  for (const event of allEvents) {
    let deserializedEvent;
    if (event.event === 'Transfer') {
      deserializedEvent = {
        event: 'Transfer',
        from: event.returnValues.from,
        to: event.returnValues.to,
        value: event.returnValues.value
      };
    } else if (event.event === 'Approval') {
      deserializedEvent = {
        event: 'Approval',
        owner: event.returnValues.owner,
        spender: event.returnValues.spender,
        value: event.returnValues.value
      };
    } else {
      console.log(`Unhandled event type: ${event.event}`);
      continue;
    }

    try {
      await global.db.collection('transfer_events_new').insertOne({
        blockNumber: BigInt(event.blockNumber),
        transactionIndex: event.transactionIndex,
        logIndex: event.logIndex,
        transactionHash: event.transactionHash,
        deserializedEvent: deserializedEvent,
        timestamp: new Date()
      });
      console.log(`Event inserted: ${event.transactionHash}-${event.logIndex}`);
    } catch (err) {
      if (err.code === 11000) {
        console.log(`Duplicate event, skipping: ${event.transactionHash}-${event.logIndex}`);
      } else {
        console.error('Error inserting event', err);
      }
    }
  }
}

async function pollForEvents() {
  try {
    const lastProcessedBlock = await getLastProcessedBlock();
    const latestBlock = BigInt(await web3.eth.getBlockNumber());

    if (latestBlock > lastProcessedBlock) {
      const fromBlock = lastProcessedBlock + BigInt(1);
      const toBlock = latestBlock < fromBlock + BigInt(999) ? latestBlock : fromBlock + BigInt(999);

      await processEvents(fromBlock, toBlock);
      await updateLastProcessedBlock(toBlock);
      console.log(`Processed blocks ${fromBlock} to ${toBlock}`);
    }
  } catch (error) {
    console.error('Error in pollForEvents:', error);
  }

  setTimeout(pollForEvents, 15000); // Poll every 15 seconds
}

module.exports = {
  pollForEvents
};
