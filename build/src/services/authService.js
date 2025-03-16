"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const libs_1 = require("../libs");
const profile_1 = require("../models/profile");
const setting_1 = require("../models/setting");
const user_1 = require("../models/user");
const chatService_1 = require("./chatService");
const iamportManager_1 = require("../libs/iamportManager");
class AuthService {
    /**
     * 가족계정 회원가입
     * @param options
     * @param connection
     * @returns
     */
    async postUser(options, connection) {
        const { email } = options;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('이메일 형식이 올바르지 않습니다.');
        }
        const length = email.length;
        if (length > 50) {
            throw new Error('이메일은 50자 이하로 입력해주세요.');
        }
        const checkEmail = await user_1.userModel.findOneUserByEmail(email, connection);
        if (checkEmail) {
            throw new Error('중복된 이메일 입니다.');
        }
        const ret = await user_1.userModel.createUser({
            email: options.email,
            password: options.password,
            phone: options.phone,
            socialId: options.socialId
        }, connection);
        if (!ret) {
            throw new Error('계정 생성에 실패하였습니다.');
        }
        const user = await user_1.userModel.findOneUserByEmail(options.email, connection);
        if (!user) {
            throw new Error('계정 생성에 실패하였습니다.');
        }
        const reqRole = 'user';
        const userId = user.userId;
        const status = user.status;
        const userAccessToken = await libs_1.jwt.createAccessToken(userId, reqRole);
        return { userId, status, userAccessToken };
    }
    async postProfile(options, connection) {
        const checkName = await profile_1.profileModel.findOneProfileByName(options.userId, options.name, connection);
        if (checkName) {
            throw new Error('중복된 이름 입니다.');
        }
        options.relation === 'child' ? options['isParent'] = false : options['isParent'] = true;
        options['accountInfo'] = JSON.stringify({ salt: libs_1.code.generateRandomHash(64) });
        const createCheck = await profile_1.profileModel.createProfile(options, connection);
        if (!createCheck) {
            throw new Error('프로필 생성에 실패하였습니다.');
        }
        const profile = await profile_1.profileModel.findOneProfileByName(options.userId, options.name, connection);
        if (!profile) {
            throw new Error('프로필 생성에 실패하였습니다.');
        }
        const createSetting = await setting_1.settingModel.createSetting(profile.profileId, connection);
        if (!createSetting) {
            throw new Error('프로필 생성에 실패하였습니다.');
        }
        const refreshToken = await libs_1.jwt.createRefreshToken({ profileId: profile.profileId }, profile.accountInfo.salt);
        if (!refreshToken) {
            throw new Error('프로필 생성에 실패하였습니다.');
        }
        const ret = await profile_1.profileModel.updateProfileById(profile.profileId, { refreshToken }, connection);
        if (!ret) {
            throw new Error('프로필 생성에 실패하였습니다.');
        }
        await chatService_1.chatService.enterFamilyChatRoom(options.userId, profile.profileId, connection);
        return ret;
    }
    /**
     * 가족계정 로그인
     * @param options
     * @returns
     */
    async postAuth(options) {
        const ret = await user_1.userModel.findOneUserByEmail(options.email);
        if (!ret) {
            throw new Error('로그인 정보가 올바르지 않습니다.');
        }
        if (ret.password !== options.password) {
            throw new Error('로그인 정보가 올바르지 않습니다.');
        }
        const reqRole = 'user';
        const userAccessToken = await libs_1.jwt.createAccessToken(ret.userId, reqRole);
        return { userId: ret.userId, status: ret.status, userAccessToken };
    }
    async postAuthProfile(profileId) {
        const ret = await profile_1.profileModel.findOneProfileById(profileId);
        if (!ret) {
            throw new Error('다시 로그인 해주세요.');
        }
        const reqRole = 'profile';
        const accessToken = await libs_1.jwt.createAccessToken(ret.profileId, reqRole);
        const refreshToken = await libs_1.jwt.createRefreshToken({ profileId: ret.profileId }, ret.accountInfo.salt);
        return { profileId: ret.profileId, userId: ret.userId, isParent: ret.isParent, accessToken, refreshToken };
    }
    async refreshToken(refreshToken, fcmToken, connection) {
        if (!refreshToken || !fcmToken) {
            throw new Error('empty_token');
        }
        const ref = await profile_1.profileModel.findOneProfileByRef(refreshToken);
        if (!ref) {
            throw new Error('invalid_refresh_token');
        }
        const { profileId, accountInfo: { salt: refreshHash } } = ref;
        try {
            await libs_1.jwt.decodeTokenRefresh(refreshToken, { algorithms: ['HS256'] }, refreshHash);
        }
        catch (e) {
            throw new Error('invalid_refresh_token');
        }
        if (fcmToken)
            profile_1.profileModel.updateProfileById(profileId, { fcmToken });
        const reqRole = 'profile';
        const newAccessToken = await libs_1.jwt.createAccessToken(profileId, reqRole);
        return newAccessToken;
    }
    async getAuthProfiles(userId, options, connection) {
        const ret = await profile_1.profileModel.findFamilyProfiles(userId, options);
        ret.userId = userId;
        return ret;
    }
    async deleteUser(userId, profileId, connection) {
        if (userId) {
            const ret = await user_1.userModel.deleteUser(userId);
            if (!ret) {
                throw new Error("회원 탈퇴에 실패하였습니다.");
            }
            return ret;
        }
        else if (profileId) {
            const profile = await profile_1.profileModel.findOneProfileById(profileId, connection);
            if (!profile) {
                throw new Error("회원 탈퇴에 실패하였습니다.");
            }
            const ret = await user_1.userModel.deleteUser(profile.userId);
            if (!ret) {
                throw new Error("회원 탈퇴에 실패하였습니다.");
            }
            return ret;
        }
        else {
            throw new Error("회원 탈퇴에 실패하였습니다.");
        }
    }
    async postCertifications(options, connection) {
        const danalImpUid = await iamportManager_1.iamportManager.postCertifications(options);
        return danalImpUid;
    }
    async postCertificationConfrim(options, connection) {
        await iamportManager_1.iamportManager.postCertificationConfrim(options);
        return;
    }
}
exports.authService = new AuthService();
