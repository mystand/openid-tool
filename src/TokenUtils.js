"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TokenUtils {
    static getProvider(header) {
        return header.split(' ')[1];
    }
    static getToken(header) {
        return header.split(' ')[2];
    }
}
exports.default = TokenUtils;
