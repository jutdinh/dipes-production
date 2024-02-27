
const { Model } = require('../config/models');
const { Buttons } = require('./Buttons');
class PrivilegeDetail extends Model{
    constructor(){
        super("privilegedetail");
        this.__addField__( "privilegedetail_id", Model.types.int, { auto: true } )

        this.__addField__( "privilegegroup_id", Model.types.int )        
        this.__addField__( "button_id", Model.types.int)   
                     

        this.__addPrimaryKey__( ["privilegedetail_id", ""] )
        this.__addForeignKey__('button_id', Buttons, 'id')
        
    }
}   
class PrivilegeDetailRecord extends PrivilegeDetail {
    constructor( { id, privilegedetail_id, privilegegroup_id,  button_id } ){
        super();
        this.setDefaultValue( { id, privilegedetail_id, privilegegroup_id,  button_id } )
    }

    get = () => {
        return {
            id: this.id.value(),
            privilegedetail_id: this.privilegedetail_id.value(),
            privilegegroup_id: this.privilegegroup_id.value(),

            button_id: this.button_id.value()
        }
    }
}
module.exports = { PrivilegeDetail, PrivilegeDetailRecord }
    