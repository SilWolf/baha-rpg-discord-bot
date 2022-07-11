import 'dotenv/config'
import { Client, Intents } from 'discord.js'

import commands, { registerGlobalCommands } from '@/discord/commands'
import guildCommands, { registerGuildCommands } from '@/discord/guildCommands'
import { getNewPosts, getPosts } from '@/baha/post.api'

import schedule from 'node-schedule'

const allCommands = [...commands, ...guildCommands]

const main = async () => {
  const token = process.env.token
  if (!token) {
    throw new Error('Missing env: token')
  }

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

  // Start the scheduler
  schedule.scheduleJob(
    '1,6,11,16,21,26,31,36,41,46,51,56 * * * *',
    async () => {
      const posts = await getNewPosts()

      if (posts.length === 0) {
        return
      }

      client.channels.cache.forEach((c) => {
        if (c.isText()) {
          c.send('Testing Message').catch(console.error)
        }
      })
    }
  )

  // Initialize first posts
  await getNewPosts()

  client.login(token)
}

export default main()
