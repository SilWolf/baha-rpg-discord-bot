// import { SlashCommandBuilder } from '@discordjs/builders';
import { CacheType, CommandInteraction } from 'discord.js';

export type DiscordCommand = {
	// data: SlashCommandBuilder;
	name: string;
	description?: string;
	execute: (interaction: CommandInteraction<CacheType>) => Promise<void>;
};
