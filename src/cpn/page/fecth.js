
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import XLSX from 'xlsx-js-style';
import {
    Varchar, Char, Text, Int,
    DateInput, TimeInput, DateTimeInput,
    Decimal, Bool, DataEmail, DataPhone

} from '../inputs search';

export default () => {
    const { lang, proxy, auth, pages, functions } = useSelector(state => state);

    const { formatNumberWithCommas } = functions

    const { openTab, renderDateTimeByFormat } = functions
    const _token = localStorage.getItem("_token");
    const { project_id, version_id, url } = useParams();
    let navigate = useNavigate();
    const [dataTables, setDataTables] = useState([]);
    const [dataFields, setDataFields] = useState([]);
    const [apiData, setApiData] = useState([])
    const [apiDataName, setApiDataName] = useState([])
    const [dataStatis, setDataStatis] = useState({})
    const [statusActive, setStatusActive] = useState(false);
    const [errorLoadConfig, setErrorLoadConfig] = useState(false);
    const [effectOneCompleted, setEffectOneCompleted] = useState(false);
    const [page, setPage] = useState([]);
    const [data, setData] = useState({});

    const [dataSearch, setdataSearch] = useState([])
    const [totalSearch, setTotalSearch] = useState(0)
    const [sumerize, setSumerize] = useState(0)

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


    useEffect(() => {
        if (page && page.components) {
            const id_str = page.components?.[0]?.api_post.split('/')[2];
            // console.log(id_str)
            fetch(`${proxy()}/apis/api/${id_str}/input_info`)
                .then(res => res.json())
                .then(res => {
                    const { data, success, content } = res;
                    console.log(res)
                    if (success) {
                        setDataTables(data.tables)
                        setDataFields(data.body)
                        setLoaded(true)
                    }
                    // setApi(api);
                    callApi()
                })
        }
    }, [page])


    // console.log(dataFields)

    const handleCloseModal = () => {
        setSelectedFields([]);
        setSelectedStats([]);
    }


    const [loaded, setLoaded] = useState(false);


    const callApi = () => {
        /* this must be fixed */
        fetch(`${proxy()}${page.components?.[0]?.api_get}`, {
            headers: {
                fromIndex: currentPage - 1
            }
        }).then(res => res.json()).then(res => {

            const { success, content, data, fields, statistic, sumerize } = res;
            console.log(res)
            if (success) {
                const statisticValues = res.statistic.values;
                setApiData(data.filter(record => record != undefined))
                setApiDataName(fields)
                setDataStatis(statisticValues)
                setLoaded(true)
                setSumerize(sumerize)
            }
            else {
                setLoaded(true)
                if (statusActive) {
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

                setErrorLoadConfig(true)


            }

        })
    }

    //search
    const [searchValues, setSearchValues] = useState({});
    const [showSearch, setShowSearch] = useState(false);
    console.log(showSearch)
    // const timeoutRef = useRef(null);
    const handleInputChange = (fomular_alias, value) => {
        setSearchValues(prevValues => ({
            ...prevValues,
            [fomular_alias]: value
        }));

        // // Nếu đã có một bộ đếm thời gian, hủy nó
        // if (timeoutRef.current) {
        //     clearTimeout(timeoutRef.current);
        // }

        // // Bắt đầu một bộ đếm thời gian mới
        // timeoutRef.current = setTimeout(() => {

        //     if (value.trim() !== "") {
        //         callApiSearch();
        //     }
        // }, 2000);
    };



    const callApiSearch = () => {
        const searchBody = {
            query: searchValues,
            start_index: currentPageSearch - 1
        }
        console.log(searchBody)
        fetch(`${proxy()}${page.components?.[0]?.api_search}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                fromIndex: currentPage - 1
            },
            body: JSON.stringify(searchBody)

        }).then(res => res.json()).then(res => {

            const { success, content, data, result, total } = res;
            console.log(res)
            if (success) {
                setdataSearch(result)
                setTotalSearch(total)

            }


        })
    };
    console.log(totalSearch)
    const handleSearchClick = () => {
        setCurrentPageSearch(1);
        if (currentPageSearch === 1) {
            callApiSearch();
        }

    }

    const handleOpenSearchClick = () => {
        setCurrentPageSearch(1);
        setShowSearch(!showSearch)
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
                if (data.hasOwnProperty(fomular_alias)) {
                    newData.push(data[fomular_alias]);
                }

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
        console.log(data)
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
    // const [currentPage, setCurrentPage] = useState(58823);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSearch, setCurrentPageSearch] = useState(1);

    useEffect(() => {
        if (page.components?.[0]?.api_get != undefined) {
            callApi()
        }
    }, [currentPage])

    useEffect(() => {
        if (page.components?.[0]?.api_search != undefined) {
            callApiSearch()
        }

    }, [currentPageSearch]); // Danh sách dependency chỉ chứa currentPage

    useEffect(() => {
        setdataSearch([])
        setSearchValues({})
    }, [showSearch]);

    const rowsPerPage = 17;

    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const current = apiData

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const paginateSearch = (pageNumber) => setCurrentPageSearch(pageNumber);

    const totalPages = Math.ceil(sumerize / rowsPerPage);

    const [selectedFields, setSelectedFields] = useState([]);/// fields
    const [selectedStats, setSelectedStats] = useState([]);
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
    const handleFieldChange = (event) => {
        const { value } = event.target;
        setSelectedFields(prevFields =>
            prevFields.includes(value)
                ? prevFields.filter(field => field !== value)
                : [...prevFields, value]
        );
    }

    const exportToCSV = (csvData) => {
        console.log(csvData)
        const selectedHeaders = apiDataName.filter(({ fomular_alias }) => selectedFields.includes(fomular_alias));
        const titleRow = { [selectedHeaders[0].fomular_alias]: 'DIPES PRODUCTION' };
        const emptyRow = selectedHeaders.reduce((obj, header, i) => {
            if (i === 0) {
                obj[header.fomular_alias] = `Nhân viên xuất: ${auth.fullname}`;
            } else {
                obj[header.fomular_alias] = '';
            }
            return obj;
        }, {});
        const headerRow = selectedHeaders.reduce((obj, header) => ({ ...obj, [header.fomular_alias]: header.display_name }), {});
        const timeRow = selectedHeaders.reduce((obj, header, i) => {
            if (i === selectedHeaders.length - 1) {
                const currentDate = new Date();
                const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
                obj[header.fomular_alias] = `Ngày xuất (dd/MM/yyyy): ${formattedDate}`;
            } else {
                obj[header.fomular_alias] = '';
            }
            return obj;
        }, {});


        // const statsRow = selectedHeaders.reduce((obj, header, i) => {     //phần thống kê ở cột cuối cùng bên phải của file Excel
        //     obj[header.fomular_alias] = i === selectedHeaders.length - 1
        //         ? dataStatis.map(data => `${data.display_name}: ${data.result}`).join(', ')
        //         : '';
        //     return obj;
        // }, {});

        const selectedStatsData = dataStatis.filter(stat => selectedStats.includes(stat.fomular_alias));
        const statsRow = selectedHeaders.reduce((obj, header, i) => {     //phần thống kê ở cột cuối cùng bên phải của file Excel
            obj[header.fomular_alias] = i === selectedHeaders.length - 1
                ? selectedStatsData.map(data => `${data.display_name}: ${data.result}`).join(', ')
                : '';
            return obj;
        }, {});

        const newCsvData = [
            titleRow,
            emptyRow,
            timeRow,
            headerRow,
            ...csvData.map(row =>
                selectedHeaders.map((header) => ({
                    [header.fomular_alias]: renderData(header, row)
                })).reduce((obj, cur) => ({ ...obj, ...cur }), {})
            ),
            statsRow
        ];
        const ws = XLSX.utils.json_to_sheet(newCsvData, { skipHeader: true });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        const fieldLengths = newCsvData.reduce((lengths, row) => {
            for (let field in row) {
                const valueLength = row[field] ? row[field].toString().length : 0;
                lengths[field] = lengths[field] ? Math.max(lengths[field], valueLength) : valueLength;
            }
            return lengths;
        }, {});
        // 
        selectedHeaders.forEach(header => {
            const headerLength = header.display_name.length;
            fieldLengths[header.fomular_alias] = Math.max(fieldLengths[header.fomular_alias] || 0, headerLength);
        });


        //  Tạo wscols dựa trên độ dài tối đa
        const wscols = selectedHeaders.map(header => ({ wch: fieldLengths[header.fomular_alias] + 2 || 10 }));

        ws['!cols'] = wscols;
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: selectedFields.length - 1 } }, // Merge cells for title row
            { s: { r: 1, c: 0 }, e: { r: 1, c: selectedFields.length - 1 } }, // Merge cells for the 'emptyRow'
            { s: { r: 2, c: 0 }, e: { r: 2, c: selectedFields.length - 2 } }, // Merge cells for the 'timeRow'
        ];


        ws[XLSX.utils.encode_cell({ c: 0, r: 0 })].s = {  // Title Row style
            fill: { fgColor: { rgb: "008000" } },
            font: { color: { rgb: "FFFFFF" }, sz: 14, bold: true },
            alignment: { horizontal: "center" }
        };

        for (let i = 0; i < selectedFields.length; i++) { // Header Row style
            ws[XLSX.utils.encode_cell({ c: i, r: 3 })].s = {
                fill: { fgColor: { rgb: "008000" } },
                font: { color: { rgb: "FFFFFF" }, sz: 12, bold: true },
            };
        }

        XLSX.writeFile(wb, `DIPES-PRODUCTION-${(new Date()).getTime()}-Export.xlsx`);
        setSelectedFields([]);
        setSelectedStats([]);
    }

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

    console.log(searchValues)
    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h4>{lang["manage data"]}</h4>
                        </div>
                    </div>
                </div>
                {/* List table */}
                <div class="row">
                    {/* modal export excel */}
                    <div class={`modal `} id="exportExcel">
                        <div class="modal-dialog modal-dialog-center">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h4 class="modal-title">{lang["export-to-excel"]}</h4>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <h5 class="mt-2 mb-2">{lang["select fields"]}:</h5>
                                        <div className="checkboxes-grid ml-4">

                                            {apiDataName.map((header, index) => (
                                                <label key={index}>
                                                    <input
                                                        type="checkbox"
                                                        value={header.fomular_alias}
                                                        checked={selectedFields.includes(header.fomular_alias)}
                                                        onChange={handleFieldChange}
                                                    />
                                                    <span className="ml-2">{header.display_name}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {
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
                                        }
                                        <h5 class="mt-4 mb-2">{lang["preview data"]}: </h5>
                                        {selectedFields && selectedFields.length > 0 || selectedStats.length > 0 ?
                                            (
                                                <>
                                                </>

                                            ) : <>  {lang["preview.content"]}
                                            </>}

                                        {selectedFields && selectedFields.length > 0 || current & current.length > 0 || dataStatis && dataStatis.length > 0 ? (
                                            <div class="table-responsive">
                                                <table class="table table-striped excel-preview">
                                                    <thead>
                                                        {selectedFields.map((field) => {
                                                            const header = apiDataName.find(
                                                                (header) => header.fomular_alias === field
                                                            );
                                                            return <th key={field}>{header ? header.display_name : field}</th>;
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
                                            exportToCSV(apiData);
                                        }
                                    }} class="btn btn-success " data-dismiss="modal">{lang["export"]} </button>
                                    <button type="button" data-dismiss="modal" onClick={handleCloseModal} class="btn btn-danger">{lang["btn.close"]}</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head d-flex">
                                <div class="heading1 margin_0 ">
                                    <h5>{page?.components?.[0]?.component_name}</h5>
                                </div>
                                {statusActive ? (

                                    <div class="ml-auto pointer" onClick={() => redirectToInput()} data-toggle="modal">
                                        <i class="fa fa-plus-circle icon-ui"></i>
                                    </div>
                                ) : null}
                                {
                                    current && current.length > 0 ? (
                                        <div class="ml-4 pointer" onClick={downloadAPI} data-toggle="modal" data-target="#exportExcel">
                                            <i class="fa fa-download icon-export"></i>
                                        </div>
                                    ) : null
                                }
                                {/* <button type="button" class="btn btn-primary custom-buttonadd" onClick={() => redirectToInput()}>
                                    <i class="fa fa-plus"></i>
                                </button> */}
                            </div>
                            <div class="table_section padding_infor_info">

                                <div class="col-md-12">
                                    {statusActive ? (<>
                                        {
                                            loaded ? (
                                                current && current.length > 0 ? (
                                                    <>
                                                        <div class="table-responsive">
                                                            <button class="btn btn-secondary mb-2" onClick={() => handleOpenSearchClick()}>
                                                                <i class="fa fa-search mr-2 fa-x"></i>
                                                                {showSearch ? "Ẩn tìm kiếm" : "Hiện tìm kiếm"}
                                                            </button>

                                                            <table className={tableClassName}>
                                                                <thead>
                                                                    <tr>
                                                                        <th class="font-weight-bold " style={{ width: "100px" }} scope="col">{lang["log.no"]}</th>
                                                                        {apiDataName.map((header, index) => (
                                                                            <th class="font-weight-bold">{header.display_name}</th>
                                                                        ))}
                                                                        <th class="font-weight-bold align-center" style={{ width: "100px" }}>Thao tác</th>
                                                                    </tr>
                                                                    {showSearch && (
                                                                        <tr>
                                                                            <th></th>
                                                                            {apiDataName.map((header, index) => (
                                                                                <th>
                                                                                    <input
                                                                                        type="text"
                                                                                        class="form-control"
                                                                                        onChange={(e) => handleInputChange(header.fomular_alias, e.target.value)}
                                                                                    />
                                                                                </th>
                                                                            ))}
                                                                            <th class="align-center"> <i class="fa fa-search size pointer icon-margin mb-2" onClick={handleSearchClick} title={lang["search"]}></i></th>
                                                                        </tr>
                                                                    )}
                                                                </thead>
                                                                <tbody>
                                                                    {showSearch ? (
                                                                        <>
                                                                            {dataSearch.length > 0 ? (
                                                                                dataSearch.map((row, index) => {
                                                                                    if (row) {
                                                                                        return (
                                                                                            <tr key={index}>
                                                                                                <td scope="row">{indexOfFirst + index + 1}</td>
                                                                                                {apiDataName.map((header) => (
                                                                                                    <td key={header.fomular_alias}>{renderData(header, row)}</td>
                                                                                                ))}
                                                                                                <td class="align-center" style={{ minWidth: "80px" }}>

                                                                                                    <i class="fa fa-edit size pointer icon-margin icon-edit" onClick={() => redirectToInputPUT(row)} title={lang["edit"]}></i>
                                                                                                    <i class="fa fa-trash-o size pointer icon-margin icon-delete" onClick={() => handleDelete(row)} title={lang["delete"]}></i>
                                                                                                </td>
                                                                                            </tr>)
                                                                                    } else {
                                                                                        return null
                                                                                    }
                                                                                })
                                                                            ) :
                                                                                <tr>
                                                                                    <td class="font-weight-bold" colspan={`${dataSearch.length + 5}`} style={{ textAlign: 'center' }}>Not Found</td>
                                                                                </tr>
                                                                            }

                                                                            {dataStatis.map((data) => (
                                                                                <tr>
                                                                                    <td class="font-weight-bold" colspan={`${apiDataName.length + 2}`} style={{ textAlign: 'right' }}>{data.display_name}: {formatNumberWithCommas(data.result)} </td>
                                                                                </tr>
                                                                            ))}
                                                                        </>
                                                                    ) :
                                                                        <>
                                                                            {current.map((row, index) => {

                                                                                if (row) {

                                                                                    return (
                                                                                        <tr key={index}>
                                                                                            <td scope="row">{indexOfFirst + index + 1}</td>
                                                                                            {apiDataName.map((header) => (
                                                                                                <td key={header.fomular_alias}>{renderData(header, row)}</td>
                                                                                            ))}
                                                                                            <td class="align-center" style={{ minWidth: "80px" }}>

                                                                                                <i class="fa fa-edit size pointer icon-margin icon-edit" onClick={() => redirectToInputPUT(row)} title={lang["edit"]}></i>
                                                                                                <i class="fa fa-trash-o size pointer icon-margin icon-delete" onClick={() => handleDelete(row)} title={lang["delete"]}></i>
                                                                                            </td>
                                                                                        </tr>)
                                                                                } else {
                                                                                    return null
                                                                                }
                                                                            })}
                                                                            {dataStatis.map((data) => (
                                                                                <tr>
                                                                                    <td class="font-weight-bold" colspan={`${apiDataName.length + 2}`} style={{ textAlign: 'right' }}>{data.display_name}: {formatNumberWithCommas(data.result)} </td>
                                                                                </tr>
                                                                            ))}
                                                                        </>
                                                                    }
                                                                </tbody>
                                                            </table>
                                                            {showSearch ? (
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <p>{lang["show"]} {indexOfFirst + 1}-{indexOfFirst + dataSearch.length} {lang["of"]} {sumerize} {lang["results"]}</p>
                                                                    <nav aria-label="Page navigation example">
                                                                        <ul className="pagination mb-0">

                                                                            {currentPageSearch > 1 &&
                                                                                <li className={`page-item`}>
                                                                                    <button className="page-link" onClick={() => paginateSearch(currentPageSearch - 1)}>
                                                                                        {currentPageSearch - 1}
                                                                                    </button>
                                                                                </li>
                                                                            }

                                                                            <li className={`page-item active`}>
                                                                                <button className="page-link ">
                                                                                    {currentPageSearch}
                                                                                </button>
                                                                            </li>

                                                                            {dataSearch.length > 0 &&
                                                                                <li className={`page-item`}>
                                                                                    <button className="page-link" onClick={() => paginateSearch(currentPageSearch + 1)}>
                                                                                        {currentPageSearch + 1}
                                                                                    </button>
                                                                                </li>
                                                                            }


                                                                        </ul>
                                                                    </nav>
                                                                </div>
                                                            ) : (
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <p>{lang["show"]} {indexOfFirst + 1}-{indexOfFirst + apiData.length} {lang["of"]} {sumerize} {lang["results"]}</p>
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

                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div class="list_cont ">
                                                        <p>{lang["not found data"]}</p>
                                                    </div>
                                                )
                                            ) : (
                                                // <div class="d-flex justify-content-center align-items-center w-100 responsive-div" >
                                                //     {/* {lang["projects.noprojectfound"]} */}
                                                //     <img width={350} className="scaled-hover-target" src="/images/icon/loading.gif" ></img>
                                                // </div>
                                                <div>{lang["not found data"]}</div>
                                            )
                                        }
                                    </>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}

