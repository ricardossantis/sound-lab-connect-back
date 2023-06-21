const {Schema, model} = require("../db/mongo")

const FeedSchema = new Schema({
  msg: {type: String, unique: true, required: true},
  queue: {type: String, required: true},
  createAt: {type: Number, required: true}
})

const Feed = model("Feed", FeedSchema)

module.exports = Feed