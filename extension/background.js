browser.contextMenus.create({
    id: "fakebreaker",
    title: "Fact check selection",
    contexts: ["selection"],
})
browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "fakebreaker") {
        const text = info.selectionText
        fetch(`https://9d001db4.ngrok.io/factcheck`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        }).then((data) => data.json()).then((result) => {

            if (result.status === true && result.result) {
                const { validity } = result.result

                browser.notifications.create({
                    type: 'basic',
                    iconUrl: browser.extension.getURL("icon.png"),
                    title: `Statement is ${validity ? 'TRUE 👌' : 'FALSE 🤮'}`,
                    message: validity ? `The statement, and I quote: "${text}", is most likely TRUE ✔️` : `The statement, and I quote: "${text}", is most likely FALSE ❌`
                })
                
            } else {

                browser.notifications.create({
                    type: 'basic',
                    iconUrl: browser.extension.getURL("icon.png"),
                    title: `Service currently unavaliable`,
                    message: `There are some issues with our backend ... pretty bad during a pitch :(`
                })
            }

        })
    }
})