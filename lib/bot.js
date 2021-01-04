import Discord from 'discord.js'

import messageHandler from './message.js'
import schedule from './schedule.js'
import cron from 'node-cron'

import { differenceInMinutes, subMinutes, set } from 'date-fns'
import { daysLookup, parseISO, dateToCron, labelToNames, formattedTime } from './utils.js'

const client = new Discord.Client()

const getChannels = (channelName) => {
  if (!client) {
    throw new Error('getChannels:error:discord.js client is not available')
  }

  const channels = client.channels.cache.filter(i => i.name === channelName)

  if (channels.size > 0) {
    return channels
  } else {
    throw new Error('getChannels:error:unknown channel')
  }
}

client.on('ready', () => {
  console.log('discordjs:event: ready')

  schedule.map(timeslot => {
    timeslot.entries.map(entry => {
      entry.days.split(',').map(day => {
        const [hour, minutes] = timeslot.scheduledFor.split(':')

        const scheduledFor = set(new Date(), {
          hours: hour,
          minutes: minutes,
          seconds: 0,
          milliseconds: 0,
          date: 3 + daysLookup(day), // 3/1/2021 is a Sunday
          month: 0,
          year: 2021,
        })

        const alerts = [
          subMinutes(scheduledFor, 60),
          subMinutes(scheduledFor, 30),
          subMinutes(scheduledFor, 10),
        ]

        alerts.map(alertDate => {
          const targetCron = dateToCron(alertDate)

          cron.schedule(targetCron, () => {
            const msg = `${labelToNames(entry.label)} will spawn in ${formattedTime(differenceInMinutes(scheduledFor, alertDate))} (${timeslot.scheduledFor} CET)`
            console.log(msg)

            const channels = getChannels('test')

            channels
              .map(channel => {
                channel
                  .send(msg)
                  .then(sentMessage => {
                    const currentDate = parseISO(new Date().toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' })) // CET
                    console.log(currentDate, scheduledFor, differenceInMinutes(currentDate, scheduledFor))
                    // const repeatTimer = setInterval(() => {
                    //   if (differenceInMinutes(currentDate, scheduledFor) > 1) {
                    //     const updatedMsg = `${labelToNames(entry.label)} will spawn in ${formattedTime(differenceInMinutes(scheduledFor, currentDate))}`
                    //     console.log(updatedMsg)
                    //     sentMessage.edit(updatedMsg)
                    //   } else {
                    //     clearInterval(repeatTimer)
                    //     sentMessage.delete()
                    //   }
                    // }, 60 * 1000)
                  })
              })
          }, {
            scheduled: true,
            timezone: "Europe/Amsterdam" // CET
          })
        })
      })
    })
  })

  // const channel = getChannels('test')
  // channel.send(`IT'S TIME for TEST: ${cronToDate("52 20 * * SAT")}`).then(sentMessage => {
  //   setTimeout(() => {
  //     sentMessage.edit('The time now is ' + new Date())
  //   }, 5000)
  // })

  // Editing a message the bot sent
  // message.channel.send("Test").then(sentMessage => sentMessage.edit("Blah"))
})

client.on('message', messageHandler)

client
  .login(process.env.BOT_TOKEN)
  .catch(e => console.log('discordjs:login:error: ' + e.message))
