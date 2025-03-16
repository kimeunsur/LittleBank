"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisLoader = void 0;
const redisManager_1 = require("../libs/redisManager");
const redisType_1 = require("../libs/redisType");
class RedisLoader {
    async init() {
        let chatClients = await redisManager_1.redisManager.getValue(redisType_1.RedisType.SOCKET_CLIENTS);
        if (!chatClients) {
            chatClients = new Map();
            await redisManager_1.redisManager.setValue(redisType_1.RedisType.SOCKET_CLIENTS, JSON.stringify([...chatClients]));
        }
    }
}
exports.redisLoader = new RedisLoader();
