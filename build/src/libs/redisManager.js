"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisManager = void 0;
const redisType_1 = require("./redisType");
const util_1 = require("util");
const express_1 = require("../loaders/express");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const loaders_1 = require("../loaders");
class RedisManager {
    constructor() {
        this.redis = express_1.expressManager.redisClient;
        /**
         * Redis 멤버함수는 기본적으로 비동기 함수이지만 Promise를 반환하지 않는다.
         * 때문에 promisify를 사용하여 Promise를 반환하도록 한다.
         * bind를 사용하여 this가 redis로 바인딩되도록 한다.
         * 왜냐하면 promisify는 this를 바인딩하지 않기 때문에 undefined가 되어 전역 함수처럼 사용되기 때문이다.
         */
        this.keys = (0, util_1.promisify)(this.redis.keys).bind(this.redis);
        this.get = (0, util_1.promisify)(this.redis.get).bind(this.redis);
        this.set = (0, util_1.promisify)(this.redis.set).bind(this.redis);
        this.incrby = (0, util_1.promisify)(this.redis.incrby).bind(this.redis);
        this.del = (0, util_1.promisify)(this.redis.del).bind(this.redis);
        this.SEPARATOR = redisType_1.RedisType.SEPARATOR;
    }
    /******************************************************************************************/
    /****************************************** REDIS *****************************************/
    /******************************************************************************************/
    /**
     * Redis에서 모든 key를 가져온다.
     * @param key RedisType의 문자열을 받는다.
     * @returns
     */
    async setValue(key, value) {
        try {
            return await this.set(key, value);
        }
        catch (e) {
            throw new Error('Redis Error');
        }
    }
    /**
     * Redis에서 모든 key를 가져온다.
     * @param key RedisType의 문자열을 받는다.
     * @returns
     */
    async getKeys(key) {
        const KEY = key + '*';
        try {
            return await this.keys(KEY);
        }
        catch (e) {
            throw new Error('Redis Error');
        }
    }
    /**
     *
     * @param key
     * @returns 존재하지 않으면 null을 반환한다.
     */
    async getValue(key) {
        try {
            return await this.get(key);
        }
        catch (e) {
            throw new Error('Redis Error');
        }
    }
    /**
     * Redis에서 key에 해당하는 value를 삭제한다.
     * @param key
     */
    async deleteKey(key) {
        try {
            await this.del(key);
        }
        catch (e) {
            throw new Error('Redis Error');
        }
    }
    /**
     * 존재하는 모든 key에 해당하는 value를 가져온다.
     * @returns
     */
    async printAllKeysAndValues() {
        try {
            const keysRes = await this.getKeys(redisType_1.RedisType.All);
            await Promise.all(keysRes.map(async (key) => {
                const res = await this.get(key);
                console.log(`key: ${key}, value: ${res}`);
                // deleteKey(key) // 모두 지우기 test
                return res;
            }));
        }
        catch (e) {
            throw new Error('Redis Error');
        }
    }
    /******************************************************************************************/
    /**************************************** EXTERNAL ****************************************/
    /******************************************************************************************/
    /**
     * Redis adapter를 이용하여 socket.io 서버를 초기화한다.
     * @param serverSocket
     */
    initRedisSocketServer(serverSocket) {
        try {
            const pubClient = express_1.expressManager.redisClient.duplicate();
            const subClient = express_1.expressManager.redisClient.duplicate();
            serverSocket.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
        }
        catch (e) {
            loaders_1.logger.error(e);
        }
    }
    /**
     * Redis에서 Map으로 된 클라이언트 소켓 목록을 가져옵니다.
     * Map<profileId, sid> 형태로 Redis에 저장되어 있습니다.
     * @returns
     */
    async getClientSids() {
        const rawClientSids = await exports.redisManager.getValue(redisType_1.RedisType.SOCKET_CLIENTS);
        if (!rawClientSids) {
            return new Map();
        }
        let arrayClientSids = JSON.parse(rawClientSids);
        return new Map(arrayClientSids);
    }
    /**
     * 클라이언트 연결이 있을 때마다 클라이언트 소켓 목록을 업데이트합니다.
     * @param profileId
     * @param clientSocketId
     */
    async setClientSid(profileId, clientSocketId) {
        const clientSids = await this.getClientSids();
        clientSids.set(profileId, clientSocketId);
        await exports.redisManager.setValue(redisType_1.RedisType.SOCKET_CLIENTS, JSON.stringify([...clientSids]));
    }
    /**
     * 클라이언트 연결 해제 마다 클라이언트 소켓 목록에서 해당 클라이언트 소켓을 삭제합니다.
     * @param profileId
     */
    async deleteClientSid(profileId) {
        const clientSids = await this.getClientSids();
        clientSids.delete(profileId);
        await exports.redisManager.setValue(redisType_1.RedisType.SOCKET_CLIENTS, JSON.stringify([...clientSids]));
    }
    splitKey(key) {
        return key.split(this.SEPARATOR);
    }
}
exports.redisManager = new RedisManager();
