
// configuration
const MAX_OUTPUTS_PER_TX = 16;  // maximum outputs per tx
const MAX_OUTPUT_GROWTH = 25;   // avoid exponential growth of wallet's outputs by maximizing creation of new outputs until enough to stay busy, then sweeping individually

/**
 * Generates transactions on the Monero network using a wallet.
 */
class MoneroTxGenerator {

  constructor(daemon, wallet) {
    this.daemon = daemon;
    this.wallet = wallet;
    this.numTxsGenerated = 0;
    this.listeners = [];
  }

  async start() {
    if (this._isGenerating) throw new Error("Transaction generation already in progress");

    // create sufficient number of subaddresses in account 0 and 1
    let numSubaddresses = (await this.wallet.getSubaddresses(0)).length;
    if (numSubaddresses.length < MAX_OUTPUTS_PER_TX - 1) for (let i = 0; i < (MAX_OUTPUTS_PER_TX - 1 - numSubaddresses); i++) await this.wallet.createSubaddress(0);
    numSubaddresses = (await this.wallet.getSubaddresses(0)).length;
    if (numSubaddresses.length < MAX_OUTPUTS_PER_TX - 1) for (let i = 0; i < (MAX_OUTPUTS_PER_TX - 1 - numSubaddresses); i++) await this.wallet.createSubaddress(1);

    // start generation loop
    this._isGenerating = true;
    this._startGenerateLoop();
  }

  stop() {
    this._isGenerating = false;
  }

  isGenerating() {
    return this._isGenerating;
  }

  getNumTxsGenerated() {
    return this.numTxsGenerated;
  }

  // Add an event listener to allow external classes to take actions in
  // response to each
  addTransactionListener(listener) {
    console.log("Adding a transaction listener");
    this.listeners.push(listener);
  }

  // ---------------------------- PRIVATE HELPERS -----------------------------

  async _startGenerateLoop() {
    while (true) {
      if (!this._isGenerating) break;

      // spend available outputs
<<<<<<< Updated upstream
      try {
        await this._spendAvailableOutputs();
      } catch (e) {
        console.log("Caught error in spendAvailableOuptuts()");
        console.log(e);
      }

=======
<<<<<<< Updated upstream
      await this._spendAvailableOutputs();
      
=======
      await this._spendAvailableOutputs(this.daemon, this.wallet);

>>>>>>> Stashed changes
>>>>>>> Stashed changes
      // sleep for a moment
      if (!this._isGenerating) break;
      await new Promise(function(resolve) { setTimeout(resolve, MoneroUtils.WALLET_REFRESH_RATE); });
    }
  }

  // Callback to notify requesting classes that a transaction occurred
  // and to provide those classes with transaction data and total number of
  // transactions up to this point
  onTransaction(tx) {
<<<<<<< Updated upstream
    console.log("onTransaction() was called!");
    for(let i = 0; i < this.listeners.length; i++) {
      this.listeners[i](tx, this.numTxsGenerated);
=======
    for(i = 0; i < listeners.length; i++) {
      listeners[i](tx, numTxsGenerated);
>>>>>>> Stashed changes
    }
  }

  async _spendAvailableOutputs() {

    console.log("Spending available outputs");

    // get available outputs
    let outputs = await this.wallet.getOutputs({isLocked: false, isSpent: false});
<<<<<<< Updated upstream
    console.log("Wallet has " + outputs.length + " available outputs");

    // avoid exponential growth of wallet's outputs by maximizing creation of new outputs until enough to stay busy, then sweeping individually
    let outputsToCreate = MAX_OUTPUT_GROWTH - outputs.length;

    // get fee with multiplier to be conservative
    let expectedFee = (await this.daemon.getFeeEstimate()).multiply(new BigInteger(1.2));
<<<<<<< Updated upstream

=======
    
=======

    console.log("Got " + outputs.length + " available outputs");

    // create additional outputs until enough are available to stay busy
    let outputsToCreate = MAX_AVAILABLE_OUTPUTS - outputs.length;
    console.log(outputsToCreate > 0 ? outputsToCreate + " remaining outputs to create" : "Not creating new outputs, sweeping existing");

    // get fee with multiplier to be conservative
    let expectedFee = await this.daemon.getFeeEstimate();
    expectedFee = expectedFee.multiply(BigInteger.parse("1.2"));

>>>>>>> Stashed changes
>>>>>>> Stashed changes
    // spend each available output
    for (let output of outputs) {

      // break if not generating
      if (!this._isGenerating) break;
<<<<<<< Updated upstream

=======
<<<<<<< Updated upstream
      
>>>>>>> Stashed changes
      // split output to reach MAX_OUTPUT_GROWTH
      if (outputsToCreate > 0) {

        // skip if output is too small to cover fee
=======

      // skip if output is too small to cover fee
      if (output.getAmount().compare(expectedFee) <= 0) continue;

      // split output until max available outputs reached
      if (outputsToCreate > 0) {

        // build send request
        let request = new MoneroSendRequest().setAccountIndex(output.getAccountIndex()).setSubaddressIndex(output.getSubaddressIndex());            // source from output subaddress
>>>>>>> Stashed changes
        let numDsts = Math.min(outputsToCreate, MAX_OUTPUTS_PER_TX - 1);
        expectedFee = expectedFee.multiply(new BigInteger(numDsts));
        expectedFee = expectedFee.multiply(new BigInteger(10));  // increase fee multiplier for multi-output txs
        if (output.getAmount().compare(expectedFee) <= 0) continue;

        // build send request
        let request = new MoneroSendRequest().setAccountIndex(output.getAccountIndex()).setSubaddressIndex(output.getSubaddressIndex());  // source from output subaddress
        let amtPerSubaddress = output.getAmount().subtract(expectedFee).divide(new BigInteger(numDsts));  // amount to send per subaddress, one output used for change
        let dstAccount = output.getAccountIndex() === 0 ? 1 : 0;
        let destinations = [];
        for (let dstSubaddress = 0; dstSubaddress < numDsts; dstSubaddress++) {
          destinations.push(new MoneroDestination((await this.wallet.getSubaddress(dstAccount, dstSubaddress)).getAddress(), amtPerSubaddress)); // TODO: without getAddress(), obscure optional deref error, prolly from serializing in first step of monero_wallet_core::send_split
        }
        request.setDestinations(destinations);

        // attempt to send
        try {
          console.log("Sending multi-output tx");
          let tx = (await this.wallet.send(request)).getTxs()[0];
          console.log(tx.toJson());
          this.numTxsGenerated++;
          outputsToCreate -= numDsts;
          console.log("Sent tx id: " + tx.getHash());
<<<<<<< Updated upstream
          console.log(this.numTxsGenerated + "txs generated");

=======
<<<<<<< Updated upstream
          console.log(this.numTxsGenerated + " txs generated");
=======
          console.log(this.numTxsGenerated + "txs generated");
>>>>>>> Stashed changes
          // The transaction was successful, so fire the "onTransaction" event
          // to notify any classes that have submitted listeners that a new
          // transaction just took place and provide that class with transaction
          // data and total number of transactios up to this point
<<<<<<< Updated upstream
          this.onTransaction(tx);

=======
          onTransaction(tx);

>>>>>>> Stashed changes
>>>>>>> Stashed changes
        } catch (e) {
          console.log("Error creating multi-output tx: " + e.message);
        }
      }

      // otherwise sweep output
      else {
        let dstAccount = output.getAccountIndex() === 0 ? 1 : 0;
        let dstAddress = await this.wallet.getAddress(dstAccount, 0);
        if (output.getAmount().compare(expectedFee) <= 0) continue;
        try {
          console.log("Sending output sweep tx");
          let tx = (await this.wallet.sweepOutput(dstAddress, output.getKeyImage().getHex())).getTxs()[0];
          this.numTxsGenerated++;
          console.log("Sweep tx id: " + tx.getHash());
          console.log(this.numTxsGenerated + " txs generated");

          // The transaction was successful, so fire the "onTransaction" event
          // to notify any classes that have submitted listeners that a new
          // transaction just took place and provide that class with transaction
          // data and total number of transactios up to this point
          this.onTransaction(tx);
        } catch (e) {
          console.log("Error creating sweep tx: " + e.message);
        }
      }
    }
  }
}

module.exports = MoneroTxGenerator;
