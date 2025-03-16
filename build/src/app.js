"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketManager_1 = require("./libs/socketManager");
const loaders_1 = require("./loaders");
const socket_io_1 = require("socket.io");
let serverSocket;
process.env.TZ = 'Asia/Seoul';
const port = process.env.PORT || 4000;
(async () => {
    await (0, loaders_1.init)();
    const server = loaders_1.express.listen(port, () => {
        const addr = server.address();
        const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        loaders_1.logger.debug(`Listening on ${bind}`);
    });
    serverSocket = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET, POST'],
            credentials: true
        },
        allowEIO3: true
    });
    socketManager_1.socketManager.initSocket(serverSocket);
})();
