import dotenv from 'dotenv'

import { Client, Intents } from 'discord.js'

import commands, { registerGlobalCommands } from './commands'
import guildCommands, { registerGuildCommands } from './guildCommands'

const allCommands = [...commands, ...guildCommands]

const main = async () => {
  dotenv.config()

  // eslint-disable-next-line prefer-destructuring
  const token = process.env.token
  if (!token) {
    throw new Error('Missing env: token')
  }

  // eslint-disable-next-line prefer-destructuring
  const appId = process.env.appId
  if (!appId) {
    throw new Error('Missing env: appId')
  }

  await registerGlobalCommands(token, appId)

  const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

  client.once('ready', () => {
    console.log('Ready!')
  })

  client.on('guildCreate', (guild) => {
    registerGuildCommands(token, appId, guild.id)
  })

  client.on('interactionCreate', (interaction) => {
    if (interaction.isCommand()) {
      const foundCommand = allCommands.find(
        (command) => command.name === interaction.commandName
      )

      if (foundCommand) {
        foundCommand.execute(interaction)
      }
    }

    if (interaction.channel) {
      console.log(
        `${interaction.user.tag} in #${interaction.channel.id} triggered an interaction.`
      )
    }
  })

  // Login to Discord with your client's token
  client.login(token)
}

export default main()
