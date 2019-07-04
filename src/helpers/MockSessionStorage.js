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
class MockSessionStorage {
    constructor() {
        this.sessions = [];
    }
    get(provider, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sessions.find(this.sessionSearchPredicate(provider, token)) || null;
        });
    }
    create(provider, token, expiresAt, openIdSub) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = { provider, token, expiresAt, openIdSub };
            this.sessions.push(session);
            return session;
        });
    }
    destroy(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const index = this.sessions.findIndex(this.sessionSearchPredicate(session.provider, session.token));
            if (index !== -1) {
                this.sessions.splice(index, 1);
            }
        });
    }
    sessionSearchPredicate(provider, token) {
        return (session) => session.provider === provider && session.token === token;
    }
}
exports.default = MockSessionStorage;
