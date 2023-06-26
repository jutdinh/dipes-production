import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default ( props ) => {
    const { table, fields } = props;
    table.fields = fields
    const ref = useRef()
    const [tableRef, setTableRef] = useState({})
    const dispatch = useDispatch()
    useEffect(() => {
        setTableRef( ref )
        if( ref.current ){
            const { offsetHeight, offsetTop, offsetLeft, offsetWidth } = ref.current;
            const { table_alias } = table;

            dispatch({
                branch: "db",
                type: "setTableOffsets",
                payload: {
                    table_alias,
                    offsetTop,
                    offsetLeft,
                    offsetWidth,
                    offsetHeight,
                    centre: {
                        offsetLeft: offsetLeft + Math.ceil(offsetWidth / 2),
                        offsetTop: offsetTop + Math.ceil( offsetHeight / 2 )
                    }
                }
            })
        }
    }, [ref])

    const isPrimary = (field) => {
        const { primary_key } = table;
        const pk = primary_key ? primary_key : []
        const existedInPK = pk.indexOf( field.id );
        if( existedInPK != -1 ){
            return true
        }
        return false;
    }

    const setCurrentTable = () => {
        dispatch({
            branch: "db",
            type: "setCurrentTable",
            payload: { table }
        })
    }

    const isForeignKey = (field) => {
        const { foreign_keys } = table;
        if( foreign_keys ){
            const key = foreign_keys.find( fk => fk.field_id == field.id )
            if( key ){
                return true
            }
        }
        return false;
    }

    return(
        <div className="" >
            <div ref = {ref} className="_shadow-blur _m-2 _bg-white _pointer _shadow-hover"                 
                onClick={ setCurrentTable }
                style={{ minWidth: 325, opacity: "0.9" }}>
                <div className="_p-0-5 _border-1-bottom">
                    <span className="_block _text-left _text-16-px _bold">{ table.table_name }</span>                
                </div>
                <div>
                    { table.fields.map( field => {
                        if( isPrimary(field) ){
                            return <PrimaryField field={field} tableRef={ tableRef } isForeignKey={ isForeignKey }  table={ table }/>
                        }
                        if( isForeignKey(field) ){
                            return <ForeignField field={ field } tableRef={ tableRef } table={ table }/>
                        }
                        return <Field field={field} />
                    }) }
                </div>
            </div>
        </div>
    )
}

const typeGenerator = (type, props) => {
    
    switch(type){
        case "INT":
        case "BIG INT":
        case "INT UNSIGNED":
        case "BIG INT UNSIGNED":
            if( props.PATTERN ){
                return `${ type }${ props.AUTO_INCREMENT ? "(auto)" : "" } `
            }
            return `${ type }`
        case "VARCHAR":
        case "CHAR":
            return `${ type }(${ props.LENGTH })`
        case "DECIMAL":
        case "DECIMAL UNSIGNED":
            return `${ type }(${ props.LENGTH }, ${ props.DECIMAL_PLACE })`
        case "BOOL":
            return `${ type }(${ props.IF_TRUE ? props.IF_TRUE : "TRUE" }, ${ props.IF_FALSE ? props.IF_FALSE : "FALSE" })`
        default:
            return `${ type }`
    }
}

const resolvePositionSize = ( start, end ) => {
    const size = {
        width: Math.abs( start.offsetLeft - end.offsetLeft ),
        height: Math.abs( start.offsetTop - end.offsetTop )
    }    
    return size; 
}


const Field = (props) => {
    const { field } = props;
    return(
        <div className="_p-0-5 _border-1-bottom _border-gray _flex _flex-now-wrap">
            <span className="_block _text-left _text-14-px _fill-available">{ field.field_name }</span>
            <span className="_block _m-l-2 _text-right _text-14-px">{ typeGenerator(field.props.DATATYPE, field.props )}</span>                
        </div>
    )
}

const PrimaryField = (props) => {
    const { field, isForeignKey, table } = props;
    const ref = useRef()
    const dispatch = useDispatch()

    useEffect(() => {
        if( ref.current != undefined && ref.current != undefined ){
            // console.log(ref)
            const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = ref.current;
            // console.log(`TOP: ${ offsetTop } - LEFT: ${ offsetLeft }`)
            if( table ){
                dispatch({
                    branch: "db",
                    type: "setTableDiagramOffset",
                    payload: {
                        table_alias: table.table_alias,
                        field_alias: field.field_alias,
                        offsetTop: offsetTop + offsetHeight / 2, 
                        offsetLeft, offsetWidth, offsetHeight                        
                    }
                })
            }
        }
    }, [ref])

    if (isForeignKey(field) ){
        return (<ForeignField field={field} highLighted={true} table={table}/>)
    }else{    
        return(
            <div ref={ ref } className="_p-0-5 _border-1-bottom _border-gray _flex _flex-now-wrap">
                <div className="_flex _flex-no-wrap _flex-aligned _fill-available">
                    <div className="_m-r-0-5">
                        <img src="/assets/icon/p-key.png" className="_w-14-px _block"/>
                    </div>
                    <span className="_block _text-left _text-14-px _bold">{ field.field_name }</span>
                </div>
                <span className="block m-l-2 text-right text-14-px">{ typeGenerator(field.props.DATATYPE, field.props ) }</span>                
            </div>
        )
    }
}

const ForeignField = (props) => {
    const { field, table, highLighted } = props;
    // console.log(field)
    const ref = useRef()
    const dispatch = useDispatch()
    const { tables, offsets, fields } = useSelector( state => state.database );    
    const [ rectSize, setRectSize ] = useState({})

    useEffect(() => {
        const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = ref.current;
        // console.log(`TOP: ${ offsetTop } - LEFT: ${ offsetLeft } - Height: ${ offsetHeight } - Width: ${ offsetWidth }`)
        if(table){
            dispatch({
                branch: "db",
                type: "setTableDiagramOffset",
                payload: {
                    table_alias: table.table_alias,
                    field_alias: field.field_alias,
                    offsetTop: offsetTop + offsetHeight / 2, 
                    offsetLeft, offsetWidth, offsetHeight                    
                }
            })
        } 
    }, [ref])

    useEffect(() => {        
        if( table ){            
            const { foreign_keys } = table;            
            const query = {}
            const {current} = ref;
            const foreignKey = foreign_keys.find( key => key.field_id == field.id );

            if( foreignKey ){                    
                const foreignTable = tables.find( tb => tb.id == foreignKey.table_id );
                const foreignField = fields.find( fd => fd.id == foreignKey.ref_field_id )
                query.table_alias = foreignTable.table_alias;
                query.field_alias = foreignField.field_alias;                
            } 
            if( offsets ){            
                const foreignOffset = offsets.filter( ofs => ofs.table_alias == query.table_alias && ofs.field_alias == query.field_alias )[0]
                if( foreignOffset ){                   
                    dispatch({
                        branch: "db",
                        type: "setStartEndPoints",
                        payload: {
                            start: { 
                                table_alias: table.table_alias,
                                field_alias: field.field_alias,
                                offsetTop: current.offsetTop + current.offsetHeight / 2, 
                                offsetLeft: current.offsetLeft,
                                offsetWidth: current.offsetWidth, 
                                offsetHeight: current.offsetHeight
                            },
                            end: foreignOffset
                        }
                    })
                }           
            }
        }

    }, [offsets])
    return(
        <div ref={ ref } className="_p-0-5 _border-1-bottom _border-gray _flex _flex-now-wrap _theme-color">            
            <div className="_flex _flex-no-wrap _flex-aligned _fill-available">
                    {  highLighted ? 
                        <div className="_m-r-0-5">
                            <img src="/assets/icon/p-key.png" className="_w-14-px _block"/>
                        </div> : null
                     }
                    <div className="_m-r-0-5">
                        <img src="/assets/icon/f-key.png" className="_w-14-px _block"/>
                    </div>
                    <span className={`_block _text-left _text-14-px _fill-available ${ highLighted ? "_bold": "" }` } style={{ color: `${ highLighted ? "black": "" }` }}>{ field.field_name }</span>                    
                </div>
            <span className="_block _m-l-2 _text-right _text-14-px">{ typeGenerator(field.props.DATATYPE, field.props )}</span>             
            
        </div>
    )
}