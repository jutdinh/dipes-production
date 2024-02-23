const sharp = require('sharp');
const fs = require('fs');
const sizeOf = require('image-size');

const Crypto = require('./Crypto');

const { Controller } = require('../config/controllers');
const { Accounts } = require('../models/Accounts');

const { Privileges, PrivilegesRecord } = require('../models/Privileges');
const { Tables } = require('../models/Tables');


class PrivilegesController extends Controller {
    #__accounts = undefined
    #__privileges = new Privileges()
    #__tables = new Tables()

    constructor() {
        super();
        this.#__accounts = new Accounts();
    }

    getPrivilegesOnTables = async (req, res) => {
        const verified = await this.verifyToken(req);

        const context = {
            success: false,
            content: "",
            data: {},
            status: 200

        }
        if (verified) {

            const tables = await this.#__tables.findAll()
            const accounts = await this.#__accounts.findAll()
            const formatedTables = []

            const serializeAccounts = {}
            accounts.map(account => {
                serializeAccounts[account.username] = account
            })

            for (let i = 0; i < tables.length; i++) {
                const table = tables[i]
                const table_id = table.id;
                table.accounts = await this.#__privileges.findAll({ table_id });
                for (let j = 0; j < table.accounts.length; j++) {
                    const { username } = table.accounts[j]

                    table.accounts[j].account = serializeAccounts[username];
                }
                formatedTables.push(table)
            }
            context.success = true
            context.data = formatedTables
        } else {
            context.content = "Token không hợp lệ"
            context.status = "0x4501040"
        }
        res.status(200).send(context)
    }


    getPrivilegesOnUsers = async (req, res) => { // in process
        const verified = await this.verifyToken(req);

        const context = {
            success: false,
            content: "",
            data: {},
            status: 200

        }
        if (verified) {

            const accounts = await this.#__accounts.findAll()
            const tables = await this.#__tables.findAll()

            const serializeTables = {}
            tables.map(table => {
                serializeTables[`${table.id}`] = table
            })

            const formatedAccounts = []
            for (let i = 0; i < accounts.length; i++) {
                const account = accounts[i]
                const username = account.username;
                account.privileges = await this.#__privileges.findAll({ username })

                for (let j = 0; j < account.privileges.length; j++) {
                    account.privileges[j].table = serializeTables[account.privileges[j].table_id]
                }
                formatedAccounts.push(account)
            }
            context.success = true
            context.data = formatedAccounts
        } else {
            context.content = "Token không hợp lệ"
            context.status = "0x4501040"
        }
        res.status(200).send(context)
    }


    changeUserPrivileges = async (req, res) => {
        const verified = await this.verifyToken(req);

        const context = {
            success: false,
            content: "",
            data: {},
            status: 200

        }
        if (verified) {
            const decodedToken = this.decodeToken(req.header("Authorization"));
            const { username, table_id } = req.params;
            const { privileges } = req.body;
            if (this.isAdmin(decodedToken)) {
                const privilege = await this.#__privileges.find({ username, table_id: parseInt(table_id) })

                if (privilege) {
                    const Privilege = new PrivilegesRecord({ ...privilege, ...privileges })
                    await Privilege.save()

                    context.success = true;
                    context.content = "Thay đổi thành công"
                    context.status = "0x4501029"
                } else {
                    context.content = "Quyền không tồn tại"
                    context.status = "0x4501031"
                }
            } else {
                context.content = "Không có quyền thực hiện thao tác"
                context.status = "0x4501031"
            }
        } else {
            context.content = "Token không hợp lệ"
            context.status = "0x4501040"
        }
        res.status(200).send(context)
    }

    flatteningPages = ( pages ) => {

        /**
         * Ép dẹp cây pages thành mảng các page cùng cấp
         */

        const pgs = []
        
        for( let i = 0 ; i < pages.length; i++ ){
            pgs.push({...pages[i], children: []})
            const { children } = pages[i]
            if( children ){
                pgs.push(...this.flatteningPages( children ) )
            }
        }
        return pgs
    }


    flatteningComponents = (components) => {
        /**
         * Ép dẹp cây component thành mảng các component cùng cấp
         */

        const cpns = []
        for (let i = 0; i < components.length; i++) {
            const { children } = components[i]
            cpns.push({ ...components[i] })
            if (children) {
                cpns.push(...this.flatteningComponents(children))
            }
        }
        return cpns
    }

    getUITree = async (req, res) => {
        const verified = await this.verifyToken(req);

        const context = {
            success: false,
            content: "",
            pages: [],
            status: 200

        }
        const tableTypes = ["table", "table_param"]
        const path = 'public/config/ui.json'

        if (verified) {
            const decodedToken = this.decodeToken(req.header("Authorization"));

            if (this.isAdmin(decodedToken)) {

                if( fs.existsSync( path ) ){
                    const rawUI = fs.readFileSync( path )
                    const ui = JSON.parse(rawUI)
                    const pages = this.flatteningPages(ui.data);
                    if( pages ){
                        for( let i = 0; i < pages.length; i++ ){
                            const page = pages[i]
                            const flattenComponents = this.flatteningComponents( page.component )
                            const tables = flattenComponents.filter( cpn => tableTypes.indexOf(cpn.name) != -1 )

                            const data = {
                                page_id: page.page_id,
                                page_title: page.page_title,
                                tables: tables.map( table => {
                                    const { props, id, children } = table;
                                    
                                    if( props ){
                                        const { name } = props
                                        const customButtons = children.filter( child => child.name == "custom_button" )
                                        const buttons = [
                                            {
                                                id: "detail",
                                                name: "Xem chi tiết",
                                            },
                                            {
                                                id: "update",
                                                name: "Cập nhật",
                                            },
                                            {
                                                id: "delete",
                                                name: "Xóa",
                                            },
                                        ]

                                        for( let j = 0; j < customButtons.length; j++ ){
                                            const { id, title, icon } = customButtons[j]
                                            const btn = {
                                                id, title, icon
                                            }
                                            buttons.push(btn)
                                        }

                                        return { id, name, buttons }
                                        
                                    }
                                }),
                            }

                            context.pages.push(data)
                        }

                    }
                }                
            }
        }
        res.status(200).send(context)
    }
}
module.exports = PrivilegesController