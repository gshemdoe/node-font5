const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const getRouter = require('./routes/get-routes')
const { handlePriceBots } = require('./bots/handleBotFunctions')
const { CPABots } = require('./bots/1-mzansi/bot')
const { AutoAcceptorBot } = require('./bots/2-AutoAcceptor/bot')

const app = express()

// database connection
mongoose.connect(`mongodb://${process.env.USER}:${process.env.PASS}@nodetuts-shard-00-00.ngo9k.mongodb.net:27017,nodetuts-shard-00-01.ngo9k.mongodb.net:27017,nodetuts-shard-00-02.ngo9k.mongodb.net:27017/vyuo-degree?ssl=true&replicaSet=atlas-pyxyme-shard-0&authSource=admin&retryWrites=true&w=majority`)
    .then(() => console.log('Connected to Vyuo Degree'))
    .catch((err) => {
        console.log(err)
    })


// MIDDLEWARES
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.set('trust proxy', true) //our app is hosted on server using proxy to pass user request
//webhookbots
if (process.env.ENVIRONMENT == 'production') {
    handlePriceBots(app)
    CPABots(app)
    AutoAcceptorBot(app)
}

app.use(getRouter)

app.listen(process.env.PORT || 3000, () => console.log('Listen to port 3000'))

process.on('unhandledRejection', (reason, promise) => {
    console.log(reason)
    //on production here process will change from crash to start cools
})

process.on('uncaughtException', async (err) => {
    console.log(err)
})

process.on('warning', e => console.warn(e.stack));