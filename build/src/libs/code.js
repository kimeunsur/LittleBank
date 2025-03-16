"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToDate = exports.hashSHA256 = exports.verifyPassword = exports.createPasswordHash = exports.generateRandomHash = exports.generateRandomPassword = exports.generateRandomCode = exports.getPasswordHash = exports.passwordIterations = void 0;
const crypto_1 = __importDefault(require("crypto"));
const passwordIterations = {
    mobile: 123223,
    admin: 123853,
    card: 127242
};
exports.passwordIterations = passwordIterations;
function generateRandomCode(digit) {
    const max = 10 ** digit;
    const min = 10 ** (digit - 1);
    return Math.floor(Math.random() * (max - min) + min);
}
exports.generateRandomCode = generateRandomCode;
function generateRandomPassword(digit) {
    return Math.random().toString(36).slice(-digit);
}
exports.generateRandomPassword = generateRandomPassword;
function generateRandomHash(length) {
    return crypto_1.default
        .randomBytes(length)
        .toString('base64')
        .replace(/[^A-Za-z0-9]/g, '');
}
exports.generateRandomHash = generateRandomHash;
const createPasswordHash = (password, iterations) => {
    try {
        const salt = generateRandomHash(64);
        const key = crypto_1.default.pbkdf2Sync(password, salt, iterations, 64, 'sha512');
        return { password: key.toString('base64'), salt };
    }
    catch (e) {
        throw e;
    }
};
exports.createPasswordHash = createPasswordHash;
const getPasswordHash = (password, salt, iterations) => {
    try {
        const key = crypto_1.default.pbkdf2Sync(password, salt, iterations, 64, 'sha512');
        return key.toString('base64');
    }
    catch (e) {
        throw e;
    }
};
exports.getPasswordHash = getPasswordHash;
function verifyPassword(password, hash, salt, iterations) {
    try {
        const key = crypto_1.default.pbkdf2Sync(password, salt, iterations, 64, 'sha512');
        return key.toString('base64') === hash;
    }
    catch (e) {
        return false;
    }
}
exports.verifyPassword = verifyPassword;
const hashSHA256 = (data) => {
    try {
        let hashData = '';
        if (data && data.length > 0) {
            //const hashData = crypto.createHash('sha256').update(data).digest('hex')
            hashData = crypto_1.default.pbkdf2Sync(data, 'n0f3', 100, 64, 'sha256').toString('base64');
        }
        return hashData;
    }
    catch (e) {
        throw e;
    }
};
exports.hashSHA256 = hashSHA256;
function convertToDate(input) {
    const rawDate = input.split('-')[0];
    const yearSuffix = rawDate.substring(0, 2);
    const month = rawDate.substring(2, 4);
    const day = rawDate.substring(4, 6);
    const currentYear = new Date().getFullYear();
    const currentYearSuffix = currentYear % 100;
    const centuryBase = (parseInt(yearSuffix) <= currentYearSuffix) ? 2000 : 1900;
    const year = centuryBase + parseInt(yearSuffix);
    return `${year}-${month}-${day}`;
}
exports.convertToDate = convertToDate;
