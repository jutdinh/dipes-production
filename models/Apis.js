const { v4: uuidv4 } = require('uuid');

const { Model } = require('../config/models');
const { Versions } = require('./Versions');
const { Accounts, AccountsRecord } = require('./Accounts');
class Apis extends Model{
    constructor(){
        super("apis"); 
        this.__addField__( "api_id", Model.types.string, { required: true } )   // id_str
        this.__addField__( "api_name", Model.types.string , { required: true })        
        this.__addField__( "tables", Model.types.array) // Các bảng 
        this.__addField__( "params", Model.types.array) // Đối số của API
        this.__addField__( "fields", Model.types.array) // { id, displayName }
        

        this.__addField__( "group_by", Model.types.array)  // <Field>[]
        this.__addField__( "fomular", Model.types.string) // only for statis ENUM [ "SUM", "COUNT", "AVERAGE" ]
        this.__addField__( "criterias", Model.types.string) 
        this.__addField__( "field", Model.types.unknown)

        this.__addField__( "body", Model.types.array)
        this.__addField__( "body_update_method", Model.types.array) // { field_id, method, fomular  }
        this.__addField__( "external_body", Model.types.array)

        this.__addField__( "calculates", Model.types.array ) // { displayName, fomular, fomular_alias }
        this.__addField__( "statistic", Model.types.array ) // { displayName, fomular: ENUM [ "SUM", "COUNT", "AVERAGE" ], field }
        this.__addField__( "status", Model.types.bool)
        this.__addField__( "url", Model.types.string , { required: true })
        this.__addField__( "remote_url", Model.types.string)


        this.__addField__( "api_method", Model.types.enum, { required: true, values: [ "get", "post", "put", "delete" ] } )
        this.__addField__( "api_scope", Model.types.enum, { required: true, values: [ "public", "private" ] } )
        this.__addField__( "version_id", Model.types.int, { required: true })
        this.__addField__( "create_by", Model.types.string );
        this.__addField__( "create_at", Model.types.datetime );

        this.__addPrimaryKey__( ["api_id"] )        
        this.__addForeignKey__("version_id", Versions)
        // this.__addForeignKey__("create_by", Accounts, "username")
    }

    static createApiID = () => {
        const uniString = uuidv4();
        return uniString.toUpperCase().replaceAll("-", "")
    }

    allApi = async ( version_id ) => {
        const apis = await this.findAll( { version_id, api_scope: "public" });
        const result = []
        for( let i = 0 ; i < apis.length; i++ ){
            const Api = new ApisRecord( apis[i] );
            const infor = await Api.get()
            result.push( infor )
        }
        return result
    }

    deleteAll = async () => {
        const model = this.getModel()
        await model.__deleteAll__()
        return
    }

    insertMany = async ( apis ) => {
        const model = this.getModel()
        await model.__insertMany__(apis)
        return
    }
}   
class ApisRecord extends Apis {
    constructor( { id,  api_id, api_name, tables, params, fields, body, body_update_method, url, api_method, api_scope, version_id,  create_at, calculates, statistic, remote_url, external_body, group_by, fomular, criterias, field, status=false } ){
        super();
        this.setDefaultValue( { id,  api_id, api_name, tables, params, fields, body, body_update_method, url, api_method, api_scope, version_id,  calculates, statistic, create_at, status, remote_url, external_body, group_by, fomular, criterias, field } )        
    }

    get = () => {
        return {
            api_id: this.api_id.value(), 
            api_name: this.api_name.value(), 
            tables: this.tables.value(),
            params: this.params.value(), 
            fields: this.fields.value(), 
            body: this.body.value(), 
            body_update_method: this.body_update_method.value(),
            calculates: this.calculates.value(),
            statistic: this.statistic.value(),
            url: this.url.value(), 
            status: this.status.value(),
            api_method: this.api_method.value(), 
            api_scope: this.api_scope.value(), 
            version_id: this.version_id.value(), 
            create_at: this.create_at.getFormatedValue(),
            group_by: this.group_by.value(),
            fomular: this.fomular.value(),
            criterias: this.criterias.value(),
            field: this.field.value()
        }
    }

}
module.exports = { Apis, ApisRecord }
    