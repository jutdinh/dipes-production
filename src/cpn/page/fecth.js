
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faDownload, faSquarePlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from "react-router-dom";
import Step from "./step/active"
import Swal from 'sweetalert2';
import XLSX from 'xlsx-js-style';
import Papa from 'papaparse';
import $ from 'jquery'

import Layout0 from "./layout/layout 0";
import Layout1 from "./layout/layout 1";
import StatisTable from './statistic/table_chart'
import Layout_active from "./layout/layout_active";
import Layout_keys from "./layout/layout_keys"
import Layout_chart from "./layout/layout_chart"
import data_cpn from '../render-cpn/data.json'
import RenderUI from '../render-cpn/render'
const rowsPerPage = 15;


export default () => {
    const { lang, proxy, auth, pages, functions } = useSelector(state => state);
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser) || {}
    //////console.log(29, pages)
    const { formatNumberWithCommas } = functions

    const { openTab, renderDateTimeByFormat } = functions
    const _token = localStorage.getItem("_token");
    const { project_id, version_id, url } = useParams();
    let navigate = useNavigate();
    const [dataTables, setDataTables] = useState([]);
    const [dataTable_id, setDataTableID] = useState(null);
    const [dataFields, setDataFields] = useState([]);
    const [apiData, setApiData] = useState([])

    const [dataUrlExport, setDataUrlExport] = useState('')
    const [errorSelect, setErrorSelect] = useState(null);
    const [loadingExportFile, setLoadingExportFile] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingResult, setLoadingResult] = useState(false);
    const [uploadedJson, setUploadedJson] = useState(null);
    ////////console.log(46, apiData)
    const currentURL = window.location.href;

    const params = functions.getAllParamsAfterPageId(currentURL, url);
    ////console.log(params);
    const [valueExport, setaValueExport] = useState({});
    const [apiDataName, setApiDataName] = useState([])
    const [dataStatis, setDataStatis] = useState([])
    const [statusActive, setStatusActive] = useState(false);
    const [errorLoadConfig, setErrorLoadConfig] = useState(false);
    const [effectOneCompleted, setEffectOneCompleted] = useState(false);
    const [page, setPage] = useState([]);
    const [dataUi, setDataUi] = useState([]);

    //////console.log(1175,apiDataName)
    const [apiViewPages, setApiViewPages] = useState([]);

    const [limit, setLimit] = useState(0)

    const [data, setData] = useState({});
    const [selectedFileType, setSelectedFileType] = useState('xlsx');
    const [dataSearch, setdataSearch] = useState([])
    const [totalSearch, setTotalSearch] = useState(0)
    const [sumerize, setSumerize] = useState(0)
    const [hasSetSumerize, setHasSetSumerize] = useState(false); //lưu count 1 lần
    const [count, setCount] = useState(0)
    const formatNumber = (num) => {
        if (num == null || isNaN(num)) {
            return '0';
        }

        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }
    // ////////console.log(dataStatis)
    const formatNumberSize = (num) => {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('nav-home_s2');

    useEffect(() => {
        if (!dataStatis || dataStatis.length === 0 && activeTab === 'nav-profile_s2') {
            setActiveTab('nav-home_s2');
        }
    }, [dataStatis]);

    useEffect(() => {


        setSearchValues({});
        setLoadingResult(false);
    }, [location.pathname]);


    useEffect(() => {

        fetch(`${proxy()}/auth/activation/check`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, activated, status, content } = resp;
                // ////////console.log(resp)
                if (activated) {
                    setStatusActive(true)
                }
                else {

                    // Swal.fire({
                    //     title: lang["faild"],
                    //     text: lang["fail.active"],
                    //     icon: "error",
                    //     showConfirmButton: true,
                    //     customClass: {
                    //         confirmButton: 'swal2-confirm my-confirm-button-class'
                    //     }
                    // }).then(function () {
                    //     // window.location.reload();
                    // });

                    setStatusActive(false)
                }
                setEffectOneCompleted(true);

            })

    }, [])



    const yourComponentArray = data_cpn.data[1]?.children.length > 0 ? data_cpn.data[1]?.children[0]?.component : data_cpn.data[1]?.component
    ////console.log(pages)

    useEffect(() => {
        if (pages && pages.length > 0) {
            const result = functions.findPageById(pages, `${url}`);

            ////console.log(141, result)
            if (result && result.component.length > 0) {
                setDataUi(result.component);
                setPage(result);
            } else {
                setDataUi([result]);
            }
        }
    }, [pages, url]);




    useEffect(() => {
        if (pages && pages.length > 0) {
            const pagesWithApiView = pages.filter(page => page.type === "apiview");
            setApiViewPages(pagesWithApiView);
            const filteredPages = pages.filter(page => page.type !== "apiview");
            const result = filteredPages.find(page => page.url === `/${url}`);
            if (result) {
                setPage(result);
            } else {
                // openTab('/page/not/found')
            }
        }
    }, [pages, url]);


    useEffect(() => {
        setCurrentPage(1)
    }, [page, url])

    const layoutId = page.components?.[0].layout_id;
    // ////////console.log(layoutId)
    const tableClassName = layoutId === 0 ? "table" : "table table-hover";

    const CustomFileInput = ({ onChange, ...props }) => {

        const [selectedFile, setSelectedFile] = useState(null);
        const fileInputRef = useRef(null);

        const handleButtonClick = (event) => {
            event.preventDefault();
            fileInputRef.current.click();
        };

        const handleFileChange = (event) => {
            event.preventDefault();
            const supportedExtensions = ['csv', 'xlsx', 'xls'];

            if (event.target.files.length > 0) {
                const file = event.target.files[0];
                const fileExtension = file.name.split(".").pop().toLowerCase();

                if (supportedExtensions.includes(fileExtension)) {
                    setSelectedFile({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        rawFile: file
                    });
                    setErrorSelect(null);
                } else {
                    setSelectedFile(null);
                    setErrorSelect(lang["check file"]);
                }
            }

        };

        function extractValueInBrackets(value) {
            const matches = value.match(/\(([^)]+)\)/);
            return matches ? matches[1] : value;
        }
        const processSelectedFile = (event) => {
            event.preventDefault();
            if (!selectedFile || !selectedFile.rawFile) return;

            const file = selectedFile.rawFile;
            const fileExtension = file.name.split(".").pop().toLowerCase();
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    if (fileExtension === 'csv') {
                        Papa.parse(e.target.result, {
                            complete: (result) => {
                                const modifiedData = result.data
                                    .filter(row => Object.values(row).some(value => value.trim() !== ''))
                                    .map(row => {
                                        const newRow = {};
                                        for (let key in row) {
                                            newRow[extractValueInBrackets(key)] = row[key];
                                        }
                                        return newRow;
                                    });

                                // ////////console.log("Parsed CSV Result:", modifiedData);
                                setUploadedJson(modifiedData);
                                importData();
                            },
                            header: true
                        });
                    } else if (['xlsx', 'xls'].includes(fileExtension)) {
                        const workbook = XLSX.read(e.target.result, { type: 'binary' });
                        const sheetName = workbook.SheetNames[0];
                        const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                        const modifiedData = json.map(row => {
                            const newRow = {};
                            for (let key in row) {
                                newRow[extractValueInBrackets(key)] = row[key];
                            }
                            return newRow;
                        });
                        // ////////console.log("Parsed Excel Result:", modifiedData);
                        setUploadedJson({ data: modifiedData });
                        importData();
                    }
                } catch (error) {
                    setErrorSelect(lang["format"]);
                }
            };

            if (fileExtension === 'csv') {
                reader.readAsText(file);
            } else {
                reader.readAsBinaryString(file);
            }
        };


        const fileTypeToReadable = (type) => {
            switch (type) {
                case 'text/csv':
                    return 'CSV';
                case 'application/vnd.ms-excel':
                    return 'Excel (XLS)';
                case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                    return 'Excel (XLSX)';
                default:
                    return 'Không xác định';
            }
        };

        return (
            <div>
                <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    {...props}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={handleButtonClick} className="btn btn-primary">
                        <i className="fa fa-file-excel-o"></i>  {lang["select file"]}
                    </button>

                    {selectedFile && <button className="btn btn-success ml-auto" onClick={processSelectedFile}>{lang["import"]}</button>}
                </div>

                {selectedFile && (
                    <div className="mt-2">
                        <ul>
                            <li> {lang["selected file"]}: {selectedFile.name}</li>
                            <li>{lang["size"]}: {formatNumberSize((selectedFile.size / 1024).toFixed(0))} KB</li>
                            <li>{lang["type"]}: {fileTypeToReadable(selectedFile.type)}</li>
                        </ul>
                    </div>
                )}
                {
                    errorSelect &&
                    <div className="mt-2 text-danger">
                        {errorSelect}
                    </div>
                }
            </div>
        );
    };

    // ////////console.log(uploadedJson)

    const BATCH_SIZE = 1000;


    const importData = async () => {
        if (!uploadedJson?.data) return;
        let batches = [];
        for (let i = 0; i < uploadedJson.data.length; i += BATCH_SIZE) {
            batches.push(uploadedJson.data.slice(i, i + BATCH_SIZE));
        }
        let logCount = 0;

        for (let batch of batches) {
            const requestBody = {
                data: batch,
                // type: "import"
            };
            logCount++;
            // ////////console.log("Sample batch data:", requestBody);

            try {
                const response = await fetch(`${proxy()}${page.components?.[0]?.api_import}`, {
                    method: "POST",
                    headers: {
                        Authorization: _token,
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(requestBody)
                });

                const jsonResponse = await response.json();
                const { success, content, data, result, total, fields, statisticValues, count, sumerize } = jsonResponse;
                // ////////console.log(jsonResponse)
                if (!success) {
                    console.error("Server did not process batch successfully:", jsonResponse);
                    break;
                }

                // ////////console.log("Successfully processed batch number:", logCount);
            } catch (error) {
                console.error("Error sending batch:", error);
                break;
            }
        }
    };
    const [dataPrivileges, setDataPrivileges] = useState([]);
    useEffect(() => {

        fetch(`${proxy()}/privileges/accounts`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, activated, status, content } = resp;

                if (success && data.length > 0) {
                    const dataUser = data.find(item => item.username === _user.username);
                    // ////////console.log(_user.username)
                    // ////////console.log(dataUser)
                    setDataPrivileges(dataUser?.privileges)
                }
            })

    }, [])
    // ////////console.log(dataPrivileges)
    const dataCheck = dataPrivileges?.find(item => item.table_id === dataTable_id);
    // ////////console.log(dataCheck)
    useEffect(() => {

        importData()

    }, [uploadedJson])


    useEffect(() => {
        if (page) {
            // const id_str = page.components?.[0]?.api_post.split('/')[2];
            const id_str = page.components?.[0]?.api_post.split('/')[2];
            const result = functions.findPostApi(page);

            ////////console.log(456, page)
            ////////console.log(456, result)
            // ////////console.log(id_str)
            fetch(`${proxy()}/apis/api/${result?.split('/')[2]}/input_info`, {
                headers: {
                    Authorization: _token
                }
            })
                .then(res => res.json())
                .then(res => {
                    const { data, success, content } = res;
                    //////console.log(413, res)
                    if (success) {
                        setDataTables(data.tables)
                        setDataTableID(data.tables[0].id)
                        setDataFields(data.body)
                        setApiDataName(data.fields)
                        setLoaded(true)
                    }
                })
        }
    }, [page, dataTable_id])
    // ////////console.log(dataTable_id)
    // ////////console.log(page)
    const handleCloseModal = () => {
        setSelectedFields([]);
        setSelectedStats([]);
        setSelectAll(false)
    }
    const [loaded, setLoaded] = useState(false);

    // ////////console.log(page)
    //search
    const [currentPage, setCurrentPage] = useState(0);

    const [requireCount, setRequireCount] = useState(true);
    const [searchValues, setSearchValues] = useState({});
    // const timeoutRef = useRef(null);
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

    useEffect(() => {
        if (currentPage >= 1) {
            setRequireCount(false);
        }
        // ////////console.log(requireCount)
    }, [currentPage]);

    // ////////console.log(2343243243324242, currentPage - 1)
    const [previousSearchValues, setPreviousSearchValues] = useState({});
    const [currentCount, setCurrentCount] = useState(null);


    const callApi = (data, dataUrl, startIndex = currentPage - 1,) => {
        const startTime = new Date().getTime();
        let loadingTimeout;
        let loadingTimeoutSearch;
        // if (Object.keys(searchValues).length !== 0) {
        //     loadingTimeoutSearch = setTimeout(() => {
        //         setLoadingSearch(true);
        //     }, 310);
        // }

        loadingTimeout = setTimeout(() => {
            setLoading(true)
        }, 300);
        const getApi = functions.findGetApi(page);
        ////////console.log(482, getApi)
        const searchBody = {
            // table_id: dataTable_id,
            start_index: startIndex,
            criteria: data,
            require_count: false,
            require_statistic: false,
            // api_id: getApi?.split('/')[2]
            // exact: true
        }

        //////console.log("ĐÂY LÀ BODY:", searchBody)
        if (dataUrl) {
            fetch(`${proxy()}${dataUrl}`, {
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
                    //////console.log(74, res)
                    if (success) {
                        setApiData(data.filter(record => record != undefined));

                        setDataStatis(statisticValues);
                        setLoaded(true);

                        if (data.length < 15) {
                            setTotalPages(currentPage);
                        } else if (currentPage === totalPages) {
                            setTotalPages(prevTotalPages => prevTotalPages + 1);
                        }

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
                    // ////////console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
                });
        }

    };

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
        const getApi = functions.findGetApi(page);
        const searchBody = {
            table_id: dataTable_id,
            start_index: currentPage - 1,
            criteria: searchValues,
            require_count: true,
            require_statistic: false,
            api_id: getApi?.split('/')[2]
            // exact: true
        }

        // ////////console.log(searchBody)
        fetch(`${proxy()}${functions.findSearchApi(page)}`, {
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
                // ////////console.log(74, res)
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
                // ////////console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
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
        const getApi = functions.findGetApi(page);
        const searchBody = {
            table_id: dataTable_id,
            start_index: currentPage - 1,
            criteria: searchValues,
            require_count: false,
            require_statistic: true,
            api_id: getApi?.split('/')[2]
            // exact: true
        }

        ////////console.log(searchBody)

        fetch(`${proxy()}${functions.findSearchApi(page)}`, {
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
                ////////console.log(74, res)
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
                // ////////console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
            });
    };

    useEffect(() => {
        // callApiView()
        if (page) {
            callApiView()

        }
    }, [page, dataTable_id])



    // useEffect(() => {

    //         callApiViewtTest()

    // }, [dataUi, dataTable_id])

    // ////////console.log(loadingSearch)
    //searching
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

    const handleKeyDown = (event) => {
        if (event.keyCode === 13) {
            handleSearchClick();

        }
    }

    const handleSearchClick = (data) => {
        setSearchValues(data)
        ////////console.log(762, data)
        setCurrentPage(1);
        if (currentPage === 1) {

            callApiCount()
            callApi(data);
            callApiStatistic()


            setSumerize(0)
        }
    }
    ////////console.log(775, searchValues)

    const redirectToInput = (url_button) => {
        ////console.log(url_button)
        ////////console.log(779, url_button)
        // if (errorLoadConfig) {
        //     Swal.fire({
        //         title: lang["faild"],
        //         text: lang["not found config"],
        //         icon: "error",
        //         showConfirmButton: true,
        //         customClass: {
        //             confirmButton: 'swal2-confirm my-confirm-button-class'
        //         }
        //     })
        //     return;
        // }
        // ////////console.log(page)
        const result = functions.findPostApi(page);
        ////////console.log(result)
        // const id_str = page.components?.[0]?.api_post.split('/')[2];

        ////console.log(`${url}/apis/api/${url_button.replace("/ui/", "")}/input_info`)

        // window.location.href = `${url}/apis/api/${url_button.replace("/ui/", "")}/input_info`;
        openTab(`/page/${url}/apis/api/${url_button.replace("/ui/", "")}/input_info`)
    }


    const redirectToImportData = (id) => {

        // if (errorLoadConfig) {
        //     Swal.fire({
        //         title: lang["faild"],
        //         text: lang["not found config"],
        //         icon: "error",
        //         showConfirmButton: true,
        //         customClass: {
        //             confirmButton: 'swal2-confirm my-confirm-button-class'
        //         }
        //     })
        //     return;
        // }
        // // ////////console.log(page)

        window.location.href = `/page/${url}/import/${id}`;
    }
    const handleViewDetail = async (record, dataUrl) => {
        ////////console.log(record)
        ////////console.log(dataUrl)
        // const { components } = page;
        // const cpn = components[0]
        // const { api_detail } = cpn;
        const api_detail = functions.findDetailApi(page)
        if (api_detail != undefined) {
            const id_str = dataUrl.split('/')[2]

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
                            // ////////console.log("succcess", data)
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

                openTab(`/page/${url}/detail/${id_str}/${stringifiedParams}`)

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

    const handleTable_Param = async (record, dataUrl) => {
        ////console.log(dataUrl)
        const api_detail = functions.findDetailApi(page)
        if (api_detail != undefined) {
            const id_str = dataUrl.split('/')[2]

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
                            // ////////console.log("succcess", data)
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

                openTab(`/page/${url}/detail/${id_str}/${stringifiedParams}`)

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

    const deleteData = (data) => {
        let rawParams = page.apis.delete;
        // const keys = Object.keys(data);
        // keys.map(key => {
        //     const value = data[key];
        //     rawParams = rawParams.replaceAll(key, value);
        // })

        fetch(`${proxy()}${rawParams}`, {
            method: "DELETE",
            headers: {
                Authorization: _token,
                "content-type": "application/json"

            }
        }).then(res => res.json()).then(res => {
            const { success, content } = res;
            if (success) {
                // al.success("Thành công", "Xóa dữ liệu thành công")
                setTimeout(() => {
                    window.location.reload();
                }, 1600);
            } else {
                // al.failure("Thất bại", "Xóa thất bại")
            }
        })
    }
    ////////console.log(838, functions.findDeleteApi(page))

    const handleDelete = (data, dataUrl) => {
        ////console.log(data)
        ////console.log(dataUrl)



        if (typeof data === 'object' || data !== undefined) {

            const extractedValues = functions.extractValuesFromData(functions.findComponentWithDeleteApiUrl(page, dataUrl), data);
            ////console.log(extractedValues)
            let api_delete = dataUrl;

            // let primaryKeys = dataTables && dataTables[0] && dataTables[0].primary_key ? dataTables[0].primary_key : null;
            // let newParams = api_delete;
            //     if (primaryKeys) {
            //         let foundObjects = dataFields.filter((obj) => primaryKeys.includes(obj.id));

            //         if (foundObjects.length > 0) {
            //             // Lấy ra mảng các id từ foundObjects
            //             let fomular_alias = foundObjects.map(obj => obj.fomular_alias);
            //             // ////////console.log(fomular_alias)

            //             const newData = [];

            //             fomular_alias.map(alias => {
            //                 newData.push(data[alias])
            //             })

            //             // ////////console.log(newData);
            //             // Tạo chuỗi newParams bằng cách nối api_delete và ids
            //             newParams = `${api_delete}/${newData.join("/")}`;


            //         } else {
            //             // ////////console.log('Không tìm thấy đối tượng nào có id trong primaryKeys');
            //         }
            //     } else {
            //         // ////////console.log('Không tìm thấy primaryKeys');
            //     }
            //     // ////////console.log(newParams);
            const newParams = `${api_delete}/${extractedValues}`;
            ////////console.log(newParams)
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
                    // const newParams = functions.findDeleteApi(page)
                    fetch(`${proxy()}${newParams}`, {
                        method: 'DELETE',
                        headers: {
                            "content-type": "application/json",
                            Authorization: `${_token}`,
                        },
                        body: JSON.stringify({ position: data.position })
                    })
                        .then(res => res.json())
                        .then((resp) => {
                            const { success, content, data, status } = resp;
                            ////////console.log(resp)
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
    }

    const redirectToInputPUT = async (record, dataUrl) => {
        //////console.log(420, dataUrl)
        const dataApiPut = functions.findPutApi(page);
        //////console.log(dataApiPut)
        // const { components } = page;
        // const cpn = components[0]
        // const { api_put } = cpn;

        if (dataApiPut != undefined) {
            // const id_str = dataApiPut.url.split('/')[2]
            const id_str = dataUrl.split('/')[2]
            const response = await new Promise((resolve, reject) => {
                fetch(`${proxy()}/apis/api/${id_str}/input_info`, {
                    headers: {
                        Authorization: _token
                    }
                })
                    .then(res => res.json())
                    .then(res => {
                        const { data, success, content } = res;
                        ////////console.log(res)
                        if (success) {
                            setDataTables(data.tables)
                            setDataFields(data.body)
                        }
                        resolve(res)
                    })
            })
            const { success, data } = response;
            ////////console.log(54, response)
            if (success) {
                const { params } = data;
                const stringifiedParams = params.map(param => {
                    const { fomular_alias } = param
                    return record[fomular_alias]
                }).join('/')
                ////////console.log(962, stringifiedParams)
                openTab(`/page/${url}/put/api/${id_str}/${stringifiedParams}`)
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
    const formatIfDate = (value) => {
        // Kiểm tra xem giá trị có phải là chuỗi ngày giờ ISO không
        if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/.test(value)) {
            // Định dạng ngày giờ theo yêu cầu của bạn (ví dụ: dd/mm/yyyy)
            const date = new Date(value);
            return date.toLocaleDateString('vi-VN');
        }
        return value; // Nếu không phải ngày, trả về giá trị như cũ
    };
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

    // Sử dụng hàm
    const callApiView = (startAt = 0, amount = 15) => {
        const headerApi = {
            Authorization: _token,
            'start-at': startAt,
            'data-amount': amount
        }
        const getApi = functions.findGetApi(page);
        if (getApi) {

            fetch(`${proxy()}${getApi}`, {
                headers: headerApi
            })
                .then(res => res.json())
                .then(res => {
                    const { success, content, data, count, fields, limit, statistic } = res;
                    ////////console.log(123456, res)
                    setApiData([])
                    if (data && data.length > 0) {
                        setApiData(data.filter(record => record != undefined));
                        setApiDataName(fields);
                        setDataStatis(statistic);
                        setSumerize(count)
                    }
                });
        } else {
            // console.error('Invalid API URL');
        }
    }

    // const callApiViewtTest = (startAt = 0, amount = 15) => {
    //     const headerApi = {
    //         Authorization: _token,
    //         'start-at': startAt,
    //         'data-amount': amount
    //     }
    //     // const apiGet = page.components?.[0]?.api_get;
    //     const apiGet = "/api/61EF5341548149488D0BACB64794267C"
    //     fetch(`${proxy()}${apiGet}`, {
    //         headers: headerApi
    //     })
    //         .then(res => res.json())
    //         .then(res => {
    //             const { success, content, data, count, fields, limit, statistic } = res;
    //             ////////console.log(res)
    //             if (data && data.length > 0) {
    //                 setApiData(data.filter(record => record != undefined));
    //                 setApiDataName(fields);
    //                 setDataStatis(statistic);
    //                 setSumerize(count)
    //                 // setLimit(limit)
    //                 // setApiViewData(data)
    //                 // setApiViewFields(fields)
    //             }
    //         });
    // }

    const [totalPages, setTotalPages] = useState(0);
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const current = apiData
    //console.log(1175, current)
    const paginate = (pageNumber) => {
        const startAt = (pageNumber - 1) * rowsPerPage;
        if (Object.keys(searchValues).length === 0) {
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
    const [selectedFields, setSelectedFields] = useState([]);/// fields
    const [selectedStats, setSelectedStats] = useState([]);
    const [exportType, setExportType] = useState("excel");
    //console.log(selectedFields)
    // statis fields
    const handleStatsChange = (event) => {
        const { value } = event.target;
        setSelectedStats(prevStats =>
            prevStats.includes(value)
                ? prevStats.filter(stat => stat !== value)
                : [...prevStats, value]
        );
    }

    //fields
    const [selectAll, setSelectAll] = useState(false);
    const handleSelectAllChange = () => {
        if (selectAll) {
            setSelectedFields([]);
        } else {
            setSelectedFields(apiDataName.map(header => header.fomular_alias));
        }
        setSelectAll(!selectAll);
    }

    const handleFieldChange = (event) => {
        const { value } = event.target;
        setSelectedFields(prevFields =>
            prevFields.includes(value)
                ? prevFields.filter(field => field !== value)
                : [...prevFields, value]
        );
    }
    function jsonToCsv(jsonData) {
        const header = Object.keys(jsonData[0]).join(",");
        const rows = jsonData.map(row => Object.values(row).join(","));
        return [header, ...rows].join("\n");
    }

    const exportToCSV = (csvData, fields) => {
        //////console.log(fields)
        const selectedHeaders = fields;
        function styleHeaders(ws) {
            const headerStyle = {
                fill: {
                    fgColor: { rgb: "008000" }
                },
                font: {
                    bold: true,
                    color: { rgb: "fffffff" }
                }
            };

            const colNum = XLSX.utils.decode_range(ws['!ref']).e.c + 1;
            for (let i = 0; i < colNum; ++i) {
                const cellRef = XLSX.utils.encode_cell({ c: i, r: 0 });
                if (ws[cellRef]) {
                    ws[cellRef].s = headerStyle;
                }
            }
        }
        const generateSampleData = (field) => {
            switch (field.DATATYPE) {
                case "INT":
                    return "0001";
                case "INT UNSIGNED":
                    return "0001";
                case "BIGINT":
                    return "0001";
                case "BIGINT UNSIGNED":
                    return "0001";
                case "TEXT":
                    return "Sample Text";
                case "BOOL":
                    return "True/False";
                case "DECIMAL":
                    return "1.00";
                case "DECIMAL":
                    return "1.0";
                case "CHAR":
                    return "a";
                case "EMAIL":
                    return "abc@gmail.com";
                case "PHONE":
                    return "0123456789";
                case "DATE":
                    return "01/11/2022";
                case "DATETIME":
                    return "01/11/2022 10:10:26";
                default:
                    return "Sample Text";
            }
        }
        // const headerRow = selectedHeaders.reduce((obj, header) => ({ ...obj, [header.fomular_alias]: header.display_name }), {});

        const segments = page.page_title;

        // const lastSegment = segments[segments.length - 1];//tên

        const result = segments;

        const headerRow = selectedHeaders.map(header => `${header.field_name}(${header.fomular_alias})`);

        const sampleRow = selectedHeaders.map(header => generateSampleData(header));

        if (csvData === 'xlsx') {
            const ws = XLSX.utils.json_to_sheet([headerRow, sampleRow], { skipHeader: true });
            styleHeaders(ws);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Template");

            XLSX.writeFile(wb, `TEMPLATE_EXCEL_${result.toUpperCase()}_${(new Date()).getTime()}.xlsx`);

        } else if (csvData === 'csv') {

            const utf8BOM = "\uFEFF";

            const csv = utf8BOM + headerRow.join(",") + "\n" + sampleRow.join(",") + "\n";

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

            const link = document.createElement("a");

            const url = URL.createObjectURL(blob);

            link.setAttribute("href", url);

            link.setAttribute("download", `TEMPLATE_CSV_${result.toUpperCase()}_${(new Date()).getTime()}.csv`);

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);
        }
        $('#closeModalExportFileSample').click();
    }

    const getCurrentDateTimeForFilename = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}_${hours}${minutes}${seconds}`;
    };

    const Export = () => {
        const selectFields = [...selectedFields, ...selectedStats]
        //console.log(selectFields)
        const exportBody = {
            export_fields: selectFields,
            criteria: valueExport,
            export_type: exportType
        };
        setLoadingExportFile(true)
        fetch(`${proxy()}${dataUrlExport}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "Accept": exportType === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv',

            },
            body: JSON.stringify(exportBody)
        })
            .then(res => res.blob())


            .then(blob => {
                ////////console.log(1300, blob)
                if (exportType === 'csv') {
                    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
                    const withBom = new Blob([bom, blob], { type: 'text/csv' });
                    blob = withBom;
                }
                const url = window.URL.createObjectURL(blob);
                ////////console.log(1300, url)
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;

                const datetimeString = getCurrentDateTimeForFilename();

                const segments = page.page_title.split('/');
                const lastSegment = segments[segments.length - 1];//tên
                const result = lastSegment.replace(/-/g, '');

                a.download = exportType === 'excel' ? `DATA_${result.toUpperCase()}_${datetimeString}.xlsx` : `DATA_${result.toUpperCase()}_${datetimeString}.csv`;

                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                setLoadingExportFile(false)
                setSelectedFields([]);
                setSelectAll(false)
            })
            .catch(error => {
                console.error('Error during export:', error);
                setLoadingExportFile(false)
            });
    };



    const callApiDataModalExport = (url, startAt = 0, amount = 15) => {
        const headerApi = {
            // Authorization: _token,
            'start-at': startAt,
            'data-amount': amount
        }

        ////////console.log(55, url)
        fetch(`${proxy()}${url}`, {
            headers: headerApi
        })

            .then(res => res.json())
            .then(res => {
                const { success, content, data, count, fields, limit, statistic } = res;
                //////console.log(123456, res)
                setApiData([])
                if (data && data.length > 0) {
                    setApiData(data.filter(record => record != undefined));

                    // setLimit(limit)
                    // setApiViewData(data)
                    // setApiViewFields(fields)
                }
            });

    }

    const callApiDataModalExport_PK = (data, dataUrl, startIndex = currentPage - 1) => {

        const searchBody = {
            start_index: startIndex,
            criteria: data,
            require_count: false,
            require_statistic: false,
        }
        if (dataUrl) {

            fetch(`${proxy()}${dataUrl}`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    Authorization: _token,
                    fromIndex: currentPage - 1,
                    "data-amount": rowsPerPage
                },
                body: JSON.stringify(searchBody)
            })
                .then(res => res.json())
                .then(res => {
                    const { success, content, data, result, total, fields, count, sumerize } = res;
                    const statisticValues = res.statistic;
                    //console.log(74, res)
                    if (success) {
                        setApiData(data.filter(record => record != undefined));

                    } else { }
                });
        }

    };




    const exportFile = (dataField, dataUrlGet, dataUrl) => {
        setApiDataName(dataField)
        setDataUrlExport(dataUrl)
        // //console.log(1388, dataField)
        // //console.log(1388, dataUrlGet)
        // //console.log(1388, dataUrl)
        callApiDataModalExport(dataUrlGet)
    }

    const exportFile_PK = (dataField, dataUrlPreview, dataUrl, fomularAlias_PK, data) => {
        setApiDataName(dataField)
        setDataUrlExport(dataUrl)

        const extractValueByKey = (data, key) => {
            return { [key]: data[key] };
        };
        // Sử dụng hàm
        const result = extractValueByKey(data, fomularAlias_PK);

        setaValueExport(result)
        callApiDataModalExport_PK(result, dataUrlPreview)
    }



    const submitButton_Custom = (params, url, primary_key, value, row) => {
        //console.log(params)
        //console.log(url)
        //console.log(primary_key)
        //console.log(row)


        const extractValueByKey = (data, key) => {
            return { [key]: data[key] };
        };
        // Sử dụng hàm
        const result = extractValueByKey(value, primary_key);
        //console.log(result)

        callApiForButtonCustom(url, params, result)
    }

    const callApiForButtonCustom = (url, param, result) => {



        //console.log(`${proxy()}${url}/${param}`)
        fetch(`${proxy()}${url}/${param}`, {
            method: "PUT",
            headers: {
                "content-type": "application/json",
                Authorization: _token,

            },
            body: JSON.stringify(result)
        })
            .then(res => res.json())
            .then(res => {
                const { success, content, data, result, total, fields, count, sumerize } = res;
                const statisticValues = res.statistic;
                //console.log(9999, res)
                if (success) {


                } else { }
            });


    };




    // Loading Export
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

    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title ">
                            <h4 class="ml-1">{lang["manage data"]}</h4>
                        </div>
                    </div>
                </div>
                {/* List table */}
                <div class="row">
                    {/* modal export excel/csv example */}
                    {/* <div class={`modal `} id="exportExcelEx">
                        <div class="modal-dialog modal-dialog-center">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h4 class="modal-title">{lang["export sample data"]}</h4>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <h5 class="mt-4 mb-2">{lang["select export type"]}:</h5>
                                        <div>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="fileType"
                                                    value="xlsx"
                                                    checked={selectedFileType === 'xlsx'}
                                                    onChange={e => setSelectedFileType(e.target.value)}
                                                />
                                                <span className="ml-2">Excel</span>
                                            </label>
                                            <label className="ml-4">
                                                <input
                                                    type="radio"
                                                    name="fileType"
                                                    value="csv"
                                                    checked={selectedFileType === 'csv'}
                                                    onChange={e => setSelectedFileType(e.target.value)}
                                                />
                                                <span className="ml-2">CSV</span>
                                            </label>
                                        </div>
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" onClick={exportToCSV} class="btn btn-success">{lang["export"]}</button>
                                    <button type="button" id="closeModalExportFileSample" onClick={handleCloseModal} class="btn btn-danger" data-dismiss="modal">{lang["btn.close"]}</button>
                                </div>
                            </div>
                        </div>
                    </div> */}
                    {/* modal export excel/csv */}
                    <div class={`modal `} id="exportExcel">
                        <div class="modal-dialog modal-dialog-center">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h4 class="modal-title">{lang["export"]}</h4>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <h5 class="mt-2 mb-2">{lang["select fields"]}:</h5>
                                        <div className="checkboxes-grid ml-4">
                                            <div className="select-all-checkbox">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectAll}
                                                        onChange={handleSelectAllChange}
                                                    />
                                                    <span className="ml-2 font-weight-bold">{lang["selectall"]}</span>
                                                </label>
                                            </div>

                                            {apiDataName.map((header, index) => (
                                                <label key={index}>
                                                    <input
                                                        type="checkbox"
                                                        value={header.fomular_alias}
                                                        checked={selectedFields.includes(header.fomular_alias)}
                                                        onChange={handleFieldChange}
                                                    />
                                                    <span className="ml-2">{header.display_name || header.field_name}</span>
                                                </label>
                                            ))}
                                        </div>

                                        {/* {
                                            dataStatis && dataStatis.length > 0 ? (
                                                <>
                                                    <h5 class="mt-4 mb-2">{lang["select statistic fields "]}:</h5>
                                                    <div className="ml-4">
                                                        {
                                                            current && current.length > 0 ? (
                                                                <div className="checkboxes-grid">
                                                                    {dataStatis.map((stat, index) => (
                                                                        <label key={index}>
                                                                            <input
                                                                                type="checkbox"
                                                                                value={stat.fomular_alias}
                                                                                checked={selectedStats.includes(stat.fomular_alias)}
                                                                                onChange={handleStatsChange}
                                                                            />
                                                                            <span className="ml-2">{stat.display_name}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div class="list_cont ">
                                                                    <p>Not found</p>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </>
                                            ) : (
                                                null
                                            )
                                        } */}



                                        <h5 class="mt-4 mb-2">{lang["select export type"]}:</h5>
                                        <div className="ml-4">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    value="excel"
                                                    checked={exportType === "excel"}
                                                    onChange={() => setExportType("excel")}
                                                />
                                                <span className="ml-2">Excel</span>
                                            </label>
                                            <label className="ml-4">
                                                <input
                                                    type="checkbox"
                                                    value="csv"
                                                    checked={exportType === "csv"}
                                                    onChange={() => setExportType("csv")}
                                                />
                                                <span className="ml-2">CSV</span>
                                            </label>
                                        </div>


                                        <h5 class="mt-4 mb-2">{lang["preview data"]}: </h5>
                                        {selectedFields && selectedFields.length > 0 || selectedStats.length > 0 ?
                                            (
                                                <>
                                                </>
                                            ) :
                                            <>
                                                {lang["preview.content"]}
                                            </>
                                        }

                                        {selectedFields && selectedFields.length > 0 || current & current.length > 0 || dataStatis && dataStatis.length > 0 ? (
                                            <div class="table-responsive">
                                                <table class="table table-striped excel-preview">
                                                    <thead>
                                                        {selectedFields.map((field) => {
                                                            const header = apiDataName.find(
                                                                (header) => header.fomular_alias === field
                                                            );
                                                            return <th key={field}>{header ? header.field_name || header.display_name : field}</th>;
                                                        })}
                                                    </thead>
                                                    <tbody>
                                                        {current.slice(0, 5).map((row, rowIndex) => (
                                                            <tr key={rowIndex}>
                                                                {selectedFields.map((field) => (
                                                                    <td key={field}>{formatIfDate(row[field])}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                        {dataStatis && dataStatis.length > 0 ? (
                                                            <tr >
                                                                {selectedStats.map((statAlias, index) => {
                                                                    const stat = dataStatis.find(
                                                                        (stat) => stat.fomular_alias === statAlias
                                                                    );
                                                                    return (
                                                                        <td key={index} class="font-weight-bold" colspan={`${selectedFields.length + 1}`} style={{ textAlign: 'right' }}>
                                                                            {stat ? `${stat.display_name}: ${stat.result}` : ''}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ) : null
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : null}
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" onClick={() => {
                                        if (selectedFields.length === 0) {
                                            Swal.fire({
                                                title: lang["faild"],
                                                text: lang["export.content.error"],
                                                icon: "error",
                                                showConfirmButton: true,
                                                customClass: {
                                                    confirmButton: 'swal2-confirm my-confirm-button-class'
                                                }
                                            })
                                        } else {
                                            Export(apiData);
                                        }
                                    }} class="btn btn-success " data-dismiss="modal">{lang["export"]} </button>
                                    <button type="button" data-dismiss="modal" onClick={handleCloseModal} class="btn btn-danger" >{lang["btn.close"]}</button>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* modal export excel*/}
                    <div class={`modal `} id="exportExcel_PK">
                        <div class="modal-dialog modal-dialog-center">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h4 class="modal-title">{lang["export"]}</h4>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <h5 class="mt-2 mb-2">{lang["select fields"]}:</h5>
                                        <div className="checkboxes-grid ml-4">
                                            <div className="select-all-checkbox">
                                                <label class="pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectAll}
                                                        onChange={handleSelectAllChange}
                                                    />
                                                    <span className="ml-2 font-weight-bold">{lang["selectall"]}</span>
                                                </label>
                                            </div>

                                            {apiDataName.map((header, index) => (
                                                <label class="pointer" key={index} >
                                                    <input
                                                        type="checkbox"
                                                        value={header.fomular_alias}
                                                        checked={selectedFields.includes(header.fomular_alias)}
                                                        onChange={handleFieldChange}
                                                    />
                                                    <span className="ml-2">{header.display_name || header.field_name}</span>
                                                </label>
                                            ))}
                                        </div>

                                        {/* {
                                            dataStatis && dataStatis.length > 0 ? (
                                                <>
                                                    <h5 class="mt-4 mb-2">{lang["select statistic fields "]}:</h5>
                                                    <div className="ml-4">
                                                        {
                                                            current && current.length > 0 ? (
                                                                <div className="checkboxes-grid">
                                                                    {dataStatis.map((stat, index) => (
                                                                        <label key={index}>
                                                                            <input
                                                                                type="checkbox"
                                                                                value={stat.fomular_alias}
                                                                                checked={selectedStats.includes(stat.fomular_alias)}
                                                                                onChange={handleStatsChange}
                                                                            />
                                                                            <span className="ml-2">{stat.display_name}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div class="list_cont ">
                                                                    <p>Not found</p>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </>
                                            ) : (
                                                null
                                            )
                                        } */}





                                        <h5 class="mt-4 mb-2">{lang["preview data"]}: </h5>
                                        {selectedFields && selectedFields.length > 0 || selectedStats.length > 0 ?
                                            (
                                                <>
                                                </>
                                            ) :
                                            <>
                                                {lang["preview.content"]}
                                            </>
                                        }

                                        {selectedFields && selectedFields.length > 0 || current & current.length > 0 || dataStatis && dataStatis.length > 0 ? (
                                            <div class="table-responsive">
                                                <table class="table table-striped excel-preview">
                                                    <thead>
                                                        {selectedFields.map((field) => {
                                                            const header = apiDataName.find(
                                                                (header) => header.fomular_alias === field
                                                            );
                                                            return <th key={field}>{header ? header.field_name || header.display_name : field}</th>;
                                                        })}
                                                    </thead>
                                                    <tbody>
                                                        {current.slice(0, 5).map((row, rowIndex) => (
                                                            <tr key={rowIndex}>
                                                                {selectedFields.map((field) => (
                                                                    <td key={field}>{formatIfDate(row[field])}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                        {dataStatis && dataStatis.length > 0 ? (
                                                            <tr >
                                                                {selectedStats.map((statAlias, index) => {
                                                                    const stat = dataStatis.find(
                                                                        (stat) => stat.fomular_alias === statAlias
                                                                    );
                                                                    return (
                                                                        <td key={index} class="font-weight-bold" colspan={`${selectedFields.length + 1}`} style={{ textAlign: 'right' }}>
                                                                            {stat ? `${stat.display_name}: ${stat.result}` : ''}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ) : null
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : null}
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" onClick={() => {
                                        if (selectedFields.length === 0) {
                                            Swal.fire({
                                                title: lang["faild"],
                                                text: lang["export.content.error"],
                                                icon: "error",
                                                showConfirmButton: true,
                                                customClass: {
                                                    confirmButton: 'swal2-confirm my-confirm-button-class'
                                                }
                                            })
                                        } else {
                                            Export(apiData);
                                        }
                                    }} class="btn btn-success " data-dismiss="modal">{lang["export"]} </button>
                                    <button type="button" data-dismiss="modal" onClick={handleCloseModal} class="btn btn-danger" >{lang["btn.close"]}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* modal import excel/csv data */}
                    <div class={`modal `} id="importExcel">
                        <div class="modal-dialog modal-dialog-center">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h4 class="modal-title">{lang["import data"]}</h4>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <div>
                                            <CustomFileInput />
                                        </div>
                                    </form>
                                </div>
                                <div class="modal-footer">

                                    <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* <Step /> */}
                    {layoutId === 0 ? (
                        < Layout0 activeTab={activeTab} page={page} statusActive={statusActive} dataCheck={dataCheck} />
                    ) : layoutId === 1 ? (
                        < Layout1 activeTab={activeTab} page={page} statusActive={statusActive} dataCheck={dataCheck} />
                    ) : layoutId === 2 ? (
                        < Layout_active page={page} statusActive={statusActive} dataCheck={dataCheck} />
                    ) : layoutId === 3 ? (
                        < Layout_keys page={page} statusActive={statusActive} dataCheck={dataCheck} />
                    ) : layoutId === 4 ? (
                        < Layout_chart page={page} statusActive={statusActive} dataCheck={dataCheck} />
                    ) : null
                    }

                    {/* {layoutId === 0 ? (
                        <div class="col-md-12">
                            <div class="white_shd full">
                                <div class="full graph_head_cus d-flex">
                                    <div class="heading1_cus margin_0 ">
                                        <div class="tab_style2">
                                            <div class="tabbar">
                                                <nav>
                                                    <div className="nav nav-tabs" style={{ borderBottomStyle: "0px" }} id="nav-tab" role="tablist">
                                                        {dataStatis && dataStatis.length > 0 ? (
                                                            <>
                                                                <a
                                                                    className={`nav-item nav-link ${activeTab === 'nav-home_s2' ? 'active' : ''}`}
                                                                    id="nav-home-tab"
                                                                    data-toggle="tab"
                                                                    href="#nav-home_s2"
                                                                    role="tab"
                                                                    aria-controls="nav-home_s2"
                                                                    onClick={() => setActiveTab('nav-home_s2')}
                                                                >
                                                                    <h5>{page?.components?.[0]?.component_name}</h5>
                                                                </a>
                                                                <a
                                                                    className={`nav-item nav-link ${activeTab === 'nav-profile_s2' ? 'active' : ''}`}
                                                                    id="nav-profile-tab"
                                                                    data-toggle="tab"
                                                                    href="#nav-profile_s2"
                                                                    role="tab"
                                                                    aria-controls="nav-profile_s2"
                                                                    onClick={() => setActiveTab('nav-profile_s2')}
                                                                >
                                                                    <h5>{lang["statistic"]}: {page?.components?.[0]?.component_name}</h5>
                                                                </a>
                                                            </>
                                                        ) : (
                                                            <a
                                                                className="nav-item nav-link"
                                                                id="nav-home-tab"
                                                                data-toggle="tab"
                                                                href="#nav-home_s2"
                                                                role="tab"
                                                                aria-controls="nav-home_s2"
                                                                onClick={() => setActiveTab('nav-home_s2')}
                                                            >
                                                                <h5>{page?.components?.[0]?.component_name}</h5>
                                                            </a>
                                                        )}
                                                    </div>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>

                                    {statusActive ? (

                                        <>
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


                                        </>
                                    ) : null}
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
                                                    </div></>

                                                :
                                                null
                                    }



                                </div>
                                <div class="full inner_elements">
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="tab_style2">
                                                <div class="tabbar padding_infor_info">
                                                    <div class="tab-content" id="nav-tabContent">
                                                        <div class={`tab-pane fade ${activeTab === 'nav-home_s2' ? 'show active' : ''}`} id="nav-home_s2" role="tabpanel" aria-labelledby="nav-home-tab">
                                                            <div class="table_section">
                                                                <div class="col-md-12">
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
                                                                                                            <tr class="color-tr">
                                                                                                                <th class="font-weight-bold " style={{ minWidth: "50px" }} scope="col">{lang["log.no"]}</th>
                                                                                                                {apiDataName.map((header, index) => (
                                                                                                                    <th key={index} class="font-weight-bold" style={{ minWidth: "200px" }}>{header.display_name ? header.display_name : header.field_name}</th>
                                                                                                                ))}
                                                                                                                <th class="font-weight-bold align-center" style={{ minWidth: "100px" }}>{lang["log.action"]}</th>
                                                                                                            </tr>
                                                                                                            <tr>
                                                                                                                <th></th>
                                                                                                                {apiDataName.map((header, index) => (
                                                                                                                    <th key={index} className="header-cell" style={{ minWidth: "200px" }}>
                                                                                                                        <input

                                                                                                                            type="text"
                                                                                                                            class="form-control"
                                                                                                                            value={searchValues[header.fomular_alias] || ''}
                                                                                                                            onChange={(e) => handleInputChange(header.fomular_alias, e.target.value)}
                                                                                                                            onKeyDown={handleKeyDown}
                                                                                                                        />
                                                                                                                    </th>
                                                                                                                ))}
                                                                                                                <th class="align-center" onClick={handleSearchClick} > <i class="fa fa-search size-24 pointer mb-2" title={lang["search"]}></i></th>
                                                                                                            </tr>

                                                                                                        </thead>
                                                                                                        <tbody>


                                                                                                            {current.map((row, index) => {
                                                                                                                if (row) {
                                                                                                                    return (
                                                                                                                        <tr key={index}>
                                                                                                                            <td scope="row" style={{ minWidth: "50px" }} className="cell">{indexOfFirst + index + 1}</td>
                                                                                                                            {apiDataName.map((header) => (
                                                                                                                                <td key={header.fomular_alias} className="cell" style={{ minWidth: "200px" }}>{renderData(header, row)}</td>
                                                                                                                            ))}
                                                                                                                            <td class="align-center" style={{ minWidth: "80px" }}>
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
                                                                                                                        </tr>)
                                                                                                                } else {
                                                                                                                    return null
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


                                                                                            <div style={{ overflowX: 'auto' }}>
                                                                                                <table className={tableClassName} style={{ marginBottom: "10px", width: '100%' }}>
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
                                                                                                            <td class="font-weight-bold cell" colspan={`${apiDataName.length + 2}`} style={{ textAlign: 'center' }}><div>{lang["not found"]}</div></td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </div>
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
                                                        <div class={`tab-pane fade ${activeTab === 'nav-profile_s2' ? 'show active' : ''}`} id="nav-profile_s2" role="tabpanel" aria-labelledby="nav-profile-tab">
                                                            {dataStatis && dataStatis.length > 0 ? (
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

                                                            ) : null
                                                            }
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                       
                    ) : (
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
                    } */}
                </div>


                < RenderUI
                    page={page}
                    component={dataUi}
                    apiData={apiData}
                    redirectToInput={redirectToInput}
                    redirectToInputPUT={redirectToInputPUT}
                    handleDelete={handleDelete}
                    handleSearchClick={handleSearchClick}
                    exportToCSV={exportToCSV}
                    handleViewDetail={handleViewDetail}
                    handleTable_Param={handleTable_Param}
                    exportFile={exportFile}
                    exportFile_PK={exportFile_PK}
                    redirectToImportData={redirectToImportData}
                    dataCheck={dataCheck}
                    submitButton_Custom={submitButton_Custom}
                />


            </div >
        </div >
    )
}

