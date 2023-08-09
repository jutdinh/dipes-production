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
    const { proxy, pages, lang, functions } = useSelector(state => state);
    const [api, setApi] = useState({})
    const [tables, setTables] = useState([])
    const [fields, setFields] = useState([]);
    const [errors, setErrors] = useState({});
    const [data, setData] = useState({});
    const [relatedTables, setRelatedTables] = useState([])
    const [page, setPage] = useState(null);


    const [phoneError, setPhoneError] = useState(false);
    const handlePhoneError = (error) => {
        setPhoneError(error);
    };
    const [emailError, setEmailError] = useState(false);
    const handleEmailError = (error) => {
        setEmailError(error);
    };
    // console.log(pages)

    useEffect(() => {

        fetch(`${proxy()}/apis/api/${id_str}/input_info`).then(res => res.json())
            .then(res => {
                const { success, api, relatedTables, data } = res;

                if (success) {
                    setFields(data.body)
                    setTables(data.tables)
                } else {
                    // al.failure("Lỗi", "Không thực hiện được chức năng này")
                }
            })
    }, [pages])
    console.log(fields)
    const result = pages?.find(item => {
        // Lấy id từ api_get
        const api_get_id = item.components?.[0]?.api_post.split('/')[2];
        // console.log(api_get_id)
        // So sánh với id_str
        return api_get_id === id_str;
    });
    // console.log (result)

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
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            const { NULL, fomular_alias } = field;
            if (!NULL) {
                if (data[fomular_alias] == null || data[fomular_alias] == undefined || data[fomular_alias] === "") {
                    valid = false
                }
            }
        }
        return valid;
    }






    const submit = () => {

        console.log({...data})
        if (!emailError && !phoneError && nullCheck(data)) {
            fetch(`${proxy()}${result?.components?.[0]?.api_post}`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },

                body: JSON.stringify({ ...data })

            }).then(res => res.json()).then(res => {
                const { success, data, fk, content } = res;
                // console.log(res)
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
                // console.log(`VALID: ${valid}`)
                if (valid) {
                    Swal.fire({
                        title: lang["success"],
                        text: lang["success.add"],
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500
                    }).then(function () {
                        window.location.reload();
                    });
                } else {
                    Swal.fire({
                        title: lang["faild"],
                        text: lang["fail.add"],
                        icon: "error",
                        showConfirmButton: true,

                    }).then(function () {
                        // Không cần reload trang
                    });
                }
            })
        } else {
            if (emailError) {
                Swal.fire({
                    title: lang["faild"],
                    text: lang["error.email_invalid"],
                    icon: "error",
                    showConfirmButton: true,
                })
            } else if (phoneError) {
                Swal.fire({
                    title: lang["faild"],
                    text: lang["error.phone_invalid"],
                    icon: "error",
                    showConfirmButton: true,
                })
            } else {
                Swal.fire({
                    title: lang["faild"],
                    text: lang["fail.null"],
                    icon: "error",
                    showConfirmButton: true,

                })
            }
        }
    };


    return (

        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h4>{lang["data management"]}</h4>
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

                                    <h5> <a onClick={() => navigate(-1)}><i class="fa fa-chevron-circle-left mr-3"></i></a>{result?.title} <i class="fa fa-chevron-right"></i> {lang["create"]}</h5>
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
                                                            table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger}
                                                            onPhoneError={handlePhoneError}
                                                        /> : null
                                                    }
                                                    {field.DATATYPE == "VARCHAR" ?
                                                        <Varchar
                                                            table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.DATATYPE == "CHAR" ?
                                                        <Char
                                                            table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.DATATYPE == "TEXT" ?
                                                        <Text
                                                            table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.DATATYPE == "INT" || field.data_type == "BIG INT" ?
                                                        <Int
                                                            selectOption={true}
                                                            table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                            field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.DATATYPE == "INT UNSIGNED" || field.data_type == "BIG INT UNSIGNED" ?
                                                        <Int
                                                            selectOption={true}
                                                            table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                            related={relatedTables} unsigned={true} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.DATATYPE == "DATE" ?
                                                        <DateInput
                                                            table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.DATATYPE == "EMAIL" ?
                                                        <DataEmail
                                                            selectOption={true}
                                                            readOnly={false}
                                                            table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger}
                                                            onEmailError={handleEmailError}
                                                        /> : null
                                                    }
                                                    {field.DATATYPE == "TIME" ?
                                                        <TimeInput
                                                            table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.DATATYPE == "DATETIME" ?
                                                        <DateTimeInput
                                                            table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.DATATYPE == "DECIMAL" ?
                                                        <Decimal
                                                            table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.DATATYPE == "DECIMAL UNSIGNED" ?
                                                        <Decimal
                                                            table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                            related={relatedTables} unsigned={true} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.DATATYPE == "BOOL" ?
                                                        <Bool
                                                            table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
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
                                                        <button type="button" onClick={submit} class="btn btn-success mr-2">{lang["btn.create"]}</button>
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