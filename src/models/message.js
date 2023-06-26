const {Schema, model} = require("../db/mongo")

const MessageSchema = new Schema({
  message: {type: String, required: true},
  username: {type: String, required: true},
  createdTime: {type: Number, required: true},
  room: {type: String, required: true}
})

const Message = model("Message", MessageSchema)

module.exports = Message