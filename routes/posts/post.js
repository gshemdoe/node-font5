const router = require('express').Router()
const { bot1Fn } = require('./bots/bot1/bot1')
const { bot2Fn } = require('./bots/bot2/bot2')

router.post('/webhook/bot1', async (req, res)=> {
    try {
        await bot1Fn(router)
    } catch (error) {
        console.log(error.message)
    }
})

router.post('/webhook/bot2', async (req, res)=> {
    try {
        await bot2Fn(router)
    } catch (error) {
        console.log(error.message)
    }
})

//this all placed on post requests because it is the last on index.js
router.all('*', (req, res) => {
    res.sendStatus(404)
})

module.exports = router