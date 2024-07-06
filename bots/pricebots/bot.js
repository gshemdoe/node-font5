const axios = require('axios').default
const { Bot, webhookCallback } = require("grammy");
const { autoRetry } = require("@grammyjs/auto-retry");

const checkPriceFn = async (app, TKN, Path, TKN_NAME, TKN_SYMBOL) => {
    const priceModel = require('../0-database/pricebots')
    const bot = new Bot(TKN);

    const imp = {
        shemdoe: 741815228,
        rt_tester: 5940671686,
        pricelogs: -1002137014810,
        kucoin: `https://www.kucoin.com/r/af/rJ4G8KG`,
    }

    let admins = [imp.shemdoe, imp.rt_tester]

    const affButtons = [
        [
            { text: `💳 BUY`, url: imp.kucoin },
            { text: `📈 TRADE`, url: imp.kucoin }
        ]
    ]

    const API = `https://api.coincap.io/v2/assets/${Path}`

    if (process.env.ENVIRONMENT == 'production') {
        let hookPath = `/telebot/${Path}`
        await bot.api.setWebhook(`https://${process.env.DOMAIN}${hookPath}`, {
            drop_pending_updates: true
        })
            .then(() => console.log(`webhook for ${Path} is set`))
            .catch(e => console.log(e.message))
        app.use(`${hookPath}`, webhookCallback(bot, 'express'))
    }
    //use auto-retry
    bot.api.config.use(autoRetry());

    //catch error
    bot.catch((err) => {
        let ctx = err.ctx
        console.log(err.message)
        ctx.reply(err.message).catch(e => console.log(e.message))
    })

    bot.command('start', async ctx => {
        try {
            let txt = `Hi <b>${ctx.chat.first_name}</b>\n\nTo get the live price of <b>${TKN_NAME}</b> use these command <b>/${TKN_SYMBOL}</b> or <b>/price</b>`
            await ctx.reply(txt, { parse_mode: 'HTML' })
        } catch (error) {
            console.log(error.message, error)
        }
    })

    bot.command(['price', `${TKN_SYMBOL}`, 'live'], async ctx => {
        let logAPI = `https://api.telegram.org/bot${process.env.LOCAL4}/sendMessage`
        try {
            let userid = ctx.chat.id
            let fname = ctx.chat.first_name
            let username = ctx.chat.username ? `<b>@${ctx.chat.username}</b>` : `<b><a href="tg://user?id=${userid}">${fname}</a></b>`

            //make request
            let res = await axios.get(API)
            let timestamp = res.data.timestamp
            let time = new Date(timestamp).toUTCString()
            let id = res.data.data.id
            let rank = res.data.data.rank
            let symbol = res.data.data.symbol
            let name = `${res.data.data.name} (${symbol})`
            let supply = res.data.data.supply
            let mcap = Number(res.data.data.marketCapUsd).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
            let vol = Number(res.data.data.volumeUsd24Hr).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
            let price = Number(res.data.data.priceUsd).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 6 })
            let change24 = Number(res.data.data.changePercent24Hr).toFixed(2)
            let txt = `<b>${name} Price as of ${time}</b>\n\n<b>📊 Rank: </b>${rank}\n<b>💰 Price: </b>${price}\n<b>📈 MktCap: </b>${mcap}\n<b>⏳ 24hr changes: </b>${change24}%\n<b>🕧 24hr Volume: </b>${vol}\n\nBuy ${name} and Make your trades with 0 fee`
            await ctx.reply(txt, {
                parse_mode: 'HTML', reply_markup: {
                    inline_keyboard: affButtons
                }
            })

            //check price notification
            let data = {
                chat_id: imp.pricelogs,
                text: `${username} just checked price of ${TKN_NAME}`,
                parse_mode: 'HTML'
            }
            await axios.post(logAPI, data)
        } catch (err) {
            let data = {
                chat_id: imp.pricelogs,
                text: err.message
            }
            console.log(err.message)
            await ctx.reply(`Oops! We seems to have a problem fetching the price. Please retry after few minutes.`)
            await axios.post(logAPI, data)
        }
    })

    bot.command('newbot', async ctx => {
        try {
            if (admins.includes(ctx.chat.id)) {
                let pload = ctx.match
                let [path, token] = pload.split(' >> ')
                let url = `https://api.coincap.io/v2/assets/${path}`

                let res = await axios.get(url)
                let tk_symbol = res.data.data.symbol
                let tk_name = `${res.data.data.name} (${tk_symbol})`

                await priceModel.create({
                    name: tk_name, path: path.trim(), token, symbol: tk_symbol.toLowerCase()
                })
                let desc = `SEE LIVE PRICE OF ${tk_name} ACROSS MULTIPLE EXCHANGES \n\nUse /start command, /price or /${tk_symbol.toLowerCase()} to get ${tk_symbol}: \n➜ Live Price \n➜ Live Market cap \n➜ 24hr Changes \n➜ 24hr Volume`
                let commands = `price - Live Price of ${tk_symbol}\n${tk_symbol.toLowerCase()} - Live Price of ${tk_symbol}`
                await ctx.reply('created')
                await ctx.reply(desc)
                await ctx.reply(commands)
            }
        } catch (error) {
            await ctx.reply(error.message)
        }
    })
}

module.exports = { checkPriceFn }