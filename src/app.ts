import {socketManager} from './libs/socketManager'
import {init as initLoaders, express, logger} from './loaders'
import {Server} from 'socket.io'

let serverSocket

process.env.TZ = 'Asia/Seoul'

const port = process.env.PORT || 4000
;(async () => {
  await initLoaders()
  const server = express.listen(port, () => {
    const addr = server.address()
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`
    logger.debug(`Listening on ${bind}`)
  })
  serverSocket = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET, POST'],
      credentials: true
    },
    allowEIO3: true
  })
  socketManager.initSocket(serverSocket)
})()
