const { Telegraf } = require('telegraf')
const usersModel = require('./database/users')
const listModel = require('./database/botlist')

//delaying
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const imp = {
    halot: 1473393723
}


const myBotsFn = async (app) => {
    try {
        const tokens = await listModel.find()

        for (let tk of tokens) {
            const bot = new Telegraf(tk.token).catch(e2 => console.log(e2.message))
            if(process.env.ENVIRONMENT == 'production') {
                app.use(bot.webhookCallback(`/webhook/${tk._id}`))
            }

            bot.catch(async (e, ctx) => {
                console.log(e)
            })

            bot.start(async ctx => {
                try {
                    let chatid = ctx.chat.id
                    let first_name = ctx.chat.first_name
                    let botname = ctx.botInfo.username
                    let user = await usersModel.findOne({ chatid })
                    if (!user) {
                        let tk = await listModel.findOne({ botname })
                        await usersModel.create({ chatid, first_name, botname, token: tk.token })
                    }
                    let url = `https://playabledownload.com/1584699`
                    await ctx.reply(`Hello <b>${first_name}!</b>\n\nWelcome to our platform. Unlock the largest library of adult videos and leaked sex tapes as well as our private group for escorts and hookups.\n\nBelow, prove your are not a robot to unlock the group invite link.`, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: '🔓 UNLOCK INVITE LINK 🥵', url }
                                ]
                            ]
                        }
                    })
                } catch (e) {
                    console.log(e.message, e)
                }
            })

            bot.command('stats', async ctx => {
                try {
                    let all = await usersModel.countDocuments()
                    let lists = await listModel.find()

                    let txt = `Total Users Are ${all.toLocaleString('en-US')}\n\n`

                    for (let [i, v] of lists.entries()) {
                        let num = (await usersModel.countDocuments({ botname: v.botname })).toLocaleString('en-US')
                        txt = txt + `${i + 1}. @${v.botname} = ${num}\n\n`
                    }
                    await ctx.reply(txt)
                } catch (err) {
                    console.log(err.message)
                }
            })

            bot.on('message', async ctx => {
                try {
                    if (ctx.message.reply_to_message) {
                        let rpmsg = ctx.message.reply_to_message.text
                        let txt = ctx.message.text

                        if (rpmsg.toLowerCase() == 'token') {
                            let bt = await listModel.create({ token: txt, botname: 'unknown' })
                            await ctx.reply(`Token Added: 👉 ${bt.token} 👈\n\nReply with username of bot`)
                        } else if (rpmsg.includes('Token Added:')) {
                            let token = rpmsg.split('👉 ')[1].split(' 👈')[0].trim()
                            let bt = await listModel.findOneAndUpdate({ token }, { $set: { botname: txt } }, { new: true })
                            let final = `New Bot with the following info added successfully:\n\n✨ Botname: ${bt.botname}\n✨ Token: ${bt.token}`
                            await ctx.reply(final)
                        }
                    }
                } catch (err) {
                    console.log(err.message, err)
                }
            })


            if(process.env.ENVIRONMENT == 'production') {
                bot.telegram.setWebhook(`https://font5.onrender.com/webhook/${tk._id}`).catch(e => console.log(e.message, e))
            } else {
                bot.launch().catch(e=> console.log(e.message, e))
            }
        }
    } catch (err) {
        console.log(err.message, err)
    }
}


module.exports = {
    globalBots: myBotsFn
}
