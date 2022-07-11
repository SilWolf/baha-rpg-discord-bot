"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewPosts = exports.getPosts = void 0;
var _1 = __importDefault(require("."));
var cachedlastPostId;
var getPosts = function (lastPostId) {
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
                if (lastPostId === (rawPost === null || rawPost === void 0 ? void 0 : rawPost.id)) {
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
exports.getPosts = getPosts;
var getNewPosts = function () { return (0, exports.getPosts)(cachedlastPostId); };
exports.getNewPosts = getNewPosts;
exports.default = {};
