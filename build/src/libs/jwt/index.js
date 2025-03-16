"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefreshToken = exports.createAccessToken = exports.decodeTokenRefresh = exports.decodeToken = exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const privateKey = fs_1.default.readFileSync(`${__dirname}/private.pem`);
const publicKey = fs_1.default.readFileSync(`${__dirname}/public.pem`);
let ACCESS_TOKEN_EXPIRE_TIME = 60 * 60 * 24 * 365 * 50;
let REFRESH_TOKEN_EXPIRE_TIME = 60 * 60 * 24 * 365 * 50;
if ('production' == process.env.NODE_ENV) {
    ACCESS_TOKEN_EXPIRE_TIME = 60 * 60 * 24 * 365 * 50;
}
async function createToken(payload, options, secret = privateKey) {
    try {
        return await jsonwebtoken_1.default.sign(payload, secret, options);
    }
    catch (e) {
        throw e;
    }
}
exports.createToken = createToken;
async function decodeToken(token, options, secret = publicKey) {
    try {
        return await jsonwebtoken_1.default.verify(token, secret, options);
    }
    catch (e) {
        throw new Error('invalid_token');
    }
}
exports.decodeToken = decodeToken;
async function decodeTokenRefresh(token, options, secret = publicKey) {
    try {
        return await jsonwebtoken_1.default.verify(token, secret, options);
    }
    catch (e) {
        throw new Error('invalid_refresh_token');
    }
}
exports.decodeTokenRefresh = decodeTokenRefresh;
async function createAccessToken(id, reqRole) {
    try {
        const payload = { sub: id, reqRole };
        return await createToken(payload, {
            algorithm: 'RS256',
            expiresIn: ACCESS_TOKEN_EXPIRE_TIME
        });
    }
    catch (e) {
        throw e;
    }
}
exports.createAccessToken = createAccessToken;
async function createRefreshToken(profileId, tokenSecret) {
    try {
        const payload = {
            sub: profileId
        };
        return await createToken(payload, { algorithm: 'HS256', expiresIn: REFRESH_TOKEN_EXPIRE_TIME }, tokenSecret);
    }
    catch (e) {
        throw e;
    }
}
exports.createRefreshToken = createRefreshToken;
