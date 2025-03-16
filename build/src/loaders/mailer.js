"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.sendToUsers = exports.sendTempPassword = exports.sendResetPassword = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("config"));
const index_1 = require("./index");
const awsSecrets = config_1.default.get('aws.secrets');
let transporter = null;
let senderEmail = null;
async function init() {
    const { service, sender, accountId, pass } = await index_1.aws.getSecretValue(awsSecrets.mailer);
    senderEmail = [sender];
    transporter = nodemailer_1.default.createTransport({
        service,
        auth: {
            user: accountId,
            pass
        }
    });
    index_1.logger.debug('Mailer loaded');
}
exports.init = init;
async function sendToUsers(to, subject, html) {
    try {
        if (['development', 'production'].indexOf(process.env.NODE_ENV) !== -1)
            return;
        if (process.env.NODE_ENV !== 'production')
            subject = `[DEV]${subject}`;
        const mailOptions = {
            from: senderEmail,
            to,
            subject,
            html
        };
        await transporter.sendMail(mailOptions);
    }
    catch (e) {
        throw e;
    }
}
exports.sendToUsers = sendToUsers;
async function sendResetPassword(to, confirmToken) {
    try {
        const subject = '패스워드 변경';
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, '../views/resetPasswordEmailSend.ejs'), { confirmToken }, { async: true });
        await sendToUsers(to, subject, html);
    }
    catch (e) {
        throw e;
    }
}
exports.sendResetPassword = sendResetPassword;
async function sendTempPassword(to, name, password) {
    try {
        const subject = '임시 패스워드 발급';
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, '../views/resetPasswordResult.ejs'), { name, password }, { async: true });
        await sendToUsers(to, subject, html);
    }
    catch (e) {
        throw e;
    }
}
exports.sendTempPassword = sendTempPassword;
