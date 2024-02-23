
const { Controller } = require('../config/controllers');

class PrivilegeDetail extends Controller {
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
module.exports = PrivilegeDetail

    