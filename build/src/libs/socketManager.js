"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketManager = void 0;
const loaders_1 = require("../loaders");
const _1 = require(".");
const chatService_1 = require("../services/chatService");
const chat_1 = require("../models/chat");
const redisManager_1 = require("./redisManager");
const buddyService_1 = require("../services/buddyService");
const profileService_1 = require("../services/profileService");
const blockService_1 = require("../services/blockService");
const fcmManager_1 = require("./fcmManager");
class SocketManager {
    /**
     * socket.io 서버를 초기화하고, 연결 이벤트를 등록합니다.
     * @param serverSocket
     */
    initSocket(serverSocket) {
        // redis adapter가 개발 환경에서 동작하지 않아서 주석 처리합니다.
        // 이후 구슬땀을 위해 다른 adapter로 테스트 해봐야하 합니다.
        // redisManager.initRedisSocketServer(serverSocket)
        serverSocket.use((clientSocket, next) => {
            const token = clientSocket.handshake.auth.token;
            this.userMiddleware(clientSocket, token, next);
        });
        this.serverSocket = serverSocket;
        loaders_1.logger.info('socket.io server is running');
        serverSocket.on('connect', this.connectEvent.bind(this));
    }
    /**
     * clientSocket의 이벤트를 관리합니다.
     * @param clientSocket
     */
    async connectEvent(clientSocket) {
        const profileId = clientSocket.profileId;
        const clientSid = clientSocket.id;
        await redisManager_1.redisManager.setClientSid(profileId, clientSid);
        loaders_1.logger.info(`profile connected -> profileId ${profileId}`);
        /**
         * 채팅방 퇴장 이벤트
         *
         * 현재 앱에서 동작 이벤트를 잡는 경우가 많아서 사용하고 있지 않습니다.
         * 지금은 채팅방 입장 시 기존에 입장한 채팅방을 모두 나가는 방식으로 동작합니다.
         * 241129 기준으로 채팅방 입장 시 앱에서 입장 API를 두 번 호출하는 문제가 있습니다.
         */
        clientSocket.on('leaveChatRoom', async (data, callback) => {
            try {
                const chatRoomId = Number(data.chatRoomId);
                const rooms = this.getRoomsBySid(clientSid);
                if (!rooms.has(chatRoomId.toString())) {
                    return;
                }
                await clientSocket.leave(chatRoomId.toString());
                await chatService_1.chatService.leaveChatRoom(chatRoomId, profileId);
                await this.emitReceiveUnreadUserCounts(chatRoomId, profileId);
                loaders_1.logger.info(`profile leave chat room -> profileId ${profileId}, chatRoomId ${chatRoomId}`);
            }
            catch (e) {
                if (callback) {
                    callback({ message: e.message, stack: e.stack });
                }
                loaders_1.logger.error(e === null || e === void 0 ? void 0 : e.stack);
            }
        });
        /**
         * 소켓이 연결 해제를 시작할 때 발생합니다.
         *
         * disconnecting 이벤트는 room에 대한 알림 및 데이터 저장 등 추가적인 처리를 할 때 호출됩니다.
         * disconnecting 이벤트 이후에 모든 방에 대해 leave()가 묵시적으로 호출되므로 따로 관리할 필요가 없습니다.
         * client는 자신의 sid로 된 방도 따로 가지고 있습니다. 이 방은 client가 입장한 방이 아닙니다.
         */
        clientSocket.on('disconnecting', async () => {
            try {
                const sid = clientSid;
                const rooms = this.getRoomsBySid(sid);
                for (const roomId of rooms) {
                    if (sid === roomId) {
                        continue;
                    }
                    const chatRoomId = Number(roomId);
                    await chatService_1.chatService.leaveChatRoom(chatRoomId, profileId);
                    await this.emitReceiveUnreadUserCounts(chatRoomId, profileId);
                }
            }
            catch (e) {
                loaders_1.logger.error(e === null || e === void 0 ? void 0 : e.stack);
            }
        });
        /**
         * 소켓 연결 해제 이벤트
         * socket.io에서 입장한 모든 방을 자동으로 나간 뒤에 호출되는 이벤트입니다.
         * -> leave(roomId)를 모두 호출하기 때문에 명시적으로 leave()를 호출할 필요가 없습니다.
         */
        clientSocket.on('disconnect', async () => {
            try {
                loaders_1.logger.info(`profile disconnected -> profileId ${profileId}`);
                await redisManager_1.redisManager.deleteClientSid(profileId);
            }
            catch (e) {
                loaders_1.logger.error(e === null || e === void 0 ? void 0 : e.stack);
            }
        });
        /**
         * 방의 다른 사람들에게 메시지 전송 이벤트
         */
        clientSocket.on('sendMessage', async (data, callback) => {
            try {
                let { chatRoomId, chatType, content } = data;
                const chatMessageId = await chatService_1.chatService.createChatMessage(chatRoomId, profileId, chatType, content);
                await this.emitReceiveMessage(profileId, chatRoomId, chatMessageId, chatType, content);
                const sendMessageRes = {
                    chatMessageId,
                };
                if (callback) {
                    callback(sendMessageRes);
                }
            }
            catch (e) {
                if (callback) {
                    callback({ message: e.message, stack: e.stack });
                }
                loaders_1.logger.error(e === null || e === void 0 ? void 0 : e.stack);
            }
        });
    }
    /**
     * 메시지를 DB에 저장하고, 해당 방의 다른 사람들에게 메시지를 전송합니다.
     * @param profileId
     * @param chatRoomId
     * @param chatType chatMessageType
     * @param content
     * @param connection
     * @returns chat_message 테이블의 insertId
     */
    async emitReceiveMessage(profileId, chatRoomId, chatMessageId, chatType, content, connection) {
        const { createdAt } = await chat_1.chatModel.findOneChatMessage(chatMessageId, connection);
        const chatRoom = await chatService_1.chatService.getChatRoom(chatRoomId, connection); // 총원이 생기면 위로 올리기
        const userId = chatRoom.userId;
        let name = '';
        let buddies;
        let isFamily = false;
        if (chatService_1.chatService.isFamily(userId)) {
            name = await profileService_1.profileService.getFamilyName(profileId, connection);
            isFamily = true;
        }
        else {
            buddies = await buddyService_1.buddyService.getBuddiesInChatRoom(chatRoomId, profileId, connection);
        }
        // 앱은 켜져 있어서 소켓은 연결되어 있으나 채팅방에 입장하지 않은 사람에게 읽지 않은 메시지 수를 전송합니다.
        const chatUsers = await chatService_1.chatService.getChatUsers(chatRoomId, connection);
        for (const chatUser of chatUsers) {
            const targetProfileId = chatUser.profileId;
            if (profileId === targetProfileId
                || await this.isInRoom(targetProfileId, chatRoomId)) {
                continue;
            }
            await this.emitReceiveUnreadMessageCounts(targetProfileId, connection);
        }
        const message = chatService_1.chatService.getFCMContent(chatType, content);
        const dto = {
            isFamily,
            name,
            buddies,
            message,
            chatRoomType: chatRoom === null || chatRoom === void 0 ? void 0 : chatRoom.chatRoomType,
        };
        await fcmManager_1.fcmManager.sendFcmToOfflineInChatRoom(profileId, chatRoomId, dto, connection);
        // test
        loaders_1.logger.info(`emitReceiveMessage: ${JSON.stringify(content, null, 2)}`);
        // test
        const unreadUserCounts = await chatService_1.chatService.getUnreadUserCounts(chatRoomId, profileId, connection);
        const currentUserCounts = await this.getOfflineUserCounts(chatRoomId, connection);
        const receiveUnreadUserCounts = {
            unreadUserCounts,
            currentUserCounts
        };
        console.log('메시지 보낼 때 emitReceiveMessage receiveUnreadUserCounts', JSON.stringify(receiveUnreadUserCounts, null, 2));
        const sids = this.getSidsInRoom(chatRoomId);
        if (sids.size < 2) {
            return;
        }
        const mySid = await this.getSid(profileId);
        const profile = await profileService_1.profileService.getProfileInfo(profileId, connection);
        const profileImage = profile.profileImage;
        await this.emitSendMessageToOtherSockets(profileId, profileImage, name, userId, sids, mySid, buddies, chatMessageId, chatType, content, createdAt);
    }
    /**
     * 채팅방에 입장한 사람 중에서 오프라인인 사람의 수를 가져옵니다.
     * DB에서 채팅방 총원 수를, 소켓에서 온라인인 사람의 수를 가져와서 빼줍니다.
     * @param chatRoomId
     * @param connection
     * @returns
     */
    async getOfflineUserCounts(chatRoomId, connection) {
        const { chatUserCount } = await chatService_1.chatService.getChatRoom(chatRoomId, connection);
        const currentUserCounts = this.getSidsInRoom(chatRoomId).size;
        return chatUserCount - currentUserCounts;
    }
    /**
     * 채팅방에 읽지 않은 유저 수를 전송하는 이벤트를 발생시킵니다.
     * 읽지 않은 유저 수는 채팅방에 입장한 사람 중에서 오프라인인 사람의 수입니다.
     * @param chatRoomId
     * @param profileId
     * @param connection
     */
    async emitReceiveUnreadUserCounts(chatRoomId, profileId, connection) {
        const unreadUserCounts = await chatService_1.chatService.getUnreadUserCounts(chatRoomId, profileId, connection);
        const currentUserCounts = await this.getOfflineUserCounts(chatRoomId, connection);
        const receiveUnreadUserCounts = {
            unreadUserCounts,
            currentUserCounts
        };
        this.serverSocket.to(chatRoomId.toString()).emit('receiveUnreadUserCount', receiveUnreadUserCounts);
        // // test
        console.log('출입할 때 emitReceiveUnreadUserCounts receiveUnreadUserCounts', JSON.stringify(receiveUnreadUserCounts, null, 2));
    }
    /**
     * 자신이 읽지 않은 메시지 수를 전송하는 이벤트를 발생시킵니다.
     * @param profileId
     * @param connection
     * @returns
     */
    async emitReceiveUnreadMessageCounts(profileId, connection) {
        const sid = await this.getSid(profileId);
        if (sid === '') {
            return;
        }
        const family = await chatService_1.chatService.getFamilyUnreadMessageCounts(profileId, connection);
        const buddy = await chatService_1.chatService.getBuddyUnreadMessageCounts(profileId, connection);
        const receiveUnreadMessageCounts = {
            family,
            buddy
        };
        this.serverSocket.to(sid.toString()).emit('receiveUnreadMessageCount', receiveUnreadMessageCounts);
    }
    /**
     * 자신을 포함하여 채팅 상태 변경 이벤트를 전송합니다.
     * @param profileId
     * @param chatMessageId
     * @param content
     */
    async emitChangeChatStatus(chatRoomId, profileId, chatMessageId, content) {
        const res = { chatMessageId, content };
        const sids = this.getSidsInRoom(chatRoomId);
        const blocks = await blockService_1.blockService.getBlocksThatBlockMe(profileId);
        for (const targetSid of sids) {
            const targetProfileId = this.getProfileIdBySid(targetSid);
            if (blockService_1.blockService.isBlocked(blocks, targetProfileId)) {
                continue;
            }
            this.serverSocket.to(targetSid.toString()).emit('changeChatStatus', res);
        }
    }
    /**
     * sid 목록을 받아 온라인 profileId 목록을 가져옵니다.
     * @param sids
     * @param mySid
     * @returns
     */
    getOnlineProfileIds(sids) {
        const onlineProfiles = new Set();
        for (const sid of sids) {
            const profileId = this.getProfileIdBySid(sid);
            onlineProfiles.add(profileId);
        }
        return onlineProfiles;
    }
    /**
     *
     * @param chatUsers
     * @param onlineProfileIds
     * @returns
     */
    getOfflineProfileIdAndFcmToken(chatUsers, onlineProfileIds) {
        const offlineProfiles = [];
        for (const chatUser of chatUsers) {
            const profileId = chatUser.profileId;
            if (!onlineProfileIds.has(profileId)) {
                offlineProfiles.push(chatUser);
            }
        }
        return offlineProfiles;
    }
    async emitSendMessageToOtherSockets(profileId, profileImage, name, userId, sids, mySid, buddies, chatMessageId, chatType, content, createdAt) {
        const blocks = await blockService_1.blockService.getBlocksThatBlockMe(profileId);
        for (const targetSid of sids) {
            if (mySid === targetSid) {
                continue;
            }
            const targetProfileId = this.getProfileIdBySid(targetSid);
            if (blockService_1.blockService.isBlocked(blocks, targetProfileId)) {
                continue;
            }
            if (!chatService_1.chatService.isFamily(userId)) {
                name = buddyService_1.buddyService.getCustomName(buddies, profileId);
            }
            const receiveMessage = {
                profileId,
                profileImage,
                name,
                chatMessageId,
                chatType,
                content,
                createdAt
            };
            this.serverSocket.to(targetSid.toString()).emit('receiveMessage', receiveMessage);
        }
    }
    async waitForClientSocket(profileId, maxRetries = 5, delayMs = 1000) {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const clientSocket = await this.getClientSocketInstance(profileId);
            if (clientSocket) {
                return clientSocket;
            }
            loaders_1.logger.info(`Retrying... (${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        loaders_1.logger.info('Client socket not found after maximum retries.');
        return null;
    }
    /**
     * 채팅방에 입장합니다.
     * @param chatRoomId
     * @param profileId
     */
    async enterChatRoom(chatRoomId, profileId, connection) {
        const clientSocket = await this.getClientSocketInstance(profileId);
        await this.leaveAllChatRoom(clientSocket, profileId, chatRoomId, connection);
        if (clientSocket === null || clientSocket === void 0 ? void 0 : clientSocket.connected) {
            clientSocket.join(chatRoomId.toString());
        }
        await chatService_1.chatService.enterChatRoom(chatRoomId, profileId, connection);
        await exports.socketManager.emitReceiveUnreadUserCounts(chatRoomId, profileId, connection);
    }
    /**
     * 채팅방에 입장하기 전에 기존에 입장한 모든 채팅방을 나갑니다.
     * @param clientSocket
     * @param profileId
     * @param connection
     */
    async leaveAllChatRoom(clientSocket, profileId, currentChatRoomId, connection) {
        if (!clientSocket) {
            return;
        }
        const sid = clientSocket.id;
        const rooms = this.getRoomsBySid(sid);
        for (const roomId of rooms) {
            if (roomId === sid) {
                continue;
            }
            const chatRoomId = Number(roomId);
            if (currentChatRoomId === chatRoomId) {
                continue;
            }
            clientSocket.leave(chatRoomId.toString());
            await chatService_1.chatService.leaveChatRoom(chatRoomId, profileId, connection);
        }
    }
    /**
     * redis에 저장된 클라이언트 소켓 목록에서 profileId로 클라이언트 sid를 가져옵니다.
     * @param profileId
     * @returns
     */
    async getSid(profileId) {
        const clientSids = await redisManager_1.redisManager.getClientSids();
        const sid = clientSids.get(profileId);
        return sid ? String(sid) : '';
    }
    /**
     * 해당 방에 입장해 있는 온라인 유저의 sid 목록을 가져옵니다.
     * output example
        rooms Map(4) {
          'hpHrhLuOFNPuAAAC' => Set(1) { 'hpHrhLuOFNPuAAAC' },
          '1' => Set(3) {
            'hpHrhLuOFNPuAAAC',
            'Kt0IeYreQTXIAAAE',
            '7d2iS0GAzF5kAAAH'
          },
          'Kt0IeYreQTXIAAAE' => Set(1) { 'Kt0IeYreQTXIAAAE' },
          '7d2iS0GAzF5kAAAH' => Set(1) { '7d2iS0GAzF5kAAAH' }
        }
     * @param chatRoomId
     * @returns
     */
    getSidsInRoom(chatRoomId) {
        const sids = this.serverSocket.sockets.adapter.rooms.get(chatRoomId.toString());
        // if (!sids) {
        //   throw new Error('해당 방에 입장한 온라인 유저가 없습니다. 채팅방에 입장해주세요.')
        // }
        // return sids
        return sids ? sids : new Set();
    }
    /**
     * profileId로 Redis에 저장된 서버 소켓을 통해 클라이언트 소켓 인스턴스를 가져옵니다.
     * @param profileId
     * @returns
     */
    async getClientSocketInstance(profileId) {
        const clientSid = await this.getSid(profileId);
        const clientSockets = this.getClientSockets();
        return clientSockets.get(clientSid.toString());
    }
    /**
     * 서버 소켓에 저장되어 있는 클라이언트 소켓 인스턴스 목록을 가져옵니다.
     * Map<sid, Socket> 형태로 저장되어 있습니다.
     * 각 Socket에는 profileId가 저장되어 있습니다.
     * 해당 Socket에 emit() 함수를 사용하여 클라이언트에게 메시지를 전송할 수 있습니다.
     * @returns
     */
    getClientSockets() {
        return this.serverSocket.sockets.sockets;
    }
    getProfileIdBySid(sid) {
        const sockets = this.getClientSockets();
        const socket = sockets.get(sid);
        const profileId = socket.profileId;
        return profileId;
    }
    async isInRoom(profileId, chatRoomId) {
        const mySid = await this.getSid(profileId);
        const sids = this.getSidsInRoom(chatRoomId);
        return sids.has(mySid) ? true : false;
    }
    /**
     * 서버 소켓에 저장되어 있는 Map<sid, Set<roomId>> 형태의 목록을 가져옵니다.
     * 클라이언트는 기본적으로 자신의 sid로 되어 있는 방에 속해있습니다. 즉, sid는 개념적으로 방이라고 볼 수 있습니다.
     * 때문에 서버에서 to(sid)로 메시지를 전송해도 클라이언트가 받을 수  있습니다.
     *
     * output example
        sids Map(3) {
          '7Uy5Jqn_SufcAAAK' => Set(2) { '7Uy5Jqn_SufcAAAK', '1' },
          'EAQ1XXIx-xuVAAAN' => Set(2) { 'EAQ1XXIx-xuVAAAN', '1' },
          'Mya1TbP-4qoAAAAQ' => Set(4) { 'Mya1TbP-4qoAAAAQ', '1', '2', '3' }
        }
     * @returns
     */
    getRoomsBySid(sid) {
        const sids = this.serverSocket.sockets.adapter.sids;
        if (sids.size === 0) {
            throw new Error('참여한 방을 찾을 수 없습니다. 네트워크 상태를 확인해 주세요.');
        }
        return sids.get(sid);
    }
    /**
     * HTTP header authorization 섹션의 Bearer 토큰을 검증합니다.
     * @param clientSocket
     * @param authorization
     * @param next
     */
    async userMiddleware(clientSocket, authorization, next) {
        try {
            if ((authorization === null || authorization === void 0 ? void 0 : authorization.split(' ')[0]) === 'Bearer') {
                await this.initProfileId(clientSocket, authorization, next);
            }
            else {
                clientSocket.disconnect();
                next(new Error('invalid_token'));
            }
        }
        catch (e) {
            if (e.message === 'forbidden') {
                clientSocket.disconnect();
                next(new Error(e));
            }
            else {
                clientSocket.disconnect();
                next(new Error('invalid_token'));
            }
        }
    }
    /**
     * JWT를 decode하여 안에 담긴 profileId로 clientSocket 내 profileId를 초기화합니다.
     * 각 clientSocket으로도 profile을 구분할 수 있습니다.
     * @param clientSocket
     * @param authorization
     * @param next
     * @returns
     */
    async initProfileId(clientSocket, authorization, next) {
        if (authorization.split(' ')[1] === 'test1111') {
            clientSocket.profileId = 1;
            next();
            return;
        }
        if (authorization.split(' ')[1] === 'test2222') {
            clientSocket.profileId = 2;
            next();
            return;
        }
        if (authorization.split(' ')[1] === 'test3333') {
            clientSocket.profileId = 8;
            next();
            return;
        }
        if (authorization.split(' ')[1] === 'test4444') {
            clientSocket.profileId = 3;
            next();
            return;
        }
        if (authorization.split(' ')[1] === 'test31') {
            clientSocket.profileId = 31;
            next();
            return;
        }
        if (authorization.split(' ')[1] === 'test5555') {
            clientSocket.profileId = 5;
            next();
            return;
        }
        if (authorization.split(' ')[1] === 'test8888') {
            clientSocket.profileId = 15;
            next();
            return;
        }
        if (authorization.split(' ')[1] === 'test9999') {
            clientSocket.profileId = 7;
            next();
            return;
        }
        const jwtToken = await _1.jwt.decodeToken(authorization.split(' ')[1], { algorithms: ['RS256'] });
        if (jwtToken.sub) {
            clientSocket.profileId = jwtToken.sub;
            next();
            return;
        }
    }
}
exports.socketManager = new SocketManager();
