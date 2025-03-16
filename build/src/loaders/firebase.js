"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const config_1 = __importDefault(require("config"));
const _1 = require("./");
const aws_1 = require("./aws");
async function init() {
    try {
        const awsSecrets = config_1.default.get('aws.secrets');
        const serviceAccount = await (0, aws_1.getSecretValue)(awsSecrets.firebase);
        firebase_admin_1.default.initializeApp({ credential: firebase_admin_1.default.credential.cert(serviceAccount) });
        _1.logger.debug('Firebase loaded');
    }
    catch (e) {
        throw e;
    }
}
exports.init = init;
