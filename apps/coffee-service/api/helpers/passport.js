"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_jwt_1 = require("passport-jwt");
const passport_1 = __importDefault(require("passport"));
const models_1 = require("@coffee/models");
const opts = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};
passport_1.default.use(new passport_jwt_1.Strategy(opts, async (jwt_payload, done) => {
    try {
        const user = await models_1.UserModel.findByPk(jwt_payload.id, {
            attributes: ['id', 'username', 'email', 'role_id', 'last_login', 'recent_login'],
            include: [
                {
                    model: models_1.UserRoleModel,
                    as: 'role',
                    attributes: ['name']
                }
            ]
        });
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    }
    catch (error) {
        console.error(error);
        return done(error, false);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await models_1.UserModel.findByPk(id, {
            attributes: ['id', 'username', 'email', 'role_id'],
            include: [
                {
                    model: models_1.UserRoleModel,
                    as: 'role',
                    attributes: ['name']
                }
            ]
        });
        if (user) {
            done(null, user);
        }
        else {
            done(null, false);
        }
    }
    catch (error) {
        done(error, false);
    }
});
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map