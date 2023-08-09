import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
const SAMPLE_DATA = [
    { id: 1, name: "Data 1" },
    { id: 2, name: "Data 2" },
    { id: 3, name: "Data 3" },
    //... thêm nhiều dữ liệu khác theo nhu cầu của bạn
];

export default (props) => {
    const { field, changeTrigger, related, table, defaultValue, selectOption } = props;

    const [current, setCurrent] = useState(defaultValue ? defaultValue : "")
    const [fields, setFields] = useState([])
    const [height, setHeight] = useState(0)
    const [foreignData, setForeignData] = useState([]);

    const [showKey, setShowKey] = useState("")
    const { proxy, unique_string } = useSelector(state => state);
    const [relatedTable, setRelatedTable] = useState({})
    const [pk, setPK] = useState("");
   

    // console.log(table)
    // console.log("data field",field.id)
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    const filteredData =1

    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };
    const handleInputClick = (e) => {
        e.stopPropagation();
    };

    useEffect(() => {
        if (defaultValue !== undefined) {
            const key = isFieldForeign()
            if (key) {

                // fetch(`${proxy()}/apis/apis/table/data/${table_alias}`).then(res => res.json()).then(res => {/table/:table_id/data
                fetch(`${proxy()}/apis/table/${key.table_id}/data`)

                    .then(res => res.json())

                    .then(res => {
                        const { success, data, fields } = res.data;
                        // console.log(res.data)
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
                const dataBody = {
                    table_id: 41,
                    start_index: 0,
                    criteria: {
                    }
                }
                console.log(dataBody)
                fetch(`${proxy()}/api/foreign/data`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",

                    },
                    body: JSON.stringify(dataBody)

                }).then(res => res.json()).then(res => {
                    const { success, data, fields,  sumerize, statistic } = res;
                    console.log(res)
                    setCurrent(data)
                    changeTrigger(field, data)
                })
            } else {
                const key = isFieldForeign()
                if (key) {
                    if (foreignData.length == 0) {
                        const dataBody = {
                            table_id: 41,
                            start_index: 0,
                            criteria: {
        
                            }
                        }
                        console.log(dataBody)
                        fetch(`${proxy()}/api/foreign/data`, {
                            method: "POST",
                            headers: {
                                "content-type": "application/json",

                            },
                            body: JSON.stringify(dataBody)

                        }).then(res => res.json())
                            .then(res => {
                                const { success, data, fields,  sumerize, statistic } = res;
                                console.log(res)
                                setForeignData(data)
                                setFields(fields)

                                const { ref_field_id } = key;
                                const primaryField = fields.find(field => field.id == ref_field_id);
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
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <form>
                            <div className="form-group">
                                <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                                <div className="custom-dropdown" onClick={toggleDropdown}>
                                    {generateData(current) || "Chọn"}
                                    {isOpen && (
                                        <div className="dropdown-list">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search..."
                                                value={searchTerm}
                                                onClick={handleInputClick}
                                                onChange={handleSearchChange}
                                            />
                                            {filteredData && filteredData.length > 0 && filteredData.map((d, index) =>
                                                <div
                                                    key={index}
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        setCurrent(d);
                                                        changeTrigger(field, d[pk]);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    {generateData(d)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
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
                                <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                                <div className="custom-dropdown" onClick={toggleDropdown}>
                                    {generateData(current) || "Chọn"}
                                    {isOpen && (
                                        <div className="dropdown-list">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search..."
                                                value={searchTerm}
                                                onClick={handleInputClick}
                                                onChange={handleSearchChange}
                                            />
                                            {filteredData && filteredData.length > 0 && filteredData.map((d, index) =>
                                                <div
                                                    key={index}
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        setCurrent(d);
                                                        changeTrigger(field, d[pk]);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    {generateData(d)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )

        }
    }

}