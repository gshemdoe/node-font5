const mkekaMega = require('../database/mkeka-mega')


const sendMkeka3 = async (ctx, delay, bot, imp) => {
    try {
        let bw = `http://bet-link.top/betway/register`
        let gsb = 'http://bet-link.top/gsb-tz/register'
        let pm = `http://pmaff.com/?serial=61291818&creative_id=1788`
        let ke = `http://bet-link.top/22bet/register`
        let tzWinner = `http://bet-link.top/betwinner/register`
        let ug = `http://bet-link.top/gsb-ug/register`
        let prm = `http://bet-link.top/premierbet/register`
        let zm = `https://track.africabetpartners.com/visit/?bta=35468&nci=5976&utm_campaign=zambia`
        let zm_short = `https://is.gd/register_gsb_zambia`

        await ctx.replyWithChatAction('typing')
        await delay(1000)
        let nairobi = new Date().toLocaleDateString('en-GB', { timeZone: 'Africa/Johannesburg' })
        let keka = await mkekaMega.aggregate(([
            { $match: { date: nairobi } },
            { $sample: { size: 15 } }
        ]))
        let txt = `<b><u>🔥 Bet of the Day [ ${nairobi} ]</u></b>\n\n\n`
        let odds = 1
        if (keka.length > 0) {
            for (let m of keka) {
                txt = txt + `<u>${m.time} | ${m.league}</u>\n⚽️ <b><a href="${bw}">${m.match}</a></b>\n<b>🎯 ${m.bet}</b>  @${m.odds} \n\n•••\n\n`
                odds = (odds * m.odds).toFixed(2)
            }

            let finaText = txt + `<b>🔥 Total Odds: ${Number(odds).toLocaleString('en-US')}</b>\n\n•••••\n\n<blockquote>Betslip was prepared at <b>22Bet.</b> Get 200% bonus on your first deposit. Open the link below to claim your bonus</blockquote>\n\n<b>👤 Get Bonus!\n<a href="${ke}">https://22bet.com/promo/bonus\nhttps://22bet.com/promo/bonus</a>\n\n\n•••</b>`

            await ctx.reply(finaText, { parse_mode: 'HTML', disable_web_page_preview: true })
        } else {
            await ctx.replyWithChatAction('typing')
            setTimeout(() => {
                ctx.reply(`Ooops! Today's slip is not yet prepared. Please come back later`)
                    .catch(e => console.log(e.message))
            }, 1000)
        }
    } catch (error) {
        console.log(error.message, error)
    }
}

module.exports = {
    mkeka3: sendMkeka3
}