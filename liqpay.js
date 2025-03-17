const crypto = require("crypto");

class LiqPay {
    constructor(publicKey, privateKey) {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    generatePaymentData(params) {
        params.public_key = this.publicKey;
        const jsonString = JSON.stringify(params);
        const data = Buffer.from(jsonString).toString("base64");
        const signature = this.sign(data);
        return { data, signature };
    }

    sign(data) {
        return crypto.createHash("sha1").update(this.privateKey + data + this.privateKey).digest("base64");
    }
}

module.exports = LiqPay;
