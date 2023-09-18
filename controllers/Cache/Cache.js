const { Database } = require('../../config/models/database');

const CACHE = "CACHE_TABLE_NEVER_DIE"

class Cache {
    constructor(){
    
    }

    setUsername = ( username ) => {
        
    }

    setData = async ( key, value ) => {  
        // console.log(key, value)     
        const oldValue = await Database.selectAll(CACHE, { key })
        if( oldValue && oldValue.length > 0 ){
            if( oldValue.length != 1 ){
                await Database.deleteMany(CACHE, { key })
                await Database.insert( CACHE, { key, value } )    
            }else{
                await Database.update(CACHE, { key }, { value })
            }
        }else{
            await Database.insert( CACHE, { key, value } )
        }
    }

    getData = async ( key ) => {
        const cache = await Database.selectAll(CACHE, { key })
        return cache[0]
    }

    clearData = async () => {
        
    }
}

module.exports = new Cache()