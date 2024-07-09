const mongoose = require('mongoose')
const Schema = mongoose.Schema

const botUsersSchema = new Schema({
    chatid: {type: Number},
    first_name: {type: String},
}, {timestamps: true, strict: false})

const vyuo = mongoose.connection.useDb('vyuo-degree')
const model = vyuo.model('Auto Acceptor Users', botUsersSchema)
module.exports = model