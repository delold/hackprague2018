const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const unfluff = require('unfluff')
const { JSDOM } = require('jsdom')
const fetch = require('node-fetch')
const { AmioApi, WebhookRouter } = require('amio-sdk-js')
const cors = require('cors')

const chatbot = new AmioApi({
    accessToken: 'Rp5s9KybT7Yi6RtdNbHqsIJ8Xh9BfBAKMMD5HhVLiRdFIRr34iICo65QG1rsko0pFUkMqbZYJiFtLbWLTHFbg1Wpay'
})

const chatRouter = new WebhookRouter({
    secretToken: 'zob6f4FuFeO5I4Gl4shmHyswivEcRN'
})

app.use(cors())
app.use(bodyparser.json())

const handleRequest = async (text) => {
    if (text === 'server error') throw Error('server error')
    return {
        status: true,
        result: {
            validity: (text === 'valid input'),
            sources: [
                { source: 'Washington Post', title: 'Some title 2', link: "https://cloud.google.com/vision/docs/ocr" },
                { source: 'Reuters', title: 'Some title', link: "https://cloud.google.com/vision/docs/ocr" }
            ]
        }
    }
}


chatRouter.onError(error => console.error(error))
chatRouter.onMessageReceived(async (data, timestamp) => {
    console.log('new Message received', data)

    if (data.channel && data.contact && data.content) {
        const { channel: { id: channelId }, contact: { id: contactId }, content: { type, payload: text }} = data
        
        const result = await handleRequest(text) 

        if (result.status === true && result.result) {
            const { validity, sources } = result.result
            await chatbot.messages.send({
                channel: { id: channelId },
                contact: { id: contactId },
                content: { type: 'text', payload: validity ? `The statement, and I quote: "${text}", is most likely TRUE ✔️` : `The statement, and I quote: "${text}", is most likely FALSE ❌` }
            })

            if (sources && sources.length > 0) {
                await chatbot.messages.send({
                    channel: { id: channelId },
                    contact: { id: contactId },
                    content: { type: 'text', payload: validity ? 'Here are some confirmations:' : 'Here are some valid sources:' }
                })

                
                await chatbot.messages.send({
                    channel: { id: channelId },
                    contact: { id: contactId }, 
                    content: {
                        type: 'structure',
                        payload: sources.map(({ source, title, link }) => (
                            {
                                title: title,
                                text: source,
                                buttons: [
                                    {
                                        type: "url",
                                        title: "Visit website",
                                        payload: link
                                    }
                                ]
                            }
                        ))
                    }
                })
            }

        } else {
            await chatbot.messages.send({
                channel: { id: channelId },
                contact: { id: contactId },
                content: { type, payload: `There are some issues with our backend ... pretty bad during a pitch :(` }
            })
        }

    }
})


chatRouter.onPostbackReceived(async (data, timestamp) => {
    if (data.channel && data.contact) {
        const { channel: { id: channelId }, contact: { id: contactId } } = data

        await chatbot.messages.send({
            channel: { id: channelId },
            contact: { id: contactId },
            content: {
                type: 'text',
                payload: 'Fact check 🔎 anything on the go ✔️. Just type your sentence to be checked from various sources'
            }
        })

        await chatbot.messages.send({
            channel: { id: channelId },
            contact: { id: contactId },
            content: {
                type: 'text',
                payload: 'Just type your sentence to be checked from various sources'
            }
        })
    }
})


app.post('/factcheck', async(req,res) => {
    try {
        const text = req.body.text
        const result = await handleRequest(text)
        res.status(200)
        res.send(JSON.stringify(result))
    } catch (err) {
        console.log(err)
        res.status(500)
        res.send(JSON.stringify({
            status: false,
            result: err
        }))
    }
})

app.post('/receiveBot', (req, res) => chatRouter.handleEvent(req, res))

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