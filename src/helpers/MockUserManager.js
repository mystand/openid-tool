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
class MockUserManager {
    constructor() {
        this.users = [];
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.users.findIndex(this.userSearchPredicateBySub(data.sub)) !== -1) {
                throw new Error('duplicate user');
            }
            const user = this.mapData(data);
            this.users.push(user);
            return user;
        });
    }
    findByOpenIdSub(sub) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.users.find(this.userSearchPredicateBySub(sub)) || null;
        });
    }
    findFromJWT(parsedJWT) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.users.find((user) => user.id === parsedJWT.id) || null;
        });
    }
    mapData(data) {
        return {
            id: this.users.length + 1,
            name: data.name,
            importGuid: data.sub
        };
    }
    userSearchPredicateBySub(sub) {
        return (user) => user.importGuid === sub;
    }
}
exports.default = MockUserManager;
