const Table = require('./table');
const { Field, Number, String, Datetime, Int, Bool, Enum, List } = require('./fields');
const { query } = require('express');

class Model {
    static types = {
        number:     Number,
        int:        Int,        
        string:     String,
        datetime:   Datetime,
        bool:       Bool,
        enum:       Enum,
        array:      List,
        unknown:    Field
    }
    #model = undefined;

    constructor(modelName){
        this.#model = new Table(modelName)
        this.#model.__addField__( "id", Model.types.int, { required: false } );
    }

    getModel = () => {
        return this.#model
    }

    setDefaultValue = ( serializedData ) => {
        const fields = this.#model.__getFields__()        
        for( let i = 0; i < fields.length; i++ ){
            const { __fieldName, __fieldObject } =  fields[i]                        
            this[ __fieldName ] = __fieldObject
            this[ __fieldName ].value( serializedData[ __fieldName ] )
        }
    }

    __addField__ = ( fieldName, fieldObject, fieldProps = undefined ) => {                
        this.#model.__addField__( fieldName, fieldObject, fieldProps )
    }

    __addProperty__ = ( propName, referencesOn ) => {
        
    }

    __addForeignKey__ = ( fieldName, referencesOn, onField = undefined ) => {        
        this[ new referencesOn().getModel().__getTableName__() ] = new referencesOn().getModel()
        this.#model.__addForeignKey__( fieldName, referencesOn, onField )
    }

    __addPrimaryKey__ = ( fields ) => {
        this.#model.__addPrimaryKey__(fields);
    }


    find = ( query = undefined ) => {
        const type = typeof( query );

        switch(type){
            case 'number':
            case 'undefined':
                return this.#model.__find__( query )            
            default:
                return this.#model.__findCriteria__(query)                
        }
    }

    findAll = (query = undefined) => {
        return this.#model.__findAll__( query )
    }

    findFrom = async ( query, from, to ) => {
        return this.#model.__findFrom__(query, from, to )
    }

    insert = ( data ) => {
        return this.#model.__insertRecord__( data );
    }

    save = async () => {
        let id = this.id.value();
        if( id ){
            const newData = { id };
            const fields = this.#model.__getFields__()
            for( let i = 0; i < fields.length; i++ ){
                const { __fieldName } =  fields[i]
                const required = this[ __fieldName ].__required;
                if( required && this[ __fieldName ].value() == undefined ){
                    throw Error(`${this.#model.__getTableName__()}.${__fieldName} mang thuộc tính required = true nên không được phép bỏ trống!`)
                }
                
                newData[ __fieldName ] = this[ __fieldName ].value();                
            }
            const updateResult = await this.#model.__updateObject__( {...newData} );
            
            return updateResult;
                        
        }else{            
            id = await this.#model.__getNewId__();
            const newData = {};
            const fields = this.#model.__getFields__()

            for( let i = 0; i < fields.length; i++ ){
                const { __fieldName } = fields[i]
                const { __required, __auto } = this[ __fieldName ];
                if( __required && this[ __fieldName ].value() == undefined ){
                    throw Error(`${this.#model.__getTableName__()}.${__fieldName} mang thuộc tính required = true nên không được phép bỏ trống!`)
                }

                if( __auto ){
                    this[__fieldName].value(id);
                }
                newData[ __fieldName ] = this[ __fieldName ].value();                
            }
            newData["id"] = id;
            let insertResult = await this.#model.__insertObject__( newData );
            if( insertResult ){
                this.id.value( id );
                return true
            }
            else{
                return false;
            }
        }       
    }

    remove = async () => { // new
        const id = this.id.value();
        await this.#model.__deleteObject__({ id })        
    }

    count = async ( query = undefined ) => {
        return await this.#model.__count__( query )
    }
}


module.exports = Model
