"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authCtrl = void 0;
const authService_1 = require("../../../../services/authService");
const loaders_1 = require("../../../../loaders");
class AuthCtrl {
    /**
     * 가족계정 회원가입
     * @param req
     * @param res
     * @param next
     */
    async postUser(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const { email, password, phone, socialId } = req.options;
            const ret = await authService_1.authService.postUser({ email, password, phone, socialId }, connection);
            await loaders_1.db.commit(connection);
            res.status(200).json(ret);
        }
        catch (e) {
            if (connection)
                await loaders_1.db.rollback(connection);
            e.status = 477;
            next(e);
        }
    }
    async postProfile(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const userId = req.userId;
            const { fcmToken, profilePass, profileImage, name, bankCode, bankName, bankAccount, relation } = req.options;
            await authService_1.authService.postProfile({ userId, profilePass, name, relation, fcmToken, profileImage, bankCode, bankName, bankAccount, }, connection);
            await loaders_1.db.commit(connection);
            res.status(200).send('success');
        }
        catch (e) {
            if (connection)
                await loaders_1.db.rollback(connection);
            e.status = 477;
            next(e);
        }
    }
    /**
     * 가족계정 로그인
     * @param req
     * @param res
     * @param next
     */
    async postAuth(req, res, next) {
        try {
            const { email, password } = req.options;
            const ret = await authService_1.authService.postAuth({ email, password });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async postAuthProfile(req, res, next) {
        try {
            const ret = await authService_1.authService.postAuthProfile(req.options.id);
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async postAuthRefresh(req, res, next) {
        try {
            const { refreshToken, fcmToken } = req.options;
            const newAccessToken = await authService_1.authService.refreshToken(refreshToken, fcmToken);
            res.status(200).json({ accessToken: newAccessToken, refreshToken });
        }
        catch (e) {
            if (e.message === 'invalid_token')
                e.status = 401;
            else if (e.message === 'invalid_refresh_token')
                e.status = 499;
            else if (e.message === 'empty_token')
                e.status = 400;
            next(e);
        }
    }
    async getAuthProfiles(req, res, next) {
        try {
            const userId = req.userId;
            const { page, perPage } = req.options;
            const ret = await authService_1.authService.getAuthProfiles(userId, { page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async deleteUser(req, res, next) {
        try {
            const userId = req.userId;
            const profileId = req.profileId;
            await authService_1.authService.deleteUser(userId, profileId);
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async postCertifications(req, res, next) {
        try {
            const { name, phone, birth, genderDigit, carrier, isMvno } = req.options;
            const ret = await authService_1.authService.postCertifications({ name, phone, birth, gender_digit: genderDigit, carrier, is_mvno: isMvno });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async postCertificationConfrim(req, res, next) {
        try {
            const { danalImpUid, otp } = req.options;
            await authService_1.authService.postCertificationConfrim({ imp_uid: danalImpUid, otp });
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
}
exports.authCtrl = new AuthCtrl();
