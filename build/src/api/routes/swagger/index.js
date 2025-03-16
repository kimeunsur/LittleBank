"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_dist_1 = __importDefault(require("swagger-ui-dist"));
const express_basic_auth_1 = __importDefault(require("express-basic-auth"));
const config_1 = __importDefault(require("config"));
const generator_1 = __importDefault(require("./generator"));
const package_json_1 = __importDefault(require("../../../../package.json"));
const swaggerConfig = config_1.default.get('swagger');
const router = express_1.default.Router();
if (process.env.NODE_ENV !== 'production') {
    const swaggerFile = 'doc.json';
    const mobileDoc = (0, generator_1.default)('mobile');
    mobileDoc.info.title = `${mobileDoc.info.title} mobile user api`;
    const adminDoc = (0, generator_1.default)('admin');
    adminDoc.info.title = `${adminDoc.info.title} admin api`;
    delete adminDoc.components.securitySchemes;
    const description = `\n - [${mobileDoc.info.title}](/api/swagger)\n - [${adminDoc.info.title}](/api/swagger/admin)\n`;
    mobileDoc.info.description += description;
    adminDoc.info.description += description;
    router.use((0, express_basic_auth_1.default)({
        users: { [swaggerConfig.id]: swaggerConfig.password },
        challenge: true,
        realm: `${package_json_1.default.name} ${process.env.NODE_ENV}`
    }));
    router.use('/', (req, res, next) => {
        if (req.url === '/') {
            return res.redirect(`?url=${swaggerFile}`);
        }
        next();
    }, express_1.default.static(`${__dirname}/../../../../node_modules/swagger-ui-dist`));
    router.route(`/${swaggerFile}`).get((req, res, next) => {
        try {
            res.status(200).json(mobileDoc);
        }
        catch (e) {
            next(e);
        }
    });
    router.use('/mobile', (req, res, next) => {
        if (req.url === '/') {
            return res.redirect(`?url=${swaggerFile}`);
        }
        next();
    }, express_1.default.static(swagger_ui_dist_1.default.absolutePath()));
    router.route(`/mobile/${swaggerFile}`).get((req, res, next) => {
        try {
            res.status(200).json(mobileDoc);
        }
        catch (e) {
            next(e);
        }
    });
    router.use('/admin', (req, res, next) => {
        if (req.url === '/') {
            return res.redirect(`?url=${swaggerFile}`);
        }
        next();
    }, express_1.default.static(swagger_ui_dist_1.default.absolutePath()));
    router.route(`/admin/${swaggerFile}`).get((req, res, next) => {
        try {
            res.status(200).json(adminDoc);
        }
        catch (e) {
            next(e);
        }
    });
}
exports.default = router;
