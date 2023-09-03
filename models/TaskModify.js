
const { Model } = require('../config/models');
const { Tasks } = require('./Tasks');
const { Accounts, AccountsRecord } = require('./Accounts');
class TaskModify extends Model{
    constructor(){
        super("taskmodify");
        this.__addField__( "task_id", Model.types.int, { required: true } )
        this.__addField__( "modified_by", Model.types.string, { required: true } )
        this.__addField__( "modified_at", Model.types.datetime )
        this.__addField__( "modified_what", Model.types.string )
        this.__addField__( "old_value", Model.types.string, { maxLength: Number.MAX_SAFE_INTEGER } )
        this.__addField__( "new_value", Model.types.string, { maxLength: Number.MAX_SAFE_INTEGER } )

        this.__addPrimaryKey__( ["id"] )        
        this.__addForeignKey__( "task_id", Tasks)
        // this.__addForeignKey__( "modified_by", Accounts, "username")
    }

    destroyAll = async ( task_id ) => {
        const model = this.getModel();
        await model.__deleteObjects__({ task_id })
        return
    }
}   
class TaskModifyRecord extends TaskModify {
    constructor( { id, task_id, modified_by, modified_at, modified_what, old_value, new_value } ){
        super();
        this.setDefaultValue( { id, task_id, modified_by, modified_at, modified_what, old_value, new_value } )        
    }

    get = async () => {
        return { 
            id: this.id.value(),
            task_id: this.task_id.value(),
            modified_by: await this.getModifiedBy(),
            modified_at: this.modified_at.getFormatedValue(),
            modified_what: this.modified_what.value(),
            old_value: this.old_value.value(),
            new_value: this.new_value.value() 
        }
    }

    getModifiedBy = async () => {
        const username = this.modified_by.value();
        const account = await this.accounts.__findCriteria__({ username });
        if( account ){
            const Account = new AccountsRecord( account );
            return Account.get()
        }else{
            return `Account ${ username } đã bị xóa hoặc không còn khả dụng nữa!`
        }
    }

}
module.exports = { TaskModify, TaskModifyRecord }
    