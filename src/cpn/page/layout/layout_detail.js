import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import {
    Varchar, Char, Text, Int,
    DateInput, TimeInput, DateTimeInput,
    Decimal, Bool, DataEmail, DataPhone, Label

} from '../../inputs';

export default () => {
    const dispatch = useDispatch();
    const { id_str } = useParams()
    const _token = localStorage.getItem("_token");
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser) || {}
    const storedPwdString = localStorage.getItem("password_hash");
    const { project_id, version_id, url } = useParams();
    let navigate = useNavigate();
    const { proxy, pages, lang, socket } = useSelector(state => state);
    const [api, setApi] = useState({})
    const [tables, setTables] = useState([])
    const [keyFields, setKeyFields] = useState([]);
    const [params, setParams] = useState([]);
    const [fields, setFields] = useState([]);
    const [data, setData] = useState({});
    const [relatedTables, setRelatedTables] = useState([])
    const [initialData, setInitData] = useState({})
    const [loaded, setLoaded] = useState(false)
    const [page, setPage] = useState([]);
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('myParam');

    const goToHomePage = () => {
        navigate(`/page/${url}`);
    };
    useEffect(() => {
        if (pages && pages.length > 0) {

            const filteredPages = pages.filter(page => page.type !== "apiview");
            const result = filteredPages.find(page => page.url === `/${url}`);
            if (result) {
                setPage(result);
            } else {
                // openTab('/page/not/found')
            }
        }
    }, [pages]);

    // console.log(page)

    const result = pages?.filter(item => item.type !== "apiview" && item.components?.[0]?.api_detail).find(item => {
        // Lấy id từ api_get
        const api_get_id = item.components?.[0]?.api_detail.split('/')[2];
        // So sánh với id_str
        return api_get_id === id_str;
    });

    useEffect(() => {
        // console.log(page)
        if (pages && pages.length > 0) {

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
                    // console.log(res)
                    if (success) {
                        // const { tables } = data.tables;
                        const apiFields = data.fields;

                        // apiFields.push(...data.fields)


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

                        const username = _user.username === "administrator" ? "" : _user.username;
                        const requestBody = {
                            checkCustomer: {
                                username: username,
                                password: storedPwdString,
                            },
                            id: rawParams
                        }

                        fetch(`${proxy()}${page.components?.[0]?.api_detail}`, {
                            method: "POST",
                            headers: {
                                Authorization: _token,
                                "content-type": "application/json"
                            },
                            body: JSON.stringify(requestBody)
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
                                if (initData) {
                                    const data = {};
                                    apiFields.map(field => {
                                        const { fomular_alias } = field;
                                        data[fomular_alias] = initData[fomular_alias];
                                    })
                                    setInitData(initData ? initData : {});
                                    setData({ ...data })
                                    setLoaded(true)
                                }
                            })
                    } else {

                    }
                })
        }
    }, [page, url])
    // console.log(initialData)
    useEffect(() => {
        // console.log(data)
    }, [data])

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
                                    <h5> <label class="pointer" onClick={() => goToHomePage()}>
                                        <a title={lang["back"]}><i class=" fa fa-chevron-circle-left mr-1 mt-3 mb-0 nav-item nav-link"></i></a>{result?.title}
                                    </label> <i class="fa fa-chevron-right"></i>  {lang["viewdetail"]}</h5>

                                </div>
                                {/* <div class="ml-auto">
                                <i class="fa fa-newspaper-o icon-ui"></i>
                            </div> */}
                            </div>
                            <div class="table_section padding_infor_info" style={{height: "78vh"}}>
                                <div class="row column1">
                                    <div class="form-group col-lg-4">

                                    </div>
                                    <div class="col-md-12 col-lg-12">
                                        <div class="d-flex align-items-center mb-1">
                                        </div>
                                    </div>
                                    {tables.length > 0 ?
                                        <div class="col-md-12">
                                            <div className="w-50-pct mg-auto p-1 bg-white">
                                                <span className="block text-32-px text-center p-0-5">{api.api_name}</span>
                                                <div className="label-container">
                                                    {fields.map(field =>
                                                        <div key={field.field_id}>
                                                            {
                                                                field.DATATYPE == "PHONE" ||
                                                                    field.DATATYPE == "TEXT" ||
                                                                    field.DATATYPE == "CHAR" ||
                                                                    field.DATATYPE == "INT" ||
                                                                    field.DATATYPE == "EMAIL" ||
                                                                    field.data_type == "BIG INT" ||
                                                                    field.DATATYPE == "INT UNSIGNED" ||
                                                                    field.data_type == "BIG INT UNSIGNED" ||
                                                                    field.DATATYPE == "DATE" ||
                                                                    field.DATATYPE == "TIME" ||
                                                                    field.DATATYPE == "DATETIME" ||
                                                                    field.DATATYPE == "DECIMAL" ||
                                                                    field.DATATYPE == "DECIMAL UNSIGNED" ||
                                                                    field.DATATYPE == "BOOL"
                                                                    ?
                                                                    <Label
                                                                        selectOption={false}
                                                                        table={tables.filter(tb => tb.id == field.table_id)[0]}
                                                                        related={relatedTables} field={field}
                                                                        defaultValue={initialData[field.fomular_alias]}
                                                                    /> : null
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                                <div class="row justify-content-center">
                                                    <div class="col-md-6">
                                                        <div class="mt-2 d-flex justify-content-end">
                                                            {/* <button type="button" style={{ minWidth: "105px" }} onClick={() => goToHomePage()} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button> */}
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