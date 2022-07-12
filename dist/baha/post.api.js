"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewPosts = exports.getPosts = void 0;
var _1 = __importDefault(require("."));
var auth_api_1 = require("./auth.api");
var cachedlastPostId;
var getPosts = function (lastPostId) { return __awaiter(void 0, void 0, void 0, function () {
    var fn, posts, e_1, posts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fn = function () {
                    return _1.default
                        .get('/guild/v1/post_list.php')
                        .then(function (res) {
                        var _a;
                        if (!res.data.data) {
                            return [];
                        }
                        var rawPosts = (_a = res.data.data.postList) !== null && _a !== void 0 ? _a : [];
                        if (rawPosts.length === 0) {
                            return [];
                        }
                        var posts = [];
                        for (var i = 0; i < rawPosts.length; i += 1) {
                            var rawPost = rawPosts[i][0];
                            if (rawPost) {
                                if (!lastPostId || lastPostId <= (rawPost === null || rawPost === void 0 ? void 0 : rawPost.id)) {
                                    break;
                                }
                                posts.push({
                                    id: rawPost.id,
                                    publisher: rawPost.publisher,
                                    content: rawPost.content,
                                    ctime: rawPost.ctime,
                                    to: rawPost.to,
                                    urlPreview: Array.isArray(rawPost.urlPreview)
                                        ? undefined
                                        : rawPost.urlPreview,
                                });
                            }
                        }
                        if (posts.length > 0) {
                            cachedlastPostId = posts[0].id;
                        }
                        return posts;
                    });
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 6]);
                return [4, fn()];
            case 2:
                posts = _a.sent();
                return [2, posts];
            case 3:
                e_1 = _a.sent();
                return [4, (0, auth_api_1.postLogin)()];
            case 4:
                _a.sent();
                return [4, fn()];
            case 5:
                posts = _a.sent();
                return [2, posts];
            case 6: return [2];
        }
    });
}); };
exports.getPosts = getPosts;
var getNewPosts = function () { return (0, exports.getPosts)(cachedlastPostId); };
exports.getNewPosts = getNewPosts;
exports.default = {};
