"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGlobalCommands = void 0;
var rest_1 = require("@discordjs/rest");
var v10_1 = require("discord-api-types/v10");
var builders_1 = require("@discordjs/builders");
var ping_command_1 = __importDefault(require("./ping.command"));
var Commands = [ping_command_1.default];
exports.default = Commands;
var registerGlobalCommands = function (token, appId) {
    var rest = new rest_1.REST({ version: '10' }).setToken(token);
    return rest
        .put(v10_1.Routes.applicationCommands(appId), {
        body: Commands.map(function (_a) {
            var name = _a.name, description = _a.description;
            return new builders_1.SlashCommandBuilder()
                .setName(name)
                .setDescription(description !== null && description !== void 0 ? description : 'No Description')
                .toJSON();
        }),
    })
        .then(function () { return console.log('Successfully registered application commands.'); })
        .catch(console.error);
};
exports.registerGlobalCommands = registerGlobalCommands;
