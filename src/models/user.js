const {Schema, model} = require("../db/mongo")

const UserSchema = new Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    role: {type: String, required: false},
    isApproved: {type: Boolean, required: false},
    stripeAccount: {type: Object, required: false}
})

const User = model("User", UserSchema)

module.exports = User