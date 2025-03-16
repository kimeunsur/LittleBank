"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = void 0;
const chat_1 = require("../models/chat");
const profileService_1 = require("./profileService");
const socketManager_1 = require("../libs/socketManager");
const chatRoomType_1 = require("../interfaces/chatRoomType");
const chatType_1 = require("../interfaces/chatType");
class ChatService {
    constructor() {
        this.NOT_FOUND = '채팅방을 찾을 수 없습니다.';
        this.NOT_JOIN = '채팅방에 참여한 사용자가 아닙니다.';
    }
    /**
     * 채팅방 생성과 동시에 채팅방에 입장합니다.
     * @param profileId
     * @param targetProfileId
     * @param connection
     * @returns
     */
    async createChatRoom(optoins, connection) {
        const { userId, profileId, targetProfileId, chatRoomType } = optoins;
        const chatRoomId = await chat_1.chatModel.createChatRoom({ userId, chatRoomType }, connection);
        await this.createChatUser(chatRoomId, profileId, connection);
        if (targetProfileId) {
            await this.createChatUser(chatRoomId, targetProfileId, connection);
            await chat_1.chatModel.increaseChatUserCountChatRoom(chatRoomId, connection);
        }
        return chatRoomId;
    }
    /**
     * content chatType이 message 또는 photo라면 참을 반환합니다.
     * content 객체 내에 chatContent가 존재할 때는 chatType이 message 또는 photo입니다.
     * @param content
     * @returns
     */
    isMessageOrPhoto(content) {
        return 'chatContent' in content;
    }
    /**
     * chat_message를 생성합니다.
     * @param chatRoomId
     * @param profileId
     * @param chatType
     * @param content
     * @param connection
     * @returns
     */
    async createChatMessage(chatRoomId, profileId, chatType, content, connection) {
        const chatUser = await chat_1.chatModel.findChatUser(chatRoomId, profileId, connection);
        if (!chatUser) {
            throw new Error(this.NOT_JOIN);
        }
        let chatContent;
        if (this.isMessageOrPhoto(content)) {
            chatContent = content.chatContent;
        }
        else {
            chatContent = null;
        }
        return await chat_1.chatModel.createChatMessage({ chatRoomId, profileId, chatType, chatContent }, connection);
    }
    /**
     * 가족 목록과 가족 채팅방 메시지 목록을 조회하며 소켓 연결을 진행합니다.
     * @param profileId
     * @param connection
     * @returns
     */
    async getFamilies(profileId, options, connection) {
        const profile = await profileService_1.profileService.getProfileInfo(profileId, connection);
        const userId = profile.userId;
        const profiles = await profileService_1.profileService.getFamilyProfilesInfo(userId, profileId, connection);
        const chatRoom = await this.getFamilyChatRoom(userId, connection);
        if (!chatRoom) {
            throw new Error(this.NOT_FOUND);
        }
        const chatRoomId = chatRoom.chatRoomId;
        const messages = await this.findRecentChatMessagesByChatRoomIdOrderByAsc(chatRoomId, profileId, userId, options, connection);
        await socketManager_1.socketManager.enterChatRoom(chatRoomId, profileId, connection);
        await socketManager_1.socketManager.emitReceiveUnreadMessageCounts(profileId, connection);
        return { chatRoomId, profileId, profiles, messages };
    }
    async createDirectChatRoom(options, connection) {
        const { profileId, targetProfileId, myUserId, targetUserId } = options;
        let userId = null;
        if (myUserId === targetUserId) {
            userId = myUserId;
        }
        return await this.createChatRoom({ userId, profileId, targetProfileId, chatRoomType: chatRoomType_1.ChatRoomType.DIRECT }, connection);
    }
    /**
     * 채팅방 조회 및 해당 방과 소켓 연결을 진행합니다.
     * getName은 친구 또는 가족 관계 확인을 여기에서 진행하므로 DB 추가 및 수정 작업이 들어가기 전에 실행되어야 합니다.
     * @param chatRoomId
     * @param profileId
     * @returns
     */
    async getDirectChatRoom(profileId, targetProfileId, options, connection) {
        if (profileId === targetProfileId) {
            throw new Error('올바르지 않은 대상입니다.');
        }
        const name = await profileService_1.profileService.getName(profileId, targetProfileId, connection);
        const profile = await profileService_1.profileService.getProfileInfo(profileId, connection);
        const targetProfile = await profileService_1.profileService.getProfileInfo(targetProfileId, connection);
        let chatRoomId;
        const chatRoom = await chat_1.chatModel.findDirectChatRoomByProfileIds(profileId, targetProfileId, connection);
        if (!chatRoom) {
            chatRoomId = await this.createDirectChatRoom({ profileId, targetProfileId, myUserId: profile.userId, targetUserId: targetProfile.userId }, connection);
        }
        else {
            chatRoomId = chatRoom.chatRoomId;
        }
        const userId = chatRoom === null || chatRoom === void 0 ? void 0 : chatRoom.userId;
        let isFamily = true;
        if (!this.isFamily(userId)) {
            options['followerId'] = profileId;
            isFamily = false;
        }
        const messages = await this.findRecentChatMessagesByChatRoomIdOrderByAsc(chatRoomId, profileId, userId, options, connection);
        await socketManager_1.socketManager.enterChatRoom(chatRoomId, profileId, connection);
        return { profileId, name, chatRoomId, isFamily, messages };
    }
    async getChatRoom(chatRoomId, connection) {
        const chatRoom = await chat_1.chatModel.findChatRoomById(chatRoomId, connection);
        if (!chatRoom) {
            throw new Error(this.NOT_FOUND);
        }
        return chatRoom;
    }
    /**
     * profile 생성 시 가족 채팅방에 참여합니다.
     * @param userId
     * @param profileId
     * @param connection
     */
    async enterFamilyChatRoom(userId, profileId, connection) {
        let chatRoom = await exports.chatService.getFamilyChatRoom(userId, connection);
        if (!chatRoom) {
            const targetProfileId = null;
            await exports.chatService.createChatRoom({ userId, profileId, targetProfileId, chatRoomType: chatRoomType_1.ChatRoomType.GROUP }, connection);
            return;
        }
        await this.createChatUser(chatRoom.chatRoomId, profileId, connection);
        await chat_1.chatModel.increaseChatUserCountChatRoom(chatRoom.chatRoomId, connection);
    }
    async getChatUserProfileIdFcmTokens(chatRoomId, connection) {
        const chatUsers = await chat_1.chatModel.findProfilesInChatRoom(chatRoomId, connection);
        if (chatUsers.length === 0) {
            throw new Error('채팅방에 참여한 사용자가 없습니다.');
        }
        return chatUsers;
    }
    async getChatMessages(profileId, chatRoomId, options, connection) {
        const chatRoom = await chat_1.chatModel.findChatRoomById(chatRoomId, connection);
        if (!chatRoom) {
            throw new Error(this.NOT_FOUND);
        }
        const chatUser = await chat_1.chatModel.findChatUser(chatRoomId, profileId, connection);
        if (!chatUser) {
            throw new Error(this.NOT_JOIN);
        }
        let userId = chatRoom.userId;
        if (!this.isFamily(userId)) {
            options['followerId'] = profileId;
        }
        const messages = await this.findRecentChatMessagesByChatRoomIdOrderByAsc(chatRoomId, profileId, userId, options, connection);
        return { profileId, messages };
    }
    /**
     * 가족 채팅방에는 userId가 존재하므로 userId를 받아 가족 채팅방인지 확인합니다.
     * @param userId
     * @returns
     */
    isFamily(userId) {
        return userId !== null;
    }
    async enterChatRoom(chatRoomId, profileId, connection) {
        const chatUser = await chat_1.chatModel.findChatUser(chatRoomId, profileId, connection);
        if (!chatUser) {
            throw new Error(this.NOT_JOIN);
        }
        await chat_1.chatModel.updateChatUserEnterAt(chatRoomId, profileId, connection);
    }
    async leaveChatRoom(chatRoomId, profileId, connection) {
        const chatUser = await chat_1.chatModel.findChatUser(chatRoomId, profileId, connection);
        if (!chatUser) {
            throw new Error(this.NOT_JOIN);
        }
        await chat_1.chatModel.updateChatUserLeaveAt(chatRoomId, profileId, connection);
    }
    async findRecentChatMessagesByChatRoomIdOrderByAsc(chatRoomId, profileId, userId, options, connection) {
        let messages;
        const { page, perPage } = options;
        const start = perPage * page - perPage;
        const end = perPage;
        if (end - start > 1000) {
            throw new Error('100개 보다 많은 메시지를 조회할 수 없습니다.');
        }
        if (this.isFamily(userId)) {
            messages = await chat_1.chatModel.findRecentChatMessagesByChatRoomIdOrderByAscForFamily(chatRoomId, profileId, options, connection);
        }
        else {
            messages = await chat_1.chatModel.findRecentChatMessagesByChatRoomIdOrderByAscForGeneral(chatRoomId, options, connection);
        }
        const data = this.getMessageByChatType(messages);
        const total = data.length;
        return { data, total };
    }
    getFCMContent(chatType, content) {
        switch (chatType) {
            case chatType_1.ChatType.MESSAGE:
                return content.chatContent;
            case chatType_1.ChatType.PHOTO:
                return '사진을 보냈습니다.';
            case chatType_1.ChatType.MISSION:
                return '미션을 보냈습니다.';
            case chatType_1.ChatType.ALBUM:
                return '앨범을 보냈습니다.';
            case chatType_1.ChatType.TASK:
                return '용돈 요청을 보냈습니다.';
            default:
                throw new Error('알 수 없는 채팅 형식입니다.');
        }
    }
    getContent(chatType) {
        switch (chatType) {
            case chatType_1.ChatType.MISSION:
                return '친구가 미션을 완료했습니다.';
            case chatType_1.ChatType.TASK:
                return '친구가 용돈을 받았습니다.';
            default:
                throw new Error('알 수 없는 채팅 형식입니다.');
        }
    }
    getMessageByChatType(messages) {
        return messages.map((message) => {
            let content;
            switch (message.chatType) {
                case chatType_1.ChatType.MESSAGE:
                case chatType_1.ChatType.PHOTO:
                    content = { chatContent: message.chatContent };
                    break;
                case chatType_1.ChatType.MISSION:
                    content = {
                        allowanceMissionId: message.allowanceMissionId,
                        missionChat: message.missionChat,
                        missionAmount: message.missionAmount,
                        missionStartDate: message.missionStartDate,
                        missionStatus: message.missionStatus,
                        missionEndDate: message.missionEndDate,
                        missionParentComment: message.missionParentComment,
                        missionParentImage: message.missionParentImage,
                        missionChildComment: message.missionChildComment,
                        missionChildImage: message.missionChildImage,
                        childProfileId: message.childProfileId,
                        childProfileName: message.childProfileName
                    };
                    break;
                case chatType_1.ChatType.ALBUM:
                    content = {
                        allowanceAlbumId: message.allowanceAlbumId,
                        albumChat: message.albumChat,
                        albumAmount: message.albumAmount,
                        albumStatus: message.albumStatus,
                        albumImages: message.albumImages.split(',')
                    };
                    break;
                case chatType_1.ChatType.TASK:
                    content = {
                        allowanceChatId: message.allowanceChatId,
                        allowanceChat: message.allowanceChat,
                        allowanceAmount: message.allowanceAmount,
                        allowanceChatStatus: message.allowanceChatStatus,
                        allowanceChatImage: message.allowanceChatImage,
                        allowanceContent: message.allowanceContent
                    };
                    break;
                default:
                    throw new Error('알 수 없는 채팅 형식입니다.');
            }
            return {
                profileId: message.profileId,
                profileImage: message.profileImage,
                name: message.name,
                chatMessageId: message.chatMessageId,
                chatType: message.chatType,
                content,
                createdAt: message.createdAt
            };
        });
    }
    async getUnreadUserCounts(chatRoomId, profileId, connection) {
        const chatUser = await chat_1.chatModel.findChatUser(chatRoomId, profileId, connection);
        if (!chatUser) {
            throw new Error(this.NOT_JOIN);
        }
        return await chat_1.chatModel.findUnreadUserCounts(chatRoomId, connection);
    }
    async getFamilyUnreadMessageCounts(profileId, connection) {
        return await chat_1.chatModel.findFamilyUnreadMessageCounts(profileId, connection);
    }
    async getBuddyUnreadMessageCounts(profileId, connection) {
        return await chat_1.chatModel.findBuddyUnreadMessageCounts(profileId, connection);
    }
    async getChatUsers(chatRoomId, connection) {
        return await chat_1.chatModel.findProfilesInChatRoom(chatRoomId, connection);
    }
    async getChatRoomsByProfileId(profileId, connection) {
        return await chat_1.chatModel.findChatRoomsByProfileId(profileId, connection);
    }
    async decreaseChatUserCount(chatRoomId, connection) {
        return await chat_1.chatModel.decreaseChatUserCountChatRoom(chatRoomId, connection);
    }
    async deleteChatUserByProfileId(profileId, connection) {
        return await chat_1.chatModel.deleteChatUserByProfileId(profileId, connection);
    }
    /**
     * chat_user를 생성합니다.
     * @param chatRoomId
     * @param profileId
     * @param connection
     * @returns
     */
    async createChatUser(chatRoomId, profileId, connection) {
        return await chat_1.chatModel.createChatUser({ chatRoomId, profileId }, connection);
    }
    /**
     * userId로 가족 채팅방을 조회합니다.
     * @param userId
     * @param connection
     * @returns
     */
    async getFamilyChatRoom(userId, connection) {
        return await chat_1.chatModel.findFamilyChatRoomByUserId(userId, connection);
    }
}
exports.chatService = new ChatService();
