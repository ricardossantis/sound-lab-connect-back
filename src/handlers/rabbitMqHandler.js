const rabbitMQHandler = require("../connection/rabbitMq");
const { listMarketplaces } = require('../handlers/marketplaceHandler')
const Feed = require('../models/feed')

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
              activeUsers.forEach((_socket) => {
                socketIO.emit(`${mainQueue}-feed`, [message]);
              });

              channel.ack(msg);
            })
          })
        }, {noAck: false})
      });
    })
  })
}

const saveFeedItems = (msg, queue) => Feed.create({ msg, queue })

const retrieveFeedItems = async (queue = 'mixing') => {
  // const mainQueues = await listMarketplaces()
  const feeds = await Feed.find({ queue })
  return { feeds, queue }
}

const emitFeedItems = async (feeds, userId, mainQueue, socketIO) => {
   feeds.forEach(feed => {
   const message = JSON.stringify(feed);
   socketIO.to(userId).emit(`${mainQueue}-feed`, message);
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
  addServiceToQueue,
  emitFeedItems,
  retrieveFeedItems
}