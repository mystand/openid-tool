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
const moment = require("moment");
class SessionManager {
    constructor(sessionStorage) {
        this.sessionStorage = sessionStorage;
    }
    getSession(provider, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sessionStorage.get(provider, token);
        });
    }
    createSession(provider, token, expiresAt, openIdSub) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sessionStorage.create(provider, token, expiresAt, openIdSub);
        });
    }
    isSessionExpired(session) {
        return __awaiter(this, void 0, void 0, function* () {
            return moment(session.expiresAt).isBefore();
        });
    }
    destroySession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sessionStorage.destroy(session);
        });
    }
}
exports.default = SessionManager;
