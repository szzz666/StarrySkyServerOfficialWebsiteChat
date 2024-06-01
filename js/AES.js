// const crypto = require('crypto');
// const CryptoJS = require('crypto-js');
// const IV = Buffer.from("xlinkXLINKXlinka", 'utf8');
function encrypt(data, key) {
    // 注意：crypto-js默认不支持偏移量(IV)，需要手动处理
    const iv = CryptoJS.enc.Utf8.parse("xlinkXLINKXlinka"); // 使用指定的IV
    const keyHex = CryptoJS.enc.Utf8.parse(key); // 将密钥转换为WordArray格式

    // 执行加密操作
    const encrypted = CryptoJS.AES.encrypt(data, keyHex, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    // 返回Base64格式的加密结果
    return encrypted.toString();
}