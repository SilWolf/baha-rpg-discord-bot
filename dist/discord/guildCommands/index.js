"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGuildCommands = void 0;
var rest_1 = require("@discordjs/rest");
var v10_1 = require("discord-api-types/v10");
var builders_1 = require("@discordjs/builders");
var guildCommands = [];
exports.default = guildCommands;
var registerGuildCommands = function (token, appId, guildId) {
    var rest = new rest_1.REST({ version: '10' }).setToken(token);
    return rest
        .put(v10_1.Routes.applicationGuildCommands(appId, guildId), {
        body: guildCommands.map(function (_a) {
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
exports.registerGuildCommands = registerGuildCommands;
