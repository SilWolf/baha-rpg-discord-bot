import 'dotenv/config'
import { Client, Intents, MessageEmbed } from 'discord.js'

import commands, { registerGlobalCommands } from '@/discord/commands'
import guildCommands, { registerGuildCommands } from '@/discord/guildCommands'
import { getNewPosts } from '@/baha/post.api'

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

  client.login(token).then(async () => {
    const checkForNewPostAndBroadcast = async () => {
      const posts = await getNewPosts()

      if (posts.length === 0) {
        return
      }

      const postEmbeds = posts.map((post) => {
        const [title, ...description] = post.content.split('\n')

        const embed = new MessageEmbed()
          .setColor('#62d4f3')
          .setTitle(title)
          .setDescription(decodeURIComponent(description.join('\n')))
          .setAuthor({
            name: post.publisher.name,
            iconURL: post.publisher.propic,
            url: `https://home.gamer.com.tw/homeindex.php?owner=${post.publisher.id}`,
          })
          .setTimestamp(new Date(post.ctime))

        if (post.urlPreview) {
          embed.setURL(post.urlPreview.urlLink)
          embed.setThumbnail(post.urlPreview.urlImage)
        } else {
          embed.setURL(
            `https://guild.gamer.com.tw/post_detail.php?gsn=${post.to.gsn}&sn=${post.id}`
          )
        }

        return embed
      })

      client.channels.cache.forEach((c) => {
        if (c.type === 'GUILD_TEXT' || c.type === 'DM') {
          for (let i = 0; i < postEmbeds.length; i += 1) {
            c.send({
              embeds: [postEmbeds[i]],
            }).catch(() => {
              // do nothing
            })
          }
        }
      })
    }

    // Start the scheduler
    schedule.scheduleJob(
      '1,6,11,16,21,26,31,36,41,46,51,56 * * * *',
      checkForNewPostAndBroadcast
    )
    // schedule.scheduleJob('* * * * *', checkForNewPostAndBroadcast)

    // Uncomment the following line for debugging
    // checkForNewPostAndBroadcast()

    // Initialize first posts
    await getNewPosts()
  })
}

export default main()
