import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import {
    Varchar, Char, Text, Int,
    DateInput, TimeInput, DateTimeInput,
    Decimal, Bool, DataEmail, DataPhone, FileImage, FileImageUpdate

} from '../inputs';

export default () => {
    const dispatch = useDispatch();
    const { id_str } = useParams()
    const _token = localStorage.getItem("_token");
    const { project_id, version_id, url } = useParams();
    let navigate = useNavigate();
    const { proxy, pages, lang, socket, functions } = useSelector(state => state);
    const [api, setApi] = useState({})
    const [tables, setTables] = useState([])
    const [keyFields, setKeyFields] = useState([]);
    const [params, setParams] = useState([]);
    const [fields, setFields] = useState([]);
    const [data, setData] = useState({});
    const [relatedTables, setRelatedTables] = useState([])
    const [initialData, setInitData] = useState({})
    const [loaded, setLoaded] = useState(false)
    const [page, setPage] = useState(null);

// console.log(fields)
// console.log(initialData)
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('myParam');

    const goToHomePage = () => {
        // navigate(`/page/${url}`);
        navigate(-1)
    };



    const [phoneError, setPhoneError] = useState(false);
    const handlePhoneError = (error) => {
        setPhoneError(error);
    };
    const [emailError, setEmailError] = useState(false);
    const handleEmailError = (error) => {
        setEmailError(error);
    };
    // console.log(pages)



    // const result = pages?.filter(item => item.type !== "apiview").find(item => {
    //     // Lấy id từ api_get
    //     const api_get_id = item.components?.[0]?.api_put.split('/')[2];
    //     // So sánh với id_str
    //     return api_get_id === id_str;
    // });

    useEffect(() => {
        if (pages && pages.length > 0) {
            const result = functions.findPageById(pages, `${url}`);
            if (result.component.length > 0) {

                setPage(result);
            } else {

            }
        }
    }, [pages, url]);

    const result = functions.findPutApi(page);
 console.log(result)

    const changeTrigger = (field, value) => {
        if (loaded) {
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

    useEffect(() => {
        const url = window.location;
        const rawParams = url.pathname.split(`/${id_str}/`)[1];
        const paramsList = rawParams.split('/');
        // console.log(rawParams)
        fetch(`${proxy()}/apis/api/${id_str}/input_info`,
            {
                headers: {
                    Authorization: _token
                }
            })
            .then(res => res.json())
            .then(res => {
                const { success, data } = res;
                console.log(res)
                if (success) {
                    // const { tables } = data.tables;
                    const apiFields = data.params;

                    apiFields.push(...data.body)


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
                    // fetch(`${proxy()}/apis/retrieve/${id_str}/${rawParams}`, {
                    fetch(`${proxy()}/apis/retrieve/${id_str}/${rawParams}`, {
                        headers: {
                            Authorization: _token
                        }
                    })
                        .then(res => res.json()).then(res => {
                            // console.log(res);

                            const { data } = res;
                            let initData = data;
                            // console.log(serializeParams)
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
                                setData({ ...data })
                                setLoaded(true)
                            }
                        })
                } else {
                    // al.failure("Lỗi", "API này không tồn tại hoặc đã bị vô hiệu")
                }
            })
    }, [])

    useEffect(() => {
        // console.log(data)
    }, [data])
    const showError = (title, text) => {
        Swal.fire({
            title: title,
            text: text,
            icon: "error",
            showConfirmButton: true,
        });
    };
    const handleAPIErrors = (res) => {
        const { primaryConflict, foreignConflict, typeError } = res;

        if (primaryConflict && foreignConflict) return showError(lang["faild"], lang["erorr pk fk"]);
        if (primaryConflict) return showError(lang["faild"], lang["erorr pk"]);
        if (foreignConflict) return showError(lang["faild"], lang["erorr fk"]);
        if (typeError) return showError(lang["faild"], lang["fail.add"]);
    };
    // console.log(fields)
    const submit = () => {
        const url = window.location;
        const rawParams = url.pathname.split(`/${id_str}/`)[1];
        const paramsList = rawParams.split('/');
        console.log(data)

        if (!emailError && !phoneError && nullCheck(data)) {
            fetch(`${proxy()}/ui/${id_str}/${paramsList.join('/')}`, {
                method: "PUT",
                headers: {
                    Authorization: `${_token}`,
                    "content-type": "application/json"
                },
                body: JSON.stringify({ ...data })
            })

                .then(res => res.json())
                .then(res => {
                    // console.log(res)
                    if (res.primaryConflict || res.foreignConflict || res.typeError) {
                        handleAPIErrors(res);
                    } else {
                        Swal.fire({
                            title: lang["success"],
                            text: lang["success.update"],
                            icon: "success",
                            showConfirmButton: false,
                            timer: 1500
                        }).then(function () {
                            window.location.reload();
                        });
                    }
                    const dataSubmit = {
                        api_id: id_str,
                        data: data
                    }

                    socket.emit("/dipe-production-update-data", dataSubmit);


                })
                .catch(error => {
                    // Xử lý lỗi nếu cần
                });
        } else {
            if (emailError) showError(lang["faild"], lang["error.email_invalid"]);
            else if (phoneError) showError(lang["faild"], lang["error.phone_invalid"]);
            else showError(lang["faild"], lang["fail.null"]);
        }
    };

    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h4 class="ml-1">{lang["data management"]}</h4>
                        </div>
                    </div>
                </div>
                {/* List table */}
                <div class="row">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head_cus d-flex">
                                <div class="heading1_cus margin_0 ">
                                    {/* <h5> <a onClick={() => navigate(-1)}><i class="fa fa-chevron-circle-left mr-3"></i></a>{page?.components?.[0]?.component_name}</h5> */}
                                    <h5>
                                        <label class="pointer" onClick={() => goToHomePage()}>
                                            <a title={lang["back"]}><i class=" fa fa-chevron-circle-left mr-1 mt-3 mb-0 nav-item nav-link"></i></a>{functions.findPropsNameUpdateByUrl(page,id_str)}
                                            <i class={` ${functions.findPropsNameUpdateByUrl(page,id_str)?.trim() !== '' && 'fa fa-chevron-right ml-2 mr-1'} `}></i>  
                                            {lang["update"]}
                                        </label>
                                    </h5>
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
                                    {tables.length > 0 ?

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
                                                                onPhoneError={handlePhoneError} defaultValue={initialData[field.fomular_alias]}
                                                            /> : null
                                                        }
                                                        {field.DATATYPE == "VARCHAR" ?
                                                            <Varchar
                                                                table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                                related={relatedTables} field={field}
                                                                changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                            /> : null
                                                        }
                                                        {field.DATATYPE == "CHAR" ?
                                                            <Char
                                                                table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                                related={relatedTables} field={field}
                                                                changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                            /> : null
                                                        }
                                                        {field.DATATYPE == "TEXT" ?
                                                            <Text
                                                                selectOption={false}
                                                                table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                                related={relatedTables} field={field}
                                                                changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                            /> : null
                                                        }
                                                        {field.DATATYPE == "INT" || field.data_type == "BIG INT" ?
                                                            <Int
                                                                selectOption={false}
                                                                table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                                field={field}
                                                                changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                            /> : null
                                                        }
                                                        {field.DATATYPE == "INT UNSIGNED" || field.data_type == "BIG INT UNSIGNED" ?
                                                            <Int
                                                                table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                                related={relatedTables} unsigned={true} field={field}
                                                                changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                            /> : null
                                                        }
                                                        {field.DATATYPE == "DATE" ?
                                                            <DateInput
                                                                table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                                related={relatedTables} field={field}
                                                                changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                            /> : null
                                                        }
                                                        {field.DATATYPE == "EMAIL" ?
                                                            <DataEmail
                                                                selectOption={true}
                                                                readOnly={true}
                                                                table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                                related={relatedTables} field={field}
                                                                changeTrigger={changeTrigger}
                                                                onEmailError={handleEmailError} defaultValue={initialData[field.fomular_alias]}
                                                            /> : null
                                                        }
                                                        {field.DATATYPE == "TIME" ?
                                                            <TimeInput
                                                                table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                                related={relatedTables} field={field}
                                                                changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                            /> : null
                                                        }
                                                        {field.DATATYPE == "DATETIME" ?
                                                            <DateTimeInput
                                                                table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                                related={relatedTables} field={field}
                                                                changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                            /> : null
                                                        }
                                                        {field.DATATYPE == "DECIMAL" ?
                                                            <Decimal
                                                                table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                                related={relatedTables} field={field}
                                                                changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                            /> : null
                                                        }
                                                        {field.DATATYPE == "DECIMAL UNSIGNED" ?
                                                            <Decimal
                                                                table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                                related={relatedTables} unsigned={true} field={field}
                                                                changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                            /> : null
                                                        }
                                                        {field.DATATYPE == "BOOL" ?
                                                            <Bool
                                                                table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                                related={relatedTables} field={field}
                                                                changeTrigger={changeTrigger} defaultValue={initialData[field.fomular_alias]}
                                                            /> : null
                                                        }
                                                     {field.DATATYPE == "FILE" ?
                                                            <FileImageUpdate
                                                                table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                                related={relatedTables} field={field}
                                                                changeTrigger={changeTrigger}  defaultValue={initialData[field.fomular_alias]}/> : null
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
                                                            <button type="button" style={{ minWidth: "105px" }} onClick={submit} class="btn btn-success mr-2">{lang["btn.update"]}</button>
                                                            <button type="button" style={{ minWidth: "105px" }} onClick={() => goToHomePage()} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                                                        </div>
                                                    </div>
                                                </div>


                                            </div>
                                        </div> : null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}