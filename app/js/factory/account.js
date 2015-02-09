
require('angular');
var bitcoin = require('bitcoinjs-lib');
var typeforce = require('typeforce');
var bip39 = require('bip39');
var nodeCrypto = require('crypto');
var crypto = require('./crypto')(); // angular module, this is probably a no-no way to import

module.exports = function(crypto) {
  function Account(attributes, password) {
    if (!(this instanceof Account)) return new Account(attributes, password);

    typeforce('Object', attributes);
    typeforce('String', attributes.alias);
    angular.extend(this, attributes);

    if (!this.id) this.id = nodeCrypto.randomBytes(32).toString('hex');
    if (this.seed) {
      if (!password) throw new Error('Can\'t decrypt account without a password');

      this.seed = crypto.decrypt(this.seed, password);
    }
  }

  Account.prototype.toJSON = function(options) {
    options = options || {};

    var data = {
      alias: this.alias,
      mnemonicHash: this.mnemonicHash
    };

    if (options.saveSeed) {
      if (!options.password) throw new Error('Can\'t save unencrypted seed');

      data.seed = crypto.encrypt(this.seed, options.password);
    }

    return data;
  }

  Account.prototype.delete = function(data) {
    if (!this.keys) throw new Error()
  }

  Account.prototype.setMnemonic = function(mnemonic, overwrite) {
    // if (!overwrite && this.seed) throw new Error('This will overwrite the current seed!');

    this.mnemonic = mnemonic;
    this.mnemonicHash = this.hashMnemonic(mnemonic);
    this.keys = null;
  }

  Account.prototype.hashMnemonic =
  Account.hashMnemonic = function(mnemonic) {
    return nodeCrypto.createHash('sha256').update(mnemonic).digest('base64');
  }

  Account.prototype.generateMnemonic = 
  Account.generateMnemonic = function() {
    return bip39.generateMnemonic();
  }

  Account.prototype.validateMnemonic = 
  Account.validateMnemonic = function(mnemonic) {
    return mnemonic && bip39.validateMnemonic(mnemonic);
  }

  Account.prototype.verifyMnemonic = function(mnemonic) {
    return this.mnemonic && this.mnemonicHash === this.hashMnemonic(mnemonic);
  }

  Account.prototype.generateKeys = function() {
    if (!this.mnemonic) this.generateMnemonic();

    this.seed = bip39.mnemonicToSeed(this.mnemonic);
    var root = bitcoin.HDNode.fromSeedBuffer(this.seed);
    var accountZero = root.deriveHardened(0);
    this.keys = {
      sign: accountZero.derive(0),
      decrypt: accountZero.derive(1)
    }
  }

  Account.prototype._checkKeys = function() {
    if (!this.seed) {
      if (!this.mnemonic) throw new Error('This account doesn\'t have any keys!');

      this.generateKeys();
    }
  }

  Account.prototype.sign = function(doc) {
    this._checkKeys();
    return bitcoin.Message.sign(this.keys.sign.privKey, doc).toString('hex');
  }

  Account.prototype.decrypt = function(doc) {
    this._checkKeys();
    return crypto.decrypt(doc, this.keys.decrypt);
  }

  return Account;
}
