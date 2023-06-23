const {Schema, model} = require("../db/mongo")

const ServiceSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    marketplace: {type: String, required: true},
    owner: {type: String, required: true},
    createAt: {type: Number, required: true},
    product: {type: Object, required: false},
    priceStripe: {type: Object, required: true},
})

const Service = model("Service", ServiceSchema)

module.exports = Service