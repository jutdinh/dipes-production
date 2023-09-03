const { Model } = require('../config/models');
const langs = require('../functions/langs');
class EventLogs extends Model{
    constructor(){
        super("eventlogs");
        this.__addField__( "event_id", Model.types.int, { auto: true } )
        this.__addField__( "event_type", Model.types.enum, { values: [ "info", "warn", "error" ] })
        this.__addField__( "event_title", Model.types.string )
        this.__addField__( "event_description", Model.types.string, { maxLength: Number.MAX_SAFE_INTEGER } )
        this.__addField__( "user_ip", Model.types.string)
        this.__addField__( "create_user", Model.types.string , { required: true })
        this.__addField__( "create_at", Model.types.datetime )

        this.__addPrimaryKey__( ["id"] )        
    }

    allLogs = async (language) => {
        const logs = await this.findAll()
        const result = []
        for( let i = 0 ; i < logs.length; i++ ){
            const Log = new EventLogsRecord( logs[i] )
            result.push( Log.translate( language ) )
        }
        return result.reverse();
    }

    search = async ( language, type, start, end ) => {
        const allLogs = await this.allLogs( language )
        const typeFilted = this.searchToType( type, allLogs )
        const startDateFilted = this.searchToStartDate( start,typeFilted )
        const endDateFilted = this.searchToEndDate( end, startDateFilted )
        return endDateFilted;
    }

    searchToType = (type, logs) => {
        if( type ){
            const filted = logs.filter( log => log.raw_type == type );
            return filted
        }
        return logs;
    }

    searchToStartDate = ( date, logs ) => {
        if( date ){
            const filted = logs.filter( log => {
                
                return log.raw_date.getTime() >= date.getTime()
            });
            return filted;
        }
        return logs
    }
    searchToEndDate = ( date, logs ) => {
        if( date ){
            const filted = logs.filter( log => log.raw_date <= date );
            return filted;
        }
        return logs
    }
}   
class EventLogsRecord extends EventLogs {
    constructor( { id, event_id, event_type, event_title, event_description, create_user, create_at, user_ip } ){
        super();
        this.setDefaultValue( { id, event_id, event_type, event_title, event_description, create_user, create_at, user_ip } )        
    }
    get = () => {
        return { 
            id: this.id.value(), 
            event_id: this.event_id.value(), 
            event_type: this.event_type.value(), 
            event_title: this.event_title.value(), 
            event_description: this.event_description.value(), 
            create_user: this.create_user.value(), 
            create_at: this.create_at.getFormatedValue(), 
            raw_date: this.create_at.value(),
            raw_type: this.event_type.value(),
            ip: this.user_ip.value()
        }
    }

    translate = (lg) => {        
        const lang = langs[lg]
        const log = this.get();
        log.event_type = lang[ log.event_type ];        
        const keys = Object.keys( lang );
        for( let i = 0; i < keys.length; i++ ){
            const key = keys[i]
            log.event_title = log.event_title.replaceAll( key, lang[key] )
            log.event_description = log.event_description.replaceAll( key, lang[key] )
        }
        return log;
    }
}
module.exports = { EventLogs, EventLogsRecord }
    