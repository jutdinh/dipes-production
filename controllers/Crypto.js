const crypto = require("crypto")

class Crypto {
    #__algorithm    = "aes-256-cbc";     
    #__initVector   = Buffer.from("thisistheinintve");    
    #__securityKey  = Buffer.from("thisistheinintvethisistheinintve");
    #__cipher       = crypto.createCipheriv(this.#__algorithm, this.#__securityKey, this.#__initVector);
    #__decipher     = crypto.createDecipheriv(this.#__algorithm, this.#__securityKey, this.#__initVector);
    constructor(){
        
    }

    encrypt = ( data ) => {
        let encryptedData = this.#__cipher.update(data, "utf-8", "hex");
        encryptedData += this.#__cipher.final("hex");
        return encryptedData
    }

    decrypt = ( encryptedData ) => {
        let decryptedData = this.#__decipher.update(encryptedData, "hex", "utf-8");
        decryptedData += this.#__decipher.final("utf8");
        return decryptedData
    }
}
module.exports = Crypto

    

