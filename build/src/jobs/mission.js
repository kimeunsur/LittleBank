"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agenda = void 0;
const agenda_1 = __importDefault(require("agenda"));
const config_1 = __importDefault(require("config"));
const mongoDbConfig = config_1.default.get('mongodb');
const mongoConnectionString = mongoDbConfig.agenda;
const agenda = new agenda_1.default({ db: { address: mongoConnectionString, options: { useUnifiedTopology: true } } });
exports.agenda = agenda;
// agenda.on('ready', () => console.log('Agenda loaded'))
// agenda.on('error', (error) => console.error('Agenda error:', error))
async function cancelAllJobs() {
    await agenda.cancel({});
}
(async function () {
    await agenda.start().then(async () => {
        await cancelAllJobs();
    });
})();
