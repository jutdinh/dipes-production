const { Model } = require('../config/models');
const { Accounts } = require('./Accounts');
const { Tables } = require('./Tables');

class Privileges extends Model{

    static READ     = "read"
    static WRITE    = "write"
    static MODIFY   = "modify"
    static PURGE    = "purge"

    constructor(){
        super("privileges");        
        this.__addField__( "username", Model.types.string,  { required: true } )
        this.__addField__( "table_id", Model.types.int, { required: true } )
        this.__addField__( "read", Model.types.bool, { default: true } )
        this.__addField__( "write", Model.types.bool, { default: false } )
        this.__addField__( "modify", Model.types.bool, { default: false } )
        this.__addField__( "purge", Model.types.bool, { default: false } )

        this.__addPrimaryKey__( ["username", "table_id"] )        
        this.__addForeignKey__( "username", Accounts )
        this.__addForeignKey__( "table_id", Tables, "id" )
    }

    deleteAll = async () => {
        const model = this.getModel()
        await model.__deleteAll__()
        return
    }

    insertMany = async ( privileges ) => {
        const model = this.getModel()
        await model.__insertMany__(privileges)
        return
    }
}   
class PrivilegesRecord extends Privileges {
    constructor( { id, username, table_id, read, write, modify, purge } ){
        super();
        this.setDefaultValue( { id, username, table_id, read, write, modify, purge } )        
    }

    get = () => {
        return { 
            id:         this.id.value(), 
            username:   this.username.value(), 
            table_id:   this.table_id.value(), 
            select:     this.read.value(), 
            insert:     this.write.value(), 
            update:     this.modify.value(), 
            remove:     this.purge.value() 
        }        
    }
}
module.exports = { Privileges, PrivilegesRecord }
    