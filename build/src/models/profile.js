"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class ProfileModel {
    async createProfile(options, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `INSERT INTO ?? SET ?`,
            values: [tablename_1.default.profile, Object.assign({}, options)]
        });
        return insertId;
    }
    async findOneProfileById(profileId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
            values: [tablename_1.default.profile, { profileId }]
        });
        return row;
    }
    async findOneProfileByName(userId, name, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `SELECT * FROM ?? WHERE ? AND ? AND isDeleted != 1`,
            values: [tablename_1.default.profile, { name }, { userId }]
        });
        return row;
    }
    async findOneProfileByRef(refreshToken, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
            values: [tablename_1.default.profile, { refreshToken }]
        });
        return row;
    }
    async findOneFcmToken(profileId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `SELECT fcmToken FROM ?? WHERE ? AND isDeleted != 1`,
            values: [tablename_1.default.profile, { profileId }]
        });
        return row.fcmToken;
    }
    async updateProfileById(profileId, options, connection) {
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `UPDATE ?? SET ? WHERE ?`,
            values: [tablename_1.default.profile, Object.assign({}, options), { profileId }]
        });
        return affectedRows;
    }
    async findFamilyProfilesInfoExcludingUser(userId, profileId, connection) {
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
         * 
        FROM ?? 
        WHERE ? 
          AND profileId != ? 
          AND isDeleted != 1
      `,
            values: [tablename_1.default.profile, { userId }, profileId]
        });
        return rows;
    }
    async findOneFamilyNameById(profileId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT 
          p.name
        from ?? p
        where p.profileId = ?
      `,
            values: [tablename_1.default.profile, profileId]
        });
        return row.name;
    }
    async findFamilyProfiles(userId, options, connection) {
        const { page, perPage } = options;
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT    
          *
        FROM
          ??        
        WHERE
          ? AND isDeleted != 1     
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
            values: [tablename_1.default.profile, { userId }]
        });
        const [total] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          COUNT(*) AS cnt
        FROM
          ??      
        WHERE
          ? AND isDeleted != 1
      `,
            values: [tablename_1.default.profile, { userId }]
        });
        return { data: rows, total: (total === null || total === void 0 ? void 0 : total.cnt) || 0 };
    }
    async findAllProfilesForAdmin(options, connection) {
        const { search, order, page, perPage } = options;
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          p.profileId,
          p.userId,
          u.email,
          u.password,
          p.relation,
          p.name,
          p.profilePass,
          u.phone,
          u.createdAt as userCreatedAt,
          p.createdAt as profileCreatedAt,
          (CASE 
            WHEN isParent = 1 THEN parentAmount
            WHEN isParent = 0 THEN childAmount
          END) AS amount,
          p.bankName,
          p.bankAccount
        FROM
          ?? p
        JOIN
          ?? u ON p.userId = u.userId
        WHERE
          p.isDeleted != 1
          ${search ? `AND (u.email LIKE '%${search}%' OR u.phone LIKE '%${search}%')` : ''}
        ORDER BY
          p.createdAt ${order}
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
            values: [tablename_1.default.profile, tablename_1.default.user]
        });
        const [total] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          COUNT(p.profileId) AS cnt
        FROM
          ?? p
        JOIN
          ?? u ON p.userId = u.userId
        WHERE
          p.isDeleted != 1
          ${search ? `AND (u.email LIKE '%${search}%' OR u.phone LIKE '%${search}%')` : ''}
      `,
            values: [tablename_1.default.profile, tablename_1.default.user]
        });
        return { data: rows, total: (total === null || total === void 0 ? void 0 : total.cnt) || 0 };
    }
    async findFamilyForAdmin(userId, connection) {
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          p.profileId,
          p.userId,
          u.email,
          u.password,
          p.relation,
          p.name,
          p.profilePass,
          u.phone,
          u.createdAt as userCreatedAt,
          p.createdAt as profileCreatedAt,
          (CASE 
            WHEN isParent = 1 THEN parentAmount
            WHEN isParent = 0 THEN childAmount
          END) AS amount,
          p.bankName,
          p.bankAccount
        FROM
          ?? p
        JOIN
          ?? u ON p.userId = u.userId
        WHERE
          p.isDeleted != 1 AND p.?
        ORDER BY
          p.createdAt DESC           
      `,
            values: [tablename_1.default.profile, tablename_1.default.user, { userId }]
        });
        return { data: rows };
    }
    async deleteProfile(profileId, connection) {
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `UPDATE ?? SET isDeleted = true, deletedAt = now() WHERE ?`,
            values: [tablename_1.default.profile, { profileId }]
        });
        return affectedRows;
    }
}
exports.profileModel = new ProfileModel();
