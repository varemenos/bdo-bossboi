import Discord from 'discord.js'

import messageHandler from './message.js'
import newSchedule from './schedule.js'
import cron from 'node-cron'

import { differenceInMinutes, subMinutes, getDay, set, getMinutes, getHours } from 'date-fns'

const client = new Discord.Client()

const getChannel = (channelName) => {
  if (!client) {
    throw new Error('getChannel:error:discord.js client is not available')
  }

  console.log(client.channels.cache)
  const channel = client.channels.cache.find(i => i.name === channelName)

  if (channel) {
    return channel
  } else {
    throw new Error('getChannel:error:unknown channel')
  }
}

const daysLookup = (num) => {
  const table = {
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
    SAT: 6,
    SUN: 7
  }

  return table[num]
}

const dateToCron = (d) => {
  const day = getDay(d)
  const minutes = getMinutes(d)
  const hour = getHours(d)

  return `${minutes} ${hour} * * ${day}`
}

const labelToNames = (label) => {
  return label.split('/').join(' and ')
}

const formattedTime = (minutes) => {
  if (minutes > 59) {
    return `${minutes / 60} hours`
  } else {
    return `${minutes} minutes`
  }
}

client.on('ready', () => {
  console.log('discordjs:event: ready')
  console.log("-----------------------------------------------\nSchedule\n-----------------------------------------------")
  console.log(JSON.stringify(newSchedule, null, 4))



  newSchedule.map(timeslot => {
    console.log(timeslot)

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
          subMinutes(scheduledFor, 120),
          subMinutes(scheduledFor, 60),
          subMinutes(scheduledFor, 30),
        ]

        alerts.map(alertDate => {
          const targetCron = dateToCron(alertDate)

          cron.schedule(targetCron, () => {
            const msg = `${labelToNames(entry.label)} will spawn in ${formattedTime(differenceInMinutes(scheduledFor, alertDate))}`
            console.log(msg)

            const channel = getChannel('test')

            channel
              .send(msg)
              .then(sentMessage => {
                const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' }) // CET

                const repeatTimer = setInterval(() => {
                  if (differenceInMinutes(scheduledFor, currentDate) > 1) {
                    sentMessage.edit(`${labelToNames(entry.label)} will spawn in ${formattedTime(differenceInMinutes(scheduledFor, currentDate))}`)
                  } else {
                    clearInterval(repeatTimer)
                  }
                }, 60 * 1000)
              })
          }, {
            scheduled: true,
            timezone: "Europe/Amsterdam" // CET
          })
        })
      })
    })
  })

  // const channel = getChannel('test')
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
