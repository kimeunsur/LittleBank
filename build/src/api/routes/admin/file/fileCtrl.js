"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileCtrl = void 0;
const loaders_1 = require("../../../../loaders");
const mime_types_1 = __importDefault(require("mime-types"));
const uuid_1 = require("uuid");
class FileCtrl {
    async getFilesUpload(req, res, next) {
        try {
            const { mimeType, type, imageUploadTarget, num } = req.options;
            const extensions = mime_types_1.default.extensions[mimeType];
            if (type === 'image' && !mimeType.startsWith('image/')) {
                throw new Error("bad_mimetype");
            }
            if (!extensions) {
                throw new Error("bad_mimetype");
            }
            const result = [];
            for (let i = 0; i < num; i++) {
                const key = `${(0, uuid_1.v4)()}.${extensions[0]}`;
                result.push(loaders_1.aws.generatePreSignedUrl(key, type, mimeType, imageUploadTarget));
            }
            res.status(200).json(result);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
}
exports.fileCtrl = new FileCtrl();
