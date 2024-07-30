const { Bot, webhookCallback, InlineKeyboard } = require('grammy')
const { limit } = require("@grammyjs/ratelimiter");
const { hydrateReply, parseMode } = require("@grammyjs/parse-mode")
const UsersModel = require('./databases/users')

const AutoAcceptorBot = async (app) => {
    try {
        const bot = new Bot(process.env.AUTO_ACCEPT)

        //setwebhook
        let hookPath = `/telebot/${process.env.USER}/auto-acceptor`
        await bot.api.setWebhook(`https://${process.env.DOMAIN}${hookPath}`)
            .then(() => console.log(`hook for AutoAcceptor is set`))
            .catch(e => console.log(e.message))
        app.use(hookPath, webhookCallback(bot, 'express'))

        //ratelimit 1 msg per 3 seconds
        bot.use(limit({ timeFrame: 3000, limit: 1 }))

        //install the hydratereply plugin
        bot.use(hydrateReply);

        // Set the default parse mode for ctx.reply.
        bot.api.config.use(parseMode("HTML"));

        bot.catch((err) => {
            const ctx = err.ctx;
            console.error(err.message, err);
        });

        bot.command("start", async (ctx) => {
            try {
                if (ctx.chat.type == 'private') {
                    const { first_name, id } = ctx.chat
                    let botname = ctx.me.username

                    //update user informations if not upsert
                    await UsersModel.findOneAndUpdate(
                        { chatid: id },
                        { $set: { first_name, chatid: id } },
                        { upsert: true }
                    )

                    //addlinks
                    let channels = `t.me/${botname}?startchannel&admin=invite_users+manage_chat`
                    let groups = `t.me/${botname}?startgroup=g_accepting&admin=manage_chat+invite_users`

                    //inline keyboards
                    let inline_keyboard = new InlineKeyboard()
                        .url(`➕ Add Me to Your Channel(s)`, channels).row()
                        .url(`➕ Add Me to Your Group(s)`, groups).row()

                    // Send a message to the user
                    await ctx.reply(`Hi! Thanks for using me \n\nYou can use this bot to automatically accept user join requests for your channels and groups.\n\nTo set up instant user acceptance, simply add this bot to your channel or group by clicking the <b>"Add to Channel"</b> or <b>"Add to Group"</b> button below.`, { reply_markup: inline_keyboard });
                }
            } catch (error) {
                console.error(error.message, error)
            }
        });

        bot.command('privacy', async ctx => {
            try {
                await ctx.reply(`<b>Privacy Policy</b> \n\nWelcome to <b>Instant Approver</b>! Your privacy is very important to us.\n\n<b>Data Collection and Use:</b> \nWe do not store any user data. To function effectively, we only use the user ID and first name, which are publicly available on Telegram. This information is solely used to approve user join requests for channels and groups where the bot is an admin.\n\n<b>Data Security:</b> \nWe take the security of your information seriously. Since we do not store any user data, there is no risk of your personal information being accessed or misused.\n\n<b>Third-Party Services:</b> \nOur bot does not share your information with any third parties.\n\n<b>Changes to This Privacy Policy:</b> \nWe may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.\n\n<b>Contact Us:</b> \nIf you have any questions or concerns about our Privacy Policy, please feel free to contact us at <b>@shemdoe</b>. \n\nBy using our bot, you agree to the collection and use of information in accordance with this policy. Thank you for trusting <b>Instant Approver</b>!`)
            } catch (error) {
                console.error(error)
            }
        })

        bot.on('message:text', async (ctx) => {
            try {
                if (ctx.chat.type == 'private') {
                    const { first_name, id } = ctx.chat
                    let botname = ctx.me.username

                    //update user informations if not upsert
                    await UsersModel.findOneAndUpdate(
                        { chatid: id },
                        { $set: { first_name, chatid: id } },
                        { upsert: true }
                    )

                    //addlinks
                    let channels = `t.me/${botname}?startchannel&admin=invite_users+manage_chat`
                    let groups = `t.me/${botname}?startgroup=g_accepting&admin=manage_chat+invite_users`

                    //inline keyboards
                    let inline_keyboard = new InlineKeyboard()
                        .url(`➕ Add Me to Your Channel(s)`, channels).row()
                        .url(`➕ Add Me to Your Group(s)`, groups).row()

                    // Send a message to the user
                    await ctx.reply(`Hi! You can use this bot to automatically accept user join requests for your channels and groups.\n\nTo set up instant user acceptance, simply add this bot to your channel or group by clicking the <b>"Add to Channel"</b> or <b>"Add to Group"</b> button below.`, { reply_markup: inline_keyboard });
                }
            } catch (error) {
                console.error(error)
            }
        })

        bot.on('chat_join_request', async ctx => {
            try {
                let botname = ctx.me.username
                let chan_id = ctx.chatJoinRequest.chat.id
                let chan_title = ctx.chatJoinRequest.chat.title
                let userid = ctx.chatJoinRequest.from.id
                let user_fname = ctx.chatJoinRequest.from.first_name
                let linkName = ctx.chatJoinRequest.invite_link?.name
                let message1 = `Hi <b>${user_fname},</b>\nGreat news! Your request to join <b>${chan_title}</b> has been approved. Welcome aboard!\n\n<b>Show appreciation below 😉</b>`
                let message2 = `Hi <b>${user_fname},</b>\nGreat news! Your request to join <b>${chan_title}</b> has been received. You will be added to the channel soon!\n\n<b>Show appreciation below 😉</b>`
                let inline_keyboard = new InlineKeyboard()
                    .url('😍 Okay! Thank you', `t.me/${botname}?start=thank_you`).row()

                if (linkName && linkName == 'for CPAGrip') {
                    //send message to CPA ofa user
                    await ctx.api.sendMessage(userid, message2, { reply_markup: inline_keyboard })
                } else {
                    //send message to user
                    await ctx.api.sendMessage(userid, message1, { reply_markup: inline_keyboard })

                    //approve request
                    await ctx.api.approveChatJoinRequest(chan_id, userid)
                }
            } catch (error) {
                console.log(error)
                bot.api.sendMessage(741815228, error.message)
                    .catch(e => console.log(e.message))
            }
        })
    } catch (error) {
        console.log(error.message, error)
    }
}


module.exports = {
    AutoAcceptorBot
}