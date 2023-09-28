
const { Model } = require('../config/models');
class Statistics extends Model{
    constructor(){
        super("statistics");
        this.__addField__( "table_id", Model.types.int )
        this.__addField__( "calculates", Model.types.array)
        this.__addField__( "statistic", Model.types.array)

        this.__addPrimaryKey__( ["table_id"] )        
    }
}   
class StatisticsRecord extends Statistics {
    constructor( { id, table_id, calculates, statistic } ){
        super();
        this.setDefaultValue( { id, table_id, calculates, statistic } )        
    }
}
module.exports = { Statistics, StatisticsRecord }
    