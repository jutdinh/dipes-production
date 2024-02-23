
const { Model } = require('../config/models');
class PrivilegeGroup extends Model{
    constructor(){
        super("privilegegroup");
        this.__addField__( "privilegegroup_id", Model.types.int, { auto: true } )
        this.__addField__( "group_name", Model.types.string )
        
        /**tạo bản quyền và phân quyền */

        this.__addPrimaryKey__( ["privilegegroup_id"] )        
    }
}   
class PrivilegeGroupRecord extends PrivilegeGroup {
    constructor( { id, privilegegroup_id } ){
        super();
        this.setDefaultValue( { id, privilegegroup_id } )        
    }

    get = () => {
        return {
            id: this.id.value(),
            privilegegroup_id: this.privilegegroup_id.value()
        }
    }
}
module.exports = { PrivilegeGroup, PrivilegeGroupRecord }
    