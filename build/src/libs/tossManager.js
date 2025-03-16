"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tossManager = void 0;
const config_1 = __importDefault(require("config"));
const axios_1 = __importDefault(require("axios"));
const loaders_1 = require("../loaders");
class TossManager {
    constructor() {
        this.tossUrl = 'https://api.tosspayments.com/v1';
        this.awsSecrets = config_1.default.get('aws.secrets');
        //결제 조회(iamport code)
        // async getPaymentCard(customer_uid: string): Promise<any> {
        //     try {
        //         const accessToken = await this.getToken()
        //         const { data } = await axios.get(
        //         this.iamportUrl + `/subscribe/customers/${customer_uid}`,
        //         {
        //             headers: {
        //             'content-type': 'application/json',
        //             'authorization': accessToken,
        //             }
        //             }
        //         )
        //         for (let i = 4; i < 8; i++) {
        //         data.response.card_number = data.response.card_number.replace(data.response.card_number[i], '*') 
        //         }
        //         if(data.code!==0) throw new Error(data.message)
        //         return data.response
        //     } catch (e) {
        //         throw e
        //     }
        //     }
    }
    /**
     * 결제 승인
     *
     * Client SDK를 통해 요청된 건이 request 상태로 있으며, 해당 API로 결제를 승인한다.
     * paymentKey로 결제를 요청함과 동시에 해당 키가 없으면 실패하기 때문에 유효성 검사까지 같이 진행되는 셈이다.
     * @param options
     * @returns
     */
    async postPaymentConfirm(options) {
        try {
            const { secretKey, testSecretKey } = await loaders_1.aws.getSecretValue(this.awsSecrets.toss);
            let tossKey;
            process.env.NODE_ENV === 'production' ? tossKey = secretKey : tossKey = testSecretKey;
            const accessToken = "Basic " + Buffer.from(tossKey + ":").toString("base64");
            const axiosResponse = await axios_1.default.post(this.tossUrl + `/payments/confirm`, {
                paymentKey: options.paymentKey,
                orderId: options.orderId,
                amount: options.amount.toString()
            }, {
                headers: {
                    'content-type': 'application/json',
                    'authorization': accessToken,
                }
            });
            return axiosResponse.data;
        }
        catch (e) {
            loaders_1.logger.error(e);
            throw e;
        }
    }
    //결제 취소
    async postPaymentCancel(paymentKey, options) {
        try {
            const { secretKey, testSecretKey } = await loaders_1.aws.getSecretValue(this.awsSecrets.toss);
            let tossKey;
            process.env.NODE_ENV === 'production' ? tossKey = secretKey : tossKey = testSecretKey;
            const accessToken = "Basic " + Buffer.from(tossKey + ":").toString("base64");
            const axiosResponse = await axios_1.default.post(this.tossUrl + `/payments/${paymentKey}/cancel`, options, {
                headers: {
                    'content-type': 'application/json',
                    'authorization': accessToken,
                }
            });
            return axiosResponse.data;
        }
        catch (e) {
            loaders_1.logger.error(e);
            throw e;
        }
    }
}
exports.tossManager = new TossManager();
