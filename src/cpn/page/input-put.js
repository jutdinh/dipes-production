import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import {
    Varchar, Char, Text, Int,
    DateInput, TimeInput, DateTimeInput,
    Decimal, Bool, DataEmail, DataPhone

} from '../inputs';

export default () => {
    const dispatch = useDispatch();
    const { id_str } = useParams()
    const { project_id, version_id, url } = useParams();
    let navigate = useNavigate();
    const { proxy, pages, lang } = useSelector(state => state);
    const [api, setApi] = useState({})
    const [tables, setTables] = useState([])
    const [keyFields, setKeyFields] = useState([]);
    const [params, setParams] = useState([]);
    const [fields, setFields] = useState([]);
    const [errors, setErrors] = useState({});
    const [data, setData] = useState({});
    const [relatedTables, setRelatedTables] = useState([])
    const [page, setPage] = useState(null);
    const [initialData, setInitData] = useState({})
    const [dataFields, setDataFields] = useState([]);
    const [apiData, setApiData] = useState([])
    const [apiDataName, setApiDataName] = useState([])

    const [phoneError, setPhoneError] = useState(false);
    const handlePhoneError = (error) => {
        setPhoneError(error);
    };
    const [emailError, setEmailError] = useState(false);
    const handleEmailError = (error) => {
        setEmailError(error);
    };
    console.log(pages)



    const result = pages?.find(item => {
      
        const api_get_id = item.components?.[0]?.api_put.split('/')[2];
   
        return api_get_id === id_str;
    });
    console.log (result)

    const changeTrigger = (field, value) => {
        const newData = data;
        if (value === "true") {
            newData[field.fomular_alias] = true;
        } else if (value === "false") {
            newData[field.fomular_alias] = false;
        } else {
            newData[field.fomular_alias] = value;
        }
        setData(newData);
    }
    const nullCheck = () => {
        let valid = true;
        // for (let i = 0; i < fields.length; i++) {
        //     const field = fields[i];
        //     const { nullable, fomular_alias } = field;
        //     if (!nullable) {
        //         if (data[fomular_alias] == null || data[fomular_alias] == undefined || data[fomular_alias] == "") {
        //             valid = false
        //         }
        //     }
        // }
        return valid;
    }


    useEffect(() => {
        const url = window.location;
        const rawParams = url.pathname.split(`/${id_str}/`)[1];
        const paramsList = rawParams.split('/');
        console.log(rawParams)
        fetch(`${proxy()}/apis/api/${id_str}/input_info`).then(res => res.json())
            .then(res => {
                const { success, data } = res;
                console.log(res)
                if (success) {
                    // const { tables } = data.tables;
                    const apiFields = data.params;

                    apiFields.push(... data.body)
     

                   const serializeParams = apiFields.map((param, index) => {
                        const { fomular_alias } = param;    
                        return { fomular_alias, value: paramsList[index] }
                    })
                  
                    const keyFields = serializeParams.map(par => {
                        const field = apiFields.filter(f => f.fomular_alias == par.fomular_alias)[0]
                        return field;
                    })

                    setKeyFields(keyFields)
                    setParams(serializeParams);
                    setApi(data)
                    setFields(apiFields)
                    setTables(data.tables)
                    setRelatedTables(relatedTables)


                    fetch(`${proxy()}/apis/retrieve/${id_str}/${rawParams}`)
                        .then(res => res.json()).then(res => {
                            console.log(res);

                            const { data } = res;

                            let initData = data;
                            console.log(serializeParams)
                            for (let i = 0; i < params.length; i++) {
                                const { fomular_alias, value } = params[i]
                                const decodedString = decodeURIComponent(value);
                                initData = initData.filter(row => {
                                    return row[fomular_alias] == decodedString
                                })
                            }

                            if (initData[0]) {
                                const data = {};
                                apiFields.map(field => {
                                    const { fomular_alias } = field;
                                    data[fomular_alias] = initData[0][fomular_alias];
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

    console.log(fields)
    const submit = () => {
        const url = window.location;
        const rawParams = url.pathname.split(`/${id_str}/`)[1];
        const paramsList = rawParams.split('/');

        if (!emailError && !phoneError && nullCheck(data)) {
            fetch(`${proxy()}/api/${id_str}/${paramsList}`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },

                body: JSON.stringify({ ...data })

            }).then(res => res.json()).then(res => {
                const { success, data, fk, content } = res;
                console.log(res)
                const errors = [
                    "primaryConflict",
                    "foreignConflict",
                    "typeError"
                ]

                let valid = true;
                for (let i = 0; i < errors.length; i++) {
                    const isInValid = res[errors[i]]
                    if (isInValid) {
                        valid = false
                    }
                }
                console.log(`VALID: ${valid}`)
                if (valid) {
                    Swal.fire({
                        title: "Thành công!",
                        text: content,
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500
                    }).then(function () {
                        // window.location.reload();
                    });
                } else {
                    Swal.fire({
                        title: "Thất bại!",
                        text: content,
                        icon: "error",
                        showConfirmButton: true,

                    }).then(function () {
                        // Không cần reload trang
                    });
                }
            })



        } else {
            if (emailError) {
                // al.failure("Lỗi", "Địa chỉ email không hợp lệ");
            } else if (phoneError) {
                // al.failure("Lỗi", "Số điện thoại không hợp lệ");
            } else {
                // al.failure("Lỗi", "Một số trường vi phạm ràng buộc NOT NULL");
            }
        }
    };


    return (

        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h4>Quản lý dữ liệu</h4>
                        </div>
                    </div>
                </div>
                {/* List table */}
                <div class="row">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head d-flex">
                                <div class="heading1 margin_0 ">
                                    {/* <h5> <a onClick={() => navigate(-1)}><i class="fa fa-chevron-circle-left mr-3"></i></a>{page?.components?.[0]?.component_name}</h5> */}

                                    <h5> <a onClick={() => navigate(-1)}><i class="fa fa-chevron-circle-left mr-3"></i></a>{result?.title} &gt;&gt; Cập nhật</h5>
                                </div>
                                {/* <div class="ml-auto">
                                <i class="fa fa-newspaper-o icon-ui"></i>
                            </div> */}
                            </div>
                            <div class="table_section padding_infor_info">
                                <div class="row column1">
                                    <div class="form-group col-lg-4">
                                        {/* <label class="font-weight-bold">Tên bảng <span className='red_star'>*</span></label>
                                            <input type="text" class="form-control" 
                                             placeholder="" /> */}
                                    </div>
                                    <div class="col-md-12 col-lg-12">
                                        <div class="d-flex align-items-center mb-1">
                                            {/* <p class="font-weight-bold">Danh sách bảng </p> */}
                                            {/* <button type="button" class="btn btn-primary custom-buttonadd ml-auto" data-toggle="modal" data-target="#addTable">
                                            <i class="fa fa-plus"></i>
                                        </button> */}

                                        </div>

                                    </div>
                                    <div class="col-md-12">
                                        <div className="w-50-pct mg-auto p-1 bg-white">
                                            <span className="block text-32-px text-center p-0-5">{api.api_name}</span>
                                            {fields.map(field =>
                                                <div key={field.field_id}>

                                                    {field.DATATYPE == "PHONE" ?
                                                        <DataPhone
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger}
                                                            onPhoneError={handlePhoneError} defaultValue={initialData[field.fomular_alias]}
                                                        /> : null
                                                    }
                                                    {field.DATATYPE == "VARCHAR" ?
                                                        <Varchar
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                        /> : null
                                                    }
                                                    {field.DATATYPE == "CHAR" ?
                                                        <Char
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                        /> : null
                                                    }
                                                    {field.DATATYPE == "TEXT" ?
                                                        <Text
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                        /> : null
                                                    }
                                                    {field.DATATYPE == "INT" || field.data_type == "BIG INT" ?
                                                        <Int
                                                            table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                            field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                        /> : null
                                                    }
                                                    {field.DATATYPE == "INT UNSIGNED" || field.data_type == "BIG INT UNSIGNED" ?
                                                        <Int
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} unsigned={true} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                        /> : null
                                                    }
                                                    {field.DATATYPE == "DATE" ?
                                                        <DateInput
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                        /> : null
                                                    }
                                                    {field.DATATYPE == "EMAIL" ?
                                                        <DataEmail
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger}
                                                            onEmailError={handleEmailError} defaultValue={initialData[field.fomular_alias]}
                                                        /> : null
                                                    }
                                                    {field.DATATYPE == "TIME" ?
                                                        <TimeInput
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                        /> : null
                                                    }
                                                    {field.DATATYPE == "DATETIME" ?
                                                        <DateTimeInput
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                        /> : null
                                                    }
                                                    {field.DATATYPE == "DECIMAL" ?
                                                        <Decimal
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                        /> : null
                                                    }
                                                    {field.DATATYPE == "DECIMAL UNSIGNED" ?
                                                        <Decimal
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} unsigned={true} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                        /> : null
                                                    }
                                                    {field.DATATYPE == "BOOL" ?
                                                        <Bool
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                        /> : null
                                                    }
                                                </div>
                                            )}
                                            {/* <div className="m-t-1">
                                                <div className="p-1">
                                                    <div className="button-wrapper">
                                                        <button onClick={submit} className="w-max-content p-0-5 p-l-1 p-r-1 shadow-blur shadow-hover bg-theme-color no-border block text-16-px white pointer shadow-blur shadow-hover">Lưu lại</button>
                                                    </div>
                                                    <div className="button-wrapper">
                                                        <button  className="w-max-content p-0-5 p-l-1 p-r-1 shadow-blur shadow-hover bg-theme-color no-border block text-16-px white pointer shadow-blur shadow-hover">Quay về</button>
                                                    </div>
                                                </div>
                                            </div> */}


                                            <div class="row justify-content-center">
                                                <div class="col-md-6">
                                                    <div class="mt-2 d-flex justify-content-end">
                                                        <button type="button" onClick={submit} class="btn btn-success mr-2">{lang["btn.update"]}</button>
                                                        <button type="button" onClick={() => navigate(-1)} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                                                    </div>
                                                </div>
                                            </div>


                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}