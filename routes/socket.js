const { Accounts } = require('./../models/Accounts')
const { Database } = require('./../config/models/database')
const fs = require('fs')
const UI_PATH = 'public/config/ui.json'

const retriveUI = () => {
    if (fs.existsSync(UI_PATH)) {
        const stringifiedUI = fs.readFileSync(UI_PATH)
        const jsonUI = JSON.parse(stringifiedUI)
        return jsonUI
    } else {
        return { data: [] }
    }
}


module.exports = (socket) => {
    socket.on("new-connected", (payload) => {
        console.log(payload)
    })

    socket.on("/dipe-production-user-login", async (payload) => {

        if (payload && payload.username) {
            const { username } = payload

            const defaultAccount = Accounts.__defaultAccount

            const jsonUI = retriveUI()

            let sessionAccount = undefined
            if (defaultAccount.username == username) {
                sessionAccount = defaultAccount
            } else {
                const Account = new Accounts()
                const accounts = await Account.findAll({ username })
                if (accounts && accounts[0]) {
                    sessionAccount = accounts[0]
                } else {
                    console.log("account khum tồn tại")
                }
            }

            if (sessionAccount != undefined) {
                socket.join(username)
                const uis = jsonUI.data ? jsonUI.data : [];
                const getApiURLs = uis.map(ui => {

                    const url = ui.components[0]?.api_get.split('/')[2]
                    if (url) {
                        socket.join(url)
                    }
                })

            }
            socket.broadcast.emit("/dipe-production-user-login", { username })
        }
    })

    socket.on("/dipe-production-user-logout", (payload) => {
        const { username } = payload;
        socket.leave(username)
        const jsonUI = retriveUI()
        const uis = jsonUI.data ? jsonUI.data : [];

        const getApiURLs = uis.map(ui => {
            const url = ui.components[0]?.api_get.split('/')[2]
            if (url) {
                socket.leave(url)
            }
        })
        // console.log("leave mot dong rooms")
    })

    socket.on("/dipe-production-import-ui", ()=> {
        const jsonUI = retriveUI()
        const uis = jsonUI.data ? jsonUI.data : [];

        const getApiURLs = uis.map(ui => {
            const url = ui.components[0]?.api_get.split('/')[2]
            if (url) {
                socket.join(url)
            }
        })

        socket.broadcast.emit("/dipe-production-import-ui")
    })

    socket.on("/dipe-production-reconnect-ui", () => {
        const jsonUI = retriveUI()
        const uis = jsonUI.data ? jsonUI.data : [];
        console.log("reconnect ui")
        const getApiURLs = uis.map(ui => {
            const url = ui.components[0]?.api_get.split('/')[2]
            if (url) {
                socket.join(url)
            }
        })
    })
    // console.log("Connected")
}
