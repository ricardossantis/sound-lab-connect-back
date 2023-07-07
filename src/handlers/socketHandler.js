const {retrieveFeedItems, emitFeedItems} = require("./feedHandler");
const {initRabbitConnection, createUserQueue, addServiceToQueue} = require("./rabbitMqHandler");
const Message = require('../models/message')

const initConnections = (socketIO) => {
  let activeUsers = [...new Set()];
  let chatRoom = '';

  socketIO.use((socket, next) => {
    const username = socket.handshake.auth.username
    createUserQueue(username, socketIO)
    next()
  });

  socketIO.on('connection', async (socket) => {
    const userId = socket?.id
    activeUsers.push({ userId, username: '', room: '' });

    const allFeeds = await retrieveFeedItems()
    allFeeds.forEach(({feeds, queue}) => emitFeedItems(feeds, userId, queue, socketIO))

    socket.on('joinChat', async (data) => {
      const { username, room, owner } = data;
      const index = activeUsers.findIndex(user => user.userId === socket.id)
      activeUsers[index].username = username
      activeUsers[index].room = room
      socket.join(room);
      addServiceToQueue(owner, { username, room, message: 'iniciou chat' })

      Message.find({ room })
        .limit(100)
        .then((messages) => socketIO.emit(`last_100_messages_${room}`, messages))

      socketIO.emit(`receive_message_${room}`, {
        message: `Welcome ${username}`,
        username: 'CHAT_BOT',
        createdTime: Date.now()
      });

      chatRoom = room;
      const chatRoomUsers = activeUsers.filter((user) => user.room === room);
      socketIO.emit(`chatroom_users_${room}`, chatRoomUsers);
    })

    socket.on('send_message', async (data) => {
      const { message, username, room, createdTime, owner } = data;
      socketIO.emit(`receive_message_${room}`, data);
      await Message.create({ message, username, room, owner, createdTime })
      if (!activeUsers.find(user => user.username === owner)) addServiceToQueue(owner, data)
    });

    socket.on('disconnect', () => {
      activeUsers = activeUsers.filter(user => user.userId !== socket.id)
    });
  });

  return initRabbitConnection(socketIO, activeUsers)
}

module.exports = {
  initConnections
}