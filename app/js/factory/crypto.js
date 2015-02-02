var bip39 = require('bip39');
var bitcoin = require('bitcoinjs-lib');
var crypto = require('crypto');

var cache = {};
var service = {
  sign: sign,
  encrypt: encrypt,
  forget: forget,
  // requests: requests,
  // request: makeRequest,
  counts: {}
}

module.exports = function() {
  return service;
};

function deriveKeys(mnemonic) {
  if (!bip39.validateMnemonic(mnemonic)) throw new Error('Invalid mnemonic');

  if (!cache[mnemonic]) {
    var seed = bip39.mnemonicToSeed(mnemonic);
    var root = bitcoin.HDNode.fromSeedBuffer(seed);
    var accountZero = root.deriveHardened(0);
    var signingAccount = accountZero.derive(0);
    cache[mnemonic] = {
      sign: signingAccount.derive(0),
      decrypt: signingAccount.derive(1)
    }
  }

  return cache[mnemonic];
}

function sign(doc, mnemonic) {
  var keys = cache[mnemonic] || deriveKeys(mnemonic);
  return bitcoin.Message.sign(keys.sign.privKey, doc).toString('hex');
  // sigInput.val(currentReq.sig);
  // state.set('signed');
}

function forget() {
  cache = {};
}

function decrypt(doc, mnemonic) {
  // var keys = cache[mnemonic] || deriveKeys(mnemonic);
  // var decKey = keys.decrypt;
  throw new Error('unimplemented');
}

function encrypt(doc, mnemonic) {
  throw new Error('unimplemented');
}