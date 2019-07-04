"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OpenIdError extends Error {
    constructor(message = '') {
        super();
        this.name = 'OpenIdError';
        this.message = message;
    }
}
exports.default = OpenIdError;
