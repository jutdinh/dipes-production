import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faDownload, faSquarePlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import StatisTable from '../statistic/table'
import Swal from 'sweetalert2';
import ReactECharts from 'echarts-for-react';
import $ from 'jquery'
import { PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, AreaChart, Area, ComposedChart, ScatterChart, Scatter } from 'recharts';
const RECORD_PER_PAGE = 10


export default (props) => {
    const { lang, proxy, auth, pages, functions } = useSelector(state => state);
    const { openTab, renderDateTimeByFormat } = functions
    const { project_id, version_id, url } = useParams();
    const _token = localStorage.getItem("_token");
    const { formatNumber } = functions
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser) || {}

    // console.log(props)
    const [loaded, setLoaded] = useState(false);
    const [previousSearchValues, setPreviousSearchValues] = useState({});
    const [currentCount, setCurrentCount] = useState(null);



    // const [currentPage, setCurrentPage] = useState(0)
    const [apiData, setApiData] = useState([])
    const [apiDataName, setApiDataName] = useState([])
    const [sumerize, setSumerize] = useState(0)
    const [dataStatis, setDataStatis] = useState([])

    const [dataTable_id, setDataTableID] = useState(null);
    const [dataTables, setDataTables] = useState([]);
    const [dataFields, setDataFields] = useState([]);

    const [loadingExportFile, setLoadingExportFile] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingResult, setLoadingResult] = useState(false);

    // const activeTab = props.activeTab
    const page = props.page
    const statusActive = props.statusActive
    const dataCheck = props.dataCheck


    // console.log(apiData)
    const layoutId = page.components?.[0].layout_id;
    const tableClassName = layoutId === 0 ? "table" : "table table-hover";

    const callApi = (startIndex = currentPage - 1,) => {
        const startTime = new Date().getTime();
        let loadingTimeout;
        let loadingTimeoutSearch;
        if (Object.keys(searchValues).length !== 0) {
            loadingTimeoutSearch = setTimeout(() => {
                setLoadingSearch(true);
            }, 310);
        }

        loadingTimeout = setTimeout(() => {
            setLoading(true)
        }, 300);

        const searchBody = {
            table_id: dataTable_id,
            start_index: startIndex,
            criteria: searchValues,
            require_count: false,
            require_statistic: false,
            api_id: page.components?.[0]?.api_get.split('/')[2]
            // exact: true
        }

        console.log("ĐÂY LÀ BODY:", searchBody)

        fetch(`${proxy()}${page.components?.[0]?.api_search}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: _token,
                fromIndex: currentPage - 1
            },
            body: JSON.stringify(searchBody)
        })
            .then(res => res.json())
            .then(res => {
                const { success, content, data, result, total, fields, count, sumerize } = res;
                const statisticValues = res.statistic;
                console.log(74, res)
                if (success) {
                    setApiData(data.filter(record => record != undefined));

                    setDataStatis(statisticValues);
                    setLoaded(true);

                    

                } else {
                    setApiData([]);
                    setApiDataName([])
                }

                const endTime = new Date().getTime();
                const elapsedTime = endTime - startTime;

                clearTimeout(loadingTimeout);
                clearTimeout(loadingTimeoutSearch);// Clear the timeout
                setLoadingSearch(false);
                setLoading(false)
                // console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
            });
    };
    const callApiView = (startAt = 0, amount = 15) => {
        const headerApi = {
            Authorization: _token,
            'start-at': startAt,
            'data-amount': amount
        }

        const apiGet = page.components?.[0]?.api_get;
        fetch(`${proxy()}${apiGet}`, {
            headers: headerApi
        })

            .then(res => res.json())
            .then(res => {
                const { success, content, data, count, fields, limit, statistic } = res;
                // console.log(res)
                if (data && data.length > 0) {
                    setApiData(data.filter(record => record != undefined));
                    setApiDataName(fields);
                    setDataStatis(statistic);

                    setSumerize(count)
                    // setLimit(limit)
                    // setApiViewData(data)
                    // setApiViewFields(fields)
                }
            });
    }
    const callApiCount = (requireCount = false) => {

        const startTime = new Date().getTime();
        let loadingTimeout;
        let loadingTimeoutSearch;
        // if (Object.keys(searchValues).length !== 0) {
        //     loadingTimeoutSearch = setTimeout(() => {
        //         setLoadingSearch(true);
        //     }, 310);
        // }
        loadingTimeout = setTimeout(() => {

            // setLoading(true)
            setLoadingResult(true)
        }, 300);

        if (JSON.stringify(searchValues) !== JSON.stringify(previousSearchValues)) {
            setPreviousSearchValues(searchValues);
            requireCount = true;
        }

        const searchBody = {
            table_id: dataTable_id,
            start_index: currentPage - 1,
            criteria: searchValues,
            require_count: true,
            require_statistic: false,
            api_id: page.components?.[0]?.api_get.split('/')[2]
            // exact: true
        }

        // console.log(searchBody)
        fetch(`${proxy()}${page.components?.[0]?.api_search}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: _token,
                fromIndex: currentPage - 1
            },
            body: JSON.stringify(searchBody)
        })
            .then(res => res.json())
            .then(res => {

                const { success, content, data, result, total, fields, count, sumerize } = res;
                const statisticValues = res.statistic;
                // console.log(74, res)
                if (success) {
                    // setApiData(data.filter(record => record != undefined));
                    // setApiDataName(fields);
                    // setDataStatis(statisticValues);
                    // setLoaded(true);

                    if (count !== undefined && requireCount) {
                        setCurrentCount(count);
                        setSumerize(count);
                    } else if (sumerize !== undefined) {
                        setSumerize(sumerize);
                    } else if (!requireCount && currentCount != null) {
                        setSumerize(currentCount);
                    }
                } else {
                    setApiData([]);
                    setApiDataName([])
                }

                const endTime = new Date().getTime();
                const elapsedTime = endTime - startTime;

                clearTimeout(loadingTimeout);
                clearTimeout(loadingTimeoutSearch);// Clear the timeout
                setLoadingResult(false)
                // setLoadingSearch(false);
                // setLoading(false)
                // console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
            });
    };
    const callApiStatistic = (requireCount = false) => {

        const startTime = new Date().getTime();
        let loadingTimeout;
        let loadingTimeoutSearch;
        // if (Object.keys(searchValues).length !== 0) {
        //     loadingTimeoutSearch = setTimeout(() => {
        //         setLoadingSearch(true);
        //     }, 310);
        // }

        loadingTimeout = setTimeout(() => {

            // setLoading(true)
            setLoadingResult(true)
        }, 300);


        if (JSON.stringify(searchValues) !== JSON.stringify(previousSearchValues)) {
            setPreviousSearchValues(searchValues);
            requireCount = true;
        }

        const searchBody = {
            table_id: dataTable_id,
            start_index: currentPage - 1,
            criteria: searchValues,
            require_count: false,
            require_statistic: true,
            api_id: page.components?.[0]?.api_get.split('/')[2]
            // exact: true
        }

        // console.log(searchBody)

        fetch(`${proxy()}${page.components?.[0]?.api_search}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: _token,
                fromIndex: currentPage - 1
            },
            body: JSON.stringify(searchBody)
        })
            .then(res => res.json())
            .then(res => {


                const { success, content, data, result, total, fields, count, sumerize } = res;
                const statisticValues = res.statistic;
                // console.log(74, res)
                if (success) {
                    // setApiData(data.filter(record => record != undefined));
                    // setApiDataName(fields);
                    // setDataStatis(statisticValues);
                    // setLoaded(true);

                    if (count !== undefined && requireCount) {
                        setCurrentCount(count);
                        setSumerize(count);
                    } else if (sumerize !== undefined) {
                        setSumerize(sumerize);
                    } else if (!requireCount && currentCount != null) {
                        setSumerize(currentCount);
                    }
                } else {
                    setApiData([]);
                    setApiDataName([])
                }

                const endTime = new Date().getTime();
                const elapsedTime = endTime - startTime;

                clearTimeout(loadingTimeout);
                clearTimeout(loadingTimeoutSearch);// Clear the timeout
                setLoadingResult(false)
                // setLoadingSearch(false);
                // setLoading(false)
                // console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
            });
    };
    useEffect(() => {
        setCurrentPage(1)
    }, [page, url])

    const rowsPerPage = 15;
    const [currentPage, setCurrentPage] = useState(0);
    const [searching, setSearching] = useState(false);
    const [totalPages, setTotalPages] = useState(0);

    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const current = apiData

    const paginate = (pageNumber) => {
        const startAt = (pageNumber - 1) * rowsPerPage;
        if (Object.keys(searchValues).length === 0 || !searching) {
            callApiView(startAt, rowsPerPage);
        }
        else {
            callApi(pageNumber - 1);
        }
        setCurrentPage(pageNumber);
    };

    const accurateTotalPages = Math.ceil(sumerize / rowsPerPage);
    if (totalPages !== accurateTotalPages) {
        setTotalPages(accurateTotalPages);
    }
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
                        setDataTables(data.tables)
                        setDataTableID(data.tables[0].id)
                        setDataFields(data.body)
                        setLoaded(true)
                    }
                })
        }
    }, [page, dataTable_id])

    useEffect(() => {
        if (page && page.components) {
            callApiView()
        }
    }, [page, dataTable_id])
    //searching
    // console.log(loadingSearch)
    useEffect(() => {
        let timeout;
        if (loadingSearch) {
            Swal.fire({
                title: lang["searching"],
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        } else {
            timeout = setTimeout(() => {
                Swal.close();
            }, 10);
        }
        return () => {
            clearTimeout(timeout);
        };
    }, [loadingSearch]);
    ///Loading
    useEffect(() => {
        let timeout;
        if (!loadingSearch && loading) {
            Swal.fire({
                title: lang["loading"],
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        } else {
            timeout = setTimeout(() => {
                Swal.close();
            }, 500);
        }
        return () => {
            clearTimeout(timeout);
        };
    }, [loading]);
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
    const [isInitialRender, setIsInitialRender] = useState(true);
    useEffect(() => {
        let timeout;
        if (isInitialRender) {
            setIsInitialRender(false);
            return;
        }

        if (loadingExportFile) {
            Swal.fire({
                title: lang["loading"],
                allowEscapeKey: false,
                allowOutsideClick: false,

                didOpen: () => {
                    Swal.showLoading();
                }
            });
        } else {
            timeout = setTimeout(() => {
                Swal.close();
            }, 1000);
        }
    }, [loadingExportFile]);
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
    const redirectToInputPUT = async (record) => {

        const { components } = page;
        const cpn = components[0]
        const { api_put } = cpn;
        if (api_put != undefined) {
            const id_str = api_put.split('/')[2]

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
                            setDataTables(data.tables)
                            setDataFields(data.body)
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
                openTab(`/page/${url}/put/api/${id_str}/${stringifiedParams}?myParam=${url}`)

            }
        } else {
            Swal.fire({
                title: lang["faild"],
                text: lang["not found update"],
                icon: "error",
                showConfirmButton: false,
                timer: 2000,
            })
        }
    }
    const redirectToInput = () => {

        Swal.fire({
            title: lang["faild"],
            text: lang["not found config"],
            icon: "error",
            showConfirmButton: true,
            customClass: {
                confirmButton: 'swal2-confirm my-confirm-button-class'
            }
        })
        return;

        // console.log(page)
        const id_str = page.components?.[0]?.api_post.split('/')[2];

        window.location.href = `${url}/apis/api/${id_str}/input_info`;
    }
    const handleDelete = (data) => {
        // console.log(data)


        let api_delete = page.components[0].api_delete;

        let primaryKeys = dataTables && dataTables[0] && dataTables[0].primary_key ? dataTables[0].primary_key : null;
        let newParams = api_delete;
        if (primaryKeys) {
            let foundObjects = dataFields.filter((obj) => primaryKeys.includes(obj.id));

            if (foundObjects.length > 0) {
                // Lấy ra mảng các id từ foundObjects
                let fomular_alias = foundObjects.map(obj => obj.fomular_alias);
                // console.log(fomular_alias)

                const newData = [];

                fomular_alias.map(alias => {
                    newData.push(data[alias])
                })

                // console.log(newData);
                // Tạo chuỗi newParams bằng cách nối api_delete và ids
                newParams = `${api_delete}/${newData.join("/")}`;


            } else {
                // console.log('Không tìm thấy đối tượng nào có id trong primaryKeys');
            }
        } else {
            // console.log('Không tìm thấy primaryKeys');
        }
        // console.log(newParams);

        Swal.fire({
            title: lang["confirm"],
            text: lang["confirm.content"],
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: lang["btn.delete"],
            cancelButtonText: lang["btn.cancel"],
            confirmButtonColor: 'rgb(209, 72, 81)',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${proxy()}${newParams}`, {
                    method: 'DELETE',
                    headers: {
                        "content-type": "application/json",
                        Authorization: `${_token}`,
                    },
                    body: JSON.stringify({ position: data.__position__ })
                })
                    .then(res => res.json())
                    .then((resp) => {
                        const { success, content, data, status } = resp;
                        // console.log(resp)
                        // functions.showApiResponseMessage(status)

                        if (success) {
                            Swal.fire({
                                title: lang["success"],
                                text: lang["success.delete"],
                                icon: "success",
                                showConfirmButton: false,
                                timer: 1500,
                            }).then(function () {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire({
                                title: lang["faild"],
                                text: lang["fail.delete"],
                                icon: "error",
                                showConfirmButton: false,
                                timer: 2000,
                            }).then(function () {
                                // Không cần reload trang
                            });
                        }
                    });
            }
        });
    }
    const redirectToImportData = () => {
        window.location.href = `/page/${url}/import`;
    }
    const handleKeyDown = (event) => {
        if (event.keyCode === 13) {
            handleSearchClick();
        }
    }
    const handleSearchClick = () => {
        setSearching(true)
        setCurrentPage(1);
        callApiCount()
        callApi(0);
        // callApiStatistic()
        setApiData([])
        setSumerize(0)

    }
    useEffect(() => {

        if (Object.keys(searchValues).length === 0) {
            setSearching(false)
        }
        else {

        }
    }, [searching]);



    const [searchValues, setSearchValues] = useState({});
    const handleInputChange = (fomular_alias, value) => {
        setSearchValues(prevValues => {
            if (value.trim() === '') {
                const { [fomular_alias]: _, ...newValues } = prevValues;
                return newValues;
            } else {
                return {
                    ...prevValues,
                    [fomular_alias]: value
                };
            }
        });
    };

    // console.log(props.data.values.length)
    return (
        <>
            <div class="col-md-12">
                <div class="white_shd full">
                    <div class="tab_style2 layout2">
                        <div class="tabbar">
                            <nav>
                                <div className="nav nav-tabs" style={{ borderBottomStyle: "0px" }} id="nav-tab" role="tablist">
                                    <div class="full graph_head_cus d-flex">
                                        <div class="heading1_cus margin_0 nav-item nav-link ">
                                            <h5>{page?.components?.[0]?.component_name}</h5>
                                        </div>

                                        {
                                            _user.role === "uad"
                                                ?
                                                <div className="ml-auto mt-2 pointer" onClick={() => redirectToInput()} data-toggle="modal" title={lang["btn.create"]}>
                                                    <FontAwesomeIcon icon={faSquarePlus} className="icon-add" />
                                                </div>
                                                :
                                                (dataCheck && dataCheck?.write)
                                                    ?
                                                    <div className="ml-auto mt-2 pointer" onClick={() => redirectToInput()} data-toggle="modal" title={lang["btn.create"]}>
                                                        <FontAwesomeIcon icon={faSquarePlus} className="icon-add" />
                                                    </div>
                                                    :
                                                    null
                                        }




                                        {
                                            current && current.length > 0 ? (
                                                <div class="ml-4 mt-2 pointer" data-toggle="modal" data-target="#exportExcel" title={lang["export_excel_csv"]}>

                                                    <FontAwesomeIcon icon={faDownload} className="icon-export" />
                                                </div>
                                            ) : null
                                        }


                                        {
                                            _user.role === "uad"
                                                ?

                                                <>
                                                    <div class="ml-4 mt-2 pointer" data-toggle="modal" data-target="#exportExcelEx" title={lang["export data example"]}>
                                                        <FontAwesomeIcon icon={faFileExport} className="icon-export-ex" />

                                                    </div>
                                                    <div class="ml-4 mt-2 pointer" onClick={redirectToImportData} title={lang["import data"]}>
                                                        <FontAwesomeIcon icon={faFileImport} className="icon-import" />
                                                    </div>
                                                </>

                                                :
                                                (dataCheck && dataCheck?.write)
                                                    ?
                                                    <>
                                                        <div class="ml-4 mt-2 pointer" data-toggle="modal" data-target="#exportExcelEx" title={lang["export data example"]}>
                                                            <FontAwesomeIcon icon={faFileExport} className="icon-export-ex" />

                                                        </div>
                                                        <div class="ml-4 mt-2 pointer" onClick={redirectToImportData} title={lang["import data"]}>
                                                            <FontAwesomeIcon icon={faFileImport} className="icon-import" />
                                                        </div>
                                                    </>

                                                    :
                                                    null
                                        }
                                    </div>
                                </div>
                            </nav>
                        </div>
                    </div>
                    <div class="table_section padding_infor_info_layout2 ">
                        <div class="col-md-12">
                            <div class="tab-content">
                                {statusActive ? (
                                    <>
                                        {
                                            loaded ? (
                                                current && current.length > 0 ? (
                                                    <>
                                                        <div class="table-responsive">

                                                            <div style={{ overflowX: 'auto' }}>
                                                                <table className={tableClassName} style={{ marginBottom: "10px", width: '100%' }}>
                                                                    <thead>
                                                                        <tr className="color-tr">
                                                                            <th className="font-weight-bold" style={{ minWidth: "50px" }} scope="col">{lang["log.no"]}</th>
                                                                            {apiDataName.map((header, index) => (
                                                                                <th key={index} className="font-weight-bold" style={{ minWidth: "200px" }}>
                                                                                    {header.display_name ? header.display_name : header.field_name}
                                                                                </th>
                                                                            ))}
                                                                            <th className="font-weight-bold align-center " style={{ minWidth: "100px" }}>{lang["log.action"]}</th>
                                                                        </tr>
                                                                        <tr>
                                                                            <th></th>
                                                                            {apiDataName.map((header, index) => (
                                                                                <th key={index} className="header-cell" style={{ minWidth: "200px" }}>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        value={searchValues[header.fomular_alias] || ''}
                                                                                        onChange={(e) => handleInputChange(header.fomular_alias, e.target.value)}
                                                                                        onKeyDown={handleKeyDown}

                                                                                    />
                                                                                </th>
                                                                            ))}
                                                                            <th className="align-center header-cell" onClick={handleSearchClick} style={{ minWidth: "100px" }}>

                                                                                <i className="fa fa-search size-24 pointer mb-2" title={lang["search"]}></i>
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {current.map((row, index) => {
                                                                            if (row) {
                                                                                return (
                                                                                    <tr key={index}>
                                                                                        <td scope="row" className="cell" style={{ minWidth: "50px" }}>{indexOfFirst + index + 1}</td>
                                                                                        {apiDataName.map((header) => (
                                                                                            <td key={header.fomular_alias} className="cell" style={{ minWidth: "200px" }}>
                                                                                                {renderData(header, row)}
                                                                                            </td>
                                                                                        ))}
                                                                                        <td className="align-center cell" style={{ minWidth: "80px" }}>
                                                                                            {
                                                                                                _user.role === "uad"
                                                                                                    ?
                                                                                                    <i className="fa fa-edit size-24 pointer icon-margin icon-edit" onClick={() => redirectToInputPUT(row)} title={lang["edit"]}></i>
                                                                                                    :
                                                                                                    (dataCheck && dataCheck?.modify)
                                                                                                        ?
                                                                                                        <i className="fa fa-edit size-24 pointer icon-margin icon-edit" onClick={() => redirectToInputPUT(row)} title={lang["edit"]}></i>
                                                                                                        :
                                                                                                        null
                                                                                            }
                                                                                            {
                                                                                                _user.role === "uad"
                                                                                                    ?
                                                                                                    <i className="fa fa-trash-o size-24 pointer icon-delete" onClick={() => handleDelete(row)} title={lang["delete"]}></i>
                                                                                                    :
                                                                                                    (dataCheck && dataCheck?.purge)
                                                                                                        ?
                                                                                                        <i className="fa fa-trash-o size-24 pointer icon-delete" onClick={() => handleDelete(row)} title={lang["delete"]}></i>
                                                                                                        :
                                                                                                        null
                                                                                            }
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            } else {
                                                                                return null;
                                                                            }
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <p>
                                                                    {lang["show"]} {formatNumber(indexOfFirst + 1)} - {formatNumber(indexOfFirst + apiData?.length)}   {`${lang["of"]} `}
                                                                    {loadingResult ?
                                                                        <img
                                                                            width={20}
                                                                            className="mb-1"
                                                                            src="/images/icon/load.gif"
                                                                            alt="Loading..."
                                                                        ></img>
                                                                        : formatNumber(sumerize)} {lang["results"]}
                                                                </p>
                                                                <nav aria-label="Page navigation example">
                                                                    <ul className="pagination mb-0">
                                                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                            <button className="page-link" onClick={() => paginate(1)}>
                                                                                &#8810;
                                                                            </button>
                                                                        </li>
                                                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                            <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                                                                                &laquo;
                                                                            </button>
                                                                        </li>
                                                                        {currentPage > 1 && <li className="page-item"><span className="page-link">...</span></li>}
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
                                                                        {currentPage < totalPages - 1 && <li className="page-item"><span className="page-link">...</span></li>}
                                                                        <li className={`page-item ${(currentPage === totalPages) ? 'disabled' : ''}`}>
                                                                            <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                                                                                &raquo;
                                                                            </button>
                                                                        </li>
                                                                        <li className={`page-item ${(currentPage === totalPages || sumerize === 0) ? 'disabled' : ''}`}>
                                                                            <button className="page-link" onClick={() => paginate(totalPages)}>
                                                                                &#8811;
                                                                            </button>
                                                                        </li>
                                                                    </ul>
                                                                </nav>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div class="table-responsive">
                                                        <table className={tableClassName}>
                                                            <thead>
                                                                <tr class="color-tr">
                                                                    <th class="font-weight-bold " style={{ width: "100px" }} scope="col">{lang["log.no"]}</th>
                                                                    {apiDataName.map((header, index) => (
                                                                        <th key={index} class="font-weight-bold">{header.display_name ? header.display_name : header.field_name}</th>
                                                                    ))}
                                                                    <th class="font-weight-bold align-center" style={{ width: "100px" }}>{lang["log.action"]}</th>
                                                                </tr>
                                                                <tr>
                                                                    <th></th>
                                                                    {apiDataName.map((header, index) => (
                                                                        <th key={index}>
                                                                            <input
                                                                                type="text"
                                                                                class="form-control"
                                                                                value={searchValues[header.fomular_alias] || ''}
                                                                                onChange={(e) => handleInputChange(header.fomular_alias, e.target.value)}
                                                                            />
                                                                        </th>
                                                                    ))}
                                                                    <th class="align-center" onClick={handleSearchClick} > <i class="fa fa-search size-24 pointer icon-margin mb-2" title={lang["search"]}></i></th>
                                                                </tr>

                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td class="font-weight-bold" colspan={`${apiDataName.length + 2}`} style={{ textAlign: 'center' }}><div>{lang["not found"]}</div></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )
                                            ) : (
                                                null
                                                // <div class="d-flex justify-content-center align-items-center w-100 responsive-div" >
                                                //     <img width={350} className="scaled-hover-target" src="/images/icon/loading.gif" ></img>
                                                // </div>
                                                // <div>{lang["not found data"]}</div>
                                            )
                                        }
                                    </>
                                ) :
                                    null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {dataStatis && dataStatis.length > 0 ? (
                <div class="col-md-12">
                    <div class="white_shd full margin_bottom_30">
                        <div class="tab_style2">
                            <div class="tabbar">
                                <nav>
                                    <div className="nav nav-tabs" style={{ borderBottomStyle: "0px" }} id="nav-tab" role="tablist">
                                        <div class="full graph_head_cus d-flex">
                                            <div class="heading1_cus margin_0 nav-item nav-link ">
                                                <h5>{lang["statistic"]}: {page?.components?.[0]?.component_name}</h5>
                                            </div>
                                        </div>
                                    </div>
                                </nav>
                            </div>
                        </div>
                        <div class="table_section padding_infor_info_layout2">
                            <div class="col-md-12">
                                <div class="col-md-12">
                                    <div class="table_section">
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
                                                    <StatisTable data={data} statis={statis} />
                                                )
                                            }
                                            else return null
                                        })}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null
            }
        </>

    )
}