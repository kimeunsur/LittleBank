"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentCtrl = void 0;
const paymentService_1 = require("../../../../services/paymentService");
const loaders_1 = require("../../../../loaders");
class PaymentCtrl {
    async postPaymentValid(req, res, next) {
        try {
            const profileId = req.profileId;
            const { product, amount, orderId } = req.options;
            const ret = await paymentService_1.paymentService.postPaymentValid(profileId, { product, amount, orderId });
            res.status(200).json(ret);
            // res.status(200).send('success')
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async postPaymentConfirm(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const paymentId = req.options.id;
            const { paymentKey, orderId, amount } = req.options;
            await paymentService_1.paymentService.postPaymentConfirm(paymentId, profileId, { paymentKey, orderId, amount }, connection);
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
    async getPayments(req, res, next) {
        try {
            const profileId = req.profileId;
            const { page, perPage } = req.options;
            const ret = await paymentService_1.paymentService.getPayments(profileId, { page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async postPaymentCancel(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const paymentId = req.options.id;
            const { cancelReason } = req.options;
            await paymentService_1.paymentService.postPaymentCancel(paymentId, profileId, { cancelReason }, connection);
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
}
exports.paymentCtrl = new PaymentCtrl();
