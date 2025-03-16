"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressManager = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = __importDefault(require("config"));
const express_session_1 = __importDefault(require("express-session"));
const redis_1 = __importDefault(require("redis"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const agendash_1 = __importDefault(require("agendash"));
const cors_1 = __importDefault(require("cors"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
//multer setting
const multer_1 = __importDefault(require("multer"));
var upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const middlewares_1 = require("../api/middlewares");
const loaders_1 = require("../loaders");
const routes_1 = __importDefault(require("../api/routes"));
const mission_1 = require("../jobs/mission");
const util_1 = require("util");
const app = (0, express_1.default)();
const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
const redisClient = redis_1.default.createClient(config_1.default.get('redis'));
/**
 * redis가 연결되었을 때까지 기다리도록 한다.
 * 이벤트 형식은 Promise를 반환하지 않기 때문에 반환하도록 의도적으로 만들어줍니다.
 */
const redisClientReady = (0, util_1.promisify)((callback) => {
    redisClient.on('ready', callback);
});
(async () => {
    await redisClientReady();
    loaders_1.logger.debug('Redis connected');
})();
const sess = {
    name: 'littlebank.sid',
    secret: 'w)fJnqw<4G8g~w?f',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: new RedisStore({ client: redisClient }),
    cookie: {
        httpOnly: true,
        sameSite: true,
        maxAge: 60 * 60 * 2 * 1000
    }
};
if (['development', 'production'].indexOf(process.env.NODE_ENV) > -1) {
    sess.cookie.secure = true;
}
if (['development'].indexOf(process.env.NODE_ENV) > -1) {
    sess.cookie.sameSite = 'none';
}
const baseSessionMiddleware = (0, express_session_1.default)(sess);
const adminSessionMiddleware = (0, express_session_1.default)(Object.assign(Object.assign({}, sess), { name: 'admin' }));
app.use(['/api/admin', '/api/swagger/admin'], adminSessionMiddleware);
app.use(baseSessionMiddleware);
app.enable('trust proxy');
app.set('etag', false);
app.set('views', path_1.default.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
const whitelist = [
    'http://localhost:3000',
    'http://siwonpp.co.kr',
    'https://siwonpp.co.kr',
    'https://www.siwonpp.co.kr',
    'https://dev-admin.siwonpp.co.kr',
    'https://admin.siwonpp.co.kr',
    'https://dev-be.siwonpp.co.kr',
    'https://prod-be.siwonpp.co.kr'
];
const corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { credentials: true, origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};
app.use((0, cors_1.default)(corsOptionsDelegate));
app.use(middlewares_1.assignId);
app.use((0, middlewares_1.morgan)({
    skip: (req, res) => req.originalUrl.includes('/swagger') || req.originalUrl.includes('/health') || res.statusCode > 300,
    stream: loaders_1.logger.infoStream
}));
app.use((0, middlewares_1.morgan)({
    skip: (req, res) => res.statusCode < 400,
    stream: loaders_1.logger.errorStream
}));
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
app.get('/health', (req, res) => res.status(200).end());
app.use('/dash', (0, agendash_1.default)(mission_1.agenda));
//multer router 처리
app.post('/api/mobile/log/click', upload.single('img'), (req, res, next) => {
    next();
});
(0, routes_1.default)(app);
moment_timezone_1.default.tz.setDefault('Asia/Seoul');
exports.default = app;
exports.expressManager = {
    redisClient
};
