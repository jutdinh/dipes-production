import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default (props) => {
    const { field, changeTrigger, related, table, defaultValue } = props;
    const [current, setCurrent] = useState('')
    const [fields, setFields] = useState([])
    const [height, setHeight] = useState(0)
    const [foreignData, setForeignData] = useState([])
    const [showKey, setShowKey] = useState("")
    const { proxy, unique_string } = useSelector(state => state);
    const [relatedTable, setRelatedTable] = useState({})
    const [pk, setPK] = useState("");

    useEffect(() => {

        if (defaultValue !== undefined) {
            const key = isFieldForeign()
            if (key) {

                // fetch(`${proxy()}/apis/apis/table/data/${table_alias}`).then(res => res.json()).then(res => {/table/:table_id/data
                fetch(`${proxy()}/apis/table/${key.table_id}/data`).then(res => res.json()).then(res => {
                    const { success, data, fields } = res;
                    console.log(data)
                    setForeignData(data.data)
                    setFields(data.fields)

                    const { ref_field_id } = key;
                    const primaryField = fields.find(field => field.id == ref_field_id);
                    if (primaryField) {
                        setPK(primaryField.fomular_alias)
                    }
                })

            } else {
                setCurrent(defaultValue)
            }
        } else {

            const key = isFieldForeign()
            if (key) {
                if (foreignData.length == 0) {
                    fetch(`${proxy()}/apis/table/${key.table_id}/data`).then(res => res.json()).then(res => {
                        const { success, data, fields } = res;
                        console.log(data)
                        setForeignData(data.data)
                        setFields(data.fields)

                        const { ref_field_id } = key;
                        const primaryField = data.fields.find(field => field.id == ref_field_id);
                        if (primaryField) {
                            setPK(primaryField.fomular_alias)
                        }
                    })
                }
            }


        }

    }, [])


    const isFieldForeign = () => {
        if (table) {
            const { foreign_keys } = table;
            const key = foreign_keys.find(key => key.field_id == field.id)
            if (key) {
                return key
            }
        }
        return false
    }

    useEffect(() => {
        setCurrent(defaultValue)
    }, [defaultValue])


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

        if (fields.length > 0 && current) {
            let showFields = fields;
            const { display_fields } = relatedTable;

            if (display_fields && display_fields.length > 0) {
                showFields = display_fields;
                return showFields.map(f => data[f]).join(' - ')
            }

            return showFields.map(f => data[f.field_alias]).join(' - ')

        } else {
            return null
        }
    }

    const dataClickedTrigger = (data) => {
        setCurrent(data);
        changeTrigger(field, data[showKey])
    }

    if (!isFieldForeign()) {
        return (

            <div class="row justify-content-center">
                <div class="col-md-6">
                    <form>
                        <div class="form-group">
                            <label for="name">  {field.field_name}{!field.nullable && <span style={{ color: 'red' }}> *</span>}</label>
                            <input type="text"
                                className="form-control"
                                placeholder="" onChange={fieldChangeData} value={current}
                            />
                        </div>
                    </form>
                </div>
            </div>
        )
    } else {
        return (
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <form>
                        <div class="form-group">
                            <label for="name"> {field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                            <input type="text"
                                className="p-t-0-5 p-b-0-5 p-l-1 text-16-px block w-100-pct border-1"
                                placeholder="" onChange={fieldChangeData} defaultValue={generateData(current)}
                                onFocus={focusTrigger}
                                onBlur={blurTrigger}
                            />
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}