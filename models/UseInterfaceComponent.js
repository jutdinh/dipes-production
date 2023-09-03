
const { Model } = require('../config/models');
const { UserInterFace } = require('./UserInterFace');
class UserInterfaceComponent extends Model{
    constructor(){
        super("userinterfacecomponent");
        this.__addField__( "component_id", Model.types.int, { auto: true })
        this.__addField__( "component_name", Model.types.string, { required: true })
        this.__addField__( "ui_id", Model.types.int , { required: true })   
        this.__addField__( "layout_id", Model.types.int)     
        this.__addField__( "api_get", Model.types.string )
        this.__addField__( "api_post", Model.types.string )
        this.__addField__( "api_put", Model.types.string )
        this.__addField__( "api_delete", Model.types.string )
        this.__addPrimaryKey__( ["component_id"] )        

        this.__addForeignKey__( "ui_id", UserInterFace)
    }
}   
class UserInterfaceComponentRecord extends UserInterfaceComponent {
    constructor( { id, component_id, component_name, ui_id, api_get, api_post, api_put, api_delete, layout_id } ){
        super(); 
        this.setDefaultValue( { id, component_id, component_name, ui_id, api_get, api_post, api_put, api_delete, layout_id } )        
    }

    get = () => {
        return { 
            id: this.id.value(), 
            component_id: this.component_id.value(), 
            component_name: this.component_name.value(), 
            ui_id: this.ui_id.value(), 
            layout_id: this.layout_id.value(), 
            api_get: this.api_get.value(), 
            api_post: this.api_post.value(), 
            api_put: this.api_put.value(), 
            api_delete: this.api_delete.value(), 
        }
    }   
}
module.exports = { UserInterfaceComponent, UserInterfaceComponentRecord }
    