"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeService = void 0;
const code_1 = require("../models/code");
class CodeService {
    async getCodeBank(connection) {
        return await code_1.codeModel.findAll();
    }
}
exports.codeService = new CodeService();
