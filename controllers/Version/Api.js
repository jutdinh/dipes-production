const { Controller } = require('../../config/controllers');
const { Projects, ProjectsRecord } = require('../../models/Projects');
const { ProjectMembers } = require('../../models/ProjectMembers');
const { Tables, TablesRecord } = require('../../models/Tables');
const { Versions, VersionsRecord } = require('../../models/Versions');
const { intValidate, objectComparator } = require('../../functions/validator');
const { Fields, FieldsRecord } = require('../../models/Fields');
const { Apis, ApisRecord } = require('../../models/Apis');
const  Model  = require('../../config/models/model');

const fs = require("fs")

const UI_PATH = 'public/config/ui.json'

class Api extends Controller {
    #__versions = new Versions();
    #__projects = new Projects()
    #__projectMembers = new ProjectMembers()
    #__tables = new Tables();
    #__fields = new Fields();
    #__apis = new Apis();

    constructor(){
        super();
    }

    get = async ( req, res ) => {
        this.writeReq(req)

        /* Logical code goes here */

        this.writeRes({ status: 200, message: "Sample response" })
        res.status(200).send({
            success: true,
            content: "Hế nhô quơ",
            data: []
        })
    }

    getFieldsByTableId = async ( tableId ) => {
        const fields = await this.#__fields.findAll({ table_id: tableId })
        return fields;
    } 

    getFields = async ( fieldIds ) => {
        const fields = await this.#__fields.findAll({ id: { $in: fieldIds } })
        return fields ? fields : [];
    }

    getField = async ( fieldId ) => {
        const field = await this.#__fields.find({ id: fieldId })
        return field;
    }

    getTable = async ( tableId ) => {
        const table = await this.#__tables.find({ id: tableId })
        return table;
    }

    getTables = async ( tableIds ) => {
        const tables = await this.#__tables.findAll({ id: { $in:  tableIds } })
        return tables;
    }

    getApiInputInfo = async (req, res) => {

        /* NOT TESTED */
        const { api_id } = req.params;
        const context = {
            success: false
        }
        if( api_id ){
            const api = await this.#__apis.find({ api_id })            
            if( api ){

                const API = new ApisRecord( api );
                
                const method = API.api_method.value()
                
                const tableIDs = API.tables.valueOrNot()
                const bodyIDs  = API.body.valueOrNot()
                const paramIDs = API.params.valueOrNot()
    
                const tables = await this.getTables( tableIDs )
                const body   = await this.getFields( bodyIDs )
                const params = await this.getFields( paramIDs )                     
                

                for( let i = 0; i < body.length; i++ ){
                    const { id } = body[i]
                    const keys = {}
                    
                    for( let i = 0; i < tables.length; i++ ){
                        const { foreign_keys, primary_key } = tables[i]
                        const foreignKeys = foreign_keys ? foreign_keys : []
                        const primaryKey  = primary_key ? primary_key : []
    
                        const fk = foreignKeys.find( key => key.field_id == id )
                        if( fk ){
                            keys.foreign = fk;
                        }
                        const pk = primaryKey.find( key => key == id )
    
                        if( pk ){
                            keys.primary = true;
                        }
                    }       
                    body[i].keys = {...keys}   
                         
                }
                context.success = true;
                context.data = {
                    tables, body, params 
                }
            }
        }
        res.status(200).send( context )
    }    

    getAutoIncrementID = async ( req, res ) => {
        const { field_id } = req.params;
        const context = {
            success: false,
            content: "Ngo nghinh nhi, la lung nhi"
        }
        if( field_id && intValidate( field_id ) ){
            const id = parseInt( field_id )
            const field = await this.#__fields.find({ id })
            
            if( field ){
                
                const table = await this.#__tables.find({ id: field.table_id })                
                if( table ){
                    const { primary_key, foreign_keys } = table;
                    const foreignKey = foreign_keys.find( key => key.field_id == field.id );                    
                    if( foreignKey ){
                        const foreignField = await this.#__fields.find({ id: foreignKey.ref_field_id })
                        if( foreignField ){
                            const { field_alias, PATTERN } = foreignField;
                            const autoID = await Fields.makeAutoIncreament( field_alias, PATTERN )
                            context.data = { 
                                id: autoID                                
                            }
                            context.success = true;
                        }else{
                            context.content = "Bảng chứa khóa chính khum tồn tại"
                        }
                    }else{
                        const { field_alias, PATTERN } = field;
                        const autoID = await Fields.makeAutoIncreament( field_alias, PATTERN )
                        context.data = { 
                            id: autoID                                
                        }
                        context.success = true;
                    }
                }else{
                    context.content = "Bảng khum tồn tại"
                }
            }else{
                context.content = "Trường này khum tồn tại"
            }
        }else{
            context.content = "Field id khum hợp lệ"
        }
        res.status(200).send(context)
    }
    
    getForeignStructure = async ( req, res ) => {
        const { table_id } = req.params;
        console.log("CONTEXT")
        const context = {
            success: false,
            content: "Ngo nghinh nhi, la lung nhi",
            data: {}
        }

        if( table_id && intValidate(table_id) ){
            const id = parseInt( table_id )
            const table = await this.#__tables.find({ id })
            
            if( table ){
                const { table_alias } = table;
                const model = new Model( table_alias );
                const Table = model.getModel();                
                        
                const fields = await this.#__fields.allFieldsOfASingleTable({ table_id: table.id });
                context.data.fields = fields;
                context.data.table = table
            }else{
                context.content = "Bảng dữ liệu primary khum tồn tại"
            }
        }else{
            context.content = "Table id khum hợp lệ"
        }
        res.status(200).send( context )
    }

    getAllTablesAndFields = async ( req, res ) => {
        const fields = await this.#__fields.findAll({})
        const tables = await this.#__tables.findAll({})

        const formattedFields = []
        for( let i = 0 ; i < fields.length; i++ ){
            const field = fields[i];
            
            const Field = new FieldsRecord( field )
            const infor = await Field.get()
            formattedFields.push( infor )
        }

        res.status(200).send({ success: true, data: { tables, fields: formattedFields } })
    }

    importUI = ( req, res ) => {
        const { ui } = req.body;
        if( ui && ui.data ){           
            const stringifiedUI = JSON.stringify( ui )
            if( fs.existsSync(UI_PATH) ){
                fs.unlinkSync(UI_PATH)
            }
            fs.writeFileSync(UI_PATH, stringifiedUI)
            res.status(200).send({ success: true, content: "SUCCESSFULLY WRITE UI"})
        }else{
            res.status(200).send({ success: false, content: "INVALID FILE CONFIG" })
        }
    }

    getUI = (req, res) => {
        if( fs.existsSync(UI_PATH) ){
            const stringifiedUI = fs.readFileSync(UI_PATH)
            try{                
                const ui = JSON.parse(stringifiedUI)
                res.status(200).send({ success: true, content: "SUCCESSFULLY RETRIEVE UI", ui })
            }catch{
                res.status(200).send({ success: false, content: "INVALID UI CONFIG" })
            }
        }else{
            res.status(200).send({ success: false, content: "UI NOT FOUND" })
        }
    } 

}
module.exports = Api

    