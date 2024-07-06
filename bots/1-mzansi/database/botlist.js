const mongoose = require('mongoose')
const Schema = mongoose.Schema

const botListSchema = new Schema({
    token: {type: String},
    botname: {type: String}
}, {timestamps: true, strict: false})

const vyuo = mongoose.connection.useDb('vyuo-degree')
const model = vyuo.model('CPA Bot List', botListSchema)
module.exports = model