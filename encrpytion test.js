var CryptoJS = require("crypto-js");

var originalText = 'hello ooooo what does this say';
var mySecretPassphrase = 'My Secret Passphrase';

var encryptedAES = CryptoJS.AES.encrypt(originalText, mySecretPassphrase);
var decryptedBytes = CryptoJS.AES.decrypt(encryptedAES, mySecretPassphrase);

var decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

console.log(encryptedAES);

console.log(originalText);
console.log(decryptedText);

