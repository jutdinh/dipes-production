const fs = require('fs');
const { Model } = require('../config/models');

class Accounts extends Model{

    static __defaultAccount = {
        "username": "administrator", 
        "password": "dipes@admin", 
        "fullname": "Administrator", 
        "role": "uad", 
        "email": "admin.dipes@mylangroup.com", 
        "phone": "0368474601",
        "avatar": "/image/avatar/su.png"
    }

    constructor(){
        super("accounts"); // No. field is auto generated in this table
        this.__addField__( "username", Model.types.string, { required: true } )
        this.__addField__( "password", Model.types.string, { required: true } )
        this.__addField__( "fullname", Model.types.string, { required: true } )
        this.__addField__( "role", Model.types.enum, { required: true, values: ["ad", "pm", "pd", "ps"] })
        this.__addField__( "email", Model.types.string)
        this.__addField__( "phone", Model.types.string)
        this.__addField__( "address", Model.types.string)
        this.__addField__( "avatar", Model.types.string)
        this.__addField__( "note", Model.types.string)
        this.__addField__( "create_by", Model.types.string );
        this.__addField__( "create_at", Model.types.datetime, { format: "DD-MM-YYYY lúc hh:mm" } );

        this.__addPrimaryKey__( ["username"] )        
    }

    getAllAccounts = async () => {
        const accounts = await this.findAll();
        if( accounts ){
            const result = accounts.map( account => {
                const Account = new AccountsRecord( account );
                return Account.get()
            })
            return result
        }else{
            return []
        }
    }
}   
class AccountsRecord extends Accounts {
    constructor( { id, username, password, fullname, role, email, phone, avatar, address, note, create_by, create_at } ){
        super();
        this.setDefaultValue( { id, username, password, fullname, role, email, phone, avatar, address, note, create_by, create_at } )        
    }

    get = () => {
        return { 
            username: this.username.value(),       
            fullname: this.fullname.value(), 
            role:     this.role.value(), 
            email:    this.email.value(), 
            phone:    this.phone.value(), 
            avatar:   this.avatar.value(),
            address:  this.address.value(),
            note:     this.note.value(),
            create_by:this.create_by.value(), 
            create_at:this.create_at.getFormatedValue()
        }
    }

    makeFirstAva = () => {
        const baseDir = `public/image/avatar`;
        const src = `${ baseDir }/default-ava.png`;
        const dest = `${ baseDir }/${ this.username.value() }.png`;

        if( !fs.existsSync( dest ) ){
            fs.copyFileSync( src, dest )            
        }
    }

    destroy = async () => {
        await this.remove()
        fs.unlinkSync(`public${ this.avatar.value() }`)
    }
}
module.exports = { Accounts, AccountsRecord }
    