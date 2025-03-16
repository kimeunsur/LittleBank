"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iamportManager = void 0;
const config_1 = __importDefault(require("config"));
const axios_1 = __importDefault(require("axios"));
const loaders_1 = require("../loaders");
class IamportManager {
    constructor() {
        this.iamportUrl = 'https://api.iamport.kr';
        this.awsSecrets = config_1.default.get('aws.secrets');
    }
    async getToken() {
        try {
            const { impKey, impSecret } = await loaders_1.aws.getSecretValue(this.awsSecrets.iamport);
            const { data: { response } } = await axios_1.default.post(this.iamportUrl + `/users/getToken`, {
                imp_key: impKey,
                imp_secret: impSecret
            }, {
                headers: {
                    'content-type': 'application/json'
                }
            });
            return response.access_token;
        }
        catch (e) {
            loaders_1.logger.error(e);
            throw e;
        }
    }
    // 다날 본인인증 조회
    async getCertifications(options) {
        try {
            const accessToken = await this.getToken();
            const url = this.iamportUrl + `/certifications/${options.imp_uid}`;
            const data = await axios_1.default.get(url, {
                headers: {
                    'content-type': 'application/json',
                    'authorization': accessToken,
                }
            });
            // if(data.code!==0) throw new Error(data.message)    
            return data.data.response.phone;
        }
        catch (e) {
            console.log(e.response.data);
            throw e;
        }
    }
    // 다날 본인인증 요청
    async postCertifications(options) {
        try {
            const accessToken = await this.getToken();
            const url = this.iamportUrl + `/certifications/otp/request`;
            const data = await axios_1.default.post(url, options, {
                headers: {
                    'content-type': 'application/json',
                    'authorization': accessToken,
                }
            });
            // if(data.code!==0) throw new Error(data.message)    
            return data.data.response.imp_uid;
        }
        catch (e) {
            console.log(e.response.data);
            throw e;
        }
    }
    //  다날 본인인증 확인
    async postCertificationConfrim(options) {
        try {
            const accessToken = await this.getToken();
            const { data } = await axios_1.default.post(this.iamportUrl + `/certifications/otp/confirm/${options.imp_uid}`, { otp: options.otp }, {
                headers: {
                    'content-type': 'application/json',
                    'authorization': accessToken,
                }
            });
            if (data.code !== 0)
                throw new Error(data.message);
            return data.response.imp_uid;
        }
        catch (e) {
            loaders_1.logger.error(e);
            throw e;
        }
    }
}
exports.iamportManager = new IamportManager();
