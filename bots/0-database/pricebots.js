const mongoose = require('mongoose')
const Schema = mongoose.Schema

const priceSchema = new Schema({
    symbol: {
        type: String
    },
    name: {
        type: String
    },
    token: {
        type: String
    },
    path: {
        type: String
    }
}, { timestamps: true, strict: false })

const dramastore = mongoose.connection.useDb('dramastore')
const model = dramastore.model('PRICE BOTS', priceSchema)
module.exports = model