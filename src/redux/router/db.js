export default (state, action) => {
    switch (action.type) {

        case "hellowordl":

            break;

        case "addField":
            return addField(state, action);
            break;
        case "updateField":
            return updateField(state, action);
            break;
        case "updateFields":
            return updateFields(state, action);
            break;
        case "resetTempFields":
            return {
                ...state,
                tempFields: []
            }
        case "initializeData":
            return initializeData( state, action );
            break;

        case "createTable":
            return createTable( state, action );
            break;

        case "setCurrentTable":
            return setCurrentTable( state, action );
            break;

        case "destroyCurrentTable":
            return destroyCurrentTable(state, action);
            break;

        case "setCurrentField":
            return setCurrentField( state, action );
            break;

        case "destroyCurrentField":
            return destroyCurrentField(state, action);
            break;

        case "tableChange":
            return tableChange( state, action );
            break;

        case "dropTable":
            return dropTable( state, action );
            break;

        case "createField":
            return createField( state, action );
            break;

        case "dropField":
            return dropField( state, action );
            break;

        case "fieldChange":
            return fieldChange( state, action );
            break;

        case "setSelectedConstraint":
            return setSelectedConstraint( state, action );
            break;

        case "cascadingUpdateFields":
            return cascadingUpdateFields( state, action );
            break;
        case "setTableOffsets": 
            return setTableOffsets(state, action);
            break;

        case "setTableDiagramOffset":
            return setTableDiagramOffset( state, action );
            break;
        case "setStartEndPoints":
            return setStartEndPoints( state, action );
            break;
        default:
            return state;
    }
}



const addField = (state, action) => {

    const { field } = action.payload; // const field = action.payload.field
    const { tempFields, tempCounter } = state

    tempFields.push({ ...field, create_at: new Date(), index: tempCounter })
    return { ...state, tempFields, tempCounter: tempCounter + 1 }
}
const updateField = (state, action) => {
    const { field } = action.payload;
    const { tempFields } = state;

    const newFields = tempFields.map(f => {
        if (f.index == field.index) {
            return field
        }
        return f
    })

    return { ...state, tempFields: newFields }
}

const updateFields = (state, action) => {
    const { tempFieldsUpdate } = action.payload;

    return { ...state, tempFields: tempFieldsUpdate }
}



const initializeData = ( state, action ) => {
    const { tables, fields } = action.payload;
    const database = { tables, fields }
    return { ...state, database }
}

const createTable = ( state, action ) => {
    const { table } = action.payload;
    const { database } = state;
    const { tables } = database;
    let newTables;
    if( tables ){
        newTables = [ table, ...tables ]
    }else{
        newTables = [ table ]
    }

    database.tables = newTables;
    return {...state, database };
}

const setCurrentTable = ( state, action ) => {
    const { table } = action.payload;
    const { database } = state;
    database.currentTable = table;
    return { ...state, database }
}

const setCurrentField = ( state, action ) => {
    const { field } = action.payload;
    const { database } = state;
    database.currentField = field;
    return { ...state, database }
}

const destroyCurrentTable = (state, action) => {
    const { database } = state;
    delete database.currentTable;
    delete database.currentField;
    return { ...state, database }
}

const destroyCurrentField = (state, action) => {
    const { database } = state;
    delete database.currentField;
    return { ...state, database }
}

const tableChange = ( state, action ) => {
    const { table } = action.payload;
    const { database } = state;
    const { tables } = database;
    const newTables = tables.map( tb => {
        if( tb.table_id === table.table_id){
            return table
        }else{
            return tb
        }
    })
    database.tables = newTables;
    database.currentTable = table;
    return { ...state, database }
}

const dropTable = ( state, action ) => {
    const { table } = action.payload;
    const { database } = state;
    const { tables, fields } = database;

    const newTables = tables.filter( tb => tb.table_id != table.table_id );
    const newFields = fields.filter( fd => fd.table_id != table.table_id );
    /* Xoá bảng xoá luôn trường của bảng */
    /* Gòi còn xoá ràng buộc khoá ngoại nữa mà để nữa làm sau */
    database.tables = newTables;
    database.fields = newFields;
    return { ...state, database }
}

const createField = ( state, action ) => {
    const { field } = action.payload;
    const { database } = state;
    const { fields } = database;
    let newFields;
    if( fields ){
        newFields = [ ...fields, field ]
    }else{
        newFields = [ field ]
    }

    database.fields = newFields;
    return {...state, database };
}

const dropField = ( state, action ) => {
    const { field } = action.payload;
    const { database } = state;
    const { fields } = database;

    const newFields = fields.filter( fd => fd.field_id != field.field_id );
    database.fields = newFields;
    return { ...state, database }
}

const fieldChange = ( state, action ) => {
    const { values } = action.payload;
    const { database } = state;
    const { fields } = database;
    const field = database.currentField
    for( let i = 0; i < values.length ; i++ ){
        const { prop, value } = values[i]
        field[prop] = value;
    }

    const newFields = fields.map( fd => {
        if( fd.field_id === field.field_id){
            return field
        }else{
            return fd
        }
    })
    database.fields = newFields;
    database.currentField = field;
    return { ...state, database: { ...database, currentField: { ...field } } }
}

const setSelectedConstraint = ( state, action ) => {
    const { constraint } = action.payload;

    return { ...state, selectedConstraint: { ...constraint, type: constraint.value } }
}

const cascadingUpdateFields = ( state, action ) => {
    const { newFields, fk } = action.payload;
    const { database } = state;
    const { fields, currentTable, tables } = database;

    const updatedFields = fields.map( field => {
        const { field_alias } = field;
        const filtedField = newFields.filter( f => f.field_alias == field_alias )[0];
        if( filtedField != undefined ){
            return { ...field, ...filtedField }
        }else{
            return field
        }
    })

    currentTable.fk = fk;
    const newTables = tables.map( tb => {
        if( tb.table_id == currentTable.table_id ){
            return currentTable;
        }else{
            return tb;
        }
    })
    database.currentTable = currentTable;
    database.fields = updatedFields;
    return { ...state, database };
}

const setTableOffsets = ( state, action ) => {
    const { database } = state;

    const { tableOffsets } = database;
    const offset = action.payload;
    if( tableOffsets ){

        const offsetExisted = tableOffsets.filter(tb => tb.table_alias == offset.table_alias)[0]
        if( offsetExisted ){
            database.tableOffsets = tableOffsets.map( ofs => {
                if( ofs.table_alias == offset.table_alias ){
                    return offset;
                }else{
                    return ofs;
                }
            })
        }else{
            database.tableOffsets = [...tableOffsets, offset]
        }
    }else{
        database.tableOffsets = [ offset]
    }

    return {...state, database}
}

const setTableDiagramOffset = (state, action) => {  
    const { table_alias, field_alias, offsetTop, offsetLeft } = action.payload;
    const { database } = state;
    const { offsets } = database;
    if( !offsets ){
        database.offsets = [ action.payload ];
    }else{
        const isThisOffsetExisted =  offsets.filter( ofs => ofs.table_alias == table_alias && ofs.field_alias == field_alias )[0];
        if( !isThisOffsetExisted ){
            offsets.push( action.payload );                    
            database.offsets = offsets;
        }else{
            database.offsets = offsets.map( offset => {
                if(offset.table_alias == table_alias && offset.field_alias == field_alias ){
                    return action.payload 
                }else{
                    return offset;
                }
            })
        }
    }
    
    return { ...state, database }
}

const setStartEndPoints = ( state, action ) => {
    const { start, end } = action.payload;
    const { database } = state;
    const { offsetPoints } = database;    
    if( !offsetPoints ){
        database.offsetPoints = [ action.payload ];         
    }else{
        // database.offsetPoints.push({start, end})
        const pointExisted = offsetPoints.filter( point => {
            const sameStart = start.field_alias == point.start.field_alias && start.table_alias == point.start.table_alias;
            const sameEnd   = end.field_alias == point.end.field_alias && end.table_alias == point.end.table_alias;

            if( sameStart && sameEnd ){
                return true
            }
            return false;
        })[0]
        let newPoints;
        if( pointExisted ){
            newPoints = offsetPoints.map( point => {
                const sameStart = start.field_alias == point.start.field_alias && start.table_alias == point.start.table_alias;
                const sameEnd   = end.field_alias == point.end.field_alias && end.table_alias == point.end.table_alias;
    
                if( sameStart && sameEnd ){
                    return { start, end }
                }
                return point;
            });
        }else{
            newPoints = offsetPoints;
            newPoints.push({ start, end });
        }
        database.offsetPoints = newPoints;

    }  
    return { ...state, database };
}