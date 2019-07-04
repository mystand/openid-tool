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
const axios_1 = require("axios");
class HttpClient {
    constructor(providerUserinfoUri) {
        this.providerUserinfoUri = providerUserinfoUri;
    }
    getProviderResponse(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const providerResponse = yield axios_1.default.get(this.providerUserinfoUri, {
                headers: {
                    authorization: `Bearer ${token}`
                },
                validateStatus(status) {
                    return status >= 200 && status < 500;
                }
            });
            return providerResponse;
        });
    }
}
exports.default = HttpClient;
