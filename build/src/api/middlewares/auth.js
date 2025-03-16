"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.guest = exports.user = void 0;
const libs_1 = require("../../libs");
function user(roles) {
    return async function (req, res, next) {
        try {
            const { authorization } = req.headers;
            if (authorization && authorization.split(' ')[0] === 'Bearer') {
                if (authorization.split(' ')[1] === 'test1111') {
                    req.profileId = 1;
                    next();
                }
                else if (authorization.split(' ')[1] === 'test2222') {
                    req.profileId = 2;
                    next();
                }
                else if (authorization.split(' ')[1] === 'test3333') {
                    req.profileId = 8;
                    next();
                }
                else if (authorization.split(' ')[1] === 'test4444') {
                    req.profileId = 3;
                    next();
                }
                else if (authorization.split(' ')[1] === 'test5555') {
                    req.profileId = 5;
                    next();
                }
                else if (authorization.split(' ')[1] === 'test6666') {
                    req.profileId = 37;
                    next();
                }
                else if (authorization.split(' ')[1] === 'test9999') {
                    req.profileId = 7;
                    next();
                }
                else if (authorization.split(' ')[1] === 'test8888') {
                    req.profileId = 15;
                    next();
                }
                else {
                    const jwtToken = await libs_1.jwt.decodeToken(authorization.split(' ')[1], { algorithms: ['RS256'] });
                    if (jwtToken.reqRole === 'profile') {
                        req.profileId = jwtToken.sub;
                        next();
                    }
                    else if (jwtToken.reqRole === 'user') {
                        req.userId = jwtToken.sub;
                        next();
                    }
                }
            }
            else {
                res.status(401).json({ message: 'invalid_token' });
            }
        }
        catch (e) {
            res.status(401).json({ message: 'invalid_token' });
        }
    };
}
exports.user = user;
function guest(roles) {
    return async function (req, res, next) {
        try {
            const deviceId = await getDeviceIdFromHeader(req);
            req.deviceId = deviceId;
            const { authorization } = req.headers;
            if (authorization && authorization.split(' ')[0] === 'Bearer') {
                const jwtToken = await libs_1.jwt.decodeToken(authorization.split(' ')[1], { algorithms: ['RS256'] });
                if (jwtToken.sub) {
                    req.profileId = jwtToken.sub;
                    next();
                }
            }
            else {
                const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'][0] : '';
                req.guestId = libs_1.code.hashSHA256(ip);
                req.profileId = null;
                next();
            }
        }
        catch (e) {
            const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'][0] : '';
            req.guestId = libs_1.code.hashSHA256(ip);
            next();
        }
    };
}
exports.guest = guest;
function admin() {
    return async function (req, res, next) {
        try {
            const deviceId = await getDeviceIdFromHeader(req);
            req.deviceId = deviceId;
            if (req.session && req.session.adminId) {
                if (req.session.type === 'admin') {
                    return next();
                }
            }
            res.status(401).json({ message: 'invalid_session' });
        }
        catch (e) {
            res.status(401).json({ message: 'invalid_session' });
        }
    };
}
exports.admin = admin;
async function getDeviceIdFromHeader(req) {
    try {
        const deviceid = req.headers.deviceid;
        if (deviceid) {
            return deviceid;
        }
        else
            return null;
    }
    catch (e) {
        return null;
    }
}
