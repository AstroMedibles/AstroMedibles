var CryptoJS = require("crypto-js");

var originalText = '123';
var mySecretPassphrase = 'My Secret Passphrase';

var encryptedText = CryptoJS.AES.encrypt(originalText, mySecretPassphrase).toString();
var decryptedText = CryptoJS.AES.decrypt(encryptedText, mySecretPassphrase).toString(CryptoJS.enc.Utf8);

console.log(encryptedText);

console.log(originalText);
console.log(decryptedText);

