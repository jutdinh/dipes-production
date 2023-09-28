
const { Activation, ActivationRecord } = require('../models/Activation')
const { Controller } = require('../config/controllers');
var exec = require('child_process').exec;

require('dotenv').config()

class ActivationClass extends Controller {
    #__keys = new Activation()
    constructor() {
        super();
    }

    get = async (req, res) => {
        this.writeReq(req)

        /* Logical code goes here */

        this.writeRes({ status: 200, message: "Sample response" })
        res.status(200).send({
            success: true,
            content: "Sample response",
            data: []
        })
    }

    // getMachineID = async () => {
    //     const machineId = await new Promise((resolve, reject) => {
    //         exec(`echo '${process.env.LINUX_PWD}' | sudo -S dmidecode -s system-uuid`, (err, stdout, stderr) => {
    //             console.log({ err, stdout, stderr })
    //             if (typeof (stdout) == 'string') {
    //                 const splitted = stdout.split('\n')
    //                 resolve(splitted[0])
    //             } else {
    //                 resolve("UNKNOWN UUID")
    //             }
    //         });
    //     })
    //     return machineId;
    // }



    
        getMachineID = async () => {
            const machineId = await new Promise((resolve, reject) => {
                exec("wmic path win32_computersystemproduct get uuid", (err, stdout, stderr) => {
                    if (typeof (stdout) == 'string') {
                        const rawID = stdout.split("\n")[1]
                        const id = rawID.split(' ')[0]
                        resolve(id)
                    } else {
                        resolve("UNKNOWN UUID")
                    }
                });
            })
            return machineId;
        }
    


    generateActivationKey = async (req, res) => {

        /**
         * Request HEADER {
         *     Authorization: <Token>
         * }
         */

        const verified = await this.verifyToken(req);
        const context = { success: true }
        if (verified) {
            const machineId = await this.getMachineID()
            context.machineId = machineId
            const key = await this.#__keys.find({ MAC_ADDRESS: machineId })
            if (key) {
                context.activation_key = key.ACTIVATION_KEY;
            }
        }
        res.status(200).send(context)
    }

    isUUID = (uidStr) => {
        const { uuid_format } = Activation.validator;
        const splitted = uidStr.split('-');

        if (splitted.length === uuid_format.length) {
            let valid = true;
            for (let i = 0; i < uuid_format.length; i++) {
                const splitedRecord = splitted[i]
                const uuidFormat = uuid_format[i]
                if (splitedRecord.length !== uuidFormat) {
                    valid = false
                }
            }
            return valid
        }
        return false;
    }

    validateKey = (key) => {
        const {
            header,
            bodyLength,
            footer
        } = Activation.validator;
        const totalLength = bodyLength + 2;
        const splittedKey = key.split('\n')
        if (splittedKey.length === totalLength) {
            const headerPart = splittedKey[0]
            const footerPart = splittedKey[totalLength - 1];

            if (headerPart == header && footerPart == footer) {
                let isBodyValid = true;
                for (let i = 1; i < totalLength - 1; i++) {
                    const valid = this.isUUID(splittedKey[i]);
                    if (!valid) {
                        isBodyValid = false
                    }
                }
                if (isBodyValid) {
                    return true
                } else {
                    return false
                }
            } else {
                return false
            }
        } else {
            return false;
        }
    }

    validMac = (mac) => {
        return this.isUUID(mac)
    }

    getMACFromKey = (key) => {
        if (key) {
            const splittedKey = key.split('\n');
            const MAC = splittedKey[1]
            return MAC
        } else {
            return false
        }
    }

    activateKey = async (req, res) => {
        const nullCheck = this.notNullCheck(req.body, ["key"])
        const MACHINE_MAC_ADDRESS = await this.getMachineID()
        const context = {
            success: true
        }
        if (nullCheck.valid) {
            const { key } = req.body;
            const isKeyValid = this.validateKey(key)
            if (isKeyValid) {
                const activateKey = await this.#__keys.find({ MAC_ADDRESS: MACHINE_MAC_ADDRESS })
                if (!activateKey) {
                    const keyMAC = this.getMACFromKey(key);
                    if (keyMAC == MACHINE_MAC_ADDRESS) {
                        const ActivationKey = new ActivationRecord({ ACTIVATION_KEY: key, MAC_ADDRESS: MACHINE_MAC_ADDRESS, ACTIVATE_AT: new Date() });
                        await ActivationKey.save()
                        context.content = "Kích hoạt thành công" // do MAC của khóa khác mac của máy
                        context.status = "0x4501244"
                    } else {
                        context.content = "Khóa không hợp lệ" // do MAC của khóa khác mac của máy
                        context.status = "0x4501243"
                        context.success = false;
                    }
                } else {
                    context.content = "Bạn đã kích hoạt rồi"
                    context.status = "0x4501242"
                    context.success = false;
                }
            } else {
                context.content = "Khóa không hợp lệ" // do sai cú pháp
                context.status = "0x4501243"
                context.success = false;
            }

        }
        res.status(200).send(context)
    }

    static activationCheck = async () => {
        const Activate = new Activation()
        const activateKey = await Activate.findAll({})
        if (activateKey && activateKey.length > 0) {
            return true;
        } else {
            return false
        }
    }


    checkActivationKey = async (req, res) => {
        const verified = await this.verifyToken(req);
        const context = {
            success: false,
            activated: false,
            content: "Invalid token"
        }
        if (verified) {
            const isActivated = await ActivationClass.activationCheck()
            context.activated = isActivated
            context.success = true
        }
        res.status(200).send(context)
    }
}
module.exports = ActivationClass

