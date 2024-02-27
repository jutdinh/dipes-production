
const { Model } = require('../config/models');
class Buttons extends Model{
    constructor(){
        super("buttons");
        this.__addField__( "button_id", Model.types.string )
        this.__addField__( "table_id", Model.types.string ) /** This properly the id of UI table, not the model ones */
        this.__addField__( "api_id", Model.types.string )
    
        this.__addPrimaryKey__( ["id"] )        
    }

    removeAll = async () => {
        const model = this.getModel()
        await model.__deleteAll__()
        return
    }
}   
class ButtonsRecord extends Buttons {
    constructor( { id, button_id, table_id, api_id } ){
        super();
        this.setDefaultValue( { id, button_id, table_id, api_id } )
    }

    get = () => {
        return {
            id: this.id.value(),
            button_id: this.button_id.value(),
            api_id: this.api_id.value(),
            table_id: this.table_id.value()
        }
    }
}
module.exports = { Buttons, ButtonsRecord }
    