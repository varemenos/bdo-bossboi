const schedule = require('./schedule')
const cron = require('node-cron')
const Discord = require('discord.js')

const client = new Discord.Client()

client.on('ready', () => {
  console.log('I am ready!')
  console.log("schedule:" + JSON.stringify(schedule, null, 2))

  schedule.map(entry => {
    cron.schedule(entry.cron, () => {
      console.log('scheduling: ' + entry.label)

      client.channels.cache.find(i => i.name === 'test').send(entry.label + "SOON")
    }, {
      scheduled: true,
      timezone: "Europe/Amsterdam" // CET
    })
  })


  // Editing a message the bot sent
  // message.channel.send("Test").then(sentMessage => sentMessage.edit("Blah"))
})

client.on('message', message => {
  if (message.content === 'ping') {
    message.reply('pong')
  }
})

client
  .login(process.env.BOT_TOKEN)
  .catch(e => {
    console.log('CLIENT->LOGIN:ERROR: ' + e)
  })
