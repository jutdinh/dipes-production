
const { Controller } = require('../config/controllers');
const { UserPrivileges, UserPrivilegesRecord } = require('../models/UserPrivileges')

const { PrivilegeGroup, PrivilegeGroupRecord } = require('../models/PrivilegeGroup')

class UserPrivilegesController extends Controller {
    #__up = new UserPrivileges()
    #__pg = new PrivilegeGroup()

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

    grantUserPrivilege = async (req, res) => {

        /**
         * 
         *  HEADERS {
         *      Authentication: <Token>
         *  }
         * 
         *  BODY: {
         *      privilege: {
         *          privilegegroup_id: <Int>,
         *          username: <String>
         *      }
         *  }
         * 
         */

        const verified = await this.verifyToken(req);

        const context = {
            success: false,
            content: "",
            pages: [],
            status: 200

        }

        if (verified) {

            const { privilege } = req.body;

            if (privilege && this.notNullCheck(privilege, ["privilegegroup_id", "usename"])) {

                const { privilegegroup_id, username } = privilege

                const existedPrivilege = await this.#__up.findAll({ privilegegroup_id, username })                

                if (existedPrivilege && existedPrivilege.length == 0) {

                    const groups = await this.#__pg.findAll({ privilegegroup_id }) 

                    if( groups.length > 0 ){

                        const Privilege = new UserPrivilegesRecord({ username, privilegegroup_id })
                        await Privilege.save()
                        context.data = Privilege.get()
                        context.content = "Successfully granted privilege to the user"
                    }else{
                        context.content = "Invalid privilege group"    
                    }

                } else {
                    context.content = "The user has already had this privilege"
                }
            } else {
                context.content = "Invalid request body"
            }
        } else {
            context.content = "Invalid token"
        }
        res.send(context)
    }

    revokePrivilege = async (req, res) => {
        /**
                 * 
                 *  HEADERS {
                 *      Authentication: <Token>
                 *  }
                 * 
                 *  BODY: {
                 *      privilege: {
                 *          privilegegroup_id: <Int>,
                 *          username: <String>
                 *      }
                 *  }
                 * 
                 */

        const verified = await this.verifyToken(req);

        const context = {
            success: false,
            content: "",
            pages: [],
            status: 200

        }

        if (verified) {

            const { privilege } = req.body;

            if (privilege && this.notNullCheck(privilege, ["privilegegroup_id", "usename"])) {

                const { privilegegroup_id, username } = privilege

                const existedPrivilege = await this.#__up.findAll({ privilegegroup_id, username })
                if (existedPrivilege && existedPrivilege.length != 0) {

                    const Privilege = new UserPrivilegesRecord(existedPrivilege[0])
                    await Privilege.remove()

                    context.content = "Successfully revoked privilege to the user"
                } else {
                    context.content = "The user has not had this privilege"
                }
            } else {
                context.content = "Invalid request body"
            }
        } else {
            context.content = "Invalid token"
        }
        res.send(context)
    }

    modifyPrivilege = async (req, res) => {
        /**
                 * 
                 *  HEADERS {
                 *      Authentication: <Token>
                 *  }
                 * 
                 *  BODY: {
                 *      privilege: {
                 *          privilegegroup_id: <Int>,
                 *          username: <String>
                 *      }
                 *  }
                 * 
                 */

        const verified = await this.verifyToken(req);

        const context = {
            success: false,
            content: "",
            pages: [],
            status: 200

        }

        if (verified) {

            const { privilege } = req.body;

            if (privilege && this.notNullCheck(privilege, ["privilegegroup_id", "username"]).valid) {

                const { privilegegroup_id, username } = privilege
                const existedPrivilege = await this.#__up.findAll({ username })
                if (existedPrivilege && existedPrivilege.length != 0) {

                    const Privilege = new UserPrivilegesRecord(existedPrivilege[0])

                    if (Privilege.privilegegroup_id.value() != privilegegroup_id) {

                        const groups = await this.#__pg.findAll({ privilegegroup_id })
                        if (groups && groups.length > 0) {
                            Privilege.privilegegroup_id.value(privilegegroup_id)
                            await Privilege.save()                            
                            context.success = true;

                            context.content = "Successfully modified privilege on the user"
                        } else {
                            context.content = "Invalid privilege group"
                        }
                    } else {
                        context.content = "No change is made"
                    }
                } else {
                    context.content = "The user has not had this privilege"
                }
            } else {
                context.content = "Invalid request body"
            }
        } else {
            context.content = "Invalid token"
        }
        res.send(context)
    }

}
module.exports = UserPrivilegesController

