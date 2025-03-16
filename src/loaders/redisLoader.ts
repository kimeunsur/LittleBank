import { redisManager } from "../libs/redisManager"
import { RedisType } from "../libs/redisType"

class RedisLoader {
  async init() {
    let chatClients = await redisManager.getValue(RedisType.SOCKET_CLIENTS)
    if (!chatClients) {
      chatClients = new Map<number, any>()
      await redisManager.setValue(RedisType.SOCKET_CLIENTS, JSON.stringify([...chatClients]))
    }
  }
}

export const redisLoader = new RedisLoader()