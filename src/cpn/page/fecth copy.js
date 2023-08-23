
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faDownload, faSquarePlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import XLSX from 'xlsx-js-style';
import Papa from 'papaparse';
import $ from 'jquery'
import {
    Varchar, Char, Text, Int,
    DateInput, TimeInput, DateTimeInput,
    Decimal, Bool, DataEmail, DataPhone

} from '../inputs search';

import StatisTable from './statistic/table'

export default () => {
    const { lang, proxy, auth, pages, functions } = useSelector(state => state);

    const { formatNumberWithCommas } = functions

    const { openTab, renderDateTimeByFormat } = functions
    const _token = localStorage.getItem("_token");
    const { project_id, version_id, url } = useParams();
    let navigate = useNavigate();
    const [dataTables, setDataTables] = useState([]);
    const [dataTable_id, setDataTableID] = useState([]);
    const [dataFields, setDataFields] = useState([]);
    const [apiData, setApiData] = useState([])
    const [errorSelect, setErrorSelect] = useState(null);
    const [loadingExportFile, setLoadingExportFile] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [uploadedJson, setUploadedJson] = useState(null);

    const [apiDataName, setApiDataName] = useState([])
    const [dataStatis, setDataStatis] = useState([])
    const [statusActive, setStatusActive] = useState(false);
    const [errorLoadConfig, setErrorLoadConfig] = useState(false);
    const [effectOneCompleted, setEffectOneCompleted] = useState(false);
    const [page, setPage] = useState([]);
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
    console.log(dataStatis)
    const formatNumberSize = (num) => {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }
    const location = useLocation();

    useEffect(() => {

        setSearchValues({});
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
                // console.log(resp)
                if (activated) {
                    setStatusActive(true)
                }
                else {
                    Swal.fire({
                        title: lang["faild"],
                        text: lang["fail.active"],
                        icon: "error",
                        showConfirmButton: true,
                        customClass: {
                            confirmButton: 'swal2-confirm my-confirm-button-class'
                        }

                    }).then(function () {
                        // window.location.reload();
                    });
                    setStatusActive(false)
                }
                setEffectOneCompleted(true);

            })

    }, [])
    useEffect(() => {
        if (pages && pages.length > 0) {
            const result = pages.find(page => page.url === `/${url}`);
            // console.log(result)
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

    const tableClassName = layoutId === 0 ? "table table-striped" : "table table-hover";


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

                                // console.log("Parsed CSV Result:", modifiedData);
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
                        // console.log("Parsed Excel Result:", modifiedData);
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

    // console.log(uploadedJson)

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
            // console.log("Sample batch data:", requestBody);

            try {
                const response = await fetch(`${proxy()}${page.components?.[0]?.api_import}`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(requestBody)
                });

                const jsonResponse = await response.json();
                const { success, content, data, result, total, fields, statisticValues, count, sumerize } = jsonResponse;
                console.log(jsonResponse)
                if (!success) {
                    console.error("Server did not process batch successfully:", jsonResponse);
                    break;
                }

                // console.log("Successfully processed batch number:", logCount);
            } catch (error) {
                console.error("Error sending batch:", error);
                break;
            }
        }
    };


    useEffect(() => {

        importData()

    }, [uploadedJson])


    useEffect(() => {
        if (page && page.components) {
            const id_str = page.components?.[0]?.api_post.split('/')[2];
            // console.log(id_str)
            fetch(`${proxy()}/apis/api/${id_str}/input_info`)
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
                    // setApi(api);
                    callApi()
                })
        }
    }, [page, dataTable_id])
    // console.log(dataTable_id)

    const handleCloseModal = () => {
        setSelectedFields([]);
        setSelectedStats([]);
        setSelectAll(false)
    }
    const [loaded, setLoaded] = useState(false);


    //search
    const [currentPage, setCurrentPage] = useState(0);
    // console.log(currentPage)
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
        // console.log(requireCount)
    }, [currentPage]);

    // console.log(2343243243324242, currentPage)
    const [previousSearchValues, setPreviousSearchValues] = useState({});
    const [currentCount, setCurrentCount] = useState(null);


    const callApi = (requireCount = false) => {
        const startTime = new Date().getTime();
        let loadingTimeout;

        if (Object.keys(searchValues).length !== 0) {
            loadingTimeout = setTimeout(() => {
                setLoadingSearch(true);
            }, 150);
        }

        if (JSON.stringify(searchValues) !== JSON.stringify(previousSearchValues)) {
            setPreviousSearchValues(searchValues);
            requireCount = true;
        }

        const searchBody = {
            table_id: dataTable_id,
            start_index: currentPage - 1,
            criteria: searchValues,
            require_count: requireCount,
            api_id: page.components?.[0]?.api_get.split('/')[2]
            // exact: true
        }

        // console.log(searchBody)

        fetch(`${proxy()}/api/foreign/data`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
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
                    setApiDataName(fields);
                    setDataStatis(statisticValues);
                    setLoaded(true);

                    if (count !== undefined && requireCount) {
                        setCurrentCount(count);
                        setSumerize(count);
                    } else if (sumerize !== undefined) {
                        setSumerize(sumerize);
                    } else if (!requireCount && currentCount != null) {
                        setSumerize(currentCount);
                    }
                }

                const endTime = new Date().getTime();
                const elapsedTime = endTime - startTime;

                clearTimeout(loadingTimeout); // Clear the timeout
                setLoadingSearch(false);

                // console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
            });
    };



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


    const handleSearchClick = () => {
        setCurrentPage(1);
        if (currentPage === 1) {
            callApi(true);
        }
    }

    const redirectToInput = () => {
        if (errorLoadConfig) {
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
        }
        // console.log(page)
        const id_str = page.components?.[0]?.api_post.split('/')[2];
        window.location.href = `apis/api/${id_str}/input_info`;
    }
    const redirectToImportData = () => {
        if (errorLoadConfig) {
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
        }
        // console.log(page)

        window.location.href = `/page/${url}/import`;
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

    const redirectToInputPUT = async (record) => {

        const { components } = page;
        const cpn = components[0]
        const { api_put } = cpn;
        if (api_put != undefined) {
            const id_str = api_put.split('/')[2]

            const response = await new Promise((resolve, reject) => {
                fetch(`${proxy()}/apis/api/${id_str}/input_info`)
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
                openTab(`/page/put/api/${id_str}/${stringifiedParams}`)
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
    const downloadAPI = () => {
        // console.log(apiData);

    };



    useEffect(() => {
        if (page.components?.[0]?.api_get != undefined) {
            callApi();
        }
    }, [currentPage])

    ///
    const rowsPerPage = 15;
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const current = apiData
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(sumerize / rowsPerPage) || 1;

    const [selectedFields, setSelectedFields] = useState([]);/// fields
    const [selectedStats, setSelectedStats] = useState([]);
    const [exportType, setExportType] = useState("excel");
    ////paginate statistic



    // statis fields
    const handleStatsChange = (event) => {
        const { value } = event.target;
        setSelectedStats(prevStats =>
            prevStats.includes(value)
                ? prevStats.filter(stat => stat !== value)
                : [...prevStats, value]
        );
    }
    // console.log(selectedStats)
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
        // console.log(value)
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

    const exportToCSV = (csvData) => {
        const selectedHeaders = apiDataName;

        const generateSampleData = (field) => {
            switch (field.DATATYPE) {
                case "INT":
                    return field.MIN || "0001";
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
        const segments = page.url.split('/');
        const lastSegment = segments[segments.length - 1];//tên
        const result = lastSegment.replace(/-/g, '');

        const headerRow = selectedHeaders.map(header => `${header.field_name}(${header.fomular_alias})`);
        const sampleRow = selectedHeaders.map(header => generateSampleData(header));

        if (selectedFileType === 'xlsx') {
            const ws = XLSX.utils.json_to_sheet([headerRow, sampleRow], { skipHeader: true });
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Template");


            XLSX.writeFile(wb, `TEMPLATE_${result.toUpperCase()}_${(new Date()).getTime()}.xlsx`);

        } else if (selectedFileType === 'csv') {
            const utf8BOM = "\uFEFF";
            const csv = utf8BOM + headerRow.join(",") + "\n" + sampleRow.join(",") + "\n";

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `TEMPLATE_${result.toUpperCase()}_${(new Date()).getTime()}.csv`);
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
        const exportBody = {
            export_fields: selectFields,
            criteria: {},
            export_type: exportType
        };

        // console.log(exportBody)
        setLoadingExportFile(true)
        fetch(`${proxy()}${page.components?.[0]?.api_export}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "Accept": exportType === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv',

            },
            body: JSON.stringify(exportBody)
        })
            .then(res => res.blob())
            .then(blob => {
                if (exportType === 'csv') {
                    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
                    const withBom = new Blob([bom, blob], { type: 'text/csv' });
                    blob = withBom;
                }
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;

                const datetimeString = getCurrentDateTimeForFilename();

                const segments = page.url.split('/');
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

            // Swal.fire({
            //     title: lang["success"],
            //     icon: 'success',
            //     timer: 2000,
            //     showConfirmButton: false
            // });
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

    const searchData = () => {
        console.log(data)
    }

    // console.log(searchValues)
    // console.log(sumerize)
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
                    <div class={`modal `} id="exportExcelEx">
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
                    </div>
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
                                                                    <td key={field}>{row[field]}</td>
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
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head d-flex">
                                <div class="heading1 margin_0 ">


                                    <div class="tab_style2">
                                        <div class="tabbar">
                                            <nav>
                                                <div class="nav nav-tabs" id="nav-tab" role="tablist">
                                                    <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#nav-home_s2" role="tab" aria-controls="nav-home_s2" aria-selected="true">    <h5>{page?.components?.[0]?.component_name}</h5></a>
                                                    <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-profile_s2" role="tab" aria-controls="nav-profile_s2" aria-selected="false">Profile</a>
                                                    <a class="nav-item nav-link" id="nav-contact-tab" data-toggle="tab" href="#nav-contact_s2" role="tab" aria-controls="nav-contact1_s2" aria-selected="false">Contact</a>
                                                </div>
                                            </nav>

                                        </div>
                                    </div>
                                </div>
                                {statusActive ? (
                                    <div class="ml-auto pointer" onClick={() => redirectToInput()} data-toggle="modal" title={lang["btn.create"]}>

                                        <FontAwesomeIcon icon={faSquarePlus} className="icon-add" />
                                    </div>
                                ) : null}
                                {
                                    current && current.length > 0 ? (
                                        <div class="ml-4 pointer" data-toggle="modal" data-target="#exportExcel" title={lang["export_excel_csv"]}>

                                            <FontAwesomeIcon icon={faDownload} className="icon-export" />
                                        </div>
                                    ) : null
                                }
                                {/* {
                                    current && current.length > 0 ? (
                                        <div class="ml-4 pointer" data-toggle="modal" data-target="#exportExcelEx" title="Export Data Example">

                                            <FontAwesomeIcon icon={faFileExport} className="icon-export-ex" />
                                        </div>
                                    ) : null
                                } */}
                                {/* {
                                    current && current.length > 0 ? (
                                        <div class="ml-3 pointer" data-toggle="modal" data-target="#importExcel" title="Import data">
                                            <FontAwesomeIcon icon={faFileImport} className="icon-import" />
                                        </div>
                                    ) : null
                                } */}

                                {/* {
                                    current && current.length > 0 ? (
                                        <div class="ml-3 pointer" onClick={redirectToImportData} title="Import data">
                                            <FontAwesomeIcon icon={faFileImport} className="icon-import" />
                                        </div>
                                    ) : null
                                } */}
                                <div class="ml-4 pointer" data-toggle="modal" data-target="#exportExcelEx" title={lang["export data example"]}>
                                    <FontAwesomeIcon icon={faFileExport} className="icon-export-ex" />

                                </div>
                                <div class="ml-4 mr-3 pointer" onClick={redirectToImportData} title={lang["import data"]}>
                                    <FontAwesomeIcon icon={faFileImport} className="icon-import" />
                                </div>

                                {/* <button type="button" class="btn btn-primary custom-buttonadd" onClick={() => redirectToInput()}>
                                    <i class="fa fa-plus"></i>
                                </button> */}
                            </div>
                            <div class="full inner_elements">
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="tab_style2">
                                            <div class="tabbar padding_infor_info">

                                                <div class="tab-content" id="nav-tabContent">
                                                    <div class="tab-pane fade show active" id="nav-home_s2" role="tabpanel" aria-labelledby="nav-home-tab">
                                                        <div class="table_section">
                                                            <div class="col-md-12">
                                                                {statusActive ? (
                                                                    <>
                                                                        {
                                                                            loaded ? (
                                                                                current && current.length > 0 ? (
                                                                                    <>
                                                                                        <div class="table-responsive">


                                                                                            <table className={tableClassName} style={{ marginBottom: "10px" }}>
                                                                                                <thead>
                                                                                                    <tr>
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
                                                                                                        <th class="align-center" onClick={handleSearchClick} > <i class="fa fa-search size pointer icon-margin mb-2" title={lang["search"]}></i></th>
                                                                                                    </tr>

                                                                                                </thead>
                                                                                                <tbody>


                                                                                                    {current.map((row, index) => {
                                                                                                        if (row) {
                                                                                                            return (
                                                                                                                <tr key={index}>
                                                                                                                    <td scope="row">{indexOfFirst + index + 1}</td>
                                                                                                                    {apiDataName.map((header) => (
                                                                                                                        <td key={header.fomular_alias}>{renderData(header, row)}</td>
                                                                                                                    ))}
                                                                                                                    <td class="align-center" style={{ minWidth: "80px" }}>

                                                                                                                        <i class="fa fa-edit size-24 pointer icon-margin icon-edit" onClick={() => redirectToInputPUT(row)} title={lang["edit"]}></i>
                                                                                                                        <i class="fa fa-trash-o size-24 pointer icon-margin icon-delete" onClick={() => handleDelete(row)} title={lang["delete"]}></i>
                                                                                                                    </td>
                                                                                                                </tr>)
                                                                                                        } else {
                                                                                                            return null
                                                                                                        }
                                                                                                    })}
                                                                                                    {/* {dataStatis.map((data) => (
                                                                                <tr>
                                                                                    <td class="font-weight-bold" colspan={`${apiDataName.length + 2}`} style={{ textAlign: 'right' }}>{data.display_name}: {formatNumberWithCommas(data.result)} </td>
                                                                                </tr>
                                                                            ))} */}

                                                                                                </tbody>
                                                                                            </table>

                                                                                            <div className="d-flex justify-content-between align-items-center">
                                                                                                <p>{lang["show"]} {formatNumber(indexOfFirst + 1)} - {formatNumber(indexOfFirst + apiData?.length)} {lang["of"]} {formatNumber(sumerize)} {lang["results"]}</p>
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
                                                                                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                                                                            <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                                                                                                                &raquo;
                                                                                                            </button>
                                                                                                        </li>
                                                                                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
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
                                                                                                <tr>
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
                                                                                                    <th class="align-center" onClick={handleSearchClick} > <i class="fa fa-search size pointer icon-margin mb-2" title={lang["search"]}></i></th>
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
                                                    <div class="tab-pane fade" id="nav-profile_s2" role="tabpanel" aria-labelledby="nav-profile-tab">
                                                        {dataStatis && dataStatis.length > 0 ? (
                                                            <div class="col-md-12">
                                                                <div class="white_shd full margin_bottom_30">
                                                                    <div class="full graph_head d-flex">
                                                                        <div class="heading1 margin_0 ">
                                                                            <h5>{lang["statistic"]}: {page?.components?.[0]?.component_name}</h5>
                                                                        </div>
                                                                    </div>
                                                                    <div class="table_section padding_infor_info">

                                                                        <div class="row  mt-4" style={{}}>
                                                                            {dataStatis?.map((statis, index) => {
                                                                                const { display_name, type, data } = statis;
                                                                                if (type == "text") {
                                                                                    return (
                                                                                        <div class="col-md-12 ml-2 col-sm-4">
                                                                                            <p key={index} className="font-weight-bold">{display_name}: {data && data !== undefined && formatNumber(data.toFixed())}</p>
                                                                                        </div>
                                                                                    )
                                                                                }
                                                                                if (type == "table") {
                                                                                    return (
                                                                                        <StatisTable data={data} statis={statis} />
                                                                                    )
                                                                                }
                                                                            })}
                                                                        </div>
                                                                    </div>
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

                </div>
            </div >
        </div >
    )
}

