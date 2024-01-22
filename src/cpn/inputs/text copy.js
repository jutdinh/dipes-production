import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AsyncPaginate } from 'react-select-async-paginate';

export default (props) => {

    const { field, changeTrigger, related, table, defaultValue, selectOption } = props;
    console.log(8, props)
    const [current, setCurrent] = useState('')
    const { proxy, unique_string, lang } = useSelector(state => state);
    const [textError, settextError] = useState(false);
    const validateVarchar = (varchar) => {
        return varchar.length <= 65535;
    };
    const _token = localStorage.getItem("_token");
    const [foreignData, setForeignData] = useState([])
    const [showKey, setShowKey] = useState("")

    const [relatedTable, setRelatedTable] = useState({})
    const [pk, setPK] = useState(undefined);

    // console.log("data field",field.id)
    const [startIndex, setStartIndex] = useState(0);

    const { foreign_keys } = table;
    const corespondingKey = foreign_keys.find(key => key.field_id == field.id)




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
        const { value } = e.target
        setCurrent(value)
        if (validateVarchar(value) || value === '') {
            settextError(false);
            changeTrigger(field, value);
        } else {
            settextError(true);
        }

    }

    // useEffect(() => {
    //     setCurrent(defaultValue)
    // }, [defaultValue])
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
                    criteria: {},
                    exact: true
                };

                // console.log(dataBody)
                fetch(`${proxy()}/api/foreign/data`, {
                    method: "POST",
                    headers: {
                        Authorization: _token,
                        "content-type": "application/json",

                    },
                    body: JSON.stringify(dataBody)

                }).then(res => res.json()).then(res => {
                    const { success, data, fields, sumerize, statistic } = res;
                    // console.log(res)

                    setForeignData(data)
                    // setFields(fields)

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

                        // console.log(69, dataBody)
                        fetch(`${proxy()}/api/foreign/data`, {
                            method: "POST",
                            headers: {
                                Authorization: _token,
                                "content-type": "application/json",

                            },
                            body: JSON.stringify(dataBody)

                        }).then(res => res.json())
                            .then(res => {
                                const { success, data, fields, sumerize, statistic } = res;
                                // console.log(82, res)
                                setForeignData([...data.filter(record => record !== undefined)]);
                                // setFields(fields)
                                const { ref_field_id } = key;
                                // console.log(key)
                                const primaryField = fields.find(field => field.id == ref_field_id);
                                if (primaryField) {
                                    // console.log(primaryField)
                                    setPK(primaryField.fomular_alias)
                                }
                            })
                    }
                }
            }
        }
    }, [defaultValue])
    const generateData = (data) => {

        if (pk && data) {
            return data[pk];
        }
        return null;
    }

    const handleChange = option => {
        // console.log("Before update: ", selectedValue);
        setSelectedValue(option);
        // console.log("After update: ", selectedValue);
        fieldChangeData({ target: { value: option.value } });
    };
    const [selectedValue, setSelectedValue] = useState(null);
    const [loadedRecordCount, setLoadedRecordCount] = useState(0);
    const [options, setOption] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);

    const loadOptions = async (search, loadedOptions, { page }) => {
        // console.log(search);

        let dataBody = {
            table_id: corespondingKey.table_id,
            start_index: page,

        };

        if (search && search.trim() !== "") {
            const criteria = {};
            criteria[pk] = search;
            dataBody.criteria = criteria;
        }

        // console.log(dataBody);
        const response = await fetch(`${proxy()}/api/foreign/data`, {
            method: "POST",
            headers: {
                Authorization: _token,
                "content-type": "application/json",
            },
            body: JSON.stringify(dataBody)
        });
        const res = await response.json();
        // console.log(res);


        const returnedData = res.data;


        console.log(returnedData)
        const dataWithoutNull = returnedData.filter(record => record !== null && record !== undefined);

        setForeignData(dataWithoutNull)

        setLoadedRecordCount(prevCount => prevCount + dataWithoutNull.length);


        let hasMoreValue;



        if (dataWithoutNull.length === 0) {
            hasMoreValue = false;
        } else if (search && search.trim() !== "") {
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
                page: hasMoreValue ? page + 1 : page
            },
        };
    }




    if (isPrimaryKey()) {
        if (!isFieldForeign()) {
            if (selectOption) {
                return (
                    <div class="row justify-content-center">
                        <div class="form-group col-md-6">
                            <form>
                                <div class="form-group">
                                    <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label> <br></br>
                                    <textarea type="text"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();

                                            }
                                        }}
                                        className="form-control"
                                        value={current}
                                        placeholder="" onChange={fieldChangeData}
                                    />
                                    {textError && (
                                        <div className="rel">
                                            <div className="abs">
                                                <span className="block crimson mb-2 text-14-px " style={{ color: 'red' }}>
                                                    {lang["char error"]}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </form>
                        </div>
                    </div>
                )

            } else {
                return (
                    <div class="row justify-content-center">
                        <div class="form-group col-md-6">
                            <form>
                                <div class="form-group">
                                    <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label> <br></br>
                                    {/* <textarea disabled type="text"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();

                                            }
                                        }}
                                        className="form-control"
                                        value={current}
                                        placeholder="" onChange={fieldChangeData}
                                    /> */}

                                    <AsyncPaginate
                                        loadOptions={loadOptions}
                                        onChange={handleChange}
                                        isSearchable={true}
                                        value={selectedValue}
                                        styles={{
                                            menuList: base => ({
                                                ...base,
                                                maxHeight: '300px'
                                            })
                                        }}
                                        additional={{
                                            page: 0,
                                        }}
                                        allowCreateWhileLoading={false} // Không cho phép tạo mới khi đang tải dữ liệu
                                    />
                                    {textError && (
                                        <div className="rel">
                                            <div className="abs">
                                                <span className="block crimson mb-2 text-14-px " style={{ color: 'red' }}>
                                                    {lang["char error"]}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </form>
                        </div>
                    </div>
                )

            }

        }
        else {
            if (selectOption) {
                return (
                    <div class="row justify-content-center">
                        <div class="form-group col-md-6">
                            <form>
                                <div class="form-group">
                                    <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label> <br></br>
                                    {/* <textarea type="text"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();

                                            }
                                        }}
                                        className="form-control"
                                        value={current}
                                        placeholder="" onChange={fieldChangeData}
                                    /> */}

                                    {textError && (
                                        <div className="rel">
                                            <div className="abs">
                                                <span className="block crimson mb-2 text-14-px " style={{ color: 'red' }}>
                                                    {lang["char error"]}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </form>
                        </div>
                    </div>
                )
            } else {
                return (
                    <div class="row justify-content-center">
                        <div class="form-group col-md-6">
                            <form>
                                <div class="form-group">
                                    <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label> <br></br>
                                    <textarea disabled type="text"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();

                                            }
                                        }}
                                        className="form-control"
                                        value={current}
                                        placeholder="" onChange={fieldChangeData}
                                    />
                                    {textError && (
                                        <div className="rel">
                                            <div className="abs">
                                                <span className="block crimson mb-2 text-14-px " style={{ color: 'red' }}>
                                                    {lang["char error"]}
                                                </span>
                                            </div>
                                        </div>
                                    )}
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
                    <div class="form-group col-md-6">
                        <form>
                            <div class="form-group">
                                <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label> <br></br>
                                <textarea type="text" rows="1"
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();

                                    }
                                }}
                                className="form-control"
                                value={current}
                                placeholder="" onChange={fieldChangeData}
                            />


                              
                                {textError && (
                                    <div className="rel">
                                        <div className="abs">
                                            <span className="block crimson mb-2 text-14-px " style={{ color: 'red' }}>
                                                {lang["char error"]}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </form>
                    </div>
                </div>
            )
        }else {
            return (
                <div class="row justify-content-center">
                    <div class="form-group col-md-6">
                        <form>
                            <div class="form-group">
                                <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label> <br></br>
                                {/* <textarea type="text" rows="1"
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();

                                    }
                                }}
                                className="form-control"
                                value={current}
                                placeholder="" onChange={fieldChangeData}
                            /> */}


                                <AsyncPaginate
                                    loadOptions={loadOptions}
                                    onChange={handleChange}
                                    isSearchable={true}
                                    value={selectedValue}
                                    styles={{
                                        menuList: base => ({
                                            ...base,
                                            maxHeight: '300px'
                                        })
                                    }}
                                    additional={{
                                        page: 0,
                                    }}
                                    allowCreateWhileLoading={false} // Không cho phép tạo mới khi đang tải dữ liệu
                                />
                                {textError && (
                                    <div className="rel">
                                        <div className="abs">
                                            <span className="block crimson mb-2 text-14-px " style={{ color: 'red' }}>
                                                {lang["char error"]}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </form>
                    </div>
                </div>
            )
        }
    }

}