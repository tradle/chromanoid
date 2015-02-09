
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

    if (this.isNew !== false) this.isNew = true;
  }

  Account.prototype.toJSON = function(options) {
    options = options || {};

    var data = {
      alias: this.alias,
      isNew: false,
      hasKeys: this.hasKeys
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

    this.isNew = false;
    this.mnemonic = mnemonic;
    this.keys = null;
    this.hasKeys = true; // having a mnemonic is equivalent
  }

  Account.prototype.generateMnemonic = 
  Account.generateMnemonic = function() {
    return bip39.generateMnemonic();
  }

  Account.prototype.validateMnemonic = Account.validateMnemonic = bip39.validateMnemonic.bind(bip39);

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
