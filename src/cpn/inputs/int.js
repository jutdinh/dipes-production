import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import $ from 'jquery';
import Select from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';




export default (props) => {
    const { field, changeTrigger, related, table, defaultValue, selectOption } = props;
    const selectRef = useRef(null);

    const [current, setCurrent] = useState(defaultValue ? defaultValue : "")
    const [fields, setFields] = useState([])
    const [height, setHeight] = useState(0)
    const [foreignData, setForeignData] = useState([])
    const [showKey, setShowKey] = useState("")
    const { proxy, unique_string } = useSelector(state => state);
    const [relatedTable, setRelatedTable] = useState({})
    const [pk, setPK] = useState("");
    console.log(pk)
    // console.log("data field",field.id)
    const [startIndex, setStartIndex] = useState(0);

    const { foreign_keys } = table;
    const corespondingKey = foreign_keys.find(key => key.field_id == field.id)

    console.log(startIndex)
    useEffect(() => {
        const key = isFieldForeign()
        const { foreign_keys } = table;
        const corespondingKey = foreign_keys.find(key => key.field_id == field.id)
        if (defaultValue !== undefined) {
            if (key) {
                // fetch(`${proxy()}/apis/apis/table/data/${table_alias}`).then(res => res.json()).then(res => {/table/:table_id/data
                const dataBody = {
                    table_id: corespondingKey.table_id,
                    start_index: startIndex,
                    criteria: {}
                };

                console.log(dataBody)
                fetch(`${proxy()}/api/foreign/data`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",

                    },
                    body: JSON.stringify(dataBody)

                }).then(res => res.json()).then(res => {
                    const { success, data, fields, sumerize, statistic } = res;
                    console.log(res)
                    setCurrent(data)
                    changeTrigger(field, data)
                })

            } else {
                setCurrent(defaultValue)
            }
        } else {
            if (!isFieldForeign() && field.AUTO_INCREMENT) {
                fetch(`${proxy()}/apis/field/autoid/${field.id}`)
                    .then(res => res.json()).then(res => {
                        const { data } = res;
                        // console.log(data.id)
                        setCurrent(data.id)
                        changeTrigger(field, data.id)
                    })
            } else {
                const key = isFieldForeign()
                if (key) {
                    if (foreignData.length == 0) {
                        const dataBody = {
                            table_id: corespondingKey.table_id,
                            start_index: startIndex,
                            criteria: {}
                        };

                        console.log(69, dataBody)
                        fetch(`${proxy()}/api/foreign/data`, {
                            method: "POST",
                            headers: {
                                "content-type": "application/json",

                            },
                            body: JSON.stringify(dataBody)

                        }).then(res => res.json())
                            .then(res => {
                                const { success, data, fields, sumerize, statistic } = res;
                                console.log(82, res)
                                if (data.length === 0) {
                                    setHasMoreData(false);
                                } else {
                                    // setForeignData(prevData => [...prevData, ...data.filter(record => record !== undefined)]);
                                    setFields(fields)
                                }

                                const { ref_field_id } = key;
                                console.log(key)
                                const primaryField = fields.find(field => field.id == ref_field_id);
                                console.log(primaryField)
                                if (primaryField) {
                                    setPK(primaryField.fomular_alias)
                                }
                            })
                    }
                }

            }
        }
    }, [defaultValue])

    useEffect(() => {

    }, [])

    const [hasMoreData, setHasMoreData] = useState(true);




    const loadOptions = async (search, loadedOptions, { page }) => {
        console.log(search)

        const query = {}
        query[pk] = search
        const dataBody = {
            table_id: corespondingKey.table_id,
            start_index: page,
            query
        };

        console.log(dataBody)
        const response = await fetch(`${proxy()}/api/foreign/data`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(dataBody)
        });
        const res = await response.json();
        console.log(res)
        if (res.result.length === 0) {
            return {
                options: options,
                hasMore: false,
                additional: {
                    page: page + 1,
                },
            };

        }

        setForeignData([...res.data.filter(record => record !== undefined)]);
        if (res.data.includes(null)) {
            return {
                options: options,
                hasMore: false,
                additional: {
                    page: page + 1,
                },
            };
        } else {
            return {
                options: options,
                hasMore: true,
                additional: {
                    page: page + 1,
                },
            };
        }





    }
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
    console.log(foreignData)
    const isPrimaryKey = () => {
        if (table) {
            const { primary_key } = table;
            const key = primary_key.find(key => key == field.id)
            if (key) {
                return key
            }
        }
        return false
    }

    const fieldChangeData = (e) => {
        const rawJSON = e.target.value
        const value = JSON.parse(rawJSON)

        setCurrent(value[pk])
        changeTrigger(field, value[pk])
    }

    const changeRawData = (e) => {
        const { value } = e.target
        setCurrent(value)
        changeTrigger(field, value)
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
        // }c        
        if (data) {
            return data[pk]
        }
        return null
    }

    // const dataClickedTrigger = (data) => {
    //     setCurrent(data);
    //     changeTrigger(field, data[pk])
    // }

    const options = foreignData.map(d => ({
        value: JSON.stringify(d),
        label: generateData(d)
    }));

    const handleChange = option => {
        fieldChangeData({ target: { value: option.value } });
    };
    const [isLoading, setIsLoading] = useState(false);

    const handleScrollToBottom = () => {
        if (!isLoading) {
            setIsLoading(true);
            console.log("Reached bottom!");
            setStartIndex(prevIndex => prevIndex + 1);
        }
    };



    if (isPrimaryKey()) {

        if (!isFieldForeign()) {

            return (
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <form>
                            <div class="form-group">
                                <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                                <input
                                    type={field.AUTO_INCREMENT ? "text" : "number"}
                                    className="form-control"
                                    placeholder=""
                                    onChange={changeRawData}
                                    defaultValue={defaultValue == undefined ? current : defaultValue}
                                    readOnly={field.AUTO_INCREMENT ? true : false}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            )
        }
        else {
            return (
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <form>
                            <div class="form-group">
                                <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                                <select className="form-control" name="role" onChange={fieldChangeData} value={generateData(current)}>
                                    {selectOption ? (
                                        <option value={""} >Chọn</option>
                                    ) : null
                                    }

                                    {foreignData && foreignData.length > 0 && foreignData.map((d, index) =>
                                        <option value={JSON.stringify(d)} selected={d[pk] == defaultValue ? true : false} >
                                            <div key={index} className="form-control" >
                                                <span>{generateData(d)}</span>
                                            </div>
                                        </option>
                                    )}
                                </select>
                            </div>
                        </form>
                    </div>
                </div>
            )
        }

    } else {

        if (!isFieldForeign()) {
            return (
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <form>
                            <div class="form-group">
                                <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                                <input
                                    type={field.AUTO_INCREMENT ? "text" : "number"}
                                    className="form-control"
                                    placeholder=""
                                    onChange={changeRawData}
                                    value={current}
                                // readOnly={field.AUTO_INCREMENT ? true : false}
                                />

                            </div>
                        </form>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <form>
                            <div className="form-group">
                                <label>{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                                <AsyncPaginate
                                    defaultOptions
                                    loadOptions={loadOptions}
                                    onChange={handleChange}
                                    isSearchable={true}
                                    value={options.find(option => option.value === JSON.stringify(current))}
                                    styles={{
                                        menuList: base => ({
                                            ...base,
                                            maxHeight: '250px'
                                        })
                                    }}
                                    additional={{
                                        page: 0,
                                    }}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            );

        }
    }

}