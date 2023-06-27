import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default (props) => {
    const { field, changeTrigger, related, table, defaultValue } = props;
    const [current, setCurrent] = useState(defaultValue ? defaultValue : "")
    const [fields, setFields] = useState([])
    const [height, setHeight] = useState(0)
    const [foreignData, setForeignData] = useState([])
    const [showKey, setShowKey] = useState("")
    const { proxy, unique_string } = useSelector(state => state);
    const [relatedTable, setRelatedTable] = useState({})
    const [pk, setPK] = useState([]);

    useEffect(() => {
        if (defaultValue !== undefined) {
            if (isFieldForeign()) {
                const thisFieldForeignKey = table.fk.filter(fk => {
                    const { fks } = fk;
                    const isKeyExisted = fks.filter(key => {
                        const { field_alias, ref_on } = key;
                        return field_alias == field.field_alias;
                    })[0]
                    return isKeyExisted ? true : false;
                })[0];

                const { table_alias, fks } = thisFieldForeignKey;
                fetch(`${proxy()}/api/${unique_string}/apis/table/data/${table_alias}`).then(res => res.json()).then(res => {
                    const { success, data, fields, pk } = res;
                    setForeignData(data)
                    setFields(fields)


                    const showKey = fks.filter(k => k.field_alias == field.field_alias)[0].ref_on
                    setShowKey(showKey)
                    const rTable = related.filter(tb => tb.table_alias == table_alias)[0];
                    setRelatedTable(rTable)
                    setPK(pk)

                    const primary = pk[0]; /* This may cause some freaking bug whence has more than 1 key in primary set  */
                    const currentData = data.filter(d => d[primary] == defaultValue)[0];

                    if (currentData) {
                        setCurrent(currentData)
                    }
                })

            } else {
                setCurrent(defaultValue)
            }
        } else {
            if (!isFieldForeign() && field.props.AUTO_INCREMENT) {
                fetch(`${proxy()}/api/${unique_string}/apis/api/get/auto_increment/${field.field_alias}`)
                    .then(res => res.json()).then(res => {
                        const { id } = res;
                        setCurrent(id)
                        changeTrigger(field, id)
                    })
            } else {
                if (isFieldForeign()) {
                    const thisFieldForeignKey = table.fk.filter(fk => {
                        const { fks } = fk;
                        const isKeyExisted = fks.filter(key => {
                            const { field_alias, ref_on } = key;
                            return field_alias == field.field_alias;
                        })[0]
                        return isKeyExisted ? true : false;
                    })[0];
                    const { table_alias, fks } = thisFieldForeignKey;
                    if (foreignData.length == 0) {
                        fetch(`${proxy()}/api/${unique_string}/apis/table/data/${table_alias}`).then(res => res.json()).then(res => {
                            const { success, data, fields, pk } = res;
                            setForeignData(data)
                            setFields(fields)


                            const showKey = fks.filter(k => k.field_alias == field.field_alias)[0].ref_on
                            setShowKey(showKey)
                            const rTable = related.filter(tb => tb.table_alias == table_alias)[0];
                            setRelatedTable(rTable)
                            setPK(pk)

                        })
                    }
                }

            }
        }
    }, [defaultValue])

    useEffect(() => {

    }, [])

    useEffect(() => {
        // console.log(defaultValue)
        // console.log(pk)
        // console.log(foreignData)

        const filtedCurrent = foreignData.filter(data => data[pk[0]] == defaultValue)[0];///////////////////////////////////////////////////
        setCurrent(filtedCurrent)
    }, [foreignData])

    const isFieldForeign = () => {
        const isForeign = table.fk.filter(key => {
            const { fks } = key;
            const fkExisted = fks.filter(k => k.field_alias == field.field_alias)[0]
            return fkExisted ? true : false
        })[0]
        return isForeign ? true : false;
    }

    const fieldChangeData = (e) => {
        const value = e.target.value
        setCurrent(e.target.value)
        changeTrigger(field, value)
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
    const generateData = (data) => {

        // if( fields.length > 0 && data ){
        //     let showFields = fields;
        //     const { display_fields } = relatedTable;

        //     if( display_fields && display_fields.length > 0 ){
        //         showFields = display_fields;
        //         return showFields.map( f => data[f] ).join(' - ')
        //     }
        //     return showFields.map( f => data[ f.field_alias ] ).join(' - ')

        // }else{
        //     return null
        // }
        if (data) {
            return data[pk[0]]
        }
        return null
    }

    const dataClickedTrigger = (data) => {
        setCurrent(data);
        changeTrigger(field, data[showKey])
    }

    if (!isFieldForeign()) {
        return (
            <div className="w-100-pct p-1 m-t-1">
                <div>
                    <div>
                        <span className="block text-16-px">
                            {field.field_name}{!field.nullable && <span style={{ color: 'red' }}> *</span>}
                        </span>
                    </div>
                    <div className="m-t-0-5">
                        <input type={field.props.AUTO_INCREMENT ? "text" : "number"}
                            className="p-t-0-5 p-b-0-5 p-l-1 text-16-px block w-100-pct border-1"
                            placeholder="" onChange={fieldChangeData} value={current}
                        />
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div className="w-100-pct p-1 m-t-1">
                <div>
                    <div>
                        <span className="block text-16-px">
                            {/* { field.field_name } */}

                            {field.field_name}{!field.nullable && <span style={{ color: 'red' }}> *</span>}
                        </span>
                    </div>
                    <div className="m-t-0-5">
                        <input type="text"
                            className="p-t-0-5 p-b-0-5 p-l-1 text-16-px block w-100-pct border-1"
                            placeholder="" onChange={fieldChangeData} value={generateData(current)}         ////////////////////
                            onFocus={focusTrigger}
                            onBlur={blurTrigger}
                        />

                        {/* FOREIGN DATA SHOW AND CHOSE */}
                    </div>

                    <div className="rel">
                        <div className="abs-default w-100-pct no-overflow bg-white shadow" style={{ height: `${height}px` }}>
                            <div className="block w-100-pct p-0-5 overflow" style={{ height: `${height}px` }}>
                                {foreignData.length > 0 && foreignData.map((d, index) =>
                                    <div key={index} className="flex flex-no-wrap hover pointer" onClick={() => { dataClickedTrigger(d) }}>

                                        <div className="div p-0-5 w-max-content">
                                            <span>{generateData(d)}</span>
                                        </div>

                                        {/* fields ? fields.map( field =>
                                        <div key={field.field_id} className="div p-0-5 w-max-content">
                                            <span>{ d[ field.field_alias ] }</span>
                                        </div>
                                    ) : null */}
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