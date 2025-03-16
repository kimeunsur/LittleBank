"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class CodeModel {
    async findAll(connection) {
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          *
        FROM
          ?? 
        WHERE isdeleted = 0          
      `,
            values: [tablename_1.default.codeBank]
        });
        return { data: rows };
    }
}
exports.codeModel = new CodeModel();
