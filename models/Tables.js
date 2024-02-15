const { v4: uuidv4 } = require('uuid');

const { Model } = require('../config/models');
const { Versions } = require('./Versions');
const { Accounts, AccountsRecord } = require('./Accounts');
class Tables extends Model{
    constructor(){
        super("tables");
        this.__addField__( "table_alias", Model.types.string, { required: true } )
        this.__addField__( "table_name", Model.types.string, { required: true })
        this.__addField__( "version_id", Model.types.int, { required: true })
        this.__addField__( "primary_key", Model.types.array)
        this.__addField__( "foreign_keys", Model.types.array)
        this.__addField__( "display_fields", Model.types.array)
        
        this.__addField__( "create_by", Model.types.string, { required: true })
        this.__addField__( "create_at", Model.types.datetime ) 

        this.__addPrimaryKey__( ["id"] )        
        this.__addForeignKey__("version_id", Versions )
        // this.__addForeignKey__( "create_by", Accounts, "username" )
    }
    static makeTableAlias = () => {
        const uniString = uuidv4();
        return uniString.toUpperCase().replaceAll("-", "")
    }

    getAllTables = async ( version_id ) => {
        const tables = await this.findAll({ version_id })
        const result = []
        for( let i = 0;  i < tables.length; i++ ){
            const Table = new TablesRecord( tables[i] )
            const info = await Table.get()
            result.push( info )
        }
        return result;
    }

    deleteAll = async () => {
        const model = this.getModel()
        await model.__deleteAll__()
        return
    }

    insertMany = async ( tables ) => {
        const model = this.getModel()
        await model.__insertMany__(tables)
        return
    }
}   
class TablesRecord extends Tables {
    constructor( { id,  table_alias, table_name, version_id, create_by, create_at, primary_key, foreign_keys } ){
        super();        
        this.setDefaultValue( { id,  table_alias, table_name, version_id, create_by, create_at, primary_key, foreign_keys } )        
    }

    get = async () => {
        return { 
            id: this.id.value(), 
            table_alias: this.table_alias.value(), 
            table_name: this.table_name.value(), 
            version_id: this.version_id.value(), 
            create_by: await this.getTableCreator(), 
            create_at: this.create_at.getFormatedValue(),
            primary_key: this.primary_key.value(),
            foreign_keys: this.foreign_keys.value(),
            display_fields: this.display_fields.value(),
        }
    }

    getTableCreator = async () => {
        const username = this.create_by.value();
        const tableCreator = await this.accounts.__findCriteria__({ username })        
        
        if( !tableCreator ){            
            return "Người tạo dự án không tồn tại hoặc đã bị xóa!"            
        }else{
            const Account = new AccountsRecord( tableCreator )
            return Account.get()
        }        
    } 

    destroy = async () => {
        await this.remove()
    }
}
module.exports = { Tables, TablesRecord }
    