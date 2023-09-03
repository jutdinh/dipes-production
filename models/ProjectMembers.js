
const { Model } = require('../config/models');
const { Projects } = require('./Projects');
const { Accounts } = require('./Accounts');
class ProjectMembers extends Model{
    constructor(){
        super("projectmembers");
        this.__addField__( "username", Model.types.string , { required: true })
        this.__addField__( "project_id", Model.types.int, { required: true })
        this.__addField__( "permission", Model.types.enum, { required: true, values: ["manager", "supervisor", "deployer"] })
        
        this.__addPrimaryKey__( ["username", "project_id"] )        
        this.__addForeignKey__( "username", Accounts)
        this.__addForeignKey__( "project_id", Projects)
    }

    removeMembers = async ( project_id ) => {
        const model = this.getModel();
        await model.__deleteObjects__({ project_id })
        return
    }
}   
class ProjectMembersRecord extends ProjectMembers {
    constructor( { id, username, project_id, permission } ){
        super();
        this.setDefaultValue(  { id, username, project_id, permission } )        
    }

    get = () => {
        return { 
            id: this.id.value(),
            username: this.username.value(),
            project_id: this.project_id.value(),
            permission: this.permission.value() 
        }
        
    }

    destroy = async () => {
        await this.remove()
    }
}
module.exports = { ProjectMembers, ProjectMembersRecord }
    