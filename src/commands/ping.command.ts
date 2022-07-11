import { DiscordCommand } from '@/types/command.type'

const commandPing: DiscordCommand = {
  name: 'ping',
  description: 'Replies with pong!',
  execute: async (interaction) => {
    await interaction.reply('Pong!')
  },
}

export default commandPing
