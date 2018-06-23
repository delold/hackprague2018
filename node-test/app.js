const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const unfluff = require('unfluff')
const { JSDOM } = require('jsdom')
const fetch = require('node-fetch')

app.use(bodyparser.json())

app.post('/receiveBot', async (req, res) => {
    try {
        const { event, data } = req.body
        if (event === 'message_received') {
            const { channel: { id: channelId }, contact: { id: userId }, content: { payload, type } } = data
            if (type === 'text') {
                const status = await fetch('https://api.amio.io/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer Rp5s9KybT7Yi6RtdNbHqsIJ8Xh9BfBAKMMD5HhVLiRdFIRr34iICo65QG1rsko0pFUkMqbZYJiFtLbWLTHFbg1Wpay"
                    },
                    body: JSON.stringify({
                        "channel": { "id": channelId },
                        "contact": { "id": userId },
                        "content": {
                            "type": "text",
                            "payload": payload.toLocaleUpperCase()
                        }
                    })
                }).then((data) => {
                    return data.text()
                })
                res.send("Stuff is fine")
            }
        }
    } catch (err) {
        console.log(err)
        res.status(500)
        res.send("")
    }
})
app.post('/sendMessenger', async (req, res) => {
    try {
        const res = await fetch('https://api.amio.io/v1/messages', {
            headers: {
                'Content-Type': 'application/json',
                "authorization": "Bearer Rp5s9KybT7Yi6RtdNbHqsIJ8Xh9BfBAKMMD5HhVLiRdFIRr34iICo65QG1rsko0pFUkMqbZYJiFtLbWLTHFbg1Wpay"
            },
            body: JSON.stringify({
                "channel": {
                  "id": "152975769551387"
                },
                "contact": {
                  "id": "15297579838905937"
                },
                "content": {
                  "type": "text",
                  "payload": "Hello world!"
                }
            })
        })
        res.send(res)
    } catch (err) {
        res.status(500)
        res.send(JSON.stringify(err))
    }
})

app.post('/extract', async (req, res) => {
    try {
        const dom = await JSDOM.fromURL(req.body.url)
        const data = unfluff(dom.serialize())
        res.send(data.text)
    } catch (err) {
        res.status(500)
        res.send(JSON.stringify(err))
    }
})

app.listen(8080, () => {
    console.log(`listening on 8080`)
})