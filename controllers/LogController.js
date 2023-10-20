
const { Controller } = require('../config/controllers');
const { EventLogs, EventLogsRecord } = require('../models/EventLogs');

class LogController extends Controller {
    #__eventLogs = new EventLogs()
    constructor(){
        super();

    }

    get = async ( req, res, privileges = ["uad"] ) => {
        this.writeReq(req)

        const verified = await this.verifyToken(req);
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }

        if( verified ){
            const { lang } = req.params;
            const logs = await this.#__eventLogs.allLogs(lang);    
            /* Logical code goes here */    
            context.data = logs;
            context.content = "Gọi event logs thành công";
            context.status = this.getCode("success");
            context.success = true;
           
        }else{
            context.content = "Token khumm hợp lệ!"
            context.status = this.getCode("token-error")
        }
        res.status(200).send(context)
    }

    search = async ( req, res, privileges ="uad" ) => {

        /*
            header{
                Authorization: <Token>
            }
            
            body {
                lang: <String>
                type: <Enum> [ "info", "warn", "error" ]
                start: <Date>
                End: <Date>
            }
        */
        this.writeReq(req)
        const verified = await this.verifyToken(req);
        const context = {
            success: false,
            content: "Sample response",
            data: [],
            status: 200
        }

        if( verified ){
            const { lang, type, start, end } = req.body;
            if( lang ){
                const startDate = start ? new Date(start) : undefined
                const endDate = end ? new Date(end) : undefined
                // console.log({lang, type, startDate, endDate})
                const logs = await this.#__eventLogs.search(lang, type, startDate, endDate);    
                /* Logical code goes here */    
                context.data = logs;
                context.content = "Gọi event logs thành công";
                context.status = this.getCode("success");
                context.success = true;
            }else{
                context.content = "Bad request"
                context.status = this.getCode("bad-request")    
            }
           
        }else{
            context.content = "Token khumm hợp lệ!"
            context.status = this.getCode("token-error")
        }
        res.status(200).send(context)
    }


    writeLogImportJSON = async (req, res) => {
        /*
            header{
                Authorization: <Token>
            }

            body {
                data: <Object>
            }
        */
       const context = {
            success: false, 
            content: "Token không hợp lệ"
       }

        const verified = await this.verifyToken( req );

        if( verified ){
            const decodedToken = this.decodeToken( req.header("Authorization") )
            const { username } = decodedToken;
            
            const json = req.body.data ? JSON.stringify(req.body.data) : "undefined"
            await this.saveLog('info', req.ip, "Import devices' json", json, username)        
            context.success = true;
            context.content = "Lưu log thành công"
        }
        res.status(200).send(context)
    }

    
}
module.exports = LogController

    