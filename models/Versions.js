
const { Model } = require('../config/models');
const { Projects } = require('./Projects');
const { Accounts, AccountsRecord } = require('./Accounts');
class Versions extends Model{
    constructor(){
        super("versions");
        this.__addField__( "version_id", Model.types.int, { auto: true } )
        this.__addField__( "version_name", Model.types.string, {required: true})
        this.__addField__( "version_description", Model.types.string, { maxLength: Number.MAX_SAFE_INTEGER, default: "" })        
        
        this.__addField__( "modified_at", Model.types.datetime );      
    
        this.__addPrimaryKey__( ["version_id"] )                
        // this.__addForeignKey__( "create_by", Accounts, "username" )
    }

    makeDefaultVersion = async ( { project_id, create_by } ) => {
        const Version = new VersionsRecord({ project_id, version_name: "", version_description: "...", create_by, create_at: new Date() })
        await Version.save();
    }

    getAllProjectVersions = async () => {
        const versions = await this.findAll({});
        const result = [];
        for( let i = 0; i < versions.length; i++ ){
            const Version = new VersionsRecord( versions[i] );
            const data = await Version.get()
            result.push( data );
        }
        return result
    }
}   
class VersionsRecord extends Versions {
    constructor( {  id, version_id, version_name, version_description,  modified_at } ){
        super();
        this.setDefaultValue( {  id, version_id, version_name, version_description, modified_at} )        
    }

    get = () => {
        return {
            id: this.id.value(), 
            version_id: this.version_id.value(), 
            version_name: this.version_name.value(), 
            version_description: this.version_description.value(), 
            
            modified_at: this.modified_at.getFormatedValue(),
            
        }
    }  
    
    getVersionCreator = async () => {
        const username = this.create_by.value();
        const versionCreator = await this.accounts.__findCriteria__({ username })        
        
        if( !versionCreator ){
            if( username == Accounts.__defaultAccount.username ){
                return Accounts.__defaultAccount
            }else{
                return "Người tạo dự án không tồn tại hoặc đã bị xóa!"
            }
        }else{
            const Account = new AccountsRecord( versionCreator )
            return Account.get()
        }        
    }

}
module.exports = { Versions, VersionsRecord }
    