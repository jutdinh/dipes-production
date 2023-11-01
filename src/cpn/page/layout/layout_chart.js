import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faDownload, faSquarePlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import StatisTable from '../statistic/table_chart'
import StatisticChart from '../statistic/chart'
import Swal from 'sweetalert2';
import ReactECharts from 'echarts-for-react';
import $ from 'jquery'
import XLSX from 'xlsx-js-style';
import { PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, AreaChart, Area, ComposedChart, ScatterChart, Scatter } from 'recharts';



export default (props) => {
    const { lang, proxy, auth, pages, functions, socket } = useSelector(state => state);
    const { openTab, renderDateTimeByFormat } = functions
    const { project_id, version_id, url } = useParams();
    const _token = localStorage.getItem("_token");
    const { formatNumber } = functions
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser) || {}
    const storedPwdString = localStorage.getItem("password_hash");
    console.log(_user)
    const page = props.page
    const [apiDataName, setApiDataName] = useState([])
    const [apiData, setApiData] = useState([])
    const [dataStatis, setDataStatis] = useState([])
    const [loading, setLoading] = useState(false);
    const [dataTable_id, setDataTableID] = useState(null);

    const [inputValues, setInputValues] = useState({});
    const [searchValues, setSearchValues] = useState({});


    const checkDetail = page.components?.[0]?.api_detail

    useEffect(() => {
        if (page && page.components) {
            // const id_str = page.components?.[0]?.api_post.split('/')[2];
            const id_str = page.components?.[0]?.api_post.split('/')[2];
            // console.log(id_str)
            fetch(`${proxy()}/apis/api/${id_str}/input_info`, {
                headers: {
                    Authorization: _token
                }
            })
                .then(res => res.json())
                .then(res => {
                    const { data, success, content } = res;
                    // console.log(res)
                    if (success) {

                        // setDataTables(data.tables)
                        setDataTableID(data.tables[0].id)
                        // setDataFields(data.body)
                        // setLoaded(true)
                    }
                })
        }
    }, [page, dataTable_id])

    useEffect(() => {
        if (page && page.components) {
            setApiData([])
            callApiView()
        }
    }, [page, dataTable_id])
    const callApiView = () => {

        let loadingTimeout;
        loadingTimeout = setTimeout(() => {
            setLoading(true)
        }, 350);
        const headerApi = {
            Authorization: _token,
            "content-type": "application/json"
            // 'start-at': startAt,
            // 'data-amount': amount
        }

        const apiGet = page.components?.[0]?.api_get;
        const username = _user.username === "administrator" ? "" : _user.username;
        const requestBody = {
            checkCustomer: {
                username: username,
                password: storedPwdString
            }
        }

        fetch(`${proxy()}${apiGet}`, {
            headers: headerApi,
            method: "POST",
            body: JSON.stringify(requestBody)
        })

            .then(res => res.json())
            .then(res => {
                const { success, content, data, count, fields, statistic } = res;
                console.log(res)
                setApiDataName(fields);
                setDataStatis(statistic);
                if (data && data.length > 0) {
                    setApiData(data.filter(record => record != undefined));
                }
                clearTimeout(loadingTimeout);
                setLoading(false)
            });
    }

    // const callApiView = () => {

    //     let loadingTimeout;
    //     loadingTimeout = setTimeout(() => {
    //         setLoading(true)
    //     }, 350);
    //     const headerApi = {
    //         Authorization: _token,
    //         "content-type": "application/json"
    //         // 'start-at': startAt,
    //         // 'data-amount': amount
    //     }

        

    //     fetch(`${proxy()}/api/test/statistic`, {
    //         headers: headerApi,
    //     })
    //         .then(res => res.json())
    //         .then(res => {
    //             const { success, content, data, count, fields, statistic } = res;
    //             console.log(res)
        
    //             setDataStatis(statistic);
                
    //             clearTimeout(loadingTimeout);
    //             setLoading(false)
    //         });
    // }

    const handleViewDetail = async (record) => {

        const { components } = page;
        const cpn = components[0]
        const { api_detail } = cpn;

        if (api_detail != undefined) {
            const id_str = api_detail.split('/')[2]

            const response = await new Promise((resolve, reject) => {
                fetch(`${proxy()}/apis/api/${id_str}/input_info`, {
                    headers: {
                        Authorization: _token
                    }
                })
                    .then(res => res.json())
                    .then(res => {
                        const { data, success, content } = res;
                        if (success) {
                            // console.log("succcess", data)
                            // setDataTables(data.tables)
                            // setDataFields(data.body)
                        }
                        resolve(res)
                    })
            })
            const { success, data } = response;
            if (success) {
                const { params } = data;
                const stringifiedParams = params.map(param => {
                    const { fomular_alias } = param
                    return record[fomular_alias]
                }).join('/')
                openTab(`/page/${url}/detail/${id_str}/${stringifiedParams}?myParam=${url}`)

            }
        } else {
            Swal.fire({
                title: lang["faild"],
                text: lang["not found"],
                icon: "error",
                showConfirmButton: false,
                timer: 2000,
            })
        }
    }

    const handleInputChange = (fomular_alias, value) => {
        setInputValues(prevValues => ({
            ...prevValues,
            [fomular_alias]: value
        }));
    };

    const handleKeyDown = (event) => {
        if (event.keyCode === 13) {
            handleSearchClick();
        }
    }

    const handleSearchClick = () => {
        setSearchValues(inputValues);
    };


    const filteredData = useMemo(() => {
        return apiData.filter(row =>
            Object.entries(searchValues).every(([key, value]) =>
                row[key]?.toString().toLowerCase().includes(value?.toLowerCase())
            )
        );
    }, [apiData, searchValues]);


    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 14
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const current = filteredData.slice(indexOfFirst, indexOfLast);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);


    // const indexOfLast = currentPage * rowsPerPage;
    // const indexOfFirst = indexOfLast - rowsPerPage;
    // const current = apiData

    // const paginate = (pageNumber) => {
    //     const startAt = (pageNumber - 1) * rowsPerPage;
    //     // if (Object.keys(searchValues).length === 0 || !searching) {
    //     //     callApiView(startAt, rowsPerPage);
    //     // }
    //     // else {
    //     //     callApi(pageNumber - 1);
    //     // }
    //     setCurrentPage(pageNumber);
    // };

    const renderData = (field, data) => {
        if (data) {
            switch (field.DATATYPE) {
                case "DATE":
                case "DATETIME":
                    return renderDateTimeByFormat(data[field.fomular_alias], field.FORMAT);
                case "DECIMAL":
                case "DECIMAL UNSIGNED":
                    const { DECIMAL_PLACE } = field;
                    const decimalNumber = parseFloat(data[field.fomular_alias]);
                    return decimalNumber.toFixed(DECIMAL_PLACE)
                case "BOOL":
                    return renderBoolData(data[field.fomular_alias], field)
                default:
                    return data[field.fomular_alias];
            }
        } else {
            return "Invalid value"
        }
    };

    const renderBoolData = (data, field) => {
        const IF_TRUE = field.DEFAULT_TRUE;
        const IF_FALSE = field.DEFAULT_FALSE
        if (data != undefined) {
            if (data) {
                return IF_TRUE ? IF_TRUE : "true"
            }
            return IF_FALSE ? IF_FALSE : "false"
        } else {
            return IF_FALSE ? IF_FALSE : "false"
        }
    }


    function formatPrinterKey(key) {
        return key.match(/.{1,4}/g).join('-');
    }

    const rawKey = "PRTA123B45PRTA123B45";
    const formattedKey = formatPrinterKey(rawKey);
    console.log(dataStatis)
    return (
        <>
            {dataStatis?.map((statis, index) => {
                const { display_name, type, data } = statis;
                if (type == "text") {
                    return (
                        <div class="col-md-12  col-sm-4 d-flex ">
                            <p key={index} className="font-weight-bold ml-auto ">{display_name}: {data && data !== undefined && formatNumber(data.toFixed())}</p>
                        </div>
                    )
                }
                else if (type == "table") {
                    return (
                       
                   
                        <StatisticChart data={data} statis={statis} page={page} />

                        // <StatisticChart data={statis} statis={statis} page={page} />
                    )
                }
                else return null
            })}

        </>

    )
}