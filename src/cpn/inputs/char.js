import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default ( props ) => {
    const { field, changeTrigger, related, table, defaultValue } = props;
    const [ current, setCurrent ] = useState('')
    const [ fields, setFields ] = useState([])
    const [ height, setHeight ] = useState(0)
    const [ foreignData, setForeignData ] = useState([])
    const [ showKey, setShowKey ] = useState("")
    const { proxy, unique_string } = useSelector( state => state );
    const [ relatedTable, setRelatedTable ] = useState({})

    useEffect(() => {

        if( isFieldForeign()){
            const thisFieldForeignKey = table.fk.filter( fk => {
                const { fks } = fk;
                const isKeyExisted = fks.filter( key => {
                    const { field_alias,  ref_on } = key;
                    return field_alias == field.field_alias;
                })[0]
                return isKeyExisted ? true : false;
            })[0];

            const { table_alias, fks } = thisFieldForeignKey;
            if( foreignData.length == 0 ){
                fetch(`${ proxy()}/api/${ unique_string }/apis/table/data/${ table_alias }`).then( res => res.json() ).then( res => {
                    const { success, data, fields, pk } = res;
                    setForeignData( data )
                    setFields(fields)
                    const showKey = fks.filter(k => k.field_alias == field.field_alias )[0].ref_on
                    setShowKey(showKey)
                    const rTable = related.filter( tb => tb.table_alias == table_alias )[0];
                    setRelatedTable(rTable)
                })
            }
        }

    }, [])

    useEffect(() => {
        setCurrent(defaultValue)
    }, [defaultValue])

    const isFieldForeign = () => {
        const isForeign = table.fk.filter( key => {
            const { fks } = key;
            const fkExisted = fks.filter(  k => k.field_alias == field.field_alias )[0]
            return fkExisted ? true : false
        })[0]
        return isForeign ? true : false;
    }

    const fieldChangeData = (e) => {
        const value = e.target.value
        setCurrent( e.target.value )
        changeTrigger( field, value )
    }

    const blurTrigger = (e) => {
            e.preventDefault();
            setTimeout(() => {
                setHeight(0)
        }, 135)
    }

    const focusTrigger = () => {
        setHeight(250);
    }

    const generateData = ( data ) => {

        if( fields.length > 0 && current ){
            let showFields = fields;
            const { display_fields } = relatedTable;

            if( display_fields && display_fields.length > 0 ){
                showFields = display_fields;
                return showFields.map( f => data[f] ).join(' - ')
            }

            return showFields.map( f => data[ f.field_alias ] ).join(' - ')

        }else{
            return null
        }
    }

    const dataClickedTrigger = ( data ) => {
        setCurrent( data );
        changeTrigger( field, data[ showKey ] )
    }

    if( !isFieldForeign() ){
        return(
            <div className="w-100-pct p-1 m-t-1">
                <div>
                    <div>
                    {field.field_name}{!field.nullable && <span style={{color: 'red'}}> *</span>}
                    </div>
                    <div className="m-t-0-5">
                        <input type="text"
                            className="p-t-0-5 p-b-0-5 p-l-1 text-16-px block w-100-pct border-1"
                            placeholder="" onChange={ fieldChangeData } value={ current }
                            />
                    </div>
                </div>
            </div>
        )
    }else{
        return(
            <div className="w-100-pct p-1 m-t-1">
                <div>
                    <div>
                    {field.field_name}{!field.nullable && <span style={{color: 'red'}}> *</span>}
                    </div>
                    <div className="m-t-0-5">
                        <input type="text"
                            className="p-t-0-5 p-b-0-5 p-l-1 text-16-px block w-100-pct border-1"
                            placeholder="" onChange={ fieldChangeData } defaultValue={ generateData(current) }
                            onFocus={ focusTrigger }
                            onBlur={ blurTrigger }
                            />

                        {/* FOREIGN DATA SHOW AND CHOSE */}
                        </div>
                    <div className="rel">
                        <div className="abs-default w-100-pct no-overflow bg-white shadow" style={{ height: `${ height }px` }}>
                            <div className="block w-100-pct p-0-5 overflow" style={{ height: `${ height }px` }}>
                            { foreignData.map( (d, index) =>
                                 <div key={ index } className="flex flex-no-wrap hover pointer" onClick={ () => { dataClickedTrigger( d ) } }>
                                    { fields ? fields.map( field =>
                                        <div key={field.field_id} className="div p-0-5 w-max-content">
                                            <span>{ d[ field.field_alias ] }</span>
                                        </div>
                                    ) : null }
                                 </div>
                              )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}