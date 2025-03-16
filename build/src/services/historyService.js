"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyService = void 0;
const history_1 = require("../models/history");
const profile_1 = require("../models/profile");
class HistoryService {
    async getAllowanceHistories(profileId, options, connection) {
        const ret = await history_1.historyModel.findAllAllowanceHistories(profileId, options);
        const { balance } = await history_1.historyModel.sumAllAllowanceHistories(profileId);
        ret.balance = balance || 0;
        return ret;
    }
    async getAllowanceHistoriesParentList(profileId, options, connection) {
        const { userId } = await profile_1.profileModel.findOneProfileById(profileId);
        if (!userId) {
            throw new Error("존재하지 않는 계정입니다.");
        }
        const family = await history_1.historyModel.findFamilyProfileWithAmount(userId, profileId, options.date);
        const buddy = await history_1.historyModel.findBuddyProfileWithAmount(profileId, options.date);
        const data = [...family, ...buddy];
        const total = data.length;
        return { data: this.paginate(data, total, options.page, options.perPage), total };
    }
    paginate(data, total, page, perPage) {
        const totalPages = Math.ceil(total / perPage);
        const currentPage = Math.min(page, totalPages);
        const start = (currentPage - 1) * perPage;
        const end = start + perPage;
        return data.slice(start, end);
    }
    async getAllowanceHistoriesAdmin(options, connection) {
        const ret = await history_1.historyModel.findAllAllowanceHistoriesAdmin(options);
        return ret;
    }
    async getAllowanceAlbumHistoriesAdmin(options, connection) {
        const ret = await history_1.historyModel.findAllAllowanceAlbumHistoriesAdmin(options);
        return ret;
    }
}
exports.historyService = new HistoryService();
