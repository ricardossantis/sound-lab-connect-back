const {Schema, model} = require("../db/mongo")

const MarketplaceSchema = new Schema({
    name: {type: String, unique: true, required: true},
    users: {type: Array, required: false},
    services: {type: Array, required: false}
})

const Marketplace = model("Marketplace", MarketplaceSchema)

module.exports = Marketplace