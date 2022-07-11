"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var bahaToken = process.env.bahaToken;
var api = axios_1.default.create({
    baseURL: 'https://api.gamer.com.tw',
    params: {
        gsn: 3014,
    },
    headers: {
        Cookie: "BAHARUNE=".concat(bahaToken, ";"),
    },
});
api.interceptors.response.use(function (res) {
    var _a;
    if (res.data.error) {
        throw new Error((_a = res.data.error.message) !== null && _a !== void 0 ? _a : '未知的錯誤');
    }
    return res;
});
exports.default = api;
