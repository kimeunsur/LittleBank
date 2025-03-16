"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileService = void 0;
const profile_1 = require("../models/profile");
const setting_1 = require("../models/setting");
const blockService_1 = require("./blockService");
const buddyService_1 = require("./buddyService");
const chatService_1 = require("./chatService");
class ProfileService {
    async getProfileInfo(profileId, connection) {
        const ret = await profile_1.profileModel.findOneProfileById(profileId, connection);
        if (!ret) {
            throw new Error("프로필이 존재하지 않습니다.");
        }
        return ret;
    }
    isFamily(profileId, targetProfileId) {
        return profileId === targetProfileId;
    }
    async getName(profileId, targetProfileId, connection) {
        const profile = await this.getProfileInfo(profileId, connection);
        const targetProfile = await this.getProfileInfo(targetProfileId, connection);
        const myUserId = profile.userId;
        const targetUserId = targetProfile.userId;
        let name = '';
        if (!this.isFamily(myUserId, targetUserId)) {
            name = await buddyService_1.buddyService.getBuddyName(profileId, targetProfileId, connection);
        }
        else {
            name = await this.getFamilyName(targetProfileId, connection);
        }
        return name;
    }
    /**
     * 자신을 제외한 가족 프로필 목록을 가져옵니다.
     * 가족이 프로필을 생성하지 않았다면 빈 배열을 반환합니다.
     * @param userId
     * @param profileId
     * @param connection
     * @returns
     */
    async getFamilyProfilesInfo(userId, profileId, connection) {
        const families = await profile_1.profileModel.findFamilyProfilesInfoExcludingUser(userId, profileId, connection);
        const blocks = await blockService_1.blockService.getBlocksThatBlockedByMe(profileId, connection);
        const ret = families.filter((family) => {
            return !blockService_1.blockService.hasBlockedProfile(blocks, family.profileId);
        });
        return ret;
    }
    async getFamilyName(profileId, connection) {
        const name = await profile_1.profileModel.findOneFamilyNameById(profileId, connection);
        if (!name) {
            throw new Error('프로필이 존재하지 않습니다.');
        }
        return name;
    }
    async putProfileInfo(profileId, options, connection) {
        options = Object.fromEntries(Object.entries(options).filter(([_, value]) => value != null));
        const ret = await profile_1.profileModel.updateProfileById(profileId, options);
        if (!ret) {
            throw new Error("프로필 수정에 실패하였습니다.");
        }
        return ret;
    }
    async getProfileSetting(profileId, connection) {
        const ret = await setting_1.settingModel.findOneProfileSetting(profileId);
        if (!ret) {
            throw new Error("프로필이 존재하지 않습니다.");
        }
        return ret;
    }
    async getFcmToken(profileId, connection) {
        const fcmToken = await profile_1.profileModel.findOneFcmToken(profileId, connection);
        if (!fcmToken) {
            throw new Error('FCM 토큰이 존재하지 않습니다.');
        }
        return fcmToken;
    }
    async putProfileSetting(profileId, options, connection) {
        options = Object.fromEntries(Object.entries(options).filter(([_, value]) => value != null));
        const ret = await setting_1.settingModel.updateProfileSetting(profileId, options);
        if (!ret) {
            throw new Error("프로필 수정에 실패하였습니다.");
        }
        return ret;
    }
    async deleteProfile(profileId, connection) {
        const ret = await profile_1.profileModel.deleteProfile(profileId);
        if (!ret) {
            throw new Error("프로필 삭제에 실패하였습니다.");
        }
        const chatRooms = await chatService_1.chatService.getChatRoomsByProfileId(profileId, connection);
        for (const chatRoom of chatRooms) {
            await chatService_1.chatService.decreaseChatUserCount(chatRoom.chatRoomId, connection);
        }
        await chatService_1.chatService.deleteChatUserByProfileId(profileId, connection);
        return ret;
    }
}
exports.profileService = new ProfileService();
