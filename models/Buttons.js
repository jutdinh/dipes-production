
const { Model } = require('../config/models');
class Buttons extends Model{
    constructor(){
        super("buttons");
        this.__addField__( "button_id", Model.types.int, { auto: rue } )
    
        this.__addPrimaryKey__( ["buttons_id"] )        
    }
}   
class ButtonsRecord extends Buttons {
    constructor( { id, buttons_id } ){
        super();
        this.setDefaultValue( { id, buttons_id } )        
    }

    get = () => {
        return {
            id: this.id.value(),
            buttons_id: this.buttons_id.value()
        }
    }
}
module.exports = { Buttons, ButtonsRecord }
    