"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const moment = require("moment");
const OpenIdError_1 = require("./OpenIdError");
const ProviderHttpClient_1 = require("./ProviderHttpClient");
const SessionManager_1 = require("./SessionManager");
const TokenUtils_1 = require("./TokenUtils");
class OpenId {
    constructor(config) {
        this.userManager = config.userManager;
        this.expireMinutes = config.expireMinutes;
        this.sessionManager = new SessionManager_1.default(config.sessionStorage);
        this.jwtSecret = config.jwtSecret;
        this.providerHttpClient = new ProviderHttpClient_1.default(config.providerUserinfoUri);
        this.LOCAL_PROVIDER_NAME = config.LOCAL_PROVIDER_NAME;
        this.OPENID_PROVIDER_NAME = config.OPENID_PROVIDER_NAME;
    }
    getUserFromHeader(header) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const provider = TokenUtils_1.default.getProvider(header);
                const token = TokenUtils_1.default.getToken(header);
                if (provider === this.LOCAL_PROVIDER_NAME) {
                    return this.getUserFromJWT(token);
                }
                if (provider === this.OPENID_PROVIDER_NAME) {
                    return this.getUserFromOpenId(token);
                }
                throw new Error(`Unknown provider in your auth header: ${provider}. Only ${[this.LOCAL_PROVIDER_NAME, this.OPENID_PROVIDER_NAME]} is allowed`);
            }
            catch (e) {
                throw new OpenIdError_1.default(e.message);
            }
        });
    }
    getUserFromOpenId(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.sessionManager.getSession(this.OPENID_PROVIDER_NAME, token);
            let user = null;
            if (!session || (yield this.sessionManager.isSessionExpired(session))) {
                if (session) {
                    yield this.sessionManager.destroySession(session);
                }
                const { data: userInfo, status } = yield this.providerHttpClient.getProviderResponse(token);
                const openIdSub = userInfo.sub;
                if (!userInfo || status !== 200) {
                    throw new OpenIdError_1.default('OpenId server responsed with non 200 code');
                }
                user = yield this.userManager.findByOpenIdSub(openIdSub);
                if (!user) {
                    user = yield this.userManager.create(userInfo);
                }
                yield this.sessionManager.createSession(this.OPENID_PROVIDER_NAME, token, moment().add(this.expireMinutes, 'm').toISOString(), openIdSub);
            }
            else {
                user = yield this.userManager.findByOpenIdSub(session.openIdSub);
            }
            return user;
        });
    }
    getUserFromJWT(token) {
        return new Promise((resolve, reject) => jwt.verify(token, this.jwtSecret, (err, decoded) => {
            if (err) {
                reject(err);
            }
            resolve(decoded);
        })).then((decoded) => this.userManager.findFromJWT(decoded));
    }
}
exports.default = OpenId;
