import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faDownload, faSquarePlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import StatisTable from '../statistic/table_chart'
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
    // console.log(_token)
    const { formatNumber } = functions
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser) || {}
    const storedPwdString = localStorage.getItem("password_hash");
    // console.log(storedPwdString)
    const page = props.page
    const [apiDataName, setApiDataName] = useState([])
    const [apiData, setApiData] = useState([])
    const [loading, setLoading] = useState(false);
    const [dataTable_id, setDataTableID] = useState(null);

    const [inputValues, setInputValues] = useState({});
    const [searchValues, setSearchValues] = useState({});
    const [isActive, setIsActive] = useState(false);

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
        const username = _user.username === "administrator" ? "" : _user.username;
        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            }
        }
        
        const apiGet = page.components?.[0]?.api_get;
    

        fetch(`${proxy()}${apiGet}`, {
            headers: headerApi,
            method: "POST",
            body: JSON.stringify(requestBody)
        })

            .then(res => res.json())
            .then(res => {
                const { success, content, data, count, fields } = res;
                // console.log(res)
                setApiDataName(fields);
                if (data && data.length > 0) {
                    setApiData(data.filter(record => record != undefined));
                }
                clearTimeout(loadingTimeout);
                setLoading(false)
            });

    }
    const handleViewDetail = async (record) => {
        // console.log(record)
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
                        // console.log(res)
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
                

                const stringifiedParams = data.body.map(param => {
                    const { fomular_alias } = param
                    return record[fomular_alias]
                }).join('/')
                openTab(`/page/${url}/detail-key/${id_str}/${stringifiedParams}`)

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
        setCurrentPage(1)
        setSearchValues(inputValues);


        setIsActive(true);
        setTimeout(() => {
            setIsActive(false);
        }, 300);
    };


    const filteredData = useMemo(() => {
        return apiData.filter(row =>
            Object.entries(searchValues).every(([key, value]) =>
                row[key]?.toString().toLowerCase().includes(value?.toLowerCase())
            )
        );
    }, [apiData, searchValues]);


    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 15
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
                    // return renderDateTimeByFormat(data[field.fomular_alias], field.FORMAT);
                    return data[field.fomular_alias];
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

    return (
        <>
            <div class="col-md-12">
                <div class="white_shd full">
                    <div class="tab_style2 layout2">
                        <div class="tabbar">
                            <nav>
                                <div className="nav nav-tabs" style={{ borderBottomStyle: "0px" }} >
                                    <div class="full graph_head_cus d-flex">
                                        <div class="heading1_cus margin_0 nav-item nav-link ">
                                            <h5>{page?.components?.[0]?.component_name}</h5>
                                        </div>
                                    </div>
                                </div>
                            </nav>
                        </div>
                    </div>
                    <div class="table_section padding_infor_info_layout2 " >
                        <div class="col-md-12">
                            <div class="tab-content">
                           
                                    <div class="col-md-12">
                                        <div class="table-responsive">
                                            <>
                                                <div style={{ overflowX: 'auto', height: "74vh" }}>
                                                    <table className={"table"} style={{ marginBottom: "0px", width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead class="">
                                                            <tr class="color-tr sticky-header">
                                                                <th class="font-weight-bold " style={{ width: "50px", minWidth: "50px" }} scope="col">{lang["log.no"]}</th>
                                                                {apiDataName?.map((header, index) => (
                                                                    <th key={index} class="font-weight-bold"style={{minWidth: "150px"}}>{header.display_name ? header.display_name : header.field_name}</th>
                                                                ))}
                                                                <th class="font-weight-bold align-center" style={{ width: "100px" }}>{lang["log.action"]}</th>
                                                            </tr>
                                                            <tr >
                                                                <th></th>
                                                                {apiDataName?.map((header, index) => (
                                                                    <th key={index}>
                                                                        <input
                                                                            type="search"
                                                                            className="form-control"
                                                                            value={inputValues[header.fomular_alias] || ''}
                                                                            onChange={(e) => handleInputChange(header.fomular_alias, e.target.value)}
                                                                            onKeyDown={handleKeyDown}
                                                                        />

                                                                    </th>
                                                                ))}
                                                                <th class="align-center" onClick={handleSearchClick} style={{ minWidth: "100px" }}>
                                                                    <i class={`fa fa-search size-24 pointer mb-2 ${isActive ? 'icon-active' : ''}`} title={lang["search"]}></i>
                                                                </th>
                                                            </tr>

                                                        </thead>
                                                        
                                                        <tbody>
                                                            {current && current.length > 0 ? (

                                                                current.map((row, index) => {
                                                                    if (row) {
                                                                        return (
                                                                            <>
                                                                                <tr key={index}>
                                                                                    <td scope="row" style={{ minWidth: "50px" }} className="cell">{indexOfFirst + index + 1}</td>
                                                                                    {apiDataName?.map((header) => (
                                                                                        <td key={header.fomular_alias} className="cell">{renderData(header, row)}</td>
                                                                                    ))}
                                                                                    <td class="align-center" style={{ width: "100px" }}>
                                                                                        {checkDetail && <i className="fa fa-eye size-24 pointer icon-view" onClick={() => handleViewDetail(row)} title={lang["viewdetail"]}></i>}
                                                                                    </td>
                                                                                </tr>
                                                                            </>
                                                                        )
                                                                    } else {
                                                                        return null
                                                                    }
                                                                })

                                                            ) : <tr>
                                                                <td class="" colspan={`${apiDataName?.length + 2}`} style={{ textAlign: 'center' }}><div>{lang["not found"]}</div></td>
                                                            </tr>
                                                            }
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-1">
                                            <p>
                                                {
                                                    apiData.length > 0 ? (
                                                        `${lang["show"]} ${filteredData.length > 0 ? indexOfFirst + 1 : 0} - ${Math.min(indexOfLast, filteredData.length)} ${lang["of"]} ${Math.min(apiData.length, filteredData.length)} ${lang["results"]}`
                                                    ) : (
                                                        null
                                                        // <p> K có data</p>
                                                    )
                                                }
                                            </p>
                                            <nav aria-label="Page navigation example">
                                                <ul className="pagination mb-0">
                                                    {/* Nút đến trang đầu */}
                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <button className="page-link" onClick={() => paginate(1)}>
                                                            &#8810; 
                                                        </button>
                                                    </li>
                                                    {/* Nút đến trang trước */}
                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                                                            &laquo;
                                                        </button>
                                                    </li>
                                                    {/* Hiển thị số trang */}
                                                    {Array(totalPages).fill().map((_, index) => {
                                                        if (
                                                            index + 1 === currentPage ||
                                                            (index + 1 >= currentPage - 1 && index + 1 <= currentPage + 1)
                                                        ) {
                                                            return (
                                                                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                                    <button className="page-link" onClick={() => paginate(index + 1)}>
                                                                        {index + 1}
                                                                    </button>
                                                                </li>
                                                            )
                                                        }
                                                    })}
                                                    {/* Nút đến trang sau */}
                                                    <li className={`page-item ${(currentPage === totalPages || filteredData.length === 0) ? 'disabled' : ''}`}>
                                                        <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                                                            &raquo;
                                                        </button>
                                                    </li>
                                                    {/* Nút đến trang cuối */}
                                                    <li className={`page-item ${(currentPage === totalPages || filteredData.length === 0) ? 'disabled' : ''}`}>
                                                        <button className="page-link" onClick={() => paginate(totalPages)}>
                                                            &#8811;
                                                        </button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </div>
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}