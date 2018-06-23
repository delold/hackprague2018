const puppeteer = require('puppeteer')
const fs = require('fs')

const searchPage = async(page, hashtag) => {
    await page.goto('https://twitter.com/search-advanced')
    await page.type("input[name='tag']", hashtag)

    await page.click("button.EdgeButton.submit[type='submit']")
    await page.waitForSelector('.SearchNavigation')

    const data = await page.evaluate(async () => {
        const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
        let stuff
        let breakStuff = true
        while (breakStuff) {
            stuff = document.querySelectorAll('.tweet-text')
            if (stuff.length <= 30000) {
                
                (document.scrollingElement || document.body).scrollTop = (document.scrollingElement || document.body).scrollHeight
                let attempts = 0
                while (document.querySelectorAll('.tweet-text').length <= stuff.length) {
                    await wait(500)
                    attempts++
                    if (attempts >= 10) {
                        breakStuff = false
                        break
                    }
                }
            } else {
                break
            }
        }

        if (stuff) {
            return Array.from(stuff).map(item => `${item.innerText}\n------------`)
        }
    })

    fs.writeFileSync(`${hashtag}.txt`, data.join('\n'))
}
const app = async (hashtag) => {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    await page.setViewport({ width: 1080, height: 1080 })

    await searchPage(page, hashtag)
    await browser.close()
}

app('2ndamendment')