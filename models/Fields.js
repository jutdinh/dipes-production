
const { Model } = require('../config/models');
const { Tables } = require('./Tables');
const { Accounts, AccountsRecord } = require('./Accounts');

const { Database } = require('../config/models/database')

class Fields extends Model{

    static validTypes = [
        "INT", "INT UNSIGNED",
        "BIGINT", "BIGINT UNSIGNED",
        "BOOL",
        "DECIMAL", "DECIMAL UNSIGNED",
        "DATE", "DATETIME",
        "TEXT", "CHAR",
        "EMAIL", "PHONE",
        "FILE"
    ]

    static validPrimaryTypes = [
        "INT", "INT UNSIGNED",
        "BIGINT", "BIGINT UNSIGNED",
        "TEXT", "CHAR",
        "EMAIL", "PHONE"
    ]

    static stringFamily = [
        "CHAR", "TEXT", "EMAIL", "PHONE"
    ]

    static intFamily = [
        "INT", "INT UNSIGNED",
        "BIGINT", "BIGINT UNSIGNED"
    ]

    static floatFamily = [
        "DECIMAL", "DECIMAL UNSIGNED",
    ]

    constructor(){
        super("fields");
        this.__addField__( "field_alias", Model.types.string, { required: true })
        this.__addField__( "field_name", Model.types.string, { required: true })
        this.__addField__( "fomular_alias", Model.types.string, { required: true })
        this.__addField__( "table_id", Model.types.int, { required: true })             
        
        this.__addField__( "create_by", Model.types.string );
        this.__addField__( "create_at", Model.types.datetime );

        this.__addField__( "DATATYPE", Model.types.enum, { required: true, values: Fields.validTypes })
        this.__addField__( "NULL", Model.types.bool, { default: false })
        this.__addField__( "LENGTH", Model.types.int)
        this.__addField__( "AUTO_INCREMENT", Model.types.bool, { default: false })
        this.__addField__( "MIN", Model.types.number )
        this.__addField__( "MAX", Model.types.number )
        this.__addField__( "FORMAT", Model.types.string )
        this.__addField__( "PATTERN", Model.types.string )
        this.__addField__( "DECIMAL_PLACE", Model.types.int )
        this.__addField__( "DEFAULT", Model.types.string )
        this.__addField__( "DEFAULT_TRUE", Model.types.string, { default: "TRUE" } )
        this.__addField__( "DEFAULT_FALSE", Model.types.string, { default: "FALSE" } )


        this.__addField__("FILE_MAX_SIZE", Model.types.int, { default: 2 }) // MB
        this.__addField__("FILE_MULTIPLE", Model.types.bool, { default: false })
        this.__addField__("FILE_ACCEPT_TYPES", Model.types.array ) // array of strings which start with a dot, this one is prior        

        this.__addPrimaryKey__( ["id"] )        
        this.__addForeignKey__( "table_id", Tables, "id" )    
        // this.__addForeignKey__( "create_by", Accounts, "username" )    

    }

    static isTypeValid = ( type ) => {
        const index = Fields.validTypes.indexOf( type );
        if( index != -1 ){
            return true
        }
        return false
    }

    static makeFomularAlias = async ( rawName ) => {
        let name = rawName
        if( name == undefined || name == "" ){
            name = "Cái tên ngộ nghĩnh"
        }
        const __db = new Database()
        const splittedName = name.split(' ');
        const newNameChars = splittedName.map( word => {
            if(word[0]){
                return word[0].toUpperCase()
            }
            return ""
        }).join('')
        const uniqueId = await __db.getAutoIncrementId(newNameChars);
        return `${newNameChars}${ uniqueId }`
    }

    static isIntFamily = ( type ) => {
        const index = Fields.intFamily.indexOf(type)
        return index != -1
    }

    static makeAutoIncreament = async ( field_alias, pattern ) => {      
        const __db = Database
        const number = await __db.getAutoIncrementId(field_alias);
        let result = pattern
        if( !pattern ){
            result = "[N]"
        }
        const today = new Date();
        const date = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        result = result.replaceAll("[DD]", date);
        result = result.replaceAll("[MM]", month);
        result = result.replaceAll("[YYYY]", year);
        const numberPlaces = [];
        for (let i = 0; i < result.length; i++) {
            if (result[i] === '[') {
                var temp = ""
                for (let j = i + 1; j < result.length; j++) {
                    if (result[j] === 'N' && result[j] !== ']') {
                        temp += result[j];
                    } else {
                        if (result[j] === ']') {
                            numberPlaces.push(temp);
                            i = j;
                            temp = ""
                        }
                    }
                }
            }
        }

        if( numberPlaces.length == 0 ){
            result += "[N]"
            numberPlaces.push( "N" )
        }
        const places = numberPlaces.map(place => {
            const placeLength = place.length;
            let numberLength = number.toString().length;
            let header = "";
            for (let i = 0; i < placeLength; i++) {
                header += "0";
            }
            const result = header.slice(0, placeLength - numberLength) + number.toString();
            return { place, value: result };
        })
        for (let i = 0; i < places.length; i++) {
            const { place, value } = places[i];
            result = result.replace(`[${place}]`, value)
        }
        return result;
    }

    allFieldsOfASingleTable = async ( { table_id } ) => {
        const fields = await this.findAll({ table_id });
        const result = []
        for( let i = 0 ; i < fields.length; i++ ){
            // console.log(fields[i] )
            const Field = new FieldsRecord( fields[i] )
            const inf = await Field.get();
            result.push( inf )
        }
        return result;
    }

    removeAll = async ( table_id ) => {        
        const model = this.getModel();
        await model.__deleteObjects__({ table_id })
        return
    }

    deleteAll = async () => {
        const model = this.getModel()
        await model.__deleteAll__()
        return
    }

    insertMany = async ( fields ) => {
        const model = this.getModel()
        await model.__insertMany__(fields)
        return
    }

}   
class FieldsRecord extends Fields {
    constructor( { id, field_alias, fomular_alias ,field_name, table_id, create_at, create_by, DATATYPE, NULL, LENGTH, AUTO_INCREMENT, MIN, MAX, FORMAT, PATTERN, DECIMAL_PLACE, DEFAULT, DEFAULT_TRUE, DEFAULT_FALSE } ){
        super();
        if( Fields.isTypeValid( DATATYPE ) ){
            this.setDefaultValue( {  id, field_alias, fomular_alias, field_name, table_id, create_at, create_by, DATATYPE, NULL, LENGTH, AUTO_INCREMENT, MIN, MAX, FORMAT, PATTERN, DECIMAL_PLACE, DEFAULT, DEFAULT_TRUE, DEFAULT_FALSE  } )        
        }else{
            const error = `Kiểu dữ liệu ${ DATATYPE } khum thuộc nhóm kiểu hợp lệ`;
            throw Error(error)
        }
    }

    get = async () => {
        return { 
            id: this.id.value(), 
            field_alias: this.field_alias.value(), 
            field_name: this.field_name.value(), 
            table_id: this.table_id.value(), 
            fomular_alias: this.fomular_alias.value(),
            
            props: {
                DATATYPE: this.DATATYPE.value(), 
                NULL: this.NULL.value(), 
                LENGTH: this.LENGTH.value(), 
                AUTO_INCREMENT: this.AUTO_INCREMENT.value(), 
                MIN: this.MIN.value(), 
                MAX: this.MAX.value(), 
                FORMAT: this.FORMAT.value(), 
                PATTERN: this.PATTERN.value(),
                DECIMAL_PLACE: this.DECIMAL_PLACE.value(), 
                DEFAULT: this.DEFAULT.value(), 
                DEFAULT_TRUE: this.DEFAULT_TRUE.value(), 
                DEFAULT_FALSE: this.DEFAULT_FALSE.value(),
                FILE_MAX_SIZE: this.FILE_MAX_SIZE.value(),
                FILE_MULTIPLE: this.FILE_MULTIPLE.value(),
                FILE_ACCEPT_TYPES: this.FILE_ACCEPT_TYPES.value(),
                
            },
            create_at: this.create_at.getFormatedValue(),
            
        }
    }

    getFieldCreator = async () => {
        const username = this.create_by.value();
        const fieldCreator = await this.accounts.__findCriteria__({ username })        
        
        if( !fieldCreator ){            
            return "Người tạo dự án không tồn tại hoặc đã bị xóa!"            
        }else{
            const Account = new AccountsRecord( fieldCreator )
            return Account.get()
        }
    }
}

module.exports = { Fields, FieldsRecord }
    