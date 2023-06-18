const {Schema, model} = require("../db/mongo")

const UserSchema = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    isAdmin: {type: Boolean, required: false},
    isApproved: {type: Boolean, required: false}
})

const User = model("User", UserSchema)

module.exports = User