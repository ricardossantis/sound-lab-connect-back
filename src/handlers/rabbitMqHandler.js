const rabbitMQHandler = require("../connection/rabbitMq");
const { listMarketplaces } = require('../handlers/marketplaceHandler')

const initRabbitConnection = async (socketIO) => {
  const mainQueues = await listMarketplaces()

  rabbitMQHandler((connection) => {
    connection.createChannel((err, channel) => {
      if (err) {
        throw new Error(err);
      }
      mainQueues.forEach((mainQueue) => {
        channel.assertExchange(mainQueue, 'fanout', { durable: false }, (err, exchange) => {
          if (err) {
            throw new Error(err);
          }
          channel.assertQueue('', {exclusive: true}, (err, queue) => {
            if (err) {
              throw new Error(err)
            }
            channel.bindQueue(queue.queue, mainQueue, '')
            channel.consume(queue.queue, (msg) => {
              const result = JSON.stringify({result: Object.values(JSON.parse(msg.content.toString()))});
              socketIO.emit(`${mainQueue}-feed`, result)
            })
          }, {noAck: false})
        });
      })
    })
  })
}

const addServiceToQueue = (mkName, service) => {
  rabbitMQHandler((connection) => {
    connection.createChannel((err, channel) => {
      if (err) {
        throw new Error(err)
      }
      const msg = JSON.stringify(service);

      channel.publish(mkName, '', new Buffer(msg), {persistent: true})

      channel.close(() => {connection.close()})
    })
  })
}

module.exports = {
  initRabbitConnection,
  addServiceToQueue
}