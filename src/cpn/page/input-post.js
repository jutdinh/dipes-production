import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

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
    const [fields, setFields] = useState([]);
    const [errors, setErrors] = useState({});
    const [data, setData] = useState({});
    const [relatedTables, setRelatedTables] = useState([])
    const [page, setPage] = useState([]);


    const [phoneError, setPhoneError] = useState(false);
    const handlePhoneError = (error) => {
        setPhoneError(error);
    };
    const [emailError, setEmailError] = useState(false);
    const handleEmailError = (error) => {
        setEmailError(error);
    };
    const [post, setPost] = useState({});
    useEffect(() => {

        fetch(`${proxy()}/apis/api/${id_str}/input_info`).then(res => res.json())
            .then(res => {
                const { success, api, relatedTables, data } = res;
                if (!success) {

                    console.log(data)
                    setFields(data.body)
                    setTables(data.tables)

                } else {
                    // al.failure("Lỗi", "Không thực hiện được chức năng này")

                }

                // // const { url } = api.url;
                // const page = pages.components?.[1]?.filter(p => p.apis_post == api.url.url)[0]
                // if (page) {
                //     const { param } = page;
                //     console.log(page)
                //     // modifyPageParam(param)
                // }
            })
    }, [pages])

    const changeTrigger = (field, value) => {
        const newData = data;
        newData[field.field_alias] = value;
        setData(newData)
    }
    const nullCheck = () => {
        let valid = true;
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            const { nullable, field_alias } = field;
            if (!nullable) {
                if (data[field_alias] == null || data[field_alias] == undefined || data[field_alias] == "") {
                    valid = false
                }
            }
        }
        return valid;
    }


    const submit = () => {

        if (!emailError && !phoneError && nullCheck(data)) {
            fetch(`${proxy()}${api.url.url}`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },

                body: JSON.stringify({ data })

            }).then(res => res.json()).then(res => {
                const { success, data, fk } = res;
                // console.log(res)
                if (success) {
                    // al.success("Thành công", "Thành công thêm dữ liệu!")
                    setTimeout(() => {
                        window.location.reload();
                    }, 1600);
                } else {
                    // al.failure("Lỗi",data)
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

    console.log("tables", tables)
    console.log("body", fields)
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
                                    <h5>Trang post</h5>
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
                                                <React.StrictMode key={field.field_id}>

                                                    {field.props.DATATYPE == "PHONE" ?
                                                        <DataPhone
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger}
                                                            onPhoneError={handlePhoneError}
                                                        /> : null
                                                    }
                                                    {field.props.DATATYPE == "VARCHAR" ?
                                                        <Varchar
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.props.DATATYPE == "CHAR" ?
                                                        <Char
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.props.DATATYPE == "TEXT" ?
                                                        <Text
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.props.DATATYPE == "INT" || field.data_type == "BIG INT" ?
                                                        <Int
                                                            table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                            field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.props.DATATYPE == "INT UNSIGNED" || field.data_type == "BIG INT UNSIGNED" ?
                                                        <Int
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} unsigned={true} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.props.DATATYPE == "DATE" ?
                                                        <DateInput
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.props.DATATYPE == "EMAIL" ?
                                                        <DataEmail
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger}
                                                            onEmailError={handleEmailError}
                                                        /> : null
                                                    }
                                                    {field.props.DATATYPE == "TIME" ?
                                                        <TimeInput
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.props.DATATYPE == "DATETIME" ?
                                                        <DateTimeInput
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.props.DATATYPE == "DECIMAL" ?
                                                        <Decimal
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.props.DATATYPE == "DECIMAL UNSIGNED" ?
                                                        <Decimal
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} unsigned={true} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                    {field.props.DATATYPE == "BOOL" ?
                                                        <Bool
                                                            table={tables.filter(tb => tb.table_id == field.table_id)[0]}
                                                            related={relatedTables} field={field}
                                                            changeTrigger={changeTrigger} /> : null
                                                    }
                                                </React.StrictMode>
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