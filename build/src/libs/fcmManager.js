"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fcmManager = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const loaders_1 = require("../loaders");
const fcm_1 = require("../interfaces/fcm");
const chatService_1 = require("../services/chatService");
const buddyService_1 = require("../services/buddyService");
const socketManager_1 = require("./socketManager");
const blockService_1 = require("../services/blockService");
const profileService_1 = require("../services/profileService");
const chatRoomType_1 = require("../interfaces/chatRoomType");
class FcmManager {
    // fcm 공용 펑션 예제
    // import { fcm as Fcm } from '../libs'
    // const fcm = await Setting.findOneFcmUserById(userId, connection)
    // if(!(fcm.weekend === false && Fcm.isWeekend) && fcm.message){
    //   await Fcm.sendMsg(fcm.fcmToken, {title: Fcm.FCM_TEMPLATE.approve.title, body: Fcm.FCM_TEMPLATE.approve.body(work.title)},
    //   {dataId: workId, profile: fcm.profile || 'default', nickName: fcm.name, type: Fcm.FCM_TEMPLATE.approve.type})  
    // }
    async sendFcmToOfflineInChatRoom(profileId, chatRoomId, dto, connection) {
        const { chatRoomType } = dto;
        const sids = socketManager_1.socketManager.getSidsInRoom(chatRoomId);
        const onlineProfileIds = socketManager_1.socketManager.getOnlineProfileIds(sids);
        const chatUsers = await chatService_1.chatService.getChatUserProfileIdFcmTokens(chatRoomId, connection);
        const offlineProfiles = socketManager_1.socketManager.getOfflineProfileIdAndFcmToken(chatUsers, onlineProfileIds);
        const blockProfiles = await blockService_1.blockService.getBlocksThatBlockMe(profileId, connection);
        const filteredOfflineProfiles = offlineProfiles.filter(offlineProfile => !blockProfiles.some(blockProfile => blockProfile.profileId === offlineProfile.profileId));
        const fcmData = {
            dataId: profileId,
            type: chatRoomType === chatRoomType_1.ChatRoomType.GROUP ? fcm_1.FcmType.FAMILY : fcm_1.FcmType.DM
        };
        await this.sendFcm(profileId, filteredOfflineProfiles, fcmData, dto);
    }
    /**
     * 현재 사용하지 않습니다.
     * @param profileId
     * @param dto
     */
    async sendFcmToFriends(profileId, dto) {
        const targetProfiles = await buddyService_1.buddyService.getBuddyProfiles(profileId);
        const blockProfiles = await blockService_1.blockService.getBlocksThatBlockMe(profileId);
        const filteredOfflineProfiles = targetProfiles.filter(offlineProfile => !blockProfiles.some(blockProfile => blockProfile.profileId === offlineProfile.profileId));
        const fcmData = {
            dataId: profileId,
            type: fcm_1.FcmType.OFFLINE
        };
        await this.sendFcm(profileId, filteredOfflineProfiles, fcmData, dto);
    }
    async sendFcm(myProfileId, targetProfiles, // 내 친구 목록
    fcmData, dto) {
        let { isFamily, name, buddies, message, chatRoomType } = dto;
        let arr = []; // fcm test
        let test;
        const myProfile = await profileService_1.profileService.getProfileInfo(myProfileId);
        const myFcmToken = myProfile.fcmToken;
        for (const targetProfile of targetProfiles) {
            const fcmToken = targetProfile.fcmToken;
            const profileId = targetProfile.profileId;
            if (myFcmToken === fcmToken)
                continue;
            if (myProfileId === profileId)
                continue;
            const setting = await profileService_1.profileService.getProfileSetting(profileId);
            let isAlarmEnalbed = 1;
            if (!isFamily) {
                name = buddyService_1.buddyService.getCustomName(buddies, myProfileId);
                isAlarmEnalbed = setting.friendAlarm;
            }
            else {
                isAlarmEnalbed = setting.familyAlarm;
            }
            if (!isAlarmEnalbed)
                continue;
            const fcmMessage = new fcm_1.FcmMessage(chatRoomType === chatRoomType_1.ChatRoomType.GROUP ? fcm_1.FcmType.FAMILY : fcm_1.FcmType.DM, name, message);
            test = await this.sendMsg(fcmToken, fcmMessage, fcmData);
            arr.push(fcmToken);
        }
        loaders_1.logger.info(JSON.stringify(arr, null, 2));
        loaders_1.logger.info(JSON.stringify(test, null, 2));
    }
    // private async sendMsg(toFcmToken: string, message: FcmMessage, fcmData: any): Promise<string>{
    async sendMsg(toFcmToken, message, fcmData) {
        try {
            if (!toFcmToken) {
                throw new Error("required Fcm_Token");
            }
            if (!message.title || !message.body) {
                throw new Error("required message title and message body");
            }
            const msg = this.getMessage(toFcmToken, message, fcmData);
            // logger.info(JSON.stringify(msg)) 
            let msgId = '';
            msgId = await firebase_admin_1.default.messaging().send(msg);
            if (msgId.indexOf("/") >= 0) {
                msgId = msgId.split("/")[msgId.split("/").length - 1];
            }
            // return msgId
            return msg;
        }
        catch (e) {
            // logger.debug(e)
        }
    }
    getMessage(toFcmToken, message, data) {
        const groupKey = data.type; // === "message" ? 'rapopoo_message' : 'rapopoo_noti'
        const sound = data.sound || 'default'; // 알림음, 음성 파일명으로 설정 가능
        const { badge = '0' } = data;
        const msg = {
            token: toFcmToken,
            notification: {
                title: message.title, // 보내는 사람 이름
                body: message.body // 메시지 내용
            },
            //fcm 푸시 메세지 그룹핑(같은 그룹은 알림이 여러 개 안쌓이고 최근 1개만 보이게 처리)
            apns: {
                headers: {
                    'apns-push-type': 'alert',
                    'apns-priority': '5',
                    'apns-collapse-id': groupKey //동작 확인된 그룹핑 키
                },
                payload: {
                    aps: {
                        contentAvailable: true,
                        threadId: groupKey,
                        badge: Number(badge)
                    }
                }
            },
            android: {
                collapseKey: groupKey, //해당 키는 기기가 오프라인상태일때만 동작한다고 함(미확인)
                notification: {
                    tag: groupKey, //동작 확인된 그룹핑 키
                    sound, // 알림음
                },
            },
            data: Object.assign(Object.assign({}, data), { dataId: data.dataId.toString() })
        };
        return msg;
    }
}
exports.fcmManager = new FcmManager();
