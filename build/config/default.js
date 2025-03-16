"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
const dotenv = __importStar(require("dotenv"));
dotenv.config();
module.exports = {
    host: 'http://localhost:4000',
    database: {
        database: 'littlebank',
        connectionLimit: 20,
        timezone: 'Asia/Seoul',
        charset: 'utf8mb4',
        debug: []
    },
    mongodb: {
        agenda: 'mongodb://127.0.0.1:27017/agenda'
    },
    redis: {
        host: 'localhost',
        port: 6379
    },
    swagger: {
        id: 'alphabase',
        password: 'alphabase4u'
    },
    log: {
        group: 'dev-littlebank',
        stream: 'error'
    },
    aws: {
        secrets: {
            mysql: 'dev-littlebank-mysql',
            iamport: 'littlebank-iamport',
            toss: 'littlebank-toss',
            firebase: 'littlebank-firebase',
        },
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'ap-northeast-2',
        cloudfront: 'https://dvitu87y8yjya.cloudfront.net',
        bucket: 'dev.littlebank'
    },
    slack: {
        isSend: true
    }
};
