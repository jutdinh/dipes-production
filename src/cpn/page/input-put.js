import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

import {
    Varchar, Char, Text, Int,
    DateInput, TimeInput, DateTimeInput,
    Decimal, Bool, DataPhone, DataEmail
} from '../inputs';

export default () => {
    const dispatch = useDispatch();

    const { id_str } = useParams()

    let navigate = useNavigate();
 
    const {  proxy,  pages } = useSelector(state => state);

    const [initialData, setInitData] = useState({})
    const [page, setPage] = useState({})
    const [api, setApi] = useState({})
    const [tables, setTables] = useState([])
    const [keyFields, setKeyFields] = useState([]);
    const [fields, setFields] = useState([]);
    const [data, setData] = useState({});
    const [relatedTables, setRelatedTables] = useState([])

    const [params, setParams] = useState([]);




    useEffect(() => {
        const page = pages.filter(pag => {
            const post = pag.apis.put;
            const page_id_str = post.split('/')[4];
            return page_id_str == id_str;
        })[0];
        // console.log(page)
        if (page != undefined) {
            setPage(page)
            const { param } = page;
            // modifyPageParam(param)
        }
    }, [pages])

    // const handleClick = () => {
    //     history.back();
    // };
    const nullCheck = () => {
        console.log(data)
        let valid = true;
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            const { nullable, field_alias, field_name } = field;
            if (!nullable) {
                console.log( field_name, data[field_alias] )
                if (data[field_alias] === null || data[field_alias] === undefined || data[field_alias] === "") {
                    valid = false
                }
            }
        }
        return valid;
    }
    const [phoneError, setPhoneError] = useState(false);
    const handlePhoneError = (error) => {
        setPhoneError(error);
    };
    const [emailError, setEmailError] = useState(false);
    const handleEmailError = (error) => {
        setEmailError(error);
    };
    useEffect(() => {
        const url = window.location;
        const rawParams = url.pathname.split(`/${id_str}/`)[1];
        const paramsList = rawParams.split('/');
      
        fetch(`${proxy()}/api/apis/api/input/info/${id_str}`).then(res => res.json())
            .then(res => {
                const { success, api, relatedTables, fields } = res;
                if (success) {
                    const { tables } = api;
                    const apiFields = api.fields;
                    delete api.fields;
                    delete api.tables;

                    const serializeParams = api.params.map((param, index) => {
                        const { field_alias } = param;
                        return { field_alias, value: paramsList[index] }
                    })

                    const keyFields = serializeParams.map(par => {
                        const field = fields.filter(f => f.field_alias == par.field_alias)[0]
                        return field;
                    })

                    setKeyFields(keyFields)
                    setParams(serializeParams);
                    setApi(api)
                    setFields(apiFields)
                    setTables(tables)
                    setRelatedTables(relatedTables)


                    fetch(`${proxy()}/api/apis/retrive/put/data/${id_str}`)
                        .then(res => res.json()).then(res => {
                            const { data } = res;
                            
                            let initData = data;
                            // console.log(serializeParams)
                            for (let i = 0; i < serializeParams.length; i++) {
                                const { field_alias, value } = serializeParams[i]
                                const decodedString = decodeURIComponent(value);
                                initData = initData.filter(row => {
                                    return row[field_alias] == decodedString
                                })
                            }
                            
                            if (initData[0]) {
                                const data = {};
                                apiFields.map(field => {
                                    const { field_alias } = field;
                                    data[field_alias] = initData[0][field_alias];
                                })
                                setInitData(initData[0] ? initData[0] : {});
                                setData(data)
                            }
                        })

                } else {
                    // al.failure("Lỗi", "API này không tồn tại hoặc đã bị vô hiệu")
                }
            })
    }, [])

    const changeTrigger = (field, value) => {
        const newData = data;
        newData[field.field_alias] = value;
        setData(newData)
    }

    const paramsConcat = () => {
        const values = params.map(par => {
            const { field_name, value } = par;
            if (value) {
                return value
            }
            else {
                return field_name.replaceAll(' ', '_')
            }
        })
        return values.join('/')
    }

    const submit = () => {
        if (!emailError && !phoneError && nullCheck(data)) {
            fetch(`${proxy()}${api.url.url}${window.location.pathname.split(`/${id_str}/`)[1]}`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ data })
            }).then(res => res.json()).then(res => {
                const { success, content } = res;
                if (success) {
                    // al.success("Thành công", "Cập nhật dữ liệu thành công")
                } else {
                    // al.failure("Oops!", data)
                }
            })
        }
        else {
            if (emailError) {
                // al.failure("Thất bại", "Địa chỉ email không hợp lệ");
            } else if (phoneError) {
                // al.failure("Thất bại", "Số điện thoại không hợp lệ");
            } else {
                // al.failure("Thất bại", "Một số trường vi phạm ràng buộc NOT NULL");
            }
        }
    }
    return (
        <div className="fixed-default fullscreen main-bg overflow flex flex-no-wrap">
           

            <div id="app-container" className={`app fixed-default overflow `} style={{ height: "100vh" }}>
               
                <div className="p-1" id="app-scrollBox">
                    <div className="p-1 min-height-full-screen column">
                        <div className="w-100-pct">
                            <div className="flex flex-no-wrap bg-white shadow-blur">
                                <div className="fill-available p-1">
                                <span> {page.title} &gt;&gt; Cập nhật</span>
                                </div>
                                <div className="w-48-px flex flex-middle">
                                    <div className="w-72-px pointer order-0">
                                        {/* <div className="block p-1" onClick={() => { navTrigger() }}> */}
                                        <div className="block p-1">
                                            <span className="block w-24-px border-3-top" style={{ marginTop: "4px" }} />
                                            <span className="block w-24-px border-3-top" style={{ marginTop: "4px" }} />
                                            <span className="block w-24-px border-3-top" style={{ marginTop: "4px" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="m-t-0-5 fill-available bg-white shadow-blur">
                            <div className="w-100-pct h-fit column p-1">
                                <div className="flex flex-no-wrap border-1-bottom">
                                    <span className="p-0-5 text-16-px block fill-available no-border"></span>
                                    <div className="flex flex-no-wrap flex-aligned">
                                        <div className=" w-48-px">
                                            <img className="w-28-px block mg-auto" src="/assets/icon/viewmode/grid.png" />
                                        </div>
                                    </div>
                                </div>
                                <div className="w-100-pct m-t-1">
                                    {/* VERSION INFO */}
                                    {tables.length > 0 ?
                                        <div className="w-50-pct mg-auto p-1 bg-white">
                                            {/* <span className="block text-32-px text-center p-0-5">{api.api_name}</span> */}
                                            {keyFields.map(field =>
                                                <div className="w-100-pct p-1 m-t-1">
                                                    <div>
                                                        <span className="block text-16-px">{field.field_name}</span>
                                                    </div>
                                                    <div className="m-t-0-5">
                                                        <input type="text" value={initialData[field.field_alias]}
                                                            className="p-t-0-5 p-b-0-5 p-l-1 text-16-px block w-100-pct border-1"
                                                            placeholder=""
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {fields.map(field =>
                                                <React.StrictMode key={field.field_id}>
                                                    {field.data_type == "PHONE" ?
                                                        <DataPhone
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} onPhoneError={handlePhoneError} defaultValue={initialData[field.field_alias]} /> : null
                                                    }
                                                    {field.data_type == "EMAIL" ?
                                                        <DataEmail
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} onEmailError={handleEmailError} defaultValue={initialData[field.field_alias]} /> : null
                                                    }
                                                    {field.data_type == "VARCHAR" ?
                                                        <Varchar
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.field_alias]} /> : null
                                                    }
                                                    {field.data_type == "CHAR" ?
                                                        <Char
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.field_alias]} /> : null
                                                    }
                                                    {field.data_type == "TEXT" ?
                                                        <Text
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.field_alias]} /> : null
                                                    }
                                                    {field.data_type == "INT" || field.data_type == "BIG INT" ?
                                                        <Int
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.field_alias]} /> : null
                                                    }
                                                    {field.data_type == "INT UNSIGNED" || field.data_type == "BIG INT UNSIGNED" ?
                                                        <Int
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} unsigned={true} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.field_alias]} /> : null
                                                    }
                                                    {field.data_type == "DATE" ?
                                                        <DateInput
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.field_alias]} /> : null
                                                    }
                                                    {field.data_type == "TIME" ?
                                                        <TimeInput
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.field_alias]} /> : null
                                                    }
                                                    {field.data_type == "DATETIME" ?
                                                        <DateTimeInput
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.field_alias]} /> : null
                                                    }
                                                    {field.data_type == "DECIMAL" ?
                                                        <Decimal
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.field_alias]} /> : null
                                                    }
                                                    {field.data_type == "DECIMAL UNSIGNED" ?
                                                        <Decimal
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} unsigned={true} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.field_alias]} /> : null
                                                    }
                                                    {field.data_type == "BOOL" ?
                                                        <Bool
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.field_alias]} /> : null
                                                    }
                                                </React.StrictMode>
                                            )}
                                            <div className="m-t-1">
                                                <div className="p-1">
                                                    <div className="button-wrapper">
                                                        <button onClick={submit} className="w-max-content p-0-5 p-l-1 p-r-1 shadow-blur shadow-hover bg-theme-color no-border block text-16-px white pointer shadow-blur shadow-hover">Lưu lại</button>
                                                
                                                    </div>
                                                    <div className="button-wrapper">
                                                        <button  className="w-max-content p-0-5 p-l-1 p-r-1 shadow-blur shadow-hover bg-theme-color no-border block text-16-px white pointer shadow-blur shadow-hover">Quay về</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}