import { DiscordCommand } from '@/types/command.type';

const Command_Ping: DiscordCommand = {
	name: 'ping',
	description: 'Replies with pong!',
	execute: async (interaction) => {
		await interaction.reply('Pong!');
	},
};

export default Command_Ping;
