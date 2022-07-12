"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var discord_js_1 = require("discord.js");
var commands_1 = __importStar(require("./discord/commands"));
var guildCommands_1 = __importStar(require("./discord/guildCommands"));
var post_api_1 = require("./baha/post.api");
var node_schedule_1 = __importDefault(require("node-schedule"));
var allCommands = __spreadArray(__spreadArray([], commands_1.default, true), guildCommands_1.default, true);
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var DISCORD_TOKEN, DISCORD_APP_ID, client;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                DISCORD_TOKEN = process.env.DISCORD_TOKEN;
                if (!DISCORD_TOKEN) {
                    throw new Error('Missing env: DISCORD_TOKEN');
                }
                DISCORD_APP_ID = process.env.DISCORD_APP_ID;
                if (!DISCORD_APP_ID) {
                    throw new Error('Missing env: DISCORD_APP_ID');
                }
                return [4, (0, commands_1.registerGlobalCommands)(DISCORD_TOKEN, DISCORD_APP_ID)];
            case 1:
                _a.sent();
                client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS] });
                client.once('ready', function () {
                    console.log('Ready!');
                });
                client.on('guildCreate', function (guild) {
                    (0, guildCommands_1.registerGuildCommands)(DISCORD_TOKEN, DISCORD_APP_ID, guild.id);
                });
                client.on('interactionCreate', function (interaction) {
                    if (interaction.isCommand()) {
                        var foundCommand = allCommands.find(function (command) { return command.name === interaction.commandName; });
                        if (foundCommand) {
                            foundCommand.execute(interaction);
                        }
                    }
                    if (interaction.channel) {
                        console.log("".concat(interaction.user.tag, " in #").concat(interaction.channel.id, " triggered an interaction."));
                    }
                });
                client.login(DISCORD_TOKEN).then(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var checkForNewPostAndBroadcast;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                checkForNewPostAndBroadcast = function () { return __awaiter(void 0, void 0, void 0, function () {
                                    var posts, postEmbeds;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4, (0, post_api_1.getNewPosts)()];
                                            case 1:
                                                posts = _a.sent();
                                                if (posts.length === 0) {
                                                    return [2];
                                                }
                                                postEmbeds = posts.map(function (post) {
                                                    var _a = post.content.split('\n'), title = _a[0], description = _a.slice(1);
                                                    var embed = new discord_js_1.MessageEmbed()
                                                        .setColor('#62d4f3')
                                                        .setTitle(title)
                                                        .setDescription(decodeURIComponent(description.join('\n')))
                                                        .setAuthor({
                                                        name: post.publisher.name,
                                                        iconURL: post.publisher.propic,
                                                        url: "https://home.gamer.com.tw/homeindex.php?owner=".concat(post.publisher.id),
                                                    })
                                                        .setTimestamp(new Date(post.ctime));
                                                    if (post.urlPreview) {
                                                        embed.setURL(post.urlPreview.urlLink);
                                                        embed.setThumbnail(post.urlPreview.urlImage);
                                                    }
                                                    else {
                                                        embed.setURL("https://guild.gamer.com.tw/post_detail.php?gsn=".concat(post.to.gsn, "&sn=").concat(post.id));
                                                    }
                                                    return embed;
                                                });
                                                client.channels.cache.forEach(function (c) {
                                                    if (c.type === 'GUILD_TEXT' || c.type === 'DM') {
                                                        for (var i = 0; i < postEmbeds.length; i += 1) {
                                                            c.send({
                                                                embeds: [postEmbeds[i]],
                                                            }).catch(function () {
                                                            });
                                                        }
                                                    }
                                                });
                                                return [2];
                                        }
                                    });
                                }); };
                                node_schedule_1.default.scheduleJob('1,6,11,16,21,26,31,36,41,46,51,56 * * * *', checkForNewPostAndBroadcast);
                                return [4, (0, post_api_1.getNewPosts)()];
                            case 1:
                                _a.sent();
                                return [2];
                        }
                    });
                }); });
                return [2];
        }
    });
}); };
exports.default = main();
