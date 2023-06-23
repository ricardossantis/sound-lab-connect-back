const Feed = require("../models/feed");
const moment = require("moment/moment");
const {listMarketplaces} = require("./marketplaceHandler");

const saveFeedItems = (msg, queue) => Feed.create({ msg, queue, createAt: moment().valueOf() })

const retrieveFeedItems = async () => {
  const mainQueues = await listMarketplaces()
  const allFeeds = await Promise.all(mainQueues.map(queue => {
    return Feed.find({ queue })
      .sort({ createAt: -1 })
      .limit(10)
      .then(feeds => ({feeds, queue}))
  }))
  return allFeeds
}

const emitFeedItems = async (feeds, userId, mainQueue, socketIO) => {
  try {
    const message = JSON.stringify(feeds);
    socketIO.to(userId).emit(`${mainQueue}-feed`, message);
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  saveFeedItems,
  emitFeedItems,
  retrieveFeedItems
}