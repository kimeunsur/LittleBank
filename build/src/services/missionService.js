"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missionService = void 0;
const mission_1 = require("../models/mission");
const chatService_1 = require("../services/chatService");
const profile_1 = require("../models/profile");
const socketManager_1 = require("../libs/socketManager");
const chatType_1 = require("../interfaces/chatType");
const chat_1 = require("../models/chat");
const history_1 = require("../models/history");
const buddyService_1 = require("./buddyService");
const profileService_1 = require("./profileService");
class MissionService {
    async postMissionChat(profileId, chatRoomId, options, connection) {
        const { missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage } = options;
        const { isParent } = await profile_1.profileModel.findOneProfileById(profileId, connection);
        if (!isParent) {
            throw new Error('부모님만 가능합니다.');
        }
        const chatType = chatType_1.ChatType.MISSION;
        const content = {
            allowanceMissionId: null,
            missionChat,
            missionAmount,
            missionStartDate,
            missionEndDate,
            missionParentComment,
            missionParentImage,
            missionChildComment: null,
            missionChildImage: null,
            missionStatus: 'missionCreate',
            childProfileId: null,
            childProfileName: null
        };
        const chatMessageId = await chatService_1.chatService.createChatMessage(chatRoomId, profileId, chatType, content, connection);
        if (!chatMessageId) {
            throw new Error('채팅 발송에 실패하였습니다.');
        }
        const allowanceMissionId = await mission_1.missionModel.createMissionChat(Object.assign({ chatMessageId, profileId }, options), connection);
        if (!allowanceMissionId) {
            throw new Error('미션 생성에 실패하였습니다.');
        }
        content.allowanceMissionId = allowanceMissionId;
        await socketManager_1.socketManager.emitReceiveMessage(profileId, chatRoomId, chatMessageId, chatType, content, connection);
        return;
    }
    isFamily(userId, targetUserId) {
        return userId === targetUserId;
    }
    async getMissionChat(allowanceMissionId, profileId, connection) {
        const ret = await mission_1.missionModel.findOneMission(allowanceMissionId, connection);
        if (!ret) {
            throw new Error("미션이 존재하지 않습니다.");
        }
        const { childProfileId } = ret;
        if (childProfileId) {
            const profile = await profileService_1.profileService.getProfileInfo(profileId, connection);
            const childProfile = await profileService_1.profileService.getProfileInfo(childProfileId, connection);
            const userId = profile.userId;
            const childUserId = childProfile.userId;
            let name = '';
            if (this.isFamily(userId, childUserId)) {
                name = await profileService_1.profileService.getFamilyName(childProfileId, connection);
            }
            else {
                name = await buddyService_1.buddyService.getBuddyName(profileId, childProfileId, connection);
            }
            ret['childProfileName'] = name;
            ret['childProfileImage'] = childProfile.profileImage;
        }
        else {
            ret['childProfileName'] = null;
            ret['childProfileImage'] = null;
        }
        return ret;
    }
    async putMissionChat(profileId, allowanceMissionId, options, connection) {
        const { isParent } = await profile_1.profileModel.findOneProfileById(profileId, connection);
        if (!isParent) {
            throw new Error('부모님만 가능합니다.');
        }
        options = Object.fromEntries(Object.entries(options).filter(([_, value]) => value != null));
        const ret = await mission_1.missionModel.updateMissionChat(allowanceMissionId, options);
        if (!ret) {
            throw new Error('미션 수정에 실패하였습니다.');
        }
        const mission = await mission_1.missionModel.findOneMission(allowanceMissionId, connection);
        if (!mission || mission.missionStatus !== "missionCreate") {
            throw new Error('미션 생성 직후에만 수정 가능합니다.');
        }
        const { chatMessageId, missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage } = mission;
        const chat = await chat_1.chatModel.findOneChatMessage(chatMessageId, connection);
        if (!chat) {
            throw new Error('존재하지 않는 채팅입니다.');
        }
        const content = {
            allowanceMissionId,
            missionChat,
            missionAmount,
            missionStartDate,
            missionEndDate,
            missionParentComment,
            missionParentImage,
            missionChildComment: null,
            missionChildImage: null,
            missionStatus: 'missionCreate',
            childProfileId: null,
            childProfileName: null
        };
        await socketManager_1.socketManager.emitChangeChatStatus(chat.chatRoomId, chat.profileId, chatMessageId, content);
        return ret;
    }
    async putMissionChatRequest(profileId, allowanceMissionId, connection) {
        const { isParent, name } = await profile_1.profileModel.findOneProfileById(profileId, connection);
        if (isParent !== 0) {
            throw new Error('아이만 가능합니다.');
        }
        const mission = await mission_1.missionModel.findOneMission(allowanceMissionId, connection);
        if (!mission) {
            throw new Error('존재하지 않는 미션입니다.');
        }
        if (mission.missionStatus !== "missionCreate") {
            throw new Error('미션 요청이 불가능한 상태입니다.');
        }
        const { childProfileId, chatMessageId, missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage } = mission;
        if (childProfileId) {
            throw new Error('이미 다른 사람이 신청한 미션입니다.');
        }
        const missionStatus = 'assignRequest';
        const ret = await mission_1.missionModel.updateMissionChat(allowanceMissionId, { childProfileId: profileId, missionStatus }, connection);
        if (!ret) {
            throw new Error('미션 요청에 실패하였습니다.');
        }
        const chat = await chat_1.chatModel.findOneChatMessage(chatMessageId, connection);
        if (!chat) {
            throw new Error('존재하지 않는 채팅입니다.');
        }
        const content = {
            allowanceMissionId,
            missionChat,
            missionAmount,
            missionStartDate,
            missionEndDate,
            missionParentComment,
            missionParentImage,
            missionChildComment: null,
            missionChildImage: null,
            missionStatus,
            childProfileId: profileId,
            childProfileName: name
        };
        await socketManager_1.socketManager.emitChangeChatStatus(chat.chatRoomId, chat.profileId, chatMessageId, content);
        return;
    }
    async putMissionChatAssign(profileId, allowanceMissionId, connection) {
        const { isParent } = await profile_1.profileModel.findOneProfileById(profileId, connection);
        if (!isParent) {
            throw new Error('부모님만 가능합니다.');
        }
        const mission = await mission_1.missionModel.findOneMission(allowanceMissionId, connection);
        if (!mission) {
            throw new Error('존재하지 않는 미션입니다.');
        }
        if (mission.missionStatus !== "assignRequest") {
            throw new Error('미션 승인이 불가능한 상태입니다.');
        }
        const { chatMessageId, missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage, childProfileId } = mission;
        const missionStatus = 'assigned';
        const update = await mission_1.missionModel.updateMissionChat(allowanceMissionId, { missionStatus }, connection);
        if (!update) {
            throw new Error('미션 승인에 실패하였습니다.');
        }
        const chat = await chat_1.chatModel.findOneChatMessage(chatMessageId, connection);
        if (!chat) {
            throw new Error('존재하지 않는 채팅입니다.');
        }
        const { name } = await profile_1.profileModel.findOneProfileById(childProfileId, connection);
        if (!name) {
            throw new Error('존재하지 않는 프로필입니다.');
        }
        const content = {
            allowanceMissionId,
            missionChat,
            missionAmount,
            missionStartDate,
            missionEndDate,
            missionParentComment,
            missionParentImage,
            missionChildComment: null,
            missionChildImage: null,
            missionStatus,
            childProfileId,
            childProfileName: name
        };
        await socketManager_1.socketManager.emitChangeChatStatus(chat.chatRoomId, chat.profileId, chatMessageId, content);
        return;
    }
    async putMissionChatChildComplete(profileId, allowanceMissionId, options, connection) {
        const { missionChildComment, missionChildImage } = options;
        const { isParent } = await profile_1.profileModel.findOneProfileById(profileId, connection);
        if (isParent !== 0) {
            throw new Error('아이만 가능합니다.');
        }
        const mission = await mission_1.missionModel.findOneMission(allowanceMissionId, connection);
        if (!mission) {
            throw new Error('존재하지 않는 미션입니다.');
        }
        const { chatMessageId, missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage, childProfileId } = mission;
        if (childProfileId !== profileId) {
            throw new Error('미션 완료는 본인만 가능합니다.');
        }
        if (mission.missionStatus !== "assigned") {
            throw new Error('승인되지 않은 미션입니다.');
        }
        const missionStatus = 'missionComplete';
        const update = await mission_1.missionModel.updateMissionChat(allowanceMissionId, { missionChildComment, missionChildImage, missionStatus }, connection);
        if (!update) {
            throw new Error('미션 승인에 실패하였습니다.');
        }
        const chat = await chat_1.chatModel.findOneChatMessage(chatMessageId, connection);
        if (!chat) {
            throw new Error('존재하지 않는 채팅입니다.');
        }
        const { name } = await profile_1.profileModel.findOneProfileById(childProfileId, connection);
        if (!name) {
            throw new Error('존재하지 않는 프로필입니다.');
        }
        const content = {
            allowanceMissionId,
            missionChat,
            missionAmount,
            missionStartDate,
            missionEndDate,
            missionParentComment,
            missionParentImage,
            missionChildComment,
            missionChildImage,
            missionStatus,
            childProfileId,
            childProfileName: name
        };
        await socketManager_1.socketManager.emitChangeChatStatus(chat.chatRoomId, chat.profileId, chatMessageId, content);
        return;
    }
    async putMissionChatComplete(profileId, allowanceMissionId, connection) {
        const { isParent, parentAmount } = await profile_1.profileModel.findOneProfileById(profileId, connection);
        if (!isParent) {
            throw new Error('부모님만 가능합니다.');
        }
        const mission = await mission_1.missionModel.findOneMission(allowanceMissionId, connection);
        if (!mission) {
            throw new Error('존재하지 않는 미션입니다.');
        }
        const { chatMessageId, missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage, childProfileId, missionChildComment, missionChildImage } = mission;
        if (mission.missionStatus !== "missionComplete") {
            throw new Error('아이가 미션을 완료하지 않았습니다.');
        }
        if (parentAmount - missionAmount < 0) {
            throw new Error('금액이 부족합니다');
        }
        const { name, childAmount } = await profile_1.profileModel.findOneProfileById(childProfileId, connection);
        if (!name) {
            throw new Error('존재하지 않는 프로필입니다.');
        }
        const updateParentAmount = await profile_1.profileModel.updateProfileById(profileId, { parentAmount: parentAmount - missionAmount }, connection);
        if (!updateParentAmount) {
            throw new Error('포인트 전송에 실패하였습니다.');
        }
        const updateChildAmount = await profile_1.profileModel.updateProfileById(childProfileId, { childAmount: childAmount + missionAmount }, connection);
        if (!updateChildAmount) {
            throw new Error('포인트 전송에 실패하였습니다.');
        }
        const allowanceType = 'mission';
        const history = await history_1.historyModel.createHistory({ profileId: childProfileId, allowanceType, targetId: allowanceMissionId }, connection);
        if (!history) {
            throw new Error('포인트 전송 기록에 실패하였습니다.');
        }
        const missionStatus = 'complete';
        const update = await mission_1.missionModel.updateMissionChat(allowanceMissionId, { missionStatus }, connection);
        if (!update) {
            throw new Error('포인트 전송에 실패하였습니다.');
        }
        const chat = await chat_1.chatModel.findOneChatMessage(chatMessageId, connection);
        if (!chat) {
            throw new Error('존재하지 않는 채팅입니다.');
        }
        const content = {
            allowanceMissionId,
            missionChat,
            missionAmount,
            missionStartDate,
            missionEndDate,
            missionParentComment,
            missionParentImage,
            missionChildComment,
            missionChildImage,
            missionStatus,
            childProfileId,
            childProfileName: name
        };
        await socketManager_1.socketManager.emitChangeChatStatus(chat.chatRoomId, chat.profileId, chatMessageId, content);
        const message = chatService_1.chatService.getContent(chatType_1.ChatType.MISSION);
        const buddies = await buddyService_1.buddyService.getBuddyProfiles(childProfileId, connection);
        const dto = {
            isFamily: false,
            name,
            buddies,
            message
        };
        // await fcmManager.sendFcmToFriends(childProfileId, dto)
    }
    async deleteMissionChat(profileId, allowanceMissionId, connection) {
        const { isParent } = await profile_1.profileModel.findOneProfileById(profileId);
        if (!isParent) {
            throw new Error('부모님만 가능합니다.');
        }
        const check = await mission_1.missionModel.findOneMission(allowanceMissionId);
        if (!check || check.missionStatus !== "missionCreate") {
            throw new Error('미션 생성 직후에만 삭제 가능합니다.');
        }
        const ret = await mission_1.missionModel.deleteMissionChat(allowanceMissionId);
        if (!ret) {
            throw new Error('미션 삭제에 실패하였습니다.');
        }
        return ret;
    }
}
exports.missionService = new MissionService();
