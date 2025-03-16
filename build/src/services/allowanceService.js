"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowanceService = void 0;
const allowance_1 = require("../models/allowance");
const profile_1 = require("../models/profile");
const chatService_1 = require("../services/chatService");
const socketManager_1 = require("../libs/socketManager");
const chatType_1 = require("../interfaces/chatType");
const history_1 = require("../models/history");
const chat_1 = require("../models/chat");
const buddyService_1 = require("./buddyService");
class AllowanceService {
    async postAllowanceTask(profileId, options, connection) {
        const { userId, isParent } = await profile_1.profileModel.findOneProfileById(profileId);
        if (!userId || !isParent) {
            throw new Error('부모님만 가능합니다.');
        }
        const ret = await allowance_1.allowanceModel.createAllowanceTask(Object.assign({ userId }, options));
        if (!ret) {
            throw new Error('용돈 항목 생성에 실패하였습니다.');
        }
        return ret;
    }
    async getAllowanceTasks(profileId, options, connection) {
        const { userId } = await profile_1.profileModel.findOneProfileById(profileId);
        if (!userId) {
            throw new Error('용돈 항목을 찾을 수 없습니다.');
        }
        const ret = await allowance_1.allowanceModel.findAllAllowanceTasks(userId, options);
        if (ret.total === 0) {
            throw new Error('등록된 용돈 항목이 존재하지 않습니다.');
        }
        return ret;
    }
    async putAllowanceTask(profileId, allowanceTaskId, options, connection) {
        const { isParent } = await profile_1.profileModel.findOneProfileById(profileId);
        if (!isParent) {
            throw new Error('부모님만 가능합니다.');
        }
        options = Object.fromEntries(Object.entries(options).filter(([_, value]) => value != null));
        const ret = await allowance_1.allowanceModel.updateAllowanceTask(allowanceTaskId, options);
        if (!ret) {
            throw new Error('용돈 항목 수정에 실패하였습니다.');
        }
        return ret;
    }
    async deleteAllowanceTask(profileId, allowanceTaskId, connection) {
        const { isParent } = await profile_1.profileModel.findOneProfileById(profileId);
        if (!isParent) {
            throw new Error('부모님만 가능합니다.');
        }
        const ret = await allowance_1.allowanceModel.deleteAllowanceTask(allowanceTaskId);
        if (!ret) {
            throw new Error('용돈 항목 삭제에 실패하였습니다.');
        }
        return ret;
    }
    async postAllowanceChat(chatRoomId, allowanceTaskId, options, connection) {
        const { profileId, allowanceChat, allowanceChatImage } = options;
        const { isParent } = await profile_1.profileModel.findOneProfileById(profileId, connection);
        if (isParent !== 0) {
            throw new Error('아이만 가능합니다.');
        }
        const { taskContent, taskAmount } = await allowance_1.allowanceModel.findOneAllowanceTask(allowanceTaskId, connection);
        if (!taskContent || !taskAmount) {
            throw new Error('용돈 항목을 찾을 수 없습니다.');
        }
        const chatType = chatType_1.ChatType.TASK;
        const content = {
            allowanceChatId: null,
            allowanceChat,
            allowanceContent: taskContent,
            allowanceAmount: taskAmount,
            allowanceChatImage,
            allowanceChatStatus: 'pending',
        };
        const chatMessageId = await chatService_1.chatService.createChatMessage(chatRoomId, profileId, chatType, content, connection);
        if (!chatMessageId) {
            throw new Error('채팅 발송에 실패하였습니다.');
        }
        const allowanceChatId = await allowance_1.allowanceModel.createAllowanceChat(Object.assign({ chatMessageId, allowanceContent: taskContent, allowanceAmount: taskAmount }, options), connection);
        if (!allowanceChatId) {
            throw new Error('용돈 요청에 실패하였습니다.');
        }
        content.allowanceChatId = allowanceChatId;
        const ret = await socketManager_1.socketManager.emitReceiveMessage(profileId, chatRoomId, chatMessageId, chatType, content, connection);
        return;
    }
    async getAllowanceChat(allowanceChatId, connection) {
        const ret = await allowance_1.allowanceModel.findOneAllowanceChat(allowanceChatId);
        if (!ret) {
            throw new Error("용돈 채팅이 존재하지 않습니다.");
        }
        return ret;
    }
    async putAllowanceChatComplete(profileId, allowanceChatId, connection) {
        const { isParent, parentAmount } = await profile_1.profileModel.findOneProfileById(profileId, connection);
        if (!isParent) {
            throw new Error('부모님만 가능합니다.');
        }
        const allowance = await allowance_1.allowanceModel.findOneAllowanceChat(allowanceChatId, connection);
        if (!allowance) {
            throw new Error('존재하지 용돈 요청입니다.');
        }
        const { allowanceContent, allowanceChat, allowanceChatImage, allowanceAmount, chatMessageId } = allowance;
        const childProfileId = allowance.profileId;
        if (parentAmount - allowanceAmount < 0) {
            throw new Error('금액이 부족합니다');
        }
        if (allowance.allowanceChatStatus === 'complete') {
            throw new Error('이미 완료된 용돈 요청입니다.');
        }
        const child = await profile_1.profileModel.findOneProfileById(childProfileId, connection);
        if (!child) {
            throw new Error('포인트 전송 대상이 존재하지 않습니다.');
        }
        const updateParentAmount = await profile_1.profileModel.updateProfileById(profileId, { parentAmount: parentAmount - allowanceAmount }, connection);
        if (!updateParentAmount) {
            throw new Error('포인트 전송에 실패하였습니다.');
        }
        const updateChildAmount = await profile_1.profileModel.updateProfileById(childProfileId, { childAmount: child.childAmount + allowanceAmount }, connection);
        if (!updateChildAmount) {
            throw new Error('포인트 전송에 실패하였습니다.');
        }
        const allowanceType = 'task';
        const history = await history_1.historyModel.createHistory({ profileId: childProfileId, allowanceType, targetId: allowanceChatId }, connection);
        if (!history) {
            throw new Error('포인트 전송 기록에 실패하였습니다.');
        }
        const allowanceChatStatus = 'complete';
        const update = await allowance_1.allowanceModel.updateAllowanceChat(allowanceChatId, { allowanceChatStatus }, connection);
        if (!update) {
            throw new Error('포인트 전송에 실패하였습니다.');
        }
        const chat = await chat_1.chatModel.findOneChatMessage(chatMessageId, connection);
        if (!chat) {
            throw new Error('존재하지 않는 채팅입니다.');
        }
        const content = {
            allowanceChatId,
            allowanceChat,
            allowanceContent,
            allowanceAmount,
            allowanceChatImage,
            allowanceChatStatus,
        };
        await socketManager_1.socketManager.emitChangeChatStatus(chat.chatRoomId, chat.profileId, chatMessageId, content);
        const message = chatService_1.chatService.getContent(chatType_1.ChatType.MISSION);
        const buddies = await buddyService_1.buddyService.getBuddyProfiles(child.profileId, connection);
        const dto = {
            isFamily: false,
            name: child.name,
            buddies,
            message
        };
        // await fcmManager.sendFcmToFriends(child.profileId, dto)
    }
}
exports.allowanceService = new AllowanceService();
