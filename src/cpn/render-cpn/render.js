import React from 'react';
import { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus, faFileImport, faFileExport, faUpload, faMagnifyingGlass, faDownload } from '@fortawesome/free-solid-svg-icons';
import Chart from 'react-apexcharts'
import Swal from 'sweetalert2';
import { Table } from "react-bootstrap";
import icons from './icon';


const RenderComponent = ({ page, component, apiData, redirectToInput, redirectToInputPUT, handleDelete, handleSearchClick, exportToCSV, handleViewDetail, exportFile, redirectToImportData, exportFile_PK,  submitButton_Custom }) => {
//console.log(component)
    const { lang, proxy, auth, functions, pages } = useSelector(state => state);

    // Hàm chính để xác định loại component cần render
    const renderByType = (cpn, props, flex, id) => {

        //////console.log(page.params)
        const type = cpn.name
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

        switch (type) {
            case 'text':
                return <div style={props.style}>{props.content}</div>;
            case 'table':
                // const extraButtons = hasFlexData(flex) ? renderExtraButtons(foundChild.props.buttons, props, lang) : renderExtraButtons(props.buttons, props);
                const extraButtons = <ExtraButtons
                    buttons={hasFlexData(flex) ? foundChild.props.buttons : props.buttons}
                    props={props}
                    lang={lang}
                    redirectToInput={redirectToInput}
                    redirectToImportData={redirectToImportData}
                    exportToCSV={exportToCSV}
                    exportFile={exportFile}
                />;
                const tableStyle = applyFlexStyle(props.style); // Áp dụng style ở đây
                return (
                    <div style={tableStyle}>
                        <div class="d-flex align-items-center mt-2">
                            {props.name}
                            {extraButtons && <div class="ml-auto mb-1">{extraButtons}</div>}
                        </div>
                        <RenderTable
                            page={page}
                            component={cpn}
                            type={type}
                            apiData={apiData}
                            props={props}
                            buttons={props.buttons}
                            handleSearchClick={handleSearchClick}
                            redirectToInputPUT={redirectToInputPUT}
                            handleDelete={handleDelete}
                            handleViewDetail={handleViewDetail}
                            exportFile={exportFile}
                            exportFile_PK={exportFile_PK}
                            submitButton_Custom={submitButton_Custom} />
                    </div>
                );

            case 'table_param':
                // const extraButtons = hasFlexData(flex) ? renderExtraButtons(foundChild.props.buttons, props, lang) : renderExtraButtons(props.buttons, props);
                const extraButtons_Param = <ExtraButtons
                    buttons={hasFlexData(flex) ? foundChild.props.buttons : props.buttons}
                    props={props}
                    lang={lang}
                    redirectToInput={redirectToInput}
                    redirectToImportData={redirectToImportData}
                    exportToCSV={exportToCSV}
                    exportFile={exportFile}
                />;
                return (
                    <div>
                        <div class="d-flex align-items-center mt-2">
                            {props.name}
                            {extraButtons_Param && <div class="ml-auto mb-1">{extraButtons_Param}</div>}
                        </div>
                        <RenderTable
                            page={page}
                            component={cpn}
                            type={type}
                            apiData={apiData}
                            props={props}
                            buttons={props.buttons}
                            handleSearchClick={handleSearchClick}
                            redirectToInputPUT={redirectToInputPUT}
                            handleDelete={handleDelete}
                            handleViewDetail={handleViewDetail}
                            exportFile={exportFile}
                            exportFile_PK={exportFile_PK} 
                            submitButton_Custom={submitButton_Custom}/>
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
            case 'c_chart':
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
                                    <div class="tabbar padding_infor_info_p-d-5">
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
                                                                        {comp.children?.map((compflex) => <div key={compflex.id}>{renderByType(compflex, compflex.props, comp, compflex.id)} </div>)}
                                                                    </div>
                                                                    :
                                                                    renderByType(comp, comp.props)}
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
const ExtraButtons = ({ buttons, props, redirectToInput, redirectToImportData, exportToCSV, exportFile }) => {
    //////console.log(174,buttons)
    const { lang, proxy, auth, functions } = useSelector(state => state);
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser) || {}
    const _token = localStorage.getItem("_token");

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
                    ////////console.log(_user.username)
                    ////////console.log(dataUser)
                    setDataPrivileges(dataUser?.privileges)
                }
            })

    }, [])
    const dataTable_id = props.source.tables[0].id
    const dataCheckAdministrator = {
        "read": true,
        "write": true,
        "modify": true,
        "purge": true,
    }
    const dataCheck = _user.role !== "uad" ? dataPrivileges?.find(item => item.table_id === dataTable_id) : dataCheckAdministrator;

    return Object.entries(buttons).map(([key, value]) => {

        if (!value.state) {
            return null;
        }
        switch (key) {
            case 'add':
                return (
                    dataCheck && dataCheck?.write ?
                        <FontAwesomeIcon icon={faSquarePlus} key={key} onClick={() => redirectToInput(buttons.add.api.url)} className="icon-add mr-2 pointer" title={"Create"} />
                        :
                        null
                );
            case 'import':
                return (
                    // <FontAwesomeIcon icon={faFileImport} key={key} className="icon-import mr-2 pointer" />
                    <>
                        {
                            dataCheck && dataCheck?.write ? (<>
                                <FontAwesomeIcon icon={faUpload} className={`size-24 mr-2 icon-import pointer `} id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title={"Import data"} />
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
                                </ul></>)
                                : null
                        }
                    </>
                );
            case 'export':
                return (
                    dataCheck && dataCheck?.read ?
                        <FontAwesomeIcon icon={faDownload} className="icon-export pointer margin-bottom-1" onClick={() => exportFile(props.source.fields, props.source.get.url, buttons.export.api.url)} data-toggle="modal" data-target="#exportExcel" title={"Export_excel_csv"} />
                        : null
                );
                break;
            // Thêm các trường hợp khác nếu cần
        }
        return null;
    }).filter(Boolean);
};
const RenderTable = (props) => {

    ////console.log(328, props)

    const { project_id, version_id, url } = useParams();
    const params_Table = props.page.params
    const tableProps = props.props
    const children = props.component.children
    const buttons = props.buttons
    const exportFile = props.exportFile
    const exportFile_PK = props.exportFile_PK
    const redirectToInputPUT = props.redirectToInputPUT
    const submitButton_Custom= props.submitButton_Custom
    const handleViewDetail = props.handleViewDetail
    const handleDelete = props.handleDelete
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser) || {}
    const dataTable_id = tableProps.source.tables[0].id
    const dispatch = useDispatch();
    const typeTable = props.type
    //////console.log(children)
    const data = props.apiData
    const { lang, proxy, auth, functions } = useSelector(state => state);
    const checkState = useSelector(state => state.stateAprove);
    const _token = localStorage.getItem("_token");
    const [searchValues, setSearchValues] = useState({});
    const [apiData, setApiData] = useState([])
    const [previousSearchValues, setPreviousSearchValues] = useState({});
    const [currentCount, setCurrentCount] = useState(null);

    const { fields, search, get } = tableProps.source;
    const currentURL = window.location.href;

    const params = functions.getAllParamsAfterPageId(currentURL, url)
    const { navigator } = tableProps.buttons;
    const visibility = tableProps.visibility;
    const [currentPage, setCurrentPage] = useState(1);
    const [searchUrl, setSearchUrl] = useState('');
    const [getUrl, setGetUrl] = useState('');
    const [loadingResult, setLoadingResult] = useState(false);
    const [sumerize, setSumerize] = useState(0)
    const [dataPrivileges, setDataPrivileges] = useState([]);
    const [tableMaxHeight, setTableMaxHeight] = useState('50vh');
    ////console.log(tableMaxHeight)

    useEffect(() => {
        function updateTableHeight() {

            const newHeight = window.innerHeight - 280;
            setTableMaxHeight(`${newHeight}px`);
        }

        window.addEventListener('resize', updateTableHeight);

        // Gọi ngay khi component được mount
        updateTableHeight();

        // Cleanup listener
        return () => {
            window.removeEventListener('resize', updateTableHeight);
        };
    }, []);

    //////console.log(sumerize)
    useEffect(() => {

        fetch(`${proxy()}/privileges/accounts`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, activated, status, content } = resp;
                ////////console.log(251, resp)
                if (success && data.length > 0) {
                    const dataUser = data.find(item => item.username === _user.username);
                    ////////console.log(_user.username)
                    ////////console.log(dataUser)
                    setDataPrivileges(dataUser?.privileges)
                }
            })

    }, [])
    const dataCheckAdministrator = {
        "read": true,
        "write": true,
        "modify": true,
        "purge": true,
    }

    const dataCheck = _user.role !== "uad" ? dataPrivileges?.find(item => item.table_id === dataTable_id) : dataCheckAdministrator;

    const handleSearchClick = (data, url) => {
        ////console.log(3555, data)
        ////console.log(3555, url)

        setSearchUrl(url)
        setSearchValues(data)
        setCurrentPage(1);
        callApi(searchValues, searchUrl)
        // setSearching(true)
        callApiCount(searchValues, searchUrl)
        // callApiStatistic()
        setApiData([])
        setSumerize(0)
    }


    // Hàm để xử lý thay đổi giá trị tìm kiếm
    const handleInputChange = (e, fieldAlias, value, searchData) => {
        // Loại bỏ khoảng trắng ở hai đầu của chuỗi
        const trimmedValue = value.trim();

        // Kiểm tra nếu chuỗi chỉ chứa khoảng trắng và không có ký tự khác
        if (/^\s*$/.test(trimmedValue)) {
            // Nếu là chuỗi trắng, gán giá trị rỗng ("") cho trường fieldAlias
            setSearchValues({ ...searchValues, [fieldAlias]: "" });
        } else {
            // Nếu không phải là chuỗi trắng, cập nhật searchValues với giá trị đã trim
            setSearchValues({ ...searchValues, [fieldAlias]: trimmedValue });
        }

        // Cập nhật searchUrl
        setSearchUrl(searchData.url);
    };



    // Hàm xử lý sự kiện nhấn phím, ví dụ nhấn Enter để tìm kiếm
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick(searchValues, searchUrl);
        }
    };

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
    ////////////console.log(396, currentData)

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
        //////console.log(244, source)
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
        if (typeTable === "table_param") {
            const url = tableProps.source.search.url


            const result = params_Table?.reduce((acc, item, index) => {
                if (index < params.length) {
                    acc[item.fomular_alias] = params[index];
                }
                return acc;
            }, {});

            //////console.log(415415, result);
            setSearchValues(result)

            //////console.log(apiData);
            setCurrentPage(1);
            callApi(result, url)
            callApiCount(result, url)
            setApiData([])
            setSumerize(0)
            return;
        }
        const headerApi = {
            Authorization: _token,
            'start-at': startAt,
            'data-amount': amount
        }
        fetch(`${proxy()}${url}`, {
            headers: headerApi
        })
            .then(res => res.json())
            .then(res => {
                const { success, content, data, count, fields, limit, statistic } = res;
                setApiData([])
                if (data && data.length > 0) {
                    setApiData(data.filter(record => record != undefined));
                    setSumerize(count)
                }
            });
    }
    useEffect(() => {
        setGetUrl(get.url)
        callApiView(get.url)

    }, []);

    useEffect(() => {
        setGetUrl(get.url)
        callApiView(get.url)

        dispatch({
            branch: "ui",
            type: "checkState",
            payload: {
                success: false
            }
        })

    }, [checkState]);
    ////////////console.log(308,checkState)

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
        ////////////console.log("ĐÂY LÀ BODY:", searchBody)
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
                    ////////////console.log(74, res)
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
                    // //////////////console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
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
        ////////////console.log("ĐÂY LÀ BODY:", searchBody)
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
                    ////////////console.log(74, res)
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
                    // //////////////console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
                });
        }

    };

    const callApiCount = (data, url, requireCount = false) => {

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
            criteria: data,
            require_count: true,
            require_statistic: false,
            // api_id: page.components?.[0]?.api_get.split('/')[2]
            // exact: true
        }
        // let urlGetCount;
        // if (typeTable === "table_param") {
        //     urlGetCount = url
        // } else {
        //     urlGetCount = searchUrl
        // }
        ////////////console.log(447, searchBody)
        fetch(`${proxy()}${url}`, {
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

                const { success, content, data, result, total, fields, count } = res;
                const statisticValues = res.statistic;
                ////////////console.log(74, res)
                if (success) {
                    // setApiData(data.filter(record => record != undefined));
                    // setApiDataName(fields);
                    // setDataStatis(statisticValues);
                    // setLoaded(true);

                    if (count !== undefined) {
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
                // ////////////console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
            });
    };
    const headerRefs = useRef([]);
    useLayoutEffect(() => {
        headerRefs.current.forEach((ref) => {
          if (ref) {
      

            const maxWidth = parseInt(getComputedStyle(ref).maxWidth, 10);
            const minWidth = Math.min(ref.scrollWidth, maxWidth);
            ref.style.minWidth = `${minWidth}px`; 
          }
        });
      }, []);
    return (
        <div>
            <div class="table-responsive table-custom mb-2">
                <div style={{
                    maxHeight: tableMaxHeight,
                    overflowY: "auto"
                }}>
                    <Table bordered >
                        {/* <table class="table" style={tableProps.style}> */}
                        <thead class="sticky-header">
                            <tr>
                                {visibility.indexing && <td class="">#</td>}
                                {fields.map(field => (
                                    <td key={field.id}>{field.field_name}</td>
                                ))}
                                {hasInlineButtons && <td class="align-center">Actions</td>}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {visibility.indexing && <td></td>}
                                {fields.map((field, index) => (
                                    <th key={index} ref={el => headerRefs.current[index] = el} className="header-cell" >
                                        {functions.renderInput(field, handleInputChange, searchValues, search, handleKeyDown)}
                                    </th>
                                ))}
                                <th class="align-center"> {renderSourceButtons(tableProps.source, tableProps.source.search.url)}</th>
                            </tr>
                            {currentData && currentData.length > 0 ?
                                <>
                                    {dataCheck && dataCheck?.read ? (
                                        currentData.map((row, index) => {
                                            if (row) {
                                                return (
                                                    <tr key={index}>
                                                        <td class="align-center" scope="row" style={{ minWidth: "50px" }} className="cell">{indexOfFirst + index + 1}</td>
                                                        {fields?.map((header) => (
                                                            <td key={header.fomular_alias} className="cell">{functions.renderData(header, row)}</td>
                                                        ))}
                                                        {hasInlineButtons && (
                                                            <td class="align-center">
                                                                {/* {renderInlineButtonsForRow(buttons, row)} */}

                                                                < RenderInlineButtonsForRow data={currentData} children={children} {...props} tableProps={tableProps} row={row} redirectToInputPUT={redirectToInputPUT} handleViewDetail={handleViewDetail} handleDelete={handleDelete} dataPrivileges={dataPrivileges} exportFile={exportFile} exportFile_PK={exportFile_PK} submitButton_Custom={submitButton_Custom} />

                                                            </td>
                                                        )}
                                                    </tr>)
                                            } else {
                                                return null
                                            }
                                        })
                                    ) :
                                        <tr>
                                            <td class="font-weight-bold cell" colspan={`${fields.length + 2}`} style={{ textAlign: 'center' }}><div>{lang["no privileges"]}</div></td>
                                        </tr>
                                    }
                                </> :
                                <tr>
                                    <td class="font-weight-bold cell" colspan={`${fields.length + 2}`} style={{ textAlign: 'center' }}><div>{lang["not found"]}</div></td>
                                </tr>
                            }
                        </tbody>
                        {/* </table> */}
                    </Table>
                </div>
            </div>
            {
                currentData && currentData.length > 0 &&
                    dataCheck && dataCheck?.read ? (
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
                ) : null
            }
        </div>
    );
};


const RenderInlineButtonsForRow = (props) => {
    //console.log(420123, props)
    const { lang, proxy, auth, functions } = useSelector(state => state);
    const { openTab, renderDateTimeByFormat } = functions
    const { children, buttons, row, handleViewDetail, redirectToInputPUT, handleDelete, exportFile, exportFile_PK , submitButton_Custom} = props
    const dataTableField = props.props.source.fields
    const orderedKeys = ['approve', 'unapprove', 'detail', 'update', 'delete']; // Thứ tự mong muốn
    const dispatch = useDispatch();
    const { project_id, version_id, id_str, url } = useParams();
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser) || {}
    const _token = localStorage.getItem("_token");
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
                    ////////console.log(760, _user)
                    ////////console.log(dataUser)
                    setDataPrivileges(dataUser?.privileges)
                }
            })

    }, [])

    const dataTable_id = props.props.source.tables[0].id

    const dataCheckAdministrator = {
        "read": true,
        "write": true,
        "modify": true,
        "purge": true,
    }

    const dataCheck = _user.role !== "uad" ? dataPrivileges.find(item => item.table_id === dataTable_id) : dataCheckAdministrator;

    ////////console.log(dataCheck)

    const handleApprove = async (record, dataApi) => {
        const urlApprove = dataApi.api.url;
        const fomular_approve = dataApi.field.fomular_alias


        if (urlApprove != undefined) {

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
                        ////////////console.log(res)
                        if (success) {


                        }
                        resolve(res)
                    })
            })
            const { success, data } = response;
            ////////////console.log(54, response)
            if (success) {
                const { params } = data;
                const stringifiedParams = params.map(param => {
                    const { fomular_alias } = param
                    return record[fomular_alias]
                }).join('/')
                ////////////console.log(962, stringifiedParams)


                const bodyApprove = {
                    [fomular_approve]: true
                }
                ////////////console.log(bodyApprove)
                fetch(`${proxy()}${urlApprove}/${stringifiedParams}`, {
                    method: "PUT",
                    headers: {
                        Authorization: _token,
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({ ...bodyApprove })
                })
                    .then(res => res.json())
                    .then(res => {
                        ////////////console.log(res)
                        const { success } = res
                        if (success) {
                            dispatch({
                                branch: "ui",
                                type: "checkState",
                                payload: {
                                    success: true
                                }
                            })
                            Swal.fire({
                                title: lang["success"],
                                text: lang["success.update"],
                                icon: "success",
                                showConfirmButton: false,
                                timer: 1500
                            })
                        }
                    })
                    .catch(error => {
                        // Xử lý lỗi nếu cần
                    });
            }
        } else {
        }
    }

    const handleUnApprove = async (record, dataApi) => {
        const urlUnApprove = dataApi.api.url;
        const fomular_unapprove = dataApi.field.fomular_alias
        ////////////console.log(fomular_unapprove)
        if (urlUnApprove != undefined) {

            const id_str = urlUnApprove.split('/')[2]
            const response = await new Promise((resolve, reject) => {
                fetch(`${proxy()}/apis/api/${id_str}/input_info`, {
                    headers: {
                        Authorization: _token
                    }
                })
                    .then(res => res.json())
                    .then(res => {
                        const { data, success, content } = res;
                        ////////////console.log(res)
                        if (success) { }
                        resolve(res)
                    })
            })
            const { success, data } = response;
            ////////////console.log(54, response)
            if (success) {
                const { params } = data;
                const stringifiedParams = params.map(param => {
                    const { fomular_alias } = param
                    return record[fomular_alias]
                }).join('/')
                ////////////console.log(962, stringifiedParams)
                const bodyUnApprove = {
                    [fomular_unapprove]: false
                }
                ////////////console.log(bodyUnApprove)
                fetch(`${proxy()}${urlUnApprove}/${stringifiedParams}`, {
                    method: "PUT",
                    headers: {
                        Authorization: _token,
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({ ...bodyUnApprove })
                })
                    .then(res => res.json())
                    .then(res => {
                        ////////////console.log(res)
                        if (success) {

                            dispatch({
                                branch: "ui",
                                type: "checkState",
                                payload: {
                                    success: true
                                }
                            })

                            Swal.fire({
                                title: lang["success"],
                                text: lang["success.update"],
                                icon: "success",
                                showConfirmButton: false,
                                timer: 1500
                            })
                        }
                    })
                    .catch(error => {
                    });
            }
        } else {
        }
    }

    const handleTable_Param = async (row, pageId, params) => {
        const fomularAlias = params.map(item => item.fomular_alias);
        const values = fomularAlias.map((alias) => row[alias]);
        openTab(`/page/${pageId}/${values}`)
    }

    const handleTableExportButton = async (row, pageId, params) => {
        const fomularAlias = params.map(item => item.fomular_alias);
        const values = fomularAlias.map((alias) => row[alias]);
        openTab(`/page/${pageId}/${values}`)
    }

    const mappedButtons = children.map((child) => {

        const { id, props: buttonProps, name } = child;
        const { to, icon, style, fields, api, preview_api, primary_key, value } = buttonProps;
        const { color, backgroundColor } = style;

        const primaryKeys = primary_key?.[0]?.fomular_alias;

        // Tìm trường có id trùng với primary_key
////console.log(1075, primaryKeys)

        const fomular = children[0]?.props?.primary_key?.fomular_alias;
        ////console.log(fomular)
        switch (name) {
            case 'redirect_button':
                return (
                    <>
                        <div class="icon-table-line" style={{color: color, backgroundColor: backgroundColor}} >
                            <i className="fa fa-link size-24 mr-1  pointer icon-link" key={id} onClick={() => handleTable_Param(row, to.page_id, to.params)} title={lang["viewdetail"]}></i>
                        </div>
                    </>
                )
            case 'table_export_button':
                return (
                    <>
                        <div class="icon-table-line" style={{color: color, backgroundColor: backgroundColor}}>
                            <i className="fa fa fa-list-ul size-24 mr-1  pointer icon-list"   key={id} onClick={() => exportFile_PK(fields, preview_api.url, api.url, fomular, row)} data-toggle="modal" data-target="#exportExcel_PK" title={lang["viewdetail"]}></i>
                        </div>
                    </>
                )
            case 'custom_button':
                return (
                    <>
                        <div class="icon-table-line" style={{color: color, backgroundColor: backgroundColor}} >
                        <FontAwesomeIcon  key={id} icon={icons[icon].icon} onClick={() => submitButton_Custom( api.params,api.url,  primaryKeys, value, row ,dataTableField)} />
                            {/* <i className="fa fa fa-list-ul size-24 mr-1  pointer icon-list" key={id} onClick={() => exportFile_PK(fields, preview_api.url, api.url, fomular, row)} data-toggle="modal" data-target="#exportExcel_PK" title={lang["viewdetail"]}></i> */}
                        </div>
                    </>
                )

            default:

        }
    });


    // mappedButtons sẽ là một mảng các phần tử JSX của nút

    const fomularAlias = props.buttons.approve.field.fomular_alias;
    const shouldHideIconApprove = (row) => {
        // Kiểm tra điều kiện và trả về true nếu cần ẩn icon
        return fomularAlias && row[fomularAlias] === true;
    };

    const shouldHideIconUnApprove = (row) => {
        // Kiểm tra điều kiện và trả về true nếu cần ẩn icon
        return fomularAlias && row[fomularAlias] === false;
    };

    return (
        <div class="icon-table">
            {mappedButtons}
            {orderedKeys.filter(key => buttons[key] && buttons[key].state && buttons[key].api !== null).map(key => {
                switch (key) {
                    case 'approve':
                        return <div class="icon-table-line">
                            {shouldHideIconApprove(row) ?
                                <i className="fa fa-check-circle-o size-24 pointer icon-check icon-disable" key={key}></i>
                                : (
                                    <i
                                        className="fa fa-check-circle-o size-24 pointer icon-check"
                                        onClick={() => handleApprove(row, props.buttons.approve)}
                                        title={lang["updatestatus"]}
                                    ></i>
                                )}
                        </div>
                    case 'unapprove':
                        return (
                            <div className="icon-table-line">
                                {shouldHideIconUnApprove(row) ?
                                    <i className="fa fa-times-circle-o size-24 pointer icon-close icon-disable" key={key}></i>
                                    : (
                                        <i className="fa fa-times-circle-o size-24 pointer icon-close" key={key} onClick={() => handleUnApprove(row, props.buttons.unapprove)} title={lang["updatestatus"]}></i>
                                    )
                                }
                            </div>
                        );

                    case 'detail':
                        return <div class="icon-table-line">
                            <i className="fa fa-eye size-24 mr-1  pointer icon-view" key={key} onClick={() => handleViewDetail(row, props.buttons.detail.api.url)} title={lang["viewdetail"]}></i>
                        </div>
                    case 'update':
                        return (
                            dataCheck && dataCheck.modify ? <div class="icon-table-line">
                                <i className="fa fa-edit size-24 pointer  icon-edit" key={key} onClick={() => redirectToInputPUT(row, props.buttons.update.api.url)} title={lang["edit"]}></i>
                            </div> : null
                        )
                    case 'delete':
                        return (
                            dataCheck && dataCheck.purge ? <div class="icon-table-line">
                                <i className="fa fa-trash-o size-24 pointer icon-delete" key={key} onClick={() => handleDelete(row, props.buttons.delete.api.url)} title={lang["delete"]}></i>
                            </div> : null
                        )
                    default:
                        return <button key={key}>{key}</button>;
                }
            })}
        </div>
    )
};

const RenderChart = (props) => {
    //////console.log(730, props.props)
    const url = props.props.api
    const paramsSearch = props.props.params
    //////console.log(paramsSearch)
    const { lang, proxy, auth, functions } = useSelector(state => state);
    const _token = localStorage.getItem("_token");
    const [apiDataStatis, setApiDataStatis] = useState({})
    const [height, setHeight] = useState(350)
    //////console.log(apiDataStatis)
    useEffect(() => {
        callApiStatistic()

    }, []);

    ///search data
    const [parentFormData, setParentFormData] = useState({});
    ////console.log("data", parentFormData)
    const handleFormDataChange = (newFormData) => {
        setParentFormData(newFormData);
    };

    const handleSubmitSearch = (newFormData) => {
        ////console.log(1131, newFormData)
        //////console.log("Đã nhấn nút sêarc")
        callApiStatistic()
    };

    const handleResetSearchValue = (newFormData) => {
        ////console.log(1137, newFormData)
        setParentFormData({})
        callApiStatistic({})
    };



    const callApiStatistic = (formData = parentFormData) => {
        const statisBody = {
            criterias: formData
        }
        fetch(`${proxy()}${url.url}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: _token,
            },
            body: JSON.stringify(statisBody)
        })
            .then((res) => res.json())
            .then((res) => {
                const { success, content, statistics } = res;
                //////console.log(1163, res)
                if (success) {
                    setApiDataStatis(statistics)

                }
            });
    };

    ////////////console.log(apiDataStatis)

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
                        // ////////////console.log(chart, w, e)
                    }
                }
            },
            colors: [],
            plotOptions: {
                bar: {
                    horizontal: typeof Object.values(apiDataStatis)[0] === 'number' ? true : false, // Thiết lập này để thay đổi sang biểu đồ cột ngang
                    columnWidth: '24px',
                    barHeight: "24px",
                    distributed: true,

                }
            },
            dataLabels: {
                enabled: true,
                fontSize: '10px',
            },
            legend: {
                show: true, // Hiển thị chú thích
                position: 'bottom', // Vị trí của chú thích (có thể là 'top', 'bottom', 'right', 'left')
                horizontalAlign: 'center', // Canh lề ngang của chú thích (có thể là 'left', 'center', 'right')
                fontSize: '10px', // Kích thước font chữ
                onItemClick: {
                    toggleDataSeries: false // Ngăn chặn việc ẩn/mở các dòng dữ liệu khi nhấp vào chú thích
                },
                onItemHover: {
                    highlightDataSeries: false // Ngăn chặn việc tô đậm các dòng dữ liệu khi di chuột qua chú thích
                },
                legend: {
                    onItemClick: {
                        toggleDataSeries: true // Cho phép ẩn/hiện các chuỗi dữ liệu khi nhấp vào chú thích
                    },
                },
            },
            tooltip: {
                enabled: true,
                theme: 'light', // hoặc 'light'
                style: {
                    fontSize: '12px',
                    fontFamily: 'UTM avo, sans-serif',
                },
                x: {
                    show: true,
                    format: 'dd MMM', // Định dạng ngày tháng nếu dữ liệu của bạn có ngày tháng
                },
                y: {
                    formatter: (value) => value.toString(), // Thêm đơn vị vào giá trị
                },
                marker: {
                    show: true, // Hiển thị marker trên tooltip
                },
                custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                    // Lấy nhãn và giá trị cho điểm dữ liệu hiện tại
                    const label = w.globals.labels[dataPointIndex][0];
                    const value = series[seriesIndex][dataPointIndex];

                    // Tạo tooltip mà không có dấu phẩy sau mã
                    return `<div class="custom-tooltip-chart">
                      <span>${label}: ${value}</span>
                    </div>`;
                }
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
    ////////////console.log(chartData)

    return (
        <div className='col-md-12'>
            <h5 style={props.props.style} >{props.props.content}</h5>

            {paramsSearch && paramsSearch.length > 0 && <DynamicForm data={paramsSearch} onFormDataChange={handleFormDataChange} onFormSubmit={handleSubmitSearch} onFormReset={handleResetSearchValue} />}
            <div id="chart" style={{ width: '100%' }}>
                <Chart options={chartData.options} series={chartData.series} type="bar" height={height} />
            </div>

        </div>
    );
};

const DynamicForm = ({ data, onFormDataChange, onFormSubmit, onFormReset }) => {
    ////console.log(data)

    const [formData, setFormData] = useState({});
    //////console.log(formData)

    const handleInputChange = (fieldAlias, value) => {
        let processedValue;
        if (value === "true") {
            processedValue = true;
        } else if (value === "false") {
            processedValue = false;
        } else {
            processedValue = value;
        }
        const newFormData = { ...formData, [fieldAlias]: processedValue };
        setFormData(newFormData);
        onFormDataChange(newFormData);
    };


    const handleSubmit = (event) => {
        event.preventDefault();
        //////console.log(formData); 
        onFormSubmit(formData)
    };

    const handleResetSearchValue = (event) => {
        event.preventDefault();
        const newFormData = {};
        setFormData(newFormData);
        onFormDataChange(newFormData);
        onFormReset(newFormData)

    };

    const renderInput = (field) => {
        ////console.log(field)
        const inputValue = formData[field.fomular_alias] || "";
        ////console.log(inputValue)
        ////console.log(inputValue.toString())
        const valueBool = [
            {
                id: 0,
                label: field.DEFAULT_TRUE,
                value: true
            },
            {
                id: 1,
                label: field.DEFAULT_FALSE,
                value: false
            },
        ]
        ////console.log(valueBool)
        switch (field.DATATYPE) {

            case 'TEXT':
                return <input type="text" className="form-control" placeholder={field.field_name} value={inputValue} onChange={(e) => handleInputChange(field.fomular_alias, e.target.value)} />;

            case 'INT UNSIGNED' || 'BIG INT' || 'INT UNSIGNED' || 'BIG INT UNSIGNED':
                return <input type="number" className="form-control" placeholder={field.field_name} value={inputValue} min="0" onChange={(e) => handleInputChange(field.fomular_alias, e.target.value)} />;
            case 'DATE':
                return <input type="date" className="form-control" placeholder={field.field_name} value={inputValue} onChange={(e) => handleInputChange(field.fomular_alias, e.target.value)} />;
            case 'DATETIME':
                return <input type="datetime-local" className="form-control" placeholder={field.field_name} value={inputValue} onChange={(e) => handleInputChange(field.fomular_alias, e.target.value)} />;
            case 'BOOL':
                return (
                    <select
                        value={inputValue === true ? 'true' : 'false'}
                        onChange={(e) => handleInputChange(field.fomular_alias, e.target.value)}
                        className="form-control"
                    >
                        <option value="" disabled>Choose</option>
                        {valueBool.map((val, index) => (
                            <option key={index} value={val.value.toString()}>{val.label}</option>
                        ))}
                    </select>
                );

            default:
                return <input type="text" value={inputValue} className="form-control" onChange={(e) => handleInputChange(field.fomular_alias, e.target.value)} />;
        }
    };

    return (
        <div className="row block-statis">
            {data.map((field, index) => (
                <div className="col-md-4" key={index}>
                    <div className="form-group">
                        <label class="font-weight-bold">{field.field_name}</label>
                        {renderInput(field)}
                    </div>
                </div>
            ))}
            <div className="col-md-12 text-right">
                <button onClick={handleResetSearchValue} className="btn btn-secondary mr-3"><i class="fa fa-history mr-1 icon-search" />Làm mới</button>
                <button onClick={handleSubmit} className="btn btn-primary mr-3"><i class="fa fa-search mr-1 icon-search" />Tìm Kiếm</button>
            </div>
        </div>
    );
};

export default RenderComponent;
