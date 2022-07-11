import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

import { DiscordCommand } from '@/types/command.type';
import { SlashCommandBuilder } from '@discordjs/builders';

import Command_Ping from './ping.command';

const Commands: DiscordCommand[] = [Command_Ping];

export default Commands;

export const registerGlobalCommands = (token: string, appId: string) => {
	const rest = new REST({ version: '10' }).setToken(token);
	return rest
		.put(Routes.applicationCommands(appId), {
			body: Commands.map(({ name, description }) =>
				new SlashCommandBuilder()
					.setName(name)
					.setDescription(description ?? 'No Description')
					.toJSON()
			),
		})
		.then(() => console.log('Successfully registered application commands.'))
		.catch(console.error);
};
