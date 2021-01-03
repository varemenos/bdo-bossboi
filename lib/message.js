const messageHandler = message => {
  console.log('discordjs:event: message')

  // if (message.content === 'ping') {
  //   message.reply('pong')
  // }

  // if (message.content === 'ENRIQUE') {
  //   let countdown = 0

  //   message.reply(countdown).then(sentMessage => {
  //     setInterval(() => {
  //       countdown += 1
  //       sentMessage.edit(countdown)
  //     }, 10000)
  //   })
  // }
}

export default messageHandler
