
const { Controller } = require('../config/controllers');

class PrivilegeGroup extends Controller {
    constructor(){
        super();
    }

    get = async ( req, res ) => {
        this.writeReq(req)

        /* Logical code goes here */

        this.writeRes({ status: 200, message: "Sample response" })
        res.status(200).send({
            success: true,
            content: "Sample response",
            data: []
        })
    }

}
module.exports = PrivilegeGroup

    