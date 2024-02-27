
const { Model } = require('../config/models');
class UserPrivileges extends Model{
    constructor(){
        super("userprivileges");
        this.__addField__( "username", Model.types.string )
        this.__addField__( "privilegegroup_id", Model.types.int )
    
        this.__addPrimaryKey__( ["id"] )        
    }
}   
class UserPrivilegesRecord extends UserPrivileges {
    constructor( { id, username, privilegegroup_id } ){
        super();
        this.setDefaultValue( { id, username, privilegegroup_id } )        
    }

    get = () => {
        return {
            id: this.id.value(),
            username: this.username.value(), 
            privilegegroup_id: this.privilegegroup_id.value()
        }
    }
}
module.exports = { UserPrivileges, UserPrivilegesRecord }
    