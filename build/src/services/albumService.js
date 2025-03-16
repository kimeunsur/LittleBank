"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.albumService = void 0;
const album_1 = require("../models/album");
const chatService_1 = require("../services/chatService");
const profile_1 = require("../models/profile");
const socketManager_1 = require("../libs/socketManager");
const chatType_1 = require("../interfaces/chatType");
const history_1 = require("../models/history");
const chat_1 = require("../models/chat");
const buddy_1 = require("../models/buddy");
const setting_1 = require("../models/setting");
class AlbumService {
    async postAlbumChat(chatRoomId, options, albumImages, connection) {
        var _a;
        const { profileId, albumChat, albumAmount } = options;
        const { isParent } = await profile_1.profileModel.findOneProfileById(profileId, connection);
        if (isParent !== 0) {
            throw new Error('아이만 가능합니다.');
        }
        const adminSetting = await setting_1.settingModel.findAdminSetting();
        if (!adminSetting) {
            throw new Error('수수료 확인에 실패하였습니다. 다시 시도해주세요.');
        }
        const sellingFeeMin = (_a = adminSetting.data[0].sellingFeeMin) !== null && _a !== void 0 ? _a : 0;
        if (albumAmount < sellingFeeMin) {
            throw new Error(`앨범 판매 최소 금액은 ${sellingFeeMin}원 입니다.`);
        }
        const chatType = chatType_1.ChatType.ALBUM;
        const content = {
            allowanceAlbumId: null,
            albumChat,
            albumAmount,
            albumStatus: 'pending',
            albumImages
        };
        const chatMessageId = await chatService_1.chatService.createChatMessage(chatRoomId, profileId, chatType, content, connection);
        if (!chatMessageId) {
            throw new Error('채팅 발송에 실패하였습니다.');
        }
        const allowanceAlbumId = await album_1.albumModel.createAlbumChat(Object.assign({ chatMessageId }, options), connection);
        if (!allowanceAlbumId) {
            throw new Error('앨범 생성에 실패하였습니다.');
        }
        content.allowanceAlbumId = allowanceAlbumId;
        for (const albumImage of albumImages) {
            const ret = await album_1.albumModel.createAlbumIamge(allowanceAlbumId, albumImage, connection);
            if (!ret) {
                throw new Error('사진 업로드에 실패하였습니다.');
            }
        }
        await socketManager_1.socketManager.emitReceiveMessage(profileId, chatRoomId, chatMessageId, chatType, content, connection);
    }
    async getAlbumChat(allowanceAlbumId, connection) {
        const ret = await album_1.albumModel.findOneAlbum(allowanceAlbumId);
        if (!ret) {
            throw new Error("앨범이 존재하지 않습니다.");
        }
        return ret;
    }
    async putAlbumChatComplete(profileId, allowanceAlbumId, connection) {
        var _a, _b;
        const { isParent, parentAmount } = await profile_1.profileModel.findOneProfileById(profileId, connection);
        if (!isParent) {
            throw new Error('부모님만 가능합니다.');
        }
        const album = await album_1.albumModel.findOneAlbum(allowanceAlbumId, connection);
        if (!album) {
            throw new Error('존재하지 않는 앨범입니다.');
        }
        const { albumChat, albumAmount, chatMessageId, albumImages } = album;
        const childProfileId = album.profileId;
        if (parentAmount - albumAmount < 0) {
            throw new Error('금액이 부족합니다');
        }
        if (album.albumStatus === 'complete') {
            throw new Error('이미 완료된 앨범 판매입니다.');
        }
        const child = await profile_1.profileModel.findOneProfileById(childProfileId, connection);
        if (!child) {
            throw new Error('포인트 전송 대상이 존재하지 않습니다.');
        }
        const updateParentAmount = await profile_1.profileModel.updateProfileById(profileId, { parentAmount: parentAmount - albumAmount }, connection);
        if (!updateParentAmount) {
            throw new Error('포인트 전송에 실패하였습니다.');
        }
        const adminSetting = await setting_1.settingModel.findAdminSetting();
        if (!adminSetting) {
            throw new Error('수수료 확인에 실패하였습니다. 다시 시도해주세요.');
        }
        const sellingFee = (_a = adminSetting.data[0].sellingFee) !== null && _a !== void 0 ? _a : 0;
        const totalAmount = Math.floor(albumAmount * ((100 - sellingFee) / 100));
        const albumFee = albumAmount - totalAmount;
        const buddy = await buddy_1.buddyModel.findBuddyName({ followerId: childProfileId, followingId: profileId }, connection);
        if (!buddy) {
            throw new Error('앨범은 친구에게만 팔 수 있습니다.');
        }
        const updateChildAmount = await profile_1.profileModel.updateProfileById(childProfileId, { childAmount: child.childAmount + totalAmount }, connection);
        if (!updateChildAmount) {
            throw new Error('포인트 전송에 실패하였습니다.');
        }
        const allowanceType = 'album';
        const history = await history_1.historyModel.createHistory({ profileId: childProfileId, allowanceType, targetId: allowanceAlbumId }, connection);
        if (!history) {
            throw new Error('포인트 전송에 실패하였습니다.');
        }
        const albumStatus = 'complete';
        const update = await album_1.albumModel.updateAlbumChat(allowanceAlbumId, { albumStatus, albumBuyerName: (_b = buddy.buddyName) !== null && _b !== void 0 ? _b : null, albumBuyerId: profileId, albumFee }, connection);
        if (!update) {
            throw new Error('포인트 전송에 실패하였습니다.');
        }
        const chat = await chat_1.chatModel.findOneChatMessage(chatMessageId, connection);
        if (!chat) {
            throw new Error('존재하지 않는 채팅입니다.');
        }
        const content = {
            allowanceAlbumId,
            albumChat,
            albumAmount,
            albumStatus,
            albumImages
        };
        await socketManager_1.socketManager.emitChangeChatStatus(chat.chatRoomId, chat.profileId, chatMessageId, content);
        return;
    }
}
exports.albumService = new AlbumService();
