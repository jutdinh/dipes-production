
const { Model } = require('../config/models');
const { Versions } = require('./Versions');
const { Accounts, AccountsRecord } = require('./Accounts');

class UserInterFace extends Model{
    constructor(){
        super("userinterface");
        this.__addField__( "ui_id", Model.types.int, { auto: true } )
        this.__addField__( "title", Model.types.string, { required: true })
        this.__addField__( "version_id", Model.types.int, { required: true })
        this.__addField__( "url", Model.types.string, { required: true } ) /* Auto based on title, unique */
        this.__addField__( "status", Model.types.bool)        
        this.__addField__( "params", Model.types.array) // Đối số của API
        this.__addField__( "create_by", Model.types.string );
        this.__addField__( "create_at", Model.types.datetime );

        this.__addPrimaryKey__( ["ui_id"] )        
        this.__addForeignKey__("version_id", Versions)
        this.__addForeignKey__( "create_by", Accounts, "username" )
    }

    getAllUI = async ( {version_id} ) => {
        const ui = await this.findAll({ version_id })
        const result = []        

        for( let i = 0 ; i < ui.length; i++ ){
            const UI = new UserInterFaceRecord( ui[i] )
            const inf = await UI.get()
            result.push( inf )
        }

        return result
    }
}   
class UserInterFaceRecord extends UserInterFace {
    constructor( { id, ui_id, title, version_id, url, status, layout_id, params, create_by, create_at = new Date() } ){
        super();
        this.setDefaultValue( { id, ui_id, title, version_id, url, status, layout_id, params, create_by, create_at } )        
    }

    get = async () => {
        return { 
            id: this.id.value(), 
            ui_id: this.ui_id.value(), 
            title: this.title.value(), 
            version_id: this.version_id.value(), 
            url: this.url.value(), 
            status: this.status.value(),             
            params: this.params.value(), 
            create_by: await this.getCreator(), 
            create_at: this.create_at.getFormatedValue() 
        }
    }

    getCreator = async () => {
        const username = this.create_by.value();
        const uiCreator = await this.accounts.__findCriteria__({ username })        
        
        if( !uiCreator ){            
            return "Người tạo dự án không tồn tại hoặc đã bị xóa!"            
        }else{
            const Account = new AccountsRecord( uiCreator )
            return Account.get()
        }
    }
}
module.exports = { UserInterFace, UserInterFaceRecord }
    