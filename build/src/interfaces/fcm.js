"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FcmMessage = exports.FcmType = void 0;
/**
 * FCM의 메시지 타입
 */
var FcmType;
(function (FcmType) {
    FcmType["FAMILY"] = "family";
    FcmType["DM"] = "dm";
    // FRIEND = 'friend',
    FcmType["OFFLINE"] = "offline";
})(FcmType || (exports.FcmType = FcmType = {}));
/**
 * FCM의 보여지는 데이터만 포함하는 객체
 */
class FcmMessage {
    constructor(key, name, content) {
        switch (key) {
            case FcmType.FAMILY:
                this.title = name;
                this.body = content;
                break;
            case FcmType.DM:
                this.title = name;
                this.body = content;
                break;
            case FcmType.OFFLINE:
                this.title = name;
                this.body = content;
                break;
            default:
                throw new Error('Invalid FcmType');
        }
    }
}
exports.FcmMessage = FcmMessage;
