import 'dotenv/config'
import { Client, Intents, MessageEmbed } from 'discord.js'

import commands, { registerGlobalCommands } from '@/services/discord/commands'
import guildCommands, {
  registerGuildCommands,
} from '@/services/discord/guildCommands'
import { getNewPosts } from '@/services/baha/post.api'

import schedule from 'node-schedule'

const allCommands = [...commands, ...guildCommands]

const main = async () => {
  const DISCORD_TOKEN = process.env.DISCORD_TOKEN
  if (!DISCORD_TOKEN) {
    throw new Error('Missing env: DISCORD_TOKEN')
  }

  const DISCORD_APP_ID = process.env.DISCORD_APP_ID
  if (!DISCORD_APP_ID) {
    throw new Error('Missing env: DISCORD_APP_ID')
  }

  await registerGlobalCommands(DISCORD_TOKEN, DISCORD_APP_ID)

  const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

  client.once('ready', () => {
    console.log('Ready!')
  })

  client.on('guildCreate', (guild) => {
    registerGuildCommands(DISCORD_TOKEN, DISCORD_APP_ID, guild.id)
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

  client.login(DISCORD_TOKEN).then(async () => {
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
