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
    const [pk, setPK] = useState(undefined);

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

                    setForeignData(data)
                    setFields(fields)

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
                                setForeignData([...data.filter(record => record !== undefined)]);
                                setFields(fields)
                                const { ref_field_id } = key;
                                console.log(key)
                                const primaryField = fields.find(field => field.id == ref_field_id);
                                if (primaryField) {
                                    console.log(primaryField)
                                    setPK(primaryField.fomular_alias)
                                }
                            })
                    }
                }
            }
        }
    }, [defaultValue])
    useEffect(() => {
    }, [pk])
    const [selectedValue, setSelectedValue] = useState(null);
    const [loadedRecordCount, setLoadedRecordCount] = useState(0);
    const [options, setOption] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);

    const loadOptions = async (search, loadedOptions, { page }) => {
        console.log(search);

        let dataBody = {
            table_id: corespondingKey.table_id,
            start_index: page
        };

        if (search && search.trim() !== "") {
            const criteria = {};
            criteria[pk] = search;
            dataBody.criteria = criteria;
        }

        console.log(dataBody);
        const response = await fetch(`${proxy()}/api/foreign/data`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(dataBody)
        });
        const res = await response.json();
        console.log(res);

        let returnedData = [];

        if (res.result) {
            returnedData = res.result;
        } else {
            returnedData = res.data;
        }

        console.log(returnedData)
        const dataWithoutNull = returnedData.filter(record => record !== null && record !== undefined);

        setForeignData(dataWithoutNull)

        setLoadedRecordCount(prevCount => prevCount + dataWithoutNull.length);


        let hasMoreValue;

        if (search && search.trim() !== "") {
            hasMoreValue = true;
        } else {
            hasMoreValue = loadedRecordCount + 17 < res.sumerize;
        }
        const options = dataWithoutNull.map(d => ({
            value: JSON.stringify(d),
            label: generateData(d)
        }));
        setOption(options)
        if (defaultValue) {
            const foundOption = options.find(option => option.value === JSON.stringify(defaultValue));
            if (foundOption) {
                setSelectedOption(foundOption);
            }
        }
        return {
            options: options,
            hasMore: hasMoreValue,
            additional: {
                page: page + 1,
            },
        };
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
        console.log(e.target.value)
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
        console.log(data)
        console.log(pk)
        if (pk && data) {
            return data[pk];
        }
        return null;
    }



    // const dataClickedTrigger = (data) => {
    //     setCurrent(data);
    //     changeTrigger(field, data[pk])
    // }


    const handleChange = option => {
        console.log("Before update: ", selectedValue);
        setSelectedValue(option);
        console.log("After update: ", selectedValue);


        fieldChangeData({ target: { value: option.value } }); // Continue with your original logic
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleScrollToBottom = () => {
        if (!isLoading) {
            setIsLoading(true);
            console.log("Reached bottom!");
            setStartIndex(prevIndex => prevIndex + 1);
        }
    };

    console.log(JSON.stringify(defaultValue))
    const [defaultOption, setDefaultOption] = useState(null);

    const [initialValue, setInitialValue] = useState(null);
    console.log(defaultOption)
    useEffect(() => {

        const fetchDataForDefaultValue = async () => {
            const { foreign_keys } = table;
            const corespondingKey = foreign_keys.find(key => key.field_id == field.id)
            if (corespondingKey) {
                const dataBody = {
                    table_id: corespondingKey.table_id,
                    start_index: 0,// Bắt đầu từ trang đầu tiên
                    require_count: false
                };

                const criteria = {};

                criteria[pk] = defaultValue;
                dataBody.criteria = criteria;
                console.log(290, dataBody)
                const response = await fetch(`${proxy()}/api/foreign/data`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(dataBody)
                });

                const res = await response.json();

                let returnedData = res.result || res.data;

                const foundData = returnedData.find(d => d != undefined && d[pk] === defaultValue);
                console.log(criteria)
                const label = generateData(foundData);
                console.log(label);

                if (foundData) {
                    const dataOption = {
                        value: JSON.stringify(foundData),
                        label: generateData(foundData)
                    };

                    setDefaultOption(dataOption);

                    if (!initialValue) {
                        setInitialValue(dataOption);
                        setSelectedValue(dataOption);
                    } else if (selectedValue && initialValue.value === selectedValue.value) {
                        setSelectedValue(dataOption);
                    }
                }
            }

        };
        if (current != undefined) {
            fetchDataForDefaultValue()
        }
    }, [defaultValue, pk]);
    console.log(pk)
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
            if (selectOption) {
                return (
                    <div class="row justify-content-center">
                        <div class="col-md-6">
                            <form>
                                <div class="form-group">
                                    <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>

                                    <AsyncPaginate
                                        // defaultOptions
                                        // key={ Math.random()}
                                        loadOptions={loadOptions}
                                        onChange={handleChange}
                                        isSearchable={true}
                                        value={selectedValue}
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
            } else {
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
                                    // defaultOptions
                                    // key={ Math.random()}
                                    loadOptions={loadOptions}
                                    onChange={handleChange}
                                    isSearchable={true}
                                    value={selectedValue}
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