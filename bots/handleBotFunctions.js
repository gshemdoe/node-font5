const handlePriceBots = async (app) => {
    const call_price_fn = require('./pricebots/bot')
    const priceModel = require('./0-database/pricebots')


    try {
        if(process.env.ENVIRONMENT == 'production') {
            let info = await priceModel.find()
            for (let bot of info) {
               await call_price_fn.checkPriceFn(app, bot.token, bot.path, bot.name, bot.symbol)
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {handlePriceBots}