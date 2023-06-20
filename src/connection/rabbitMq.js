const amqp = require('amqplib/callback_api')

const rabbitMQHandler = (callback) => {
  amqp.connect('amqp://guest:guest@localhost:5672/',
    (error, connection) => {
      if (error) {
        throw new Error(error);
      }

      callback(connection);
    })
}

module.exports = rabbitMQHandler;