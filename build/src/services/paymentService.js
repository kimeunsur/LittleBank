"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const payment_1 = require("../models/payment");
const profile_1 = require("../models/profile");
const tossManager_1 = require("../libs/tossManager");
const uuid_1 = require("uuid");
const setting_1 = require("../models/setting");
class PaymentService {
    async postPaymentValid(profileId, options, connection) {
        var _a;
        const { isParent } = await profile_1.profileModel.findOneProfileById(profileId);
        if (!isParent) {
            throw new Error('부모님만 가능합니다.');
        }
        const adminSetting = await setting_1.settingModel.findAdminSetting();
        if (!adminSetting) {
            throw new Error('수수료 확인에 실패하였습니다. 다시 시도해주세요.');
        }
        const pointFee = (_a = adminSetting.data[0].pointFee) !== null && _a !== void 0 ? _a : 0;
        const totalAmount = Math.floor(options.amount * ((100 - pointFee) / 100));
        const paymentFee = options.amount - totalAmount;
        const ret = await payment_1.paymentModel.postPayment(Object.assign(Object.assign({ profileId, paymentFee }, options), { paymentStatus: 'pending' }));
        if (!ret) {
            throw new Error('결제 기록에 실패하였습니다.');
        }
        return { paymentId: ret };
    }
    async postPaymentConfirm(paymentId, profileId, options, connection) {
        var _a;
        const { paymentKey, orderId, amount } = options;
        if (amount < 200) {
            throw new Error('최소 결제 금액은 200원 입니다.');
        }
        const { isParent, parentAmount } = await profile_1.profileModel.findOneProfileById(profileId, connection);
        if (!isParent) {
            throw new Error('부모님만 가능합니다.');
        }
        const payment = await payment_1.paymentModel.findOnePayment(paymentId, connection);
        if (payment.orderId !== orderId || payment.amount !== amount || !payment) {
            throw new Error('결제 정보가 일치하지 않습니다.');
        }
        await tossManager_1.tossManager.postPaymentConfirm(Object.assign({}, options));
        const adminSetting = await setting_1.settingModel.findAdminSetting();
        if (!adminSetting) {
            throw new Error('수수료 확인에 실패하였습니다. 다시 시도해주세요.');
        }
        const pointFee = (_a = adminSetting.data[0].pointFee) !== null && _a !== void 0 ? _a : 0;
        const addAmount = Math.floor((amount * (100 - pointFee)) / 100);
        const paymentUpdate = await payment_1.paymentModel.updatePayment(paymentId, { paymentKey, paymentStatus: 'paid' }, connection);
        if (!paymentUpdate) {
            throw new Error('결제에 실패하였습니다.');
        }
        const ret = await profile_1.profileModel.updateProfileById(profileId, { parentAmount: parentAmount + addAmount }, connection);
        if (!ret) {
            throw new Error('충전에 실패하였습니다.');
        }
        return ret;
    }
    async postPaymentCancel(paymentId, profileId, options, connection) {
        const { isParent, parentAmount } = await profile_1.profileModel.findOneProfileById(profileId, connection);
        if (!isParent) {
            throw new Error('부모님만 가능합니다.');
        }
        const payment = await payment_1.paymentModel.findOnePayment(paymentId, connection);
        if (!payment) {
            throw new Error('결제 정보가 일치하지 않습니다.');
        }
        const pointFee = 1; // to do 관리자 수수료 비율 ㄱ
        const addAmount = payment.amount * pointFee;
        if (parentAmount - addAmount < 0) {
            throw new Error('이미 사용한 포인트 입니다.');
        }
        await tossManager_1.tossManager.postPaymentCancel(payment.paymentKey, Object.assign({}, options));
        const paymentUpdate = await payment_1.paymentModel.updatePayment(paymentId, { paymentStatus: 'cancel', cancelReason: options.cancelReason }, connection);
        if (!paymentUpdate) {
            throw new Error('결제 취소에 실패하였습니다.');
        }
        const ret = await profile_1.profileModel.updateProfileById(profileId, { parentAmount: parentAmount - addAmount }, connection);
        if (!ret) {
            throw new Error('결제 취소에 실패하였습니다.');
        }
        return ret;
    }
    async getPayments(profileId, options, connection) {
        const ret = await payment_1.paymentModel.findAllAllPayments(profileId, options);
        return ret;
    }
    getAmount(product) {
        let amount = 0;
        switch (product) {
            case "1만원 충전":
                amount = 10000;
                break;
            case "3만원 충전":
                amount = 30000;
                break;
            case "5만원 충전":
                amount = 50000;
                break;
            default:
                throw new Error('유효하지 않은 상품입니다.');
        }
        return amount;
    }
    generateMerchantUid() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const timestamp = `${year}${month}${day}`;
        const uuid = (0, uuid_1.v4)();
        return `${timestamp}${uuid}`;
    }
    async getPaymentHistories(options, connection) {
        const ret = await payment_1.paymentModel.findAllPaymentHistories(options);
        return ret;
    }
}
exports.paymentService = new PaymentService();
