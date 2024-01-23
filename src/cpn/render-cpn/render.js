import React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus, faFileImport, faFileExport, faUpload, faMagnifyingGlass, faDownload } from '@fortawesome/free-solid-svg-icons';
import Chart from 'react-apexcharts'

const RenderComponent = ({ component, apiData, redirectToInput, redirectToInputPUT, handleDelete, handleSearchClick, exportToCSV, handleViewDetail, exportFile, redirectToImportData }) => {

    const { lang, proxy, auth, functions } = useSelector(state => state);

    // Hàm chính để xác định loại component cần render
    const renderByType = (type, props, flex, id) => {
        console.log(123, props);
        // //console.log(123,type);
        // //console.log(123,flex);
        // //console.log(123,id);
        // Hàm kiểm tra xem đối tượng flex có dữ liệu không
        const hasFlexData = (flex) => {
            return flex && flex.props && flex.props.style;
        };

        // Áp dụng style của flex cho table nếu có
        const applyFlexStyle = (style) => {
            return hasFlexData(flex) ? { ...style, ...flex.props.style } : style;
        };

        function findChildById(children, id) {
            return children?.find(child => child.id === id);
        }
        const foundChild = hasFlexData(flex) && findChildById(flex.children, id);
        const renderExtraButtons = (buttons, props, lang) => {
            console.log(157, props)
            return Object.entries(buttons).map(([key, value]) => {

                if (!value.state) {
                    return null;
                }

                switch (key) {
                    case 'add':
                        return (
                            <FontAwesomeIcon icon={faSquarePlus} key={key} onClick={() => redirectToInput(buttons.add.api.url)} className="icon-add mr-2 pointer" title={"Create"} />
                        );

                    case 'import':
                        return (
                            // <FontAwesomeIcon icon={faFileImport} key={key} className="icon-import mr-2 pointer" />
                            <>
                                <FontAwesomeIcon icon={faUpload} className={`size-24 mr-2 icon-add pointer `} id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title={"Import data"} />
                                <input type="file" style={{ display: 'none' }} />
                                <ul class="dropdown-menu " aria-labelledby="navbarDropdownMenuLink">
                                    <li ><span class="dropdown-item" onClick={() => redirectToImportData(props.buttons.import.api.url.split('/')[2], props.source.get.url, props.buttons.add.api)} >Import File</span></li>
                                    <li class="dropdown-submenu dropdown-submenu-left">
                                        <a class="dropdown-item dropdown-toggle" href="#">File mẫu</a>
                                        <ul class="dropdown-menu first-sub-menu">
                                            <li onClick={() => exportToCSV("xlsx", props?.source?.tables?.[0]?.fields)}><span class="dropdown-item" > Excel</span></li>
                                            <li onClick={() => exportToCSV("csv", props?.source?.tables?.[0]?.fields)}><span class="dropdown-item" >CSV</span></li>
                                        </ul>
                                    </li>
                                </ul>
                            </>
                        );
                    case 'export':
                        return (
                            <FontAwesomeIcon icon={faDownload} className="icon-export pointer" onClick={() => exportFile(props.source.fields, props.source.get.url, buttons.export.api.url)} data-toggle="modal" data-target="#exportExcel" title={"Export_excel_csv"} />
                        );
                        break;
                    // Thêm các trường hợp khác nếu cần
                }
                return null;
            }).filter(Boolean);
        };
        switch (type) {
            case 'text':
                return <div style={props.style}>{props.content}</div>;
            case 'table':
                const extraButtons = hasFlexData(flex) ? renderExtraButtons(foundChild.props.buttons, props, lang) : renderExtraButtons(props.buttons, props);
                const tableStyle = applyFlexStyle(props.style); // Áp dụng style ở đây
                return (
                    <div style={tableStyle}>
                        <div class="d-flex align-items-center mt-2">
                            {props.name}
                            {extraButtons.length > 0 && <div class="ml-auto mb-1">{extraButtons}</div>}
                        </div>
                        <RenderTable apiData={apiData} props={props} buttons={props.buttons} handleSearchClick={handleSearchClick} redirectToInputPUT={redirectToInputPUT} handleDelete={handleDelete} handleViewDetail={handleViewDetail} />
                    </div>
                );
            case 'flex':
                // Các logic khác cho flex
                return (
                    <>
                        <div class="d-flex align-items-center mt-2">
                            hi
                        </div>
                    </>
                );

            case 'chart_1':

                return (
                    <>
                        <RenderChart props={props} />
                    </>
                );
            default:
                return <div>Unknown component type!</div>;
        }
    };
    return (
        <div class="row mt-2">
            <div class="col-md-12" >
                <div class="white_shd full">
                    <div class="full graph_head_cus d-flex">
                        {component?.map((comp) => (
                            <div key={comp.id}>
                            </div>
                        ))}
                    </div>
                    <div class="full inner_elements">
                        <div class="row" >
                            <div class="col-md-12">
                                <div class="tab_style2 ">
                                    <div class="tabbar padding_infor_info">
                                        <div class="tab-content" id="nav-tabContent">
                                            <div class={`tab-pane fade ${'nav-home_s2' ? 'show active' : ''}`} id="nav-home_s2" role="tabpanel" aria-labelledby="nav-home-tab">
                                                <div class="table_section">
                                                    <div class="col-md-12">
                                                        {component?.map((comp) => (
                                                            <div key={comp.id} style={{
                                                                order: comp.flex?.order,
                                                                flexGrow: comp.flex?.flexGrow
                                                            }}>
                                                                {comp.name === 'flex' ?
                                                                    <div class="">
                                                                        {comp.children?.map((compflex) => <div key={compflex.id}>{renderByType(compflex.name, compflex.props, comp, compflex.id)} </div>)}
                                                                    </div>
                                                                    :
                                                                    renderByType(comp.name, comp.props)}
                                                            </div>
                                                        ))}
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
            </div>
        </div>
    );
};

const RenderTable = (props) => {
    console.log(328, props)
    const tableProps = props.props
    const buttons = props.buttons
    const redirectToInputPUT = props.redirectToInputPUT
    const handleViewDetail = props.handleViewDetail
    const handleDelete = props.handleDelete
    // const handleSearchClick = props.handleSearchClick

    const data = props.apiData
    const { lang, proxy, auth, functions } = useSelector(state => state);
    const _token = localStorage.getItem("_token");
    const [searchValues, setSearchValues] = useState({});
    const [apiData, setApiData] = useState([])
    const [previousSearchValues, setPreviousSearchValues] = useState({});
    const [currentCount, setCurrentCount] = useState(null);
    // useEffect(() => {
    //     setApiData(data)
    // }, [data]);
    console.log(342, apiData)
    const { fields, search, get } = tableProps.source;
    const { navigator } = tableProps.buttons;
    const visibility = tableProps.visibility;
    const [currentPage, setCurrentPage] = useState(1);
    const [searchUrl, setSearchUrl] = useState('');
    const [getUrl, setGetUrl] = useState('');
    const [loadingResult, setLoadingResult] = useState(false);
    const [sumerize, setSumerize] = useState(0)
    console.log(currentPage)
    // const handleSearchClick = () => {
    //     //console.log(762, data)
    //     setCurrentPage(1);
    //     if (currentPage === 1) {
    //         // callApiCount()
    //         // callApi(data);
    //         // callApiStatistic()
    //         // setSumerize(0)
    //     }
    // }

    const handleSearchClick = () => {
        setCurrentPage(1);
        callApi(searchValues, searchUrl)
        // setSearching(true)
        setCurrentPage(1);
        callApiCount()
        // callApiStatistic()
        setApiData([])
        setSumerize(0)
    }

    // Hàm để xử lý thay đổi giá trị tìm kiếm
    const handleInputChange = (fieldAlias, value, searchData) => {
        setSearchUrl(searchData.url)
        setSearchValues({ ...searchValues, [fieldAlias]: value });
    };

    // Hàm xử lý sự kiện nhấn phím, ví dụ nhấn Enter để tìm kiếm
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };


    console.log(search.url)
    const hasInlineButtons = Object.keys(buttons).some(key =>
        buttons[key].state && !['add', 'import', 'export'].includes(key));

    const [totalPages, setTotalPages] = useState(0);
    const rowsPerPage = functions.findRowsPerPage(tableProps)


    const accurateTotalPages = Math.ceil(sumerize / rowsPerPage);
    if (totalPages !== accurateTotalPages) {
        setTotalPages(accurateTotalPages);
    }
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;

    const currentData = apiData;
    console.log(396, currentData)

    const paginate = (pageNumber) => {
        const startAt = (pageNumber - 1) * rowsPerPage;
        if (Object.keys(searchValues).length === 0) {
            callApiView(getUrl, startAt, rowsPerPage);
        }
        else {
            callApiPa(pageNumber - 1);
        }
        setCurrentPage(pageNumber);
    };

    const renderSourceButtons = (source, lang) => {
        console.log(244, source)
        return Object.entries(source).map(([key, value]) => {
            if (!value.state) {
                return null;
            }
            switch (key) {
                case 'search':
                    return (
                        <FontAwesomeIcon icon={faMagnifyingGlass} key={key} onClick={() => handleSearchClick(searchValues, source.search.url)} className="icon-add mr-2 pointer" />
                    );
                    break
            }
            return null;
        }).filter(Boolean);
    };

    const callApiView = (url, startAt = 0, amount = rowsPerPage) => {
        console.log(url)
        const headerApi = {
            Authorization: _token,
            'start-at': startAt,
            'data-amount': amount
        }

        console.log(55, headerApi)
        fetch(`${proxy()}${url}`, {
            headers: headerApi
        })

            .then(res => res.json())
            .then(res => {
                const { success, content, data, count, fields, limit, statistic } = res;
                console.log(123456, res)
                setApiData([])
                if (data && data.length > 0) {
                    setApiData(data.filter(record => record != undefined));
                    setSumerize(count)
                    // setLimit(limit)
                    // setApiViewData(data)
                    // setApiViewFields(fields)
                }
            });

    }

    useEffect(() => {
        setGetUrl(get.url)
        callApiView(get.url)

    }, []);


    const callApi = (data, dataUrl, startIndex = currentPage - 1) => {
        const startTime = new Date().getTime();
        let loadingTimeout;
        let loadingTimeoutSearch;

        const searchBody = {
            start_index: startIndex,
            criteria: data,
            require_count: false,
            require_statistic: false,
        }
        console.log("ĐÂY LÀ BODY:", searchBody)
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
                    console.log(74, res)
                    if (success) {
                        setApiData(data.filter(record => record != undefined));

                        // setDataStatis(statisticValues);
                        // setLoaded(true);
                        // if (data.length < 15) {
                        //     setTotalPages(currentPage);
                        // } else if (currentPage === totalPages) {
                        //     setTotalPages(prevTotalPages => prevTotalPages + 1);
                        // }

                    } else {
                        // setApiData([]);
                        // setApiDataName([])
                    }

                    const endTime = new Date().getTime();
                    const elapsedTime = endTime - startTime;
                    clearTimeout(loadingTimeout);
                    clearTimeout(loadingTimeoutSearch);// Clear the timeout
                    // setLoadingSearch(false);
                    // setLoading(false)
                    // //console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
                });
        }

    };

    const callApiPa = (startIndex = currentPage - 1) => {
        const startTime = new Date().getTime();
        let loadingTimeout;
        let loadingTimeoutSearch;

        const searchBody = {
            start_index: startIndex,
            criteria: searchValues,
            require_count: false,
            require_statistic: false,
        }
        console.log("ĐÂY LÀ BODY:", searchBody)
        if (searchUrl) {

            fetch(`${proxy()}${searchUrl}`, {
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
                    console.log(74, res)
                    if (success) {
                        setApiData(data.filter(record => record != undefined));

                        // setDataStatis(statisticValues);
                        // setLoaded(true);
                        // if (data.length < 15) {
                        //     setTotalPages(currentPage);
                        // } else if (currentPage === totalPages) {
                        //     setTotalPages(prevTotalPages => prevTotalPages + 1);
                        // }

                    } else {
                        // setApiData([]);
                        // setApiDataName([])
                    }

                    const endTime = new Date().getTime();
                    const elapsedTime = endTime - startTime;
                    clearTimeout(loadingTimeout);
                    clearTimeout(loadingTimeoutSearch);// Clear the timeout
                    // setLoadingSearch(false);
                    // setLoading(false)
                    // //console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
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

        const searchBody = {
            // table_id: dataTable_id,
            start_index: currentPage - 1,
            criteria: searchValues,
            require_count: true,
            require_statistic: false,
            // api_id: page.components?.[0]?.api_get.split('/')[2]
            // exact: true
        }

        console.log(447, searchBody)
        fetch(`${proxy()}${searchUrl}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: _token,
                fromIndex: currentPage - 1,

            },
            body: JSON.stringify(searchBody)
        })
            .then(res => res.json())
            .then(res => {

                const { success, content, data, result, total, fields, count, sumerize } = res;
                const statisticValues = res.statistic;
                console.log(74, res)
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
                    // setApiDataName([])
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



    return (
        <div>
            <div class="table-responsive table-custom mb-2">
                <table class="table " style={tableProps.style}>
                    <thead>
                        <tr>
                            {visibility.indexing && <th>#</th>}
                            {fields.map(field => (
                                <th key={field.id}>{field.field_name}</th>
                            ))}
                            {hasInlineButtons && <th class="align-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {visibility.indexing && <th></th>}
                            {fields.map((field, index) => (
                                <th key={index} className="header-cell" style={{ minWidth: "200px" }}>
                                    <input
                                        type="search"
                                        className="form-control"
                                        value={searchValues[field.fomular_alias] || ''}
                                        onChange={(e) => handleInputChange(field.fomular_alias, e.target.value, search)}
                                        onKeyDown={handleKeyDown}
                                    />
                                </th>
                            ))}
                            <th class="align-center"> {renderSourceButtons(tableProps.source)}</th>
                        </tr>
                        {currentData && currentData.length > 0 ?
                            <>
                                {
                                    currentData.map((row, index) => {
                                        if (row) {
                                            return (
                                                <tr key={index}>
                                                    <td scope="row" style={{ minWidth: "50px" }} className="cell">{indexOfFirst + index + 1}</td>

                                                    {fields?.map((header) => (
                                                        <td key={header.fomular_alias} className="cell">{functions.renderData(header, row)}</td>
                                                    ))}
                                                    {hasInlineButtons && (
                                                        <td class="align-center">
                                                            {/* {renderInlineButtonsForRow(buttons, row)} */}
                                                            <div class="icon-table">
                                                                < RenderInlineButtonsForRow {...props} row={row} redirectToInputPUT={redirectToInputPUT} handleViewDetail={handleViewDetail} handleDelete={handleDelete} />
                                                            </div>

                                                        </td>
                                                    )}
                                                </tr>)
                                        } else {
                                            return null
                                        }
                                    })
                                }
                            </> :
                            <tr>
                                <td class="font-weight-bold cell" colspan={`${fields.length + 2}`} style={{ textAlign: 'center' }}><div>{lang["not found"]}</div></td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
            {
                currentData && currentData.length > 0 &&
                // renderPagination(navigator, visibility)
                <div className="d-flex justify-content-between align-items-center mt-1">
                    <p>
                        {/* {lang["show"]} {apiData.length > 0 ? indexOfFirst + 1 : 0}-{Math.min(indexOfLast, apiData.length)} {lang["of"]} {apiData.length} {lang["results"]} */}

                        {lang["show"]} {functions.formatNumber(indexOfFirst + 1)} - {functions.formatNumber(indexOfFirst + apiData?.length)}   {`${lang["of"]} `}
                        {loadingResult ?
                            <img
                                width={20}
                                className="mb-1"
                                src="/images/icon/load.gif"
                                alt="Loading..."
                            ></img>
                            : functions.formatNumber(sumerize)} {lang["results"]}
                    </p>
                    <nav aria-label="Page navigation example">
                        <ul className="pagination mb-0">
                            {/* Nút đến trang đầu */}
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => paginate(1)}>
                                    &#8810;
                                </button>
                            </li>
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => paginate(Math.max(1, currentPage - 1))}>
                                    &laquo;
                                </button>
                            </li>
                            {currentPage > 2 && <li className="page-item"><span className="page-link">...</span></li>}
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
                                    );
                                }
                                return null;  // Đảm bảo trả về null nếu không có gì được hiển thị
                            })}
                            {currentPage < totalPages - 1 && <li className="page-item"><span className="page-link">...</span></li>}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => paginate(Math.min(totalPages, currentPage + 1))}>
                                    &raquo;
                                </button>
                            </li>
                            {/* Nút đến trang cuối */}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => paginate(totalPages)}>
                                    &#8811;
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            }
        </div>
    );
};



const RenderInlineButtonsForRow = (props) => {
    console.log(420, props)
    const { lang, proxy, auth, functions } = useSelector(state => state);
    const { buttons, row, handleViewDetail, redirectToInputPUT, handleDelete } = props

    const _token = localStorage.getItem("_token");
    const orderedKeys = ['approve', 'unapprove', 'detail', 'update', 'delete']; // Thứ tự mong muốn


    // const handleApprove = (url, fomular) => {

    //     const bodyApprove = {
    //         fomular: true
    //     }
    //     console.log(bodyApprove)
    //     fetch(`${proxy()}${url}`, {
    //         method: "PUT",
    //         headers: {
    //             Authorization: _token,
    //             "content-type": "application/json"
    //         },
    //         body: JSON.stringify({ bodyApprove})
    //     })
    //         .then(res => res.json())
    //         .then(res => {
    //             console.log(res)
    //             // Swal.fire({
    //             //     title: lang["success"],
    //             //     text: lang["success.add"],
    //             //     icon: "success",
    //             //     showConfirmButton: false,
    //             //     timer: 1500
    //             // }).then(function () {
    //             //     window.location.reload();
    //             // });
    //         })
    //         .catch(error => {
    //             // Xử lý lỗi nếu cần
    //         });
    // }
    const handleApprove = async (record, dataApi) => {



        const urlApprove = dataApi.api.url;
        //console.log(dataApiPut)

        // const { components } = page;
        // const cpn = components[0]
        // const { api_put } = cpn;


        if (urlApprove != undefined) {
            // const id_str = dataApiPut.url.split('/')[2]
            const id_str = urlApprove.split('/')[2]
            const response = await new Promise((resolve, reject) => {
                fetch(`${proxy()}/apis/api/${id_str}/input_info`, {
                    headers: {
                        Authorization: _token
                    }
                })
                    .then(res => res.json())
                    .then(res => {
                        const { data, success, content } = res;
                        console.log(res)
                        if (success) {


                        }
                        resolve(res)
                    })
            })
            const { success, data } = response;
            console.log(54, response)
            if (success) {
                const { params } = data;
                const stringifiedParams = params.map(param => {
                    const { fomular_alias } = param
                    return record[fomular_alias]
                }).join('/')
                console.log(962, stringifiedParams)


                const bodyApprove = {
                    fomular: true
                }
                console.log(bodyApprove)
                fetch(`${proxy()}${urlApprove}/${stringifiedParams}`, {
                    method: "PUT",
                    headers: {
                        Authorization: _token,
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({ bodyApprove })
                })
                    .then(res => res.json())
                    .then(res => {
                        console.log(res)
                        // Swal.fire({
                        //     title: lang["success"],
                        //     text: lang["success.add"],
                        //     icon: "success",
                        //     showConfirmButton: false,
                        //     timer: 1500
                        // }).then(function () {
                        //     window.location.reload();
                        // });
                    })
                    .catch(error => {
                        // Xử lý lỗi nếu cần
                    });

            }
        } else {

        }
    }

    return orderedKeys.filter(key => buttons[key] && buttons[key].state).map(key => {
        switch (key) {
            case 'approve':
                return <div class="icon-table-line">
                    <i className="fa fa-check-circle-o size-24 pointer icon-check" key={key} onClick={() => handleApprove(row, props.buttons.approve)} ></i>
                </div>
            case 'unapprove':
                return <div class="icon-table-line">
                    <i className="fa fa-times-circle-o size-24 pointer icon-close" key={key}  ></i>
                </div>

            case 'detail':
                return <div class="icon-table-line">
                    <i className="fa fa-eye size-24 mr-1  pointer icon-view" key={key} onClick={() => handleViewDetail(row, props.buttons.detail.api.url)} title={lang["viewdetail"]}></i>
                </div>
            case 'update':
                return <div class="icon-table-line">
                    <i className="fa fa-edit size-24 pointer  icon-edit" key={key} onClick={() => redirectToInputPUT(row, props.buttons.update.api.url)} title={lang["edit"]}></i>
                </div>
            case 'delete':
                return <div class="icon-table-line">
                    <i className="fa fa-trash-o size-24 pointer icon-delete" key={key} onClick={() => handleDelete(row, props.buttons.delete.api.url)} title={lang["delete"]}></i>
                </div>
            default:
                return <button key={key}>{key}</button>;
        }
    });
};

const RenderChart = (props) => {
    console.log(730, props.props)
    const url = props.props.api
    console.log(url.url)
    const { lang, proxy, auth, functions } = useSelector(state => state);
    const _token = localStorage.getItem("_token");
    const [apiDataStatis, setApiDataStatis] = useState({})
    const [height, setHeight] = useState(350)
    console.log(675, height)
    useEffect(() => {
        callApiStatistic()

    }, []);

    // useEffect(() => {
    //     // Sử dụng sự kiện thay đổi kích thước cửa sổ để cập nhật chiều cao
    //     const handleResize = () => {
    //         // Tính toán chiều cao mới dựa trên kích thước cửa sổ hoặc phần tử chứa biểu đồ
    //         const newHeight = window.innerHeight; // Hoặc thay thế bằng logic tính toán khác
    //         setHeight(newHeight);
    //     };

    //     // Gắn sự kiện thay đổi kích thước cửa sổ
    //     window.addEventListener('resize', handleResize);

    //     // Gọi hàm handleResize để cài đặt chiều cao ban đầu
    //     handleResize();

    //     // Loại bỏ sự kiện khi component unmount
    //     return () => {
    //         window.removeEventListener('resize', handleResize);
    //     };
    // }, []);


    const callApiStatistic = () => {
        fetch(`${proxy()}${url.url}`, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                Authorization: _token,
            },
        })
            .then((res) => res.json())
            .then((res) => {
                const { success, content, statistics } = res;
                console.log(res)
                if (success) {
                    setApiDataStatis(statistics)

                }
            });
    };

    console.log(apiDataStatis)

    const state = {
        series: [{
            data: []
        }],
        options: {
            chart: {
                height: height,
                type: 'bar',
                toolbar: {
                    show: false
                },
                events: {
                    click: function (chart, w, e) {
                        // console.log(chart, w, e)
                    }
                }
            },
            colors: [],
            plotOptions: {
                bar: {
                    horizontal: typeof Object.values(apiDataStatis)[0] === 'number' ? true : false, // Thiết lập này để thay đổi sang biểu đồ cột ngang
                    columnWidth: '10%',
                    distributed: true,
                }
            },
            dataLabels: {
                enabled: true,
                fontSize: '11px',
            },
            legend: {
                show: true, // Hiển thị chú thích
                position: 'bottom', // Vị trí của chú thích (có thể là 'top', 'bottom', 'right', 'left')
                horizontalAlign: 'center', // Canh lề ngang của chú thích (có thể là 'left', 'center', 'right')
                fontSize: '11px', // Kích thước font chữ
                onItemClick: {
                    toggleDataSeries: false // Ngăn chặn việc ẩn/mở các dòng dữ liệu khi nhấp vào chú thích
                },
                onItemHover: {
                    highlightDataSeries: false // Ngăn chặn việc tô đậm các dòng dữ liệu khi di chuột qua chú thích
                },
            },
            tooltip: {
                enabled: true, // Kích hoạt tooltip

            },
            // xaxis: {
            //     categories: [
            //         [''],
            //         [''],

            //     ],
            //     labels: {
            //         style: {
            //             colors: [],
            //             fontSize: '10px'
            //         }
            //     }
            // }
        },
    };
    const transformDataForChart = (apiData) => {
        if (!apiData) {
            // apiData là null hoặc undefined
            return { series: [], options: state.options };
        }
        if (typeof Object.values(apiData)[0] === 'number') {
            // Dữ liệu dạng thứ hai
            setHeight(200)
            return {
                series: [{ data: Object.values(apiData) }],
                options: {
                    ...state.options,
                    xaxis: {
                        categories: Object.keys(apiData).map(key => [key, ''])
                    }
                }
            };
        } else {
            // Dữ liệu dạng thứ nhất
            const firstKey = Object.keys(apiData)[0];
            if (firstKey && typeof apiData[firstKey] === 'object') {
                setHeight(350)
                const series = Object.keys(apiData).map(key => {
                    return { name: key, data: Object.values(apiData[key]) };
                });
                const categories = Object.keys(apiData[firstKey]);
                return {
                    series: series,
                    options: {
                        ...state.options,
                        xaxis: {
                            categories: categories.map(status => [status, ''])
                        }
                    }
                };
            } else {
                // apiData không có cấu trúc như mong đợi
                return { series: [], options: state.options };
            }
        }
    };

    const chartData = useMemo(() => transformDataForChart(apiDataStatis), [apiDataStatis]);


    console.log(chartData)

    return (
        <div>
            Biểu đồ

            <div id="chart" style={{ width: '100%' }}>
                <Chart options={chartData.options} series={chartData.series} type="bar" height={height} />
            </div>
        </div>
    );
};

export default RenderComponent;
