const sharp = require('sharp');
const fs = require('fs');
const sizeOf = require('image-size');

const Crypto = require('./Crypto');

const { Controller } = require('../config/controllers');
const { Accounts, AccountsRecord } = require('../models/Accounts');
const { EventLogsRecord } = require('../models/EventLogs');
const { Projects } = require('../models/Projects');

const { Privileges } = require('../models/Privileges');
const { Tables } = require('../models/Tables');

const fetch = require('node-fetch')
const  DIPES_USER_PASSWORD =  "a01555daf781180515dec9895c40f882"

class Auth extends Controller {
    #__accounts = undefined
    #__default = Accounts.__defaultAccount;
    #__projects = new Projects()
    #__privileges = new Privileges()
    #__tables = new Tables()

    constructor() {
        super();
        this.#__accounts = new Accounts();
    }



    cropAva = async (image, username) => {
        const base64 = image.split(';base64,')[1];
        const buffer = Buffer.from(base64, "base64");
        fs.writeFileSync(`public/temp/${username}.png`, buffer, { encoding: "base64" })

        const sizes = await new Promise((resolve, reject) => {
            sizeOf(`public/temp/${username}.png`, (error, size) => {
                resolve(size);
            })
        })
        if (sizes) {
            const { width, height } = sizes;
            const aspect = { width: width, height: height, left: 0, top: 0 }
            if (height > width) {
                const top = Math.round((height - width) / 2);
                aspect.top = top;
                aspect.height = width;
            }
            if (width > height) {
                const left = Math.round((width - height) / 2);
                aspect.left = left;
                aspect.width = height;
            }
            const destinationFile = `public/image/avatar/${username}.png`;
            if (fs.existsSync(destinationFile)) {
                fs.unlinkSync(destinationFile)
            }
            await new Promise((resolve, reject) => {
                sharp(`public/temp/${username}.png`).extract(aspect).toFile(destinationFile, (error, infor) => {
                    resolve({ error, infor })
                })
            })
            fs.unlinkSync(`public/temp/${username}.png`)

            return destinationFile
        } else {
            return false;
        }
    }


    tokenCheck = async (req, res) => {
        const verified = await this.verifyToken(req)
        const token = req.header("Authorization")
        console.log( token.slice( token.length - 20, token.length ) )
        console.log(75, verified)
        res.status(200).send({ success: verified })
    }

    getAllUserInfor = async (req, res, privileges = []) => {
        this.writeReq(req)
        const context = {
            success: false,
            content: "",
            data: {},
            status: 200
        }
        const verified = await this.verifyToken(req);
        
        if (verified) {
            const decodedToken = this.decodeToken(req.header('Authorization'));
            if (privileges.indexOf(decodedToken.role) != -1) {
                const users = await this.#__accounts.getAllAccounts()
                context.content = "Thành công!";
                context.data = users
                context.success = true;
                context.status = "0x4501000"
            } else {
                context.content = "Bạn không có quyền truy cập api này!"
                context.status = "0x4501001"
            }
        } else {
            context.content = "Token không hợp lệ"
            context.status = "0x4501002"
        }
        res.status(200).send(context)
    }

    getUserInfor = async (req, res, privileges = []) => {

        /**
         *  Request headers: {
         *      Authorization: <Token>
         *  }
         *  Request param: [ username ]
         * 
         */

        this.writeReq(req)
        const context = {
            success: false,
            content: "",
            data: {},
            status: 200
        }
        const verified = await this.verifyToken(req);
        if (verified) {
            const decodedToken = this.decodeToken(req.header('Authorization'));
            if (privileges.indexOf(decodedToken.role) != -1) {
                const { username } = req.params;

                const account = await this.#__accounts.find({ username });
                if (account) {
                    const Account = new AccountsRecord(account);
                    context.success = true;
                    context.content = "Gọi dữ liệu thành công!"
                    context.data = Account.get();
                    context.status = "0x4501003"
                } else {
                    if (username == this.#__default.username && decodedToken.role == "uad") {
                        context.data = { ...this.#__default, password: "" }
                        context.content = "Gọi dữ liệu thành công!"
                        context.status = "0x4501003"
                        context.success = true;
                    } else {
                        context.content = "Người dùng không tồn tại!"
                        context.status = "0x4501004"
                    }
                }
            } else {
                context.content = "Bạn không có quyền truy cập api này!"
                context.status = "0x4501005"
            }
        } else {
            context.content = "Token không hợp lệ"
            context.status = "0x4501006"
        }

        res.status(200).send(context)
    }


    login = async (req, res) => {

        /**
         *  Request headers: {
         *      Authorization: <Token>
         *  }
         *  Request body: {
         *      account: { username, password }
         *  }
         * 
         */



        this.writeReq(req)
        const { username, password } = req.body.account;
        const checkNULL = this.notNullCheck(req.body.account, ["username", "password"])
        if (checkNULL.valid) {
            const projects = await this.#__projects.findAll({})
            let imported = false;
            let project_type = undefined
            let remoteDomain;

            if (projects != undefined && projects.length > 0) {
                imported = true
                const project = projects[0]
                project_type = project.project_type
                remoteDomain = project.proxy_server
            }

            if (username.toLowerCase() == this.#__default.username && password == this.#__default.password) {
                const data = { ...this.#__default, password: undefined }
                const token = this.makeToken(data);

                res.status(200).send({ success: true, content: "Đăng nhập thành công", data: { token, data, imported } })
            } else {

                const Cipher = new Crypto()
                const encryptedPassword = Cipher.encrypt(password)

                const user = await this.#__accounts.find({ username: username.toLowerCase(), password: encryptedPassword })
                

                
                const dipes_user_md5 = DIPES_USER_PASSWORD
                const user_md5_cipher = new Crypto()
                const user_md5 = user_md5_cipher.encrypt( password )

                if (project_type == "api") {
                    const response = await new Promise((resolve, reject) => {
                        fetch(`${remoteDomain}/dipes/auth/login`, {
                            method: "POST",
                            headers: {
                                'content-type': "application/json",
                            },
                            body: JSON.stringify({
                                "checkUser": { 
                                    "username":"DIPES-TEAM",
                                    "password": dipes_user_md5
                                },
                                "checkCustomer": {
                                    username, 
                                    password: user_md5
                                }
                             })
                        }).then(res => res.json()).then(res => {
                            resolve(res)
                        })
                    })
                    
                    const account = response.Account
                    const success = response.Success
                    const content = response.Message
                    let token;

                    if( account && !account.role ){
                        
                        const keys = Object.keys( account )

                        for( let i = 0 ; i < keys.length; i++ ){
                            const key = keys[i].toLowerCase()
                            
                            account[key] = account[keys[i]]
                        }
                        account.role = "pd"
                        token = this.makeToken(account)
                    }


                    res.status(200).send({
                        success,
                        content,
                        data: {
                            data: account,
                            token,
                            imported: true
                        }
                    })
                } else {

                    if (user != undefined) {
                        const Account = new AccountsRecord(user);
                        const data = Account.get();
                        const { status } = data;

                        if( status ){

                            const token = this.makeToken(data);
    
                            await this.saveLog("info", req.ip, "__login", `__username ${Account.username.value()}`, Account.username.value())
    
                            res.status(200).send({ success: true, content: "Đăng nhập thành công", data: { token, data, imported } })
                        }else{
                            res.status(200).send({ success: false, content: "Tài khoản của bạn đã bị vô hiệu" })
                        }
                    } else {
                        res.status(200).send({ success: false, content: "Thông tin đăng nhập không chính xác" })
                    }
                }
            }

        } else {
            res.status(200).send({ success: false, content: "Một số trường có dữ liệu không hợp lệ" })
        }
    }

    signup = async (req, res, privileges = []) => {
        /**
         *  Request headers: {
         *      Authorization: <Token>
         *  }
         *  Request body: {
         *      account: { username, fullname, role, email, phone, address, note }
         *  }
         * 
         */


        const { username, password, fullname, role, email, phone, address, note } = req.body.account;
        const verified = await this.verifyToken(req);
        let context = {
            success: false,
            content: "",
            data: {},
            status: 200
        }
        if (!verified) {
            context = {
                success: false,
                content: "Không tìm thấy token hoặc token khum hợp lệ",
                status: "0x4501007"
            }
        } else {
            const decodedToken = this.decodeToken(req.header('Authorization'));

            const checkNULL = this.notNullCheck(req.body.account, ["username", "password", "fullname", "role"])
            if (checkNULL.valid) {

                if (this.checkPrivilege(decodedToken.role, role)) {

                    const Cipher = new Crypto()
                    const encryptedPassword = Cipher.encrypt(password)

                    const create_by = decodedToken.username;
                    const create_at = new Date()
                    const Account = new AccountsRecord({ username: username.toLowerCase(), password: encryptedPassword, fullname, role, email, phone, address, note, create_by, create_at })
                    const existedAccount = await this.#__accounts.find({ username });

                    if (existedAccount) {
                        context.content = `Tài khoản ${username} đã tồn tại`;
                    } else {
                        if (Account.username.value() != this.#__default.username) {
                            Account.avatar.value(`/image/avatar/${username}.png`)
                            Account.makeFirstAva();
                            await Account.save();

                            const tables = await this.#__tables.findAll();
                            const isAdmin = role == "ad";
                            const privileges = tables.map(table => {
                                return {
                                    username: Account.username.value(),
                                    table_id: table.id,
                                    read: true,
                                    write: isAdmin,
                                    modify: isAdmin,
                                    purge: isAdmin
                                }
                            })

                            await this.#__privileges.insertMany(privileges)
                            await this.saveLog(
                                "info",
                                req.ip,
                                "__createuser",
                                `__username: ${Account.username.value()} | __permission __${Account.role.value()}`,
                                decodedToken.username
                            )
                            context.success = true; context.content = "Tạo tài khoản thành công!"; context.data = Account.get(); context.status = "0x4501011";
                        } else {
                            context.content = `Tài khoản ${username} đã tồn tại`;
                            context.status = "0x4501008"
                        }
                    }
                } else {
                    context.content = `Bạn không có quyền để thực thi thao tác này!`
                    context.status = "0x4501009"
                    await this.saveLog("error", req.ip, "__createuser", `__noright`, decodedToken.username)
                }

            } else {
                context.content = `Không được bỏ trống các trường: ${checkNULL.nullFields.toString()}`
                context.status = "0x4501010"
            }
        }
        res.status(200).send(context)
    }


    register = async (req, res) => {

        /**
         *  Request body: {
         *      account: { username, fullname, password, email, phone, address }
         *  }
         * 
         */

        const { username, fullname, password, email, phone, address } = req.body.account;

        const checkNULL = this.notNullCheck(req.body.account, ["username", "password", "fullname"])
        const context = {}
        if (checkNULL.valid) {


            const projects = await this.#__projects.findAll({})

            let project_type, proxy_server;

            if (projects && projects[0]) {
                const project = projects[0]
                project_type = project.project_type
                proxy_server = project.proxy_server
                
            }

            if (project_type == "api") {
                const md5pwdCipher = new Crypto()
                const md5pwd = md5pwdCipher.md5Encrypt(password)

                const response = await new Promise((resolve, reject) => {
                    fetch(`${proxy_server}/auth/register`, {
                        method: "POST",
                        headers: {
                            'content-type': "application/json",
                        },
                        body: JSON.stringify({ account: {
                            ...req.body.account,
                            password: md5pwd
                        } })
                    }).then(res => res.json()).then(res => {
                        resolve(res)
                    })
                })
                
                const { success, content, token } = response;
                context.success = success
                context.content = content
                context.token = token
            } else {

                const Cipher = new Crypto()
                const encryptedPassword = Cipher.encrypt(password)

                const create_at = new Date()
                const Account = new AccountsRecord({ username: username.toLowerCase(), password: encryptedPassword, fullname, email, phone, address, create_by: {}, create_at, role: "pd" })
                const existedAccount = await this.#__accounts.find({ username });

                if (existedAccount) {
                    context.content = `Tài khoản ${username} đã tồn tại`;
                } else {
                    if (Account.username.value() != this.#__default.username) {
                        Account.avatar.value(`/image/avatar/${username}.png`)
                        Account.makeFirstAva();
                        await Account.save();

                        const tables = await this.#__tables.findAll();
                        const isAdmin = false;
                        const privileges = tables.map(table => {
                            return {
                                username: Account.username.value(),
                                table_id: table.id,
                                read: true,
                                write: isAdmin,
                                modify: isAdmin,
                                purge: isAdmin
                            }
                        })

                        await this.#__privileges.insertMany(privileges)
                        await this.saveLog(
                            "info",
                            req.ip,
                            "__createuser",
                            `__username: ${Account.username.value()} | __permission __${Account.role.value()}`,
                            "Unknown"
                        )
                        context.success = true; context.content = "Tạo tài khoản thành công!"; context.data = Account.get(); context.status = "0x4501011";
                        context.token = this.makeToken(Account.get())
                        delete context.data.create_by
                    } else {
                        context.content = `Tài khoản ${username} đã tồn tại`;
                        context.status = "0x4501008"
                    }
                }
            }
        } else {
            context.content = `Không được bỏ trống các trường: ${checkNULL.nullFields.toString()}`
            context.status = "0x4501010"
        }
        res.status(200).send(context)
    }


    removeUser = async (req, res) => {
        /**
         *  Request headers: {
         *      Authorization: <Token>
         *  }
         *  Request body: {
         *      account: { username }
         *  }
         * 
         */


        const verified = await this.verifyToken(req);

        const context = {
            success: false,
            content: "",
            data: {},
            status: 200
        }

        if (verified) {
            if (!req.body.account || !req.body.account.username) {
                context.content = "Request body không hợp lệ";
                context.status = "0x4501012"
            } else {
                const { username } = req.body.account;

                const decodedToken = this.decodeToken(req.header('Authorization'));
                const account = await this.#__accounts.find({ username })
                if (!account) {
                    context.success = true;
                    context.content = "Người dùng không tồn tại!"
                    context.status = "0x4501013"
                } else {
                    const Account = new AccountsRecord(account);
                    const validPrivilege = this.checkPrivilege(decodedToken.role, Account.role.value());
                    if (!validPrivilege) {
                        context.content = "Bạn không có quyền thực hiện thao tác này";
                        context.status = "0x4501014"
                        await this.saveLog(
                            "error", req.ip,
                            "__deleteuser",
                            `__noright`,
                            decodedToken.username
                        )
                    } else {
                        context.success = true;
                        context.content = "Xóa thành công!";
                        context.status = "0x4501015"

                        await this.saveLog(
                            "info", req.ip,
                            "__deleteuser",
                            `__username ${Account.username.value()} | __permission __${Account.role.value()}`,
                            decodedToken.username
                        )
                        await Account.destroy()
                    }
                }
            }
        } else {
            context.content = "Không tìm thấy token hoặc token khum hợp lệ";
            context.status = "0x4501016"
        }

        res.status(200).send(context)
    }

    updateUser = async (req, res, privileges = []) => {

        /**
        *  Request headers: {
        *      Authorization: <Token>
        *  }
        *  Request body: {
        *      account: { username, fullname, role, email, phone, address, note }
        *  }
        * 
        */


        const verified = await this.verifyToken(req);
        let context = {
            success: false,
            content: "",
            data: {},
            status: 200
        }
        if (verified) {
            const { account } = req.body;
            if (account != undefined) {
                const { username } = account;
                if (username != undefined) {
                    const oldInfo = await this.#__accounts.find({ username })
                    if (oldInfo != null) {
                        const decodedToken = this.decodeToken(req.header("Authorization"));
                        if (privileges.indexOf(decodedToken.role) != -1) {
                            const Account = new AccountsRecord(oldInfo)
                            if (this.checkPrivilege(decodedToken.role, Account.role.value())) {
                                const { fullname, role, email, phone, address, note, status } = req.body.account;
                                const newPriCheck = this.checkPrivilege(decodedToken.role, role);
                                if (newPriCheck) {
                                    Account.fullname.value(fullname ? fullname : undefined);
                                    Account.role.value(role);
                                    Account.email.value(email ? email : undefined);
                                    Account.phone.value(phone ? phone : undefined);
                                    Account.address.value(address ? address : undefined);
                                    Account.note.value(note ? note : undefined);
                                    Account.status.value(status);

                                    await Account.save()
                                    context.content = "Cập nhật thành công!"
                                    context.success = true;
                                    context.status = "0x4501017"

                                    await this.saveLog(
                                        "info", req.ip,
                                        "__updateuser",
                                        `__username: ${Account.username.value()}
| __fullname ${oldInfo.fullname} => ${Account.fullname.value()}
| __role __${oldInfo.role} => __${Account.role.value()}
| __email ${oldInfo.email} => ${Account.email.value()}
| __phone ${oldInfo.phone} => ${Account.phone.value()}
| __address ${oldInfo.address} => ${Account.address.value()}
| __note ${oldInfo.note} => ${Account.note.value()}
                                        `.replaceAll("\n", " "),
                                        decodedToken.username
                                    )

                                } else {
                                    context.content = "Bạn không thể cập nhật một quyền cao hơn bản thân";
                                    context.status = "0x4501018"
                                    await this.saveLog("error", req.ip, "__updateuser", `__noright`, decodedToken.username)
                                }
                            } else {
                                context.content = "Bạn không có đủ quyền để thực hiện thao tác này";
                                context.status = "0x4501019"
                                await this.saveLog("error", req.ip, "__updateuser", `__noright`, decodedToken.username)
                            }
                        } else {
                            context.content = "Bạn không có quyền để truy cập API này";
                            context.status = "0x4501020"
                            await this.saveLog("error", req.ip, "__updateuser", `__noright`, decodedToken.username)
                        }
                    } else {
                        context.content = "Tài khoản không tồn tại hoặc đã bị xóa"
                        context.status = "0x4501021"
                    }
                } else {
                    context.content = "Request body không hợp lệ"
                    context.status = "0x4501022"
                }
            } else {
                context.content = "Request body không hợp lệ"
                context.status = "0x4501022"
            }
        } else {
            context.content = "Token không hợp lệ!"
            context.status = "0x4501023"
        }
        res.status(200).send(context)
    }

    selfUpdate = async (req, res) => {

        /**
         *  Request headers: {
         *      Authorization: <Token>
         *  }
         *  Request body: {
         *      account: { username, fullname, password, email, phone, address, note }
         *  }
         * 
         */

        const verified = await this.verifyToken(req);

        const context = {
            success: false,
            content: "",
            data: {},
            status: 200

        }
        const decodedToken = this.decodeToken(req.header("Authorization"));
        if (verified) {
            const { account } = req.body;
            if (account != undefined) {
                const { username } = account;
                if (username != undefined) {
                    const account = await this.#__accounts.find({ username })
                    if (account) {
                        const Account = new AccountsRecord(account)
                        if (username === decodedToken.username) {
                            const { fullname, password, email, phone, address, note } = req.body.account;
                            Account.fullname.value(fullname ? fullname : undefined);
                            Account.password.value(password ? password : undefined);
                            Account.email.value(email ? email : undefined);
                            Account.phone.value(phone ? phone : undefined);
                            Account.address.value(address ? address : undefined);
                            Account.note.value(note ? note : undefined);

                            context.content = "Cập nhật thành công!"
                            context.success = true;
                            context.status = "0x4501024"

                            await this.saveLog(
                                "info", req.ip,
                                "__selfupdateinfo",
                                `__username ${Account.username.value()}
| __fullname ${account.fullname} => ${Account.fullname.value()}
| __email ${account.email} => ${Account.email.value()}
| __phone ${account.phone} => ${Account.phone.value()}
| __address ${account.address} => ${Account.address.value()}
| __note ${account.note} => ${Account.note.value()}
                                `.replaceAll("\n", " "),
                                decodedToken.username
                            )

                            await Account.save()

                        } else {
                            context.content = "Không thể cập nhật thông tin của tài khoản khác bằng API này!"
                            context.status = "0x4501025"
                            await this.saveLog("error", req.ip, "__selfupdateinf", `__noright`, decodedToken.username)
                        }
                    } else {
                        context.content = "Tài khoản bị xóa hoặc không tồn tại!"
                        context.status = "0x4501026"
                    }
                } else {
                    context.content = "Request body không hợp lệ"
                    context.status = "0x4501027"
                }
            } else {
                context.content = "Request body không hợp lệ"
                context.status = "0x4501027"
            }
        } else {
            context.content = "Token không hợp lệ"
            context.status = "0x4501028"
        }
        res.status(200).send(context)
    }

    changeAva = async (req, res, privileges = []) => {
        const verified = this.verifyToken(req);
        const decodedToken = this.decodeToken(req.header("Authorization"));
        const context = {
            success: false,
            content: "",
            data: {},
            status: 200
        }

        /**
         *  Request headers: {
         *      Authorization: <Token>
         *  }
         *  Request body: {
         *      username: <String>
         *      image: <Base64>
         *  }
         * 
         */
        if (verified) {
            if (privileges.indexOf(decodedToken.role) != -1) {
                const { username, image } = req.body;
                if (username && image) {
                    const user = await this.#__accounts.find({ username })
                    if (user != undefined) {
                        const Account = new AccountsRecord(user);
                        if (this.checkPrivilege(decodedToken.role, Account.role.value())) {
                            const cropResult = await this.cropAva(image, username)
                            if (cropResult) {
                                context.success = true;
                                context.content = "Thay đổi thành công"
                                context.status = "0x4501029"

                            } else {
                                context.content = "Tệp lỗi!";
                                context.status = "0x4501030"
                            }
                        } else {
                            context.content = "Bạn không có quyền thực hiện thao tác này";
                            context.status = "0x4501031"
                        }
                    } else {
                        context.content = "Tài khoản không tồn tại";
                        context.status = "0x4501032"
                    }
                } else {
                    context.content = "Request body không hợp lệ!"
                    context.status = "0x4501033"
                }
            } else {
                context.content = "Bạn không có quyền để truy cập API này!"
                context.status = "0x4501034"
            }
        } else {
            context.content = "Token không hợp lệ"
            context.status = "0x4501035"
        }
        res.status(200).send(context)
    }

    selfChangeAva = async (req, res) => {

        /**
         *  Request headers: {
         *      Authorization: <Token>
         *  }
         *  Request body: {         
         *      image: <Base64>
         *  }
         * 
         */

        const verified = await this.verifyToken(req);

        const context = {
            success: false,
            content: "",
            data: {},
            status: 200

        }
        const decodedToken = this.decodeToken(req.header("Authorization"));
        if (verified) {
            const { image } = req.body;
            if (image != undefined) {
                const { username } = decodedToken;
                if (username != undefined) {
                    const account = await this.#__accounts.find({ username })
                    if (account) {
                        this.cropAva(image, username)
                        context.content = "Cập nhật thành công!"
                        context.success = true;
                        context.status = "0x4501036"
                    } else {

                        if (username == this.#__default.username && decodedToken.role == "uad") {
                            this.cropAva(image, username)
                            context.success = true;
                            context.content = "Cập nhật thành công!"
                            context.status = "0x4501036"
                        } else {
                            context.content = "Người dùng không tồn tại!"
                            context.status = "0x4501037"
                        }
                    }
                } else {
                    context.content = "Token không hợp lệ"
                    context.status = "0x4501038"
                }
            } else {
                context.content = "Request body không hợp lệ"
                context.status = "0x4501039"
            }
        } else {
            context.content = "Token không hợp lệ"
            context.status = "0x4501040"
        }
        res.status(200).send(context)
    }

    getPrivilegesOnTables = async (req, res) => {
        const tables = await this.#__tables.findAll()
        const formatedTables = []
        for (let i = 0; i < tables.length; i++) {
            const table = tables[i]
            const table_id = table.id;
            table.accounts = await this.#__privileges.findAll({ table_id });
            for (let j = 0; j < table.accounts.length; j++) {
                const { username } = table.accounts[j]
                const account = await this.#__accounts.find({ username })
                table.accounts[j].account = account;
            }
        }
        res.status(200).send({ success: true, tables })
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
            

        } else {
            context.content = "Token không hợp lệ"
            context.status = "0x4501040"
        }
        res.status(200).send(context)
    }


    changePassword = async ( req, res ) => {       
        const checkNULL = this.notNullCheck(req.body.account, ["username", "oldPassword", "newPassword"])

        if( checkNULL.valid ){
            const { username, oldPassword, newPassword } = req.body.account;

            const projects = await this.#__projects.findAll({})
            let imported = false;
            let project_type = undefined
            let remoteDomain;

            if (projects != undefined && projects.length > 0) {
                imported = true
                const project = projects[0]
                project_type = project.project_type
                remoteDomain = project.proxy_server
            }            
            if (project_type == "api") {


                const dipes_user_md5_cipher = new Crypto()

                const old_pass_cipher = new Crypto()
                const new_pass_cipher = new Crypto()

                const dipes_user_md5 = DIPES_USER_PASSWORD
                const md5OldPass = old_pass_cipher.md5Encrypt( oldPassword )
                const md5NewPass = new_pass_cipher.md5Encrypt( newPassword )

                const response = await new Promise((resolve, reject) => {                    
                    fetch(`${remoteDomain}/dipes/auth/changePwd`, {
                        method: "POST",
                        headers: {
                            'content-type': "application/json",
                        },
                        body: JSON.stringify(
                            {
                                "checkUser": { 
                                    "username":"DIPES-TEAM",
                                    "password": dipes_user_md5
                                },
                                "checkCustomer": {
                                    username, 
                                    password:  md5OldPass,
                                },
                                "NewPassword": md5NewPass
                             }
                        )
                    }).then(res => res.json()).then(res => {
                        resolve(res)
                    })
                })
                
                const { Success, Message } = response
    
                res.status(200).send({
                    success: Success,
                    content: Message
                })
            } else {
                // not yet tested
                const Cipher = new Crypto()
                const NewPwdCipher = new Crypto()
                
                const encryptedPassword =  Cipher.encrypt(oldPassword)                 
                const encryptedNewPassword =  NewPwdCipher.encrypt(newPassword)

                const user = await this.#__accounts.find({ username: username.toLowerCase(), password: encryptedPassword })

    
                if (user != undefined) {
                    const Account = new AccountsRecord({ ...user, password: encryptedNewPassword });
                    await Account.save()

                    res.status(200).send({ success: true, content: "Đổi mật khẩu thành công" })
                } else {
                    res.status(200).send({ success: false, content: "Thông tin không chính xác" })
                }
            }

        }else{
            res.status(200).send({ success: false, content: "Thông tin không chính xác" })
        }

    } 


    refreshToken = async (req, res) => {

        /**
         * url: http://ws/auth/refreshtoken
         * 
         * req.body {
         *      token: <String>
         * }
         * 
         * 
         */


        const { token } = req.body


        const verified = await this.verifyCustomToken( token )
        
        const  success = verified;
        
        const context = {
            success,
            content: "Invalid token"
        }
        if( success ){
            const decodedToken = this.decodeToken( token )
            delete decodedToken.exp 
            delete decodedToken.iat
            const newToken = this.makeToken( decodedToken )
            context.token = newToken
            context.content = "Successfully extended token lifetime by 1 hour long"
        }
        res.status(200).send(context)
    }
}
module.exports = Auth