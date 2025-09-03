"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateOtp = void 0;
const GenerateOtp = () => {
    return Math.floor(Math.random() * (100000 - 0)) + 0;
};
exports.GenerateOtp = GenerateOtp;
