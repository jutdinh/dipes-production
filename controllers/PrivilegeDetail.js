
const { Controller } = require('../config/controllers');
const { PrivilegeDetail, PrivilegeDetailRecord } = require('../models/PrivilegeDetail');

class PrivilegeDetailController extends Controller {
    #__pd = new PrivilegeDetail()
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

    


    createPrivilegeDetail = async ( req, res ) => {

        /**
         * 
         *  HEADERS: {
         *      Authorization: <Token>
         *  }
         * 
         *  BODY: {
         *      detail: {
         *          privilegegroup_id: <Int>
         *          button_id: <String>
         *      }
         *  }
         * 
         */


        const verified = await this.verifyToken(req)

        const context = {
            success: false,
            content: "",            
            status: 200
        }

        if( verified ){

            const decodedToken = this.decodeToken(req.header("Authorization"));

            if(  this.isAdmin(decodedToken) ){
                
                const { detail } = req.body

                if( detail && this.notNullCheck(detail, ["privilegegroup_id", "button_id"]).valid ){
                    const { privilegegroup_id, button_id } = detail
                    
                    const existedPD = await this.#__pd.findAll({ privilegegroup_id, button_id })

                    
                    if( existedPD && existedPD.length == 0 ){
                        const Detail = new PrivilegeDetailRecord( { privilegegroup_id, button_id } )
                        
                        const saveResult = await Detail.save();
                        if( saveResult ){
                            context.detail = Detail.get()
                            context.success = true;
                        }else{
                            context.content = "Foreign key conflict"
                        }
                    }else{
                        context.content = "This privilege is already existed"
                    }                   
                }else{
                    context.content = "Invalid request body"
                }
            }else{
                context.content = "Administrator rights required"
            }
        }else{
            context.content = "Invalid token"
        }
        res.send(context)
    }

    removePrivilegeDetail = async (req, res) => {
        const verified = await this.verifyToken(req)

        const context = {
            success: false,
            content: "",            
            status: 200
        }

        if( verified ){

            const decodedToken = this.decodeToken(req.header("Authorization"));

            if(  this.isAdmin(decodedToken) ){
                
                const { detail } = req.body

                if( detail && this.notNullCheck(detail, ["privilegegroup_id", "button_id"]).valid ){
                    const { privilegegroup_id, button_id } = detail
                    
                    const existedPD = await this.#__pd.findAll({ privilegegroup_id, button_id })

                    if( existedPD && existedPD.length > 0 ){
                        const Detail = new PrivilegeDetailRecord( existedPD[0] )
                        Detail.remove()
                        context.success = true;
                        context.content = "Privilege purged"
                    }else{
                        context.content = "Privilege does not exit"    
                    }
                }else{
                    context.content = "Invalid request body"
                }
            }else{
                context.content = "Administrator rights required"
            }
        }else{
            context.content = "Invalid token"
        }
        res.send(context)
    }

    /**
     * 
     * API thêm quyền chi tiết, xóa quyền chi tiết
     * 
     * Map quyền vào cây UI, show ra UI, 
     * 
     */




}
module.exports = PrivilegeDetailController

    