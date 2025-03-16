"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buddyService = void 0;
const buddy_1 = require("../models/buddy");
const profile_1 = require("../models/profile");
const profileService_1 = require("./profileService");
class BuddyService {
    /**
     *
     * @param buddies 방에 있는 친구 목록
     * @param targetProfileId follwerId와 같은지를 확인하며 친구가 설정한 이름을 가져옵니다.
     * @returns
     */
    getCustomName(buddies, myProfileId) {
        for (const buddy of buddies) {
            if (buddy.followingId === myProfileId) {
                // if (buddy.followerId === targetProfileId) { // 따져보고 수정해야함
                return buddy.buddyName;
            }
        }
        throw new Error('친구로 등록 되어 있지 않습니다.');
    }
    async postBuddy(profileId, buddyProfileId, buddyNameMy, buddyNameYou, connection) {
        const buddyStatus = "buddy"; // 친구 요청 on/off 기획 확정 대기
        if (profileId === buddyProfileId) {
            throw new Error('자기 자신을 친구로 등록할 수 없습니다.');
        }
        const isFriend = await buddy_1.buddyModel.isFriedship(profileId, buddyProfileId);
        if (isFriend) {
            throw new Error('이미 친구로 등록되어 있습니다.');
        }
        const profile = await profileService_1.profileService.getProfileInfo(profileId, connection);
        const buddyProfile = await profileService_1.profileService.getProfileInfo(buddyProfileId, connection);
        if (profile.userId === buddyProfile.userId) {
            throw new Error('가족은 친구로 등록할 수 없습니다.');
        }
        const retMy = await buddy_1.buddyModel.createBuddy({ followerId: profileId, followingId: buddyProfileId, buddyName: buddyNameMy, buddyStatus }, connection);
        if (!retMy) {
            throw new Error('친구 신청에 실패하였습니다.');
        }
        const ret = await buddy_1.buddyModel.createBuddy({ followerId: buddyProfileId, followingId: profileId, buddyName: buddyNameYou, buddyStatus }, connection);
        if (!ret) {
            throw new Error('친구 신청에 실패하였습니다.');
        }
    }
    async getBuddyName(profileId, targetProfileId, connection) {
        const ret = await buddy_1.buddyModel.findBuddyName({ followerId: profileId, followingId: targetProfileId }, connection);
        if (!ret) {
            throw new Error('서로 친구 관계가 아닙니다.');
        }
        return ret.buddyName;
    }
    async getBuddies(profileId, options, connection) {
        const ret = await buddy_1.buddyModel.findAllBuddies(profileId, options);
        return ret;
    }
    async getBuddyProfiles(profileId, connection) {
        return await buddy_1.buddyModel.findBuddyProfiles(profileId, connection);
    }
    async getBuddySearch(profileId, options, connection) {
        const { userId } = await profile_1.profileModel.findOneProfileById(profileId);
        if (!userId) {
            throw new Error('다시 로그인 해주세요.');
        }
        const ret = await buddy_1.buddyModel.findAllBuddiesSearch(userId, profileId, options);
        return ret;
    }
    /**
     * 부모가 친구 탭에서 피드를 조회합니다.
     * @param profileId
     * @param options
     * @param connection
     * @returns
     */
    async getBuddiesNews(profileId, options, connection) {
        return await buddy_1.buddyModel.findBuddiesNews(profileId, options, connection);
    }
    async getBuddiesInChatRoom(chatRoomId, profileId, connection) {
        return await buddy_1.buddyModel.findBuddiesInChatRoom(chatRoomId, profileId, connection);
    }
    async putBuddy(profileId, buddyProfileId, buddyName, connection) {
        const ret = await buddy_1.buddyModel.updateBuddy({ followerId: profileId, followingId: buddyProfileId }, buddyName);
        if (!ret) {
            throw new Error('친구 이름 수정에 실패하였습니다.');
        }
        return ret;
    }
    async deleteBuddy(profileId, buddyProfileId, connection) {
        const retMy = await buddy_1.buddyModel.deleteBuddy({ followerId: profileId, followingId: buddyProfileId }, connection);
        if (!retMy) {
            throw new Error('친구 상태가 아니거나 삭제에 실패하였습니다.');
        }
        const ret = await buddy_1.buddyModel.deleteBuddy({ followerId: buddyProfileId, followingId: profileId }, connection);
        if (!ret) {
            throw new Error('친구 상태가 아니거나 삭제에 실패하였습니다.');
        }
    }
}
exports.buddyService = new BuddyService();
