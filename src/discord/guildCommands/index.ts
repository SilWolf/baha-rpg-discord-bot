import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'

import { SlashCommandBuilder } from '@discordjs/builders'
import { DiscordCommand } from '@/types/command.type'
// import GuildCommand_Ping from './ping.guildCommand';

const guildCommands: DiscordCommand[] = []

export default guildCommands

export const registerGuildCommands = (
  token: string,
  appId: string,
  guildId: string
) => {
  const rest = new REST({ version: '10' }).setToken(token)

  return rest
    .put(Routes.applicationGuildCommands(appId, guildId), {
      body: guildCommands.map(({ name, description }) =>
        new SlashCommandBuilder()
          .setName(name)
          .setDescription(description ?? 'No Description')
          .toJSON()
      ),
    })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error)
}
