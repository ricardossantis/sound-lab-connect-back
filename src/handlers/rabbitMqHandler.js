const rabbitMQHandler = require("../connection/rabbitMq");
const { listMarketplaces } = require('./marketplaceHandler')
const { saveFeedItems } = require('./feedHandler')

const initRabbitConnection = async (socketIO, activeUsers) => {
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
            channel.consume(queue.queue, async (msg) => {
              const message = msg.content.toString()
              await saveFeedItems(message, mainQueue);
              activeUsers.forEach(userId => {
                socketIO.to(userId).emit(`${mainQueue}-feed`, message);
              });
              channel.ack(msg);
            })
          })
        }, {noAck: false})
      });
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