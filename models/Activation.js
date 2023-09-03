const { v4: uuidv4 } = require('uuid');
const { Model } = require('../config/models');
class Activation extends Model{

    static validator = {
        header: `========MYLAN-ACTIVATION-KEY========`,
        bodyLength: 10,
        footer: `==============END-KEY===============`,
        uuid_format: [ 8, 4, 4, 4, 12 ]
    }

    constructor(){
        super("activation");        
        this.__addField__( "ACTIVATION_KEY", Model.types.string, { required: true, maxLength: 512 })
        this.__addField__( "MAC_ADDRESS", Model.types.string )
        this.__addField__( "ACTIVATE_AT", Model.types.datetime )
        this.__addPrimaryKey__( ["ACTIVATION_KEY"] )        
    }
}   
class ActivationRecord extends Activation {
    constructor( { id, ACTIVATION_KEY, MAC_ADDRESS, ACTIVATE_AT } ){
        super();
        this.setDefaultValue( { id, ACTIVATION_KEY, MAC_ADDRESS, ACTIVATE_AT } )        
    }    

    get = () => {
        return { 
            id: this.id.value(), 
            ACTIVATION_KEY: this.ACTIVATION_KEY.value(), 
            MAC_ADDRESS: this.MAC_ADDRESS.value() 
        }
    }
}
module.exports = { Activation, ActivationRecord }
    