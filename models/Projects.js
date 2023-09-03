
const { Model } = require('../config/models');
const { Accounts, AccountsRecord } = require('./Accounts');

class Projects extends Model{
    static validStatus = [ 1, 2, 3, 4, 5 ];

    constructor(){
        super("projects");
        this.__addField__( "project_id", Model.types.int, { auto: true } )   
        this.__addField__( "project_name", Model.types.string, { required: true } )
        this.__addField__( "project_code", Model.types.string )        
        this.__addField__( "project_status", Model.types.enum, { values: Projects.validStatus } )
        this.__addField__( "project_description", Model.types.string, { maxLength: Number.MAX_SAFE_INTEGER } )
        this.__addField__( "create_by", Model.types.string );
        this.__addField__( "create_at", Model.types.datetime, { format: "DD-MM-YYYY lúc hh:mm" });

        this.__addPrimaryKey__( ["project_id"] )       
        // this.__addForeignKey__("create_by", Accounts, "username")
    }

    AllProjects = async () => {
        const projects = await this.find();
        const result = []
        for( let i = 0 ; i < projects.length; i++ ){
            const project = projects[i];
            const Project = new ProjectsRecord( project );
            const serializedProject = await Project.get()
            result.push( serializedProject )
        }        
        return result
    }

    deleteAll = async () => {
        const model = this.getModel()
        await model.__deleteAll__()
        return
    }

    insertMany = async ( projects ) => {
        const model = this.getModel()
        await model.__insertMany__( projects )
        return
    }
}   
class ProjectsRecord extends Projects {
    constructor( { id, project_id, project_name, project_code,  project_description, project_status, create_by, create_at } ){
        super();
        this.setDefaultValue( { id, project_id, project_name,  project_description, project_code,  project_status, create_by, create_at } )        
    }

    get = async () => {
        const projectCreator = await this.getProjectCreator();

        return {             
            project_id:     this.project_id.value(),
            project_name:   this.project_name.value(),
            project_code:   this.project_code.value(),
            project_status: this.project_status.value(),
            project_description: this.project_description.value(),
            create_by:      projectCreator, 
           
            create_at:      this.create_at.getFormatedValue()
        }    
    }

    getProjectCreator = async () => {
        const username = this.create_by.value();
        const projectCreator = await this.accounts.__findCriteria__({ username })        
        
        if( !projectCreator ){
            if( username == Accounts.__defaultAccount.username ){
                return Accounts.__defaultAccount
            }else{
                return "Người tạo dự án không tồn tại hoặc đã bị xóa!"
            }
        }else{
            const Account = new AccountsRecord( projectCreator )
            return Account.get()
        }        
    }    

    destroy = async () => {
        await this.remove();
        
    }
}
module.exports = { Projects, ProjectsRecord }
    