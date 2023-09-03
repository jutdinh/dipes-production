
const { Model } = require('../config/models');
const { Projects } = require('./Projects');
const { Accounts, AccountsRecord } = require('./Accounts');
class Tasks extends Model{
    static validStatus = [ 1, 2, 3, 4, 5 ];

    constructor(){
        super("tasks");
        this.__addField__( "task_id", Model.types.int, { auto: true } )
        this.__addField__( "project_id", Model.types.int, { required: true } )
        this.__addField__( "task_name", Model.types.string)
        this.__addField__( "task_description", Model.types.string, { maxLength: Number.MAX_SAFE_INTEGER } )        
        this.__addField__( "task_status", Model.types.enum, { values: Tasks.validStatus } )
        this.__addField__( "task_priority", Model.types.int )
        this.__addField__( "task_approve", Model.types.bool, { default: false } )
        this.__addField__( "members", Model.types.array)

        this.__addField__( "create_by", Model.types.string );
        this.__addField__( "create_at", Model.types.datetime );

        this.__addPrimaryKey__( ["task_id"] )   
        this.__addForeignKey__("project_id", Projects)
        this.__addForeignKey__("create_by", Accounts, "username")     
    }

    getAllTasks = async (project_id) =>{
        const tasks = await this.findAll( { project_id } );
        const result = []
        for( let i = 0; i < tasks.length; i++){
            const Task = new TasksRecord(tasks[i]);
            const info = await Task.get()
            result.push( info )
        }
        return result;
    }

}   
class TasksRecord extends Tasks {
    constructor( { id, task_id, project_id, task_name, task_description, create_at, create_by, task_status, task_priority, task_approve, members } ){
        super();
        this.setDefaultValue( { id, task_id, project_id, task_name, task_description, create_at, create_by, task_status, task_priority, task_approve, members } )        
    }

    get = async () => {
        return { 
            id: this.id.value(),
            task_id: this.task_id.value(),
            project_id: this.project_id.value(),
            task_name: this.task_name.value(),
            task_description: this.task_description.value(),
            
            create_at: this.create_at.getFormatedValue(),
            create_by: await this.getAccount( this.create_by.value() ),
            task_status: this.task_status.value(),
            task_priority: this.task_priority.value(),
            task_approve: this.task_approve.value(),
            members: await this.getMembers(this.members.value())

       }
    }

    getAccount = async ( username ) => {
        const account = await this.accounts.__findCriteria__({ username });
        if( account ){
            const Account = new AccountsRecord( account );
            return Account.get()
        }else{
            return `Account ${ username } đã bị xóa hoặc không còn khả dụng nữa!`
        }
    }

    getMembers = async (members) => {
        const result = []
        for( let i = 0; i < members.length; i++ ){
            const info = await this.getAccount( members[i] )
            result.push( info )
        }
        return result;
    }

    destroy = async () =>{
        await this.remove()
    }
}
module.exports = { Tasks, TasksRecord }
    