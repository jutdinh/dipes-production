
const { Model } = require('../config/models');
class PrivilegeDetail extends Model{
    constructor(){
        super("privilegedetail");
        this.__addField__( "privilegedetail_id", Model.types.int, { auto: true } )

        this.__addField__( "privilegegroup_id", Model.types.int )
        this.__addField__( "button_id", Model.types )        
        this.__addField__( "api_id", Model.types.string)

        this.__addPrimaryKey__( ["privilegedetail_id", ""] )
        this.__add
    }
}   
class PrivilegeDetailRecord extends PrivilegeDetail {
    constructor( { id, privilegedetail_id } ){
        super();
        this.setDefaultValue( { id, privilegedetail_id } )        
    }

    get = () => {
        return {
            id: this.id.value(),
            privilegedetail_id: this.privilegedetail_id.value()
        }
    }
}
module.exports = { PrivilegeDetail, PrivilegeDetailRecord }
    