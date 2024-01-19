const { Accounts } = require('./../models/Accounts')
const { Database } = require('./../config/models/database')
const fs = require('fs')
const UI_PATH = 'public/config/ui.json'
DEFAULT_ERROR_CALCLATED_VALUE = "NULL"
const retriveUI = () => {
    if (fs.existsSync(UI_PATH)) {
        const stringifiedUI = fs.readFileSync(UI_PATH)
        const jsonUI = JSON.parse(stringifiedUI)
        return jsonUI
    } else {
        return { data: [] }
    }
}


module.exports = (io, socket) => {
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
                console.log(`${ username } JOINS ROOM ITSELF`)
                socket.join(username)
                // const uis = jsonUI.data ? jsonUI.data : [];
                // const getApiURLs = uis.map(ui => {

                //     const component = ui.components[0]
                //     if (component) {
                //         const keys = Object.keys(component)
                //         keys.map(k => {
                //             if (k && k.includes('api_')) {
                //                 // console.log(component[k].split('/')[2])
                //                 socket.join(component[k].split('/')[2])
                //             }
                //         })
                //     }
                // })
            }
            // socket.broadcast.emit("/dipe-production-user-login", { username })
            const rooms = io.sockets.adapter.rooms
            // console.log(rooms)
            socket.broadcast.emit("/dipe-production-user-login", { username, rooms })
        }        
    })

    socket.on("/dipe-production-user-logout", (payload) => {
        const { username } = payload;
        socket.leave(username)
        console.log(`${ username } LEAVES ROOM ITSELF`)
        const jsonUI = retriveUI()
        // const uis = jsonUI.data ? jsonUI.data : [];

        // const getApiURLs = uis.map(ui => {
        //     const component = ui.components[0]
        //     if (component) {
        //         const keys = Object.keys(component)
        //         keys.map(k => {
        //             if (k && k.includes('api_')) {
        //                 socket.leave(component[k].split('/')[2])
        //             }
        //         })
        //     }
        // })
        // console.log("leave mot dong rooms")
    })

    socket.on("/dipe-production-import-ui", () => {
        // const jsonUI = retriveUI()
        // const uis = jsonUI.data ? jsonUI.data : [];

        // const getApiURLs = uis.map(ui => {
        //     const component = ui.components[0]
        //     if (component) {
        //         const keys = Object.keys(component)
        //         keys.map(k => {
        //             if (k && k.includes('api_')) {
        //                 socket.join(component[k].split('/')[2])
        //             }
        //         })
        //     }
        // })

        socket.broadcast.emit("/dipe-production-import-ui")
    })

    socket.on("/dipe-production-reconnect-ui", () => {
        // const jsonUI = retriveUI()
        // const uis = jsonUI.data ? jsonUI.data : [];
        // console.log("reconnect ui")
        // const getApiURLs = uis.map(ui => {
        //     const component = ui.components[0]
        //     if (component) {
        //         const keys = Object.keys(component)
        //         keys.map(k => {
        //             if (k && k.includes('api_')) {
        //                 socket.join(component[k].split('/')[2])
        //             }
        //         })
        //     }
        // })
    })
    // not tested
    socket.on("/dipe-production-new-data-added", async (payload) => {
        const { data, api_id } = payload;
        const apis = await Database.selectAll('apis', { api_id })
        if (data && apis && apis[0]) {
            const table_id = apis[0].tables[0]
            const tables = await Database.selectAll("tables", { id: table_id })

            const { statistic, calculates } = apis[0]

            const table = tables[0]

            const primaryKeys = table.primary_key;
            const fields = await Database.selectAll("fields", { id: { $in: primaryKeys } })
            const key = {}
            for (let i = 0; i < fields.length; i++) {
                const field = fields[i]
                const { fomular_alias } = field;
                key[fomular_alias] = data[fomular_alias]
            }

            const originData = await Database.selectAll( table.table_alias, key )           

            const record = originData[0]

            if (calculates && calculates.length > 0) {
                const keys = Object.keys(record )
                keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);

                for (let i = 0; i < calculates.length; i++) {
                    const { fomular_alias, fomular } = calculates[i]
                    let result = fomular;
                    let originResult = fomular
                    keys.map(key => {
                        result = result.replaceAll(key, record[key])
                        originResult = originResult.replaceAll(key, record[key])
                    })
                    try {
                        record[fomular_alias] = eval(result)
                    } catch {
                        record[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                    }
                    try {
                        record[fomular_alias] = eval(originResult)
                    } catch {
                        record[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                    }
                }
            }

            const sums = await Database.selectAll(table.table_alias, { position: "sumerize" })
            const sumerize = sums[0]
            const statistics = []
            if (sumerize) {
                statistic.map(statis => {
                    const { display_name, fomular_alias, fomular, group_by } = statis;
                    const statisRecord = { display_name }
                    if (group_by && group_by.length > 0) {
                        const rawData = sumerize[fomular_alias]
                        if (rawData != undefined) {
                            if (fomular == "AVERAGE") {
                                const headers = Object.keys(rawData)
                                const values = Object.values(rawData).map(({ total, value }) => value)

                                statisRecord["data"] = { headers, values }
                                statisRecord["type"] = "table"
                            } else {
                                const headers = Object.keys(rawData)
                                const values = Object.values(rawData)
                                statisRecord["data"] = { headers, values }
                                statisRecord["type"] = "table"
                            }
                        }
                    } else {
                        statisRecord["type"] = "text"
                        statisRecord["data"] = sumerize[fomular_alias]
                    }
                    statistics.push(statisRecord)
                })
            }            
            socket.broadcast.emit("/dipe-production-new-data-added", { data: record, api_id, statistics, key })
        }
    })

    socket.on("/dipe-production-delete-data", async (payload) => {
        const { data, api_id } = payload;
        const apis = await Database.selectAll('apis', { api_id })
        if (data && apis && apis[0]) {
            const table_id = apis[0].tables[0]
            const tables = await Database.selectAll("tables", { id: table_id })

            const table = tables[0]

            const primaryKeys = table.primary_key;
            const fields = await Database.selectAll("fields", { id: { $in: primaryKeys } })
            const key = {}
            for (let i = 0; i < fields.length; i++) {
                const field = fields[i]
                const { fomular_alias } = field;
                key[fomular_alias] = data[fomular_alias]
            }
            socket.broadcast.emit("/dipe-production-delete-data", { data, api_id, key })
        }
    })

    socket.on("/dipe-production-update-data", async (payload) => {
        const { data, api_id } = payload;
        const apis = await Database.selectAll('apis', { api_id })
        

        if (data && apis && apis[0]) {
            const table_id = apis[0].tables[0]
            const { calculates, statistic } = apis[0]

            const tables = await Database.selectAll("tables", { id: table_id })
            const table = tables[0]

            const primaryKeys = table.primary_key;
            const fields = await Database.selectAll("fields", { id: { $in: primaryKeys } })
            const key = {}
            for (let i = 0; i < fields.length; i++) {
                const field = fields[i]
                const { fomular_alias } = field;
                key[fomular_alias] = data[fomular_alias]
            }
            
            const originData = await Database.selectAll( table.table_alias, key )
            const record = originData[0]

            if (calculates && calculates.length > 0) {
                const keys = Object.keys(record)
                keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);

                for (let i = 0; i < calculates.length; i++) {
                    const { fomular_alias, fomular } = calculates[i]
                    let result = fomular;
                    let originResult = fomular
                    keys.map(key => {
                        result = result.replaceAll(key, record[key])
                        originResult = originResult.replaceAll(key, record[key])
                    })
                    try {
                        record[fomular_alias] = eval(result)
                    } catch {
                        record[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                    }
                    try {
                        record[fomular_alias] = eval(originResult)
                    } catch {
                        record[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                    }
                }
            }

            const sums = await Database.selectAll(table.table_alias, { position: "sumerize" })
            const sumerize = sums[0]
            const statistics = []
            if (sumerize) {
                statistic.map(statis => {
                    const { display_name, fomular_alias, fomular, group_by } = statis;
                    const statisRecord = { display_name }
                    if (group_by && group_by.length > 0) {
                        const rawData = sumerize[fomular_alias]
                        if (rawData != undefined) {
                            if (fomular == "AVERAGE") {
                                const headers = Object.keys(rawData)
                                const values = Object.values(rawData).map(({ total, value }) => value)

                                statisRecord["data"] = { headers, values }
                                statisRecord["type"] = "table"
                            } else {
                                const headers = Object.keys(rawData)
                                const values = Object.values(rawData)
                                statisRecord["data"] = { headers, values }
                                statisRecord["type"] = "table"
                            }
                        }
                    } else {
                        statisRecord["type"] = "text"
                        statisRecord["data"] = sumerize[fomular_alias]
                    }
                    statistics.push(statisRecord)
                })
            }
            socket.broadcast.emit("/dipe-production-update-data", { data: record, api_id, key, statistics })
        }
    })


    // console.log("Connected")
}
