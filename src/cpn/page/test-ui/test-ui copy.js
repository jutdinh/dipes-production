
import { useParams } from "react-router-dom";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMaximize, faMinimize, faDownload, faCompress, faChartBar, faPlusCircle, faCirclePlus, faAngleDown, faEllipsisVertical, faPlusSquare, faPaperPlane, faPaperclip, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
export default () => {
    const { lang, proxy, auth } = useSelector(state => state);
    const _token = localStorage.getItem("_token");
    const [logs, setLogs] = useState([]);

    const [view, setView] = useState([
        {
            "serial_Number": "C3412J1K011N055",
            "hardware": "1.3",
            "frimware": "",
            "software": "",

        }, {
            "serial_Number": "C1291J1P030N050",
            "hardware": "1.3",
            "frimware": "1.8.5.L.4",
            "software": "1.0.6.1",

        },
        {
            "serial_Number": "",
            "hardware": "",
            "frimware": "",
            "software": "",

        },
        {
            "serial_Number": "",
            "hardware": "",
            "frimware": "",
            "software": "",

        }
    ])
    const [filter, setFilter] = useState({ type: 'info' });
    const [showModal, setShowModal] = useState(false);

    let langItem = localStorage.getItem("lang") ? localStorage.getItem("lang") : "Vi";

    const languages = langItem.toLowerCase();
    console.log(view)
    const handleCloseModal = () => {
        setShowModal(false);
    };

    const [showPageDetail, setShowPageDetail] = useState(false);
    const handlePageDetail = () => {
        setShowPageDetail(true)
        setShowPageAdd(false)

    }

    const [showPageAdd, setShowPageAdd] = useState(false);
    const handlePageAdd = () => {
        setShowPageAdd(true)
        setShowPageDetail(false)

    }



    const [activeTab, setActiveTab] = useState('general');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    console.log("Chi tiết", showPageDetail)
    console.log("Thêm", showPageAdd)
    const getInitialState = (key, defaultValue) => {
        const storedValue = localStorage.getItem(key);
        return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
    };

    const [isOpenGeneral, setIsOpenGeneral] = useState(getInitialState('isOpenGeneral', false));
    const [isOpenProduction, setIsOpenProduction] = useState(getInitialState('isOpenProduction', false));
    const [isOpenDiscussion, setIsOpenDiscussion] = useState(getInitialState('isOpenDiscussion', false));
    const [isOpenSupport, setIsOpenSupport] = useState(getInitialState('isOpenSupport', false));


    // Lưu trạng thái vào localStorage mỗi khi nó thay đổi
    useEffect(() => {
        localStorage.setItem('isOpenGeneral', JSON.stringify(isOpenGeneral));
    }, [isOpenGeneral]);

    useEffect(() => {
        localStorage.setItem('isOpenProduction', JSON.stringify(isOpenProduction));
    }, [isOpenProduction]);

    useEffect(() => {
        localStorage.setItem('isOpenDiscussion', JSON.stringify(isOpenDiscussion));
    }, [isOpenDiscussion]);

    useEffect(() => {
        localStorage.setItem('isOpenSupport', JSON.stringify(isOpenSupport));
    }, [isOpenSupport]);

    const toggleCollapseGeneral = () => {
        setIsOpenGeneral(!isOpenGeneral);
    };
    const toggleCollapseProduction = () => {
        setIsOpenProduction(!isOpenProduction);
    };
    const toggleCollapseDiscussion = () => {
        setIsOpenDiscussion(!isOpenDiscussion);
    };
    const toggleCollapseSupport = () => {
        setIsOpenSupport(!isOpenSupport);
    };

    const eventType = [
        { id: 0, label: lang["log.information"], value: 1, color: "#3029F7", icon: "fa fa-info-circle size-log " },
        { id: 1, label: lang["log.warning"], value: 2, color: "#f3632e", icon: "fa fa-warning size" },
        { id: 2, label: lang["log.error"], value: 3, color: "#FF0000", icon: "fa fa-times-circle fa-2x" },

    ]
    useEffect(() => {
        const stringifiedUser = localStorage.getItem("user");
        const user = JSON.parse(stringifiedUser)
        const { role } = user;
        const validPrivileges = ["uad"]

        if (validPrivileges.indexOf(role) == -1) {
            window.location = "/404-notfound"
        }
    }, [])


    const [selectedImage, setSelectedImage] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.match('image.*') && file.size <= 26214400) { // 25MB limit
                const reader = new FileReader();
                reader.onload = (e) => {
                    setSelectedImage(e.target.result);
                    setErrorMessage('');
                };
                reader.readAsDataURL(file);
            } else {
                setErrorMessage('File is too large. Please upload an image less than 25MB.');
                setSelectedImage(null);
            }
        }
    };



    const [logDetail, setLogDetail] = useState([]);

    const detailLogs = async (logid) => {
        // console.log(logid)
        setLogDetail(logid)
    };

    const [currentPageLogs, setCurrentPageLogs] = useState(1);
    const rowsPerPageLogs = 4;
    const indexOfLastMemberLogs = currentPageLogs * rowsPerPageLogs;
    const indexOfFirstMemberLogs = indexOfLastMemberLogs - rowsPerPageLogs;
    const currentMembersLogs = view.slice(indexOfFirstMemberLogs, indexOfLastMemberLogs);
    const paginateLogs = (pageNumber) => setCurrentPageLogs(pageNumber);
    const totalPagesLogs = Math.ceil(view.length / rowsPerPageLogs);

    function openModalWithContent(jsonContent) {
        // Định dạng JSON để hiển thị đẹp hơn
        const formattedJson = JSON.stringify(jsonContent, null, 4);


    }

    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h4>Trang test</h4>
                        </div>
                    </div>
                </div>

                {/* <div class="row">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head">
                                <div class="heading1 margin_0">
                                    <h5>{lang["log.statis"]}</h5>
                                </div>
                            </div>
                            <div class="table_section padding_infor_info-logs">
                                <div class="member-cus">
                                    <div class="msg_list_main">
                                        <div className="row column1 mb-3 mt-3">
                                            <div className="col-lg-3">
                                                <label>{lang["log.type"]}:</label>
                                                <select className="form-control" value={filter.type} onChange={(e) => { setFilter({ ...filter, type: e.target.value }) }}>
                                                    <option value="info">{lang["log.information"]}</option>
                                                    <option value="warn">{lang["log.warning"]}</option>
                                                    <option value="error">{lang["log.error"]}</option>

                                                </select>
                                            </div>
                                            <div className="col-lg-3">
                                                <label>{lang["log.daystart"]}:</label>
                                                <input type="datetime-local" className="form-control" value={filter.start} onChange={
                                                    (e) => { setFilter({ ...filter, start: e.target.value }) }
                                                } />
                                            </div>
                                            <div className="col-lg-3">
                                                <label>{lang["log.dayend"]}:</label>
                                                <input type="datetime-local" className="form-control" value={filter.end} onChange={
                                                    (e) => { setFilter({ ...filter, end: e.target.value }) }
                                                } />
                                            </div>
                                            <div className="col-lg-3 d-flex align-items-end justify-content-end">
                                                <button className="btn btn-primary mr-2 mt-2 btn-log" onClick={submitFilter}>{lang["btn.ok"]}</button>
                                                <button className="btn btn-secondary btn-log" onClick={() => {
                                                    setView(logs)
                                                }}>{lang["btn.clear"]}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}
                <div class="row">
                    {/* List Case */}
                    <div class="col-md-5" style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                        <div class="search-container">
                            <input type="search" class="search-input" placeholder="Case title, case description, or anything" />
                        </div>



                        <div class="pointer mt-3" onClick={handlePageAdd} >
                            <FontAwesomeIcon icon={faCirclePlus} className="size-16  color_icon_plus pointer" /> <span class="lable_add">Post Your Case </span>
                        </div>

                        <hr></hr>
                        <div class="sort-case">

                            <div class="d-flex ">
                                <p style={{ marginBottom: 0 }}>Sorted by: Created date   <FontAwesomeIcon icon={faAngleDown} className="size-16  ml-auto pointer" /> </p>
                                <div class="ml-auto"> Total: <span class="font-weight-bold  ">12</span> case(s)</div>
                            </div>
                        </div>
                        <div class="container-case">

                            <div class="box-case selected" onClick={handlePageDetail}>
                                <div class="d-flex">
                                    <h4>Bad Print quality_RMA for APC901 #8080</h4>
                                    <div class=" cross-hide pointer scaled-hover-target scaled-hover ml-auto">

                                        <FontAwesomeIcon icon={faEllipsisVertical} className="size-16   pointer" />
                                    </div>

                                </div>

                                <p>5 returned cartridges are tested and claim for warranty</p>
                                <div class="d-flex ">
                                    <p class="italic" style={{ marginBottom: 0 }}>Posted 25 days ago. </p>
                                    <div class="ml-auto"> <img width={32} src={"/images/review/ex.png"}></img></div>
                                </div>
                            </div>

                            <div class="box-case">
                                <div class="d-flex">
                                    <h4>Bad Print quality_RMA for APC901 #8080</h4>
                                    <FontAwesomeIcon icon={faEllipsisVertical} className="size-16  ml-auto pointer" />
                                </div>

                                <p>5 returned cartridges are tested and claim for warranty</p>
                                <div class="d-flex ">
                                    <p class="italic" style={{ marginBottom: 0 }}>Posted 25 days ago. </p>
                                    <div class="ml-auto"> <img width={32} src={"/images/review/ex.png"}></img></div>
                                </div>
                            </div>
                            <div class="box-case">
                                <div class="d-flex">
                                    <h4>Bad Print quality_RMA for APC901 #8080</h4>
                                    <FontAwesomeIcon icon={faEllipsisVertical} className="size-16  ml-auto pointer" />
                                </div>

                                <p>5 returned cartridges are tested and claim for warranty</p>
                                <div class="d-flex ">
                                    <p class="italic" style={{ marginBottom: 0 }}>Posted 25 days ago. </p>
                                    <div class="ml-auto"> <img width={32} src={"/images/review/ex.png"}></img></div>
                                </div>
                            </div>
                            <div class="box-case">
                                <div class="d-flex">
                                    <h4>Bad Print quality_RMA for APC901 #8080</h4>
                                    <FontAwesomeIcon icon={faEllipsisVertical} className="size-16  ml-auto pointer" />
                                </div>

                                <p>5 returned cartridges are tested and claim for warranty</p>
                                <div class="d-flex ">
                                    <p class="italic" style={{ marginBottom: 0 }}>Posted 25 days ago. </p>
                                    <div class="ml-auto"> <img width={32} src={"/images/review/ex.png"}></img></div>
                                </div>
                            </div>
                            <div class="box-case">
                                <div class="d-flex">
                                    <h4>Bad Print quality_RMA for APC901 #8080</h4>
                                    <FontAwesomeIcon icon={faEllipsisVertical} className="size-16  ml-auto pointer" />
                                </div>

                                <p>5 returned cartridges are tested and claim for warranty</p>
                                <div class="d-flex ">
                                    <p class="italic" style={{ marginBottom: 0 }}>Posted 25 days ago. </p>
                                    <div class="ml-auto"> <img width={32} src={"/images/review/ex.png"}></img></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Add Case */}
                    {showPageAdd &&
                        (
                            < div class="col-md-7" style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                                <div class="col-md-12">
                                    <div class="white_shd full margin_bottom_30">
                                        <div class="full graph_head">
                                            <div class="heading1 margin_0 d-flex">
                                                <h4 class="margin-bottom-0">New Case</h4>
                                                <FontAwesomeIcon icon={faPaperPlane} className={`size-24 ml-auto icon-add-production pointer `} />
                                            </div>
                                        </div>
                                        <div class="table_section padding_infor_info_case_detail">
                                            <div class="add-case">
                                                <div class="field-case">
                                                    <h5 class="mb-2">Case Title</h5>
                                                    <input type="text" class="form-control" placeholder="Enter case title" ></input>
                                                </div>
                                                <div class="row field-case">
                                                    <div class="col-md-8">
                                                        <h5 class="mb-2">ISSUE DESCRIPTION</h5>
                                                        <textarea class="form-control" rows={8}></textarea>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <h5 className="mb-2">ATTACHMENT</h5>
                                                        <div className="upload-container-case">
                                                            {!selectedImage && (
                                                                <label htmlFor="file-upload" className="custom-file-upload">
                                                                    CHOOSE FILE
                                                                </label>
                                                            )}
                                                            <input
                                                                id="file-upload"
                                                                type="file"
                                                                style={{ display: "none" }}
                                                                onChange={handleImageChange}
                                                                accept="image/*"
                                                            />
                                                            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                                                            {selectedImage && (
                                                                <img
                                                                    id="image-preview"
                                                                    src={selectedImage}
                                                                    alt="Image Preview"
                                                                    style={{
                                                                        maxWidth: 'calc(100% - 40px)',
                                                                        maxHeight: 'calc(100% - 10px)',
                                                                        objectFit: 'contain',
                                                                        borderRadius: '10px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onClick={() => document.getElementById('file-upload').click()}
                                                                    title="Click to change image"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="field-case">
                                                    <div class="d-flex mb-2">
                                                        <h5>Production information</h5>
                                                        <FontAwesomeIcon icon={faPlusSquare} className={`size-24 ml-auto icon-add-production pointer `} />
                                                    </div>
                                                    <div class="table-responsive">
                                                        {
                                                            view && view.length > 0 ? (
                                                                <>
                                                                    <table class="table">
                                                                        <thead>
                                                                            <tr class="color-tr">
                                                                                <th scope="col">{lang["log.no"]}</th>
                                                                                <th scope="col">SERIAL NUMBER</th>
                                                                                <th scope="col">HARDWARE</th>
                                                                                <th scope="col">FIRMWARE</th>
                                                                                <th scope="col">SOFTWARE</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {currentMembersLogs.map((log, index) => {


                                                                                return (
                                                                                    <tr key={log.id}>
                                                                                        <td class="align-center">{indexOfFirstMemberLogs + index + 1}</td>
                                                                                        <td style={{ width: "300px" }}>
                                                                                            {log.serial_Number}
                                                                                        </td>
                                                                                        <td >{log.hardware}</td>
                                                                                        <td>
                                                                                            {log.frimware}
                                                                                        </td>

                                                                                        <td>{log.software}</td>

                                                                                    </tr>

                                                                                );
                                                                            })}
                                                                            <tr></tr>
                                                                        </tbody>

                                                                    </table>
                                                                    {/* <div className="d-flex justify-content-between align-items-center">

                                                                            <p>{lang["show"]} {indexOfFirstMemberLogs + 1}-{Math.min(indexOfLastMemberLogs, logs.length)} {lang["of"]} {logs.length} {lang["results"]}</p>

                                                                            <nav aria-label="Page navigation example">
                                                                                <ul className="pagination mb-0">
                                                                                    <li className={`page-item ${currentPageLogs === 1 ? 'disabled' : ''}`}>
                                                                                        <button className="page-link" onClick={() => paginateLogs(1)}>
                                                                                            &#8810;
                                                                                        </button>
                                                                                    </li>
                                                                                    <li className={`page-item ${currentPageLogs === 1 ? 'disabled' : ''}`}>
                                                                                        <button className="page-link" onClick={() => paginateLogs(currentPageLogs - 1)}>
                                                                                            &laquo;
                                                                                        </button>
                                                                                    </li>
                                                                                    {currentPageLogs > 3 && <li className="page-item"><span className="page-link">...</span></li>}
                                                                                    {Array(totalPagesLogs).fill().map((_, index) => {
                                                                                        if (
                                                                                            index + 1 === currentPageLogs ||
                                                                                            (index + 1 >= currentPageLogs - 5 && index + 1 <= currentPageLogs + 5)
                                                                                        ) {
                                                                                            return (
                                                                                                <li key={index} className={`page-item ${currentPageLogs === index + 1 ? 'active' : ''}`}>
                                                                                                    <button className="page-link" onClick={() => paginateLogs(index + 1)}>
                                                                                                        {index + 1}
                                                                                                    </button>
                                                                                                </li>
                                                                                            )
                                                                                        }
                                                                                    })}
                                                                                    {currentPageLogs < totalPagesLogs - 2 && <li className="page-item"><span className="page-link">...</span></li>}
                                                                                    <li className={`page-item ${currentPageLogs === totalPagesLogs ? 'disabled' : ''}`}>
                                                                                        <button className="page-link" onClick={() => paginateLogs(currentPageLogs + 1)}>
                                                                                            &raquo;
                                                                                        </button>
                                                                                    </li>
                                                                                    <li className={`page-item ${currentPageLogs === totalPagesLogs ? 'disabled' : ''}`}>
                                                                                        <button className="page-link" onClick={() => paginateLogs(totalPagesLogs)}>
                                                                                            &#8811;
                                                                                        </button>
                                                                                    </li>
                                                                                </ul>
                                                                            </nav>


                                                                        </div> */}
                                                                </>
                                                            ) : (
                                                                <div class="list_cont ">
                                                                    <p>Chưa có logs</p>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* Non Case */}
                    {(!showPageDetail && !showPageAdd) && (
                        <div class="col-md-7" style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                            <div class="col-md-12">
                                <div class="white_shd full margin_bottom_30">
                                    <div class="table_section padding_infor_info_case_detail">

                                    <div>
                                            <div className="custom-tab-container">
                                                <div className={`custom-tab ${activeTab === 'general' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('general')}>
                                                    General
                                                </div>
                                                <div className={`custom-tab ${activeTab === 'products' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('products')}>
                                                    Products
                                                </div>
                                                <div className={`custom-tab ${activeTab === 'discussion' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('discussion')}>
                                                    Discussion
                                                </div>
                                                <div className={`custom-tab ${activeTab === 'support' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('support')}>
                                                    Support Quality
                                                </div>
                                            </div>

                                            <div>
                                                {activeTab === 'general' && <div><p>Here is the general information...</p></div>}
                                                {activeTab === 'products' && <div><p>Here are the products we offer...</p></div>}
                                                {activeTab === 'discussion' && <div><p>Join the discussion on various topics...</p></div>}
                                                {activeTab === 'support' && <div><p>Need help? Contact our support team for quality assistance...</p></div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detail Case */}
                    {showPageDetail && (
                        <div class="col-md-7" style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                            <div class="col-md-12">
                                <div class="white_shd full margin_bottom_30">
                                    <div class="full graph_head">
                                        <div class="heading1 margin_0 case-detail">
                                            <h4>Bad Print quality_RMA for APC901 #8080</h4>

                                            <div class="d-flex ">
                                                <p class="italic" style={{ marginBottom: 0 }}>Posted 25 days ago. <b class="status_label">Resolved</b></p>
                                                <div class="ml-auto">
                                                    <img class="icon-rate-small" src={"/images/icon/i1.png"}></img>
                                                    <img class="icon-rate-small" src={"/images/icon/i2.png"}></img>
                                                    <img class="icon-rate-small" src={"/images/icon/i3.png"}></img>
                                                    <img class="icon-rate-small" src={"/images/icon/i4.png"}></img>
                                                    <img class="icon-rate-small" src={"/images/icon/i5.png"}></img>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="table_section padding_infor_info_case_detail">
                                    <div>
                                            <div className="custom-tab-container">
                                                <div className={`custom-tab ${activeTab === 'general' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('general')}>
                                                    General
                                                </div>
                                                <div className={`custom-tab ${activeTab === 'products' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('products')}>
                                                    Products
                                                </div>
                                                <div className={`custom-tab ${activeTab === 'discussion' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('discussion')}>
                                                    Discussion
                                                </div>
                                                <div className={`custom-tab ${activeTab === 'support' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('support')}>
                                                    Support Quality
                                                </div>
                                            </div>

                                            <div>
                                                {activeTab === 'general' && <div><p>Here is the general information...</p></div>}
                                                {activeTab === 'products' && <div><p>Here are the products we offer...</p></div>}
                                                {activeTab === 'discussion' && <div><p>Join the discussion on various topics...</p></div>}
                                                {activeTab === 'support' && <div><p>Need help? Contact our support team for quality assistance...</p></div>}
                                            </div>
                                        </div>
                                        <div id="accordion" role="tablist" aria-multiselectable="true">
                                            <div class="card">
                                                <div class="card-header case-detail" role="tab" id="headingOne">
                                                    <h5 class="mb-0 d-flex ">
                                                        <span onClick={toggleCollapseGeneral} class="pointer" aria-expanded={isOpenGeneral} aria-controls="collapseOne">
                                                            GENEGAL
                                                        </span>
                                                        <FontAwesomeIcon icon={isOpenGeneral ? faAngleLeft : faAngleDown} className={`size-18 ml-auto mt-1 color_angle_down pointer ${isOpenGeneral ? 'rotate-icon' : ''}`} onClick={toggleCollapseGeneral} />
                                                    </h5>
                                                </div>

                                                <div id="collapseOne" className={`collapse ${isOpenGeneral ? 'show' : ''}`} role="tabpanel" aria-labelledby="headingOne">
                                                    <div class="card-block">
                                                        <div class="col-md-12">
                                                            <div class="info-case">
                                                                <h5>Issue Description</h5>
                                                                <span>5 returned cartridges are tested and claim for warranty</span>
                                                                <div class="image-row">
                                                                    <img class="image-icon" src="/images/helpdesk/r10.png" />
                                                                </div>
                                                                <div class="title-suggest">Suggested Solution</div>
                                                                <span class="content-suggest">Thank you for your information, please help me test again with another EXT head run with firmware 1.8.5.L.4</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="card">
                                                <div class="card-header case-detail" role="tab" id="headingOne">
                                                    <h5 class="mb-0 d-flex ">
                                                        <a onClick={toggleCollapseProduction} class="pointer" aria-expanded={isOpenProduction} aria-controls="collapseOne">
                                                            Productions
                                                        </a>
                                                        <FontAwesomeIcon icon={isOpenProduction ? faAngleLeft : faAngleDown} className={`size-18 ml-auto mt-1 color_angle_down pointer ${isOpenProduction ? 'rotate-icon' : ''}`} onClick={toggleCollapseProduction} />
                                                    </h5>
                                                </div>
                                                <div id="collapseOne" className={`collapse ${isOpenProduction ? 'show' : ''}`} role="tabpanel" aria-labelledby="headingOne">
                                                    <div class="card-block">
                                                        <div class="col-md-12">
                                                            <div class="info-case">
                                                                <div class="d-flex mb-2 mt-1">
                                                                    <h5>Production information</h5>

                                                                    <FontAwesomeIcon icon={faPlusSquare} data-toggle="modal" data-target="#addProduct" className={`size-24 ml-auto icon-add-production pointer `} />
                                                                </div>
                                                                <div class="table-responsive">
                                                                    {
                                                                        view && view.length > 0 ? (
                                                                            <>
                                                                                <table class="table">
                                                                                    <thead>
                                                                                        <tr class="color-tr">
                                                                                            <th>{lang["log.no"]}</th>
                                                                                            <th>SERIAL NUMBER</th>
                                                                                            <th>HARDWARE</th>
                                                                                            <th>FIRMWARE</th>
                                                                                            <th>SOFTWARE</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {currentMembersLogs.map((log, index) => {
                                                                                            return (
                                                                                                <tr key={log.id}>
                                                                                                    <td class="align-center">{indexOfFirstMemberLogs + index + 1}</td>
                                                                                                    <td style={{ width: "300px" }}>
                                                                                                        {log.serial_Number}
                                                                                                    </td>
                                                                                                    <td >{log.hardware}</td>
                                                                                                    <td>
                                                                                                        {log.frimware}
                                                                                                    </td>
                                                                                                    <td>{log.software}</td>
                                                                                                </tr>
                                                                                            );
                                                                                        })}
                                                                                    </tbody>
                                                                                </table>
                                                                                <div className="d-flex justify-content-between align-items-center">
                                                                                    <p>{lang["show"]} {indexOfFirstMemberLogs + 1}-{Math.min(indexOfLastMemberLogs, view.length)} {lang["of"]} {view.length} {lang["results"]}</p>
                                                                                    <nav aria-label="Page navigation example">
                                                                                        <ul className="pagination mb-0">
                                                                                            <li className={`page-item ${currentPageLogs === 1 ? 'disabled' : ''}`}>
                                                                                                <button className="page-link" onClick={() => paginateLogs(1)}>
                                                                                                    &#8810;
                                                                                                </button>
                                                                                            </li>
                                                                                            <li className={`page-item ${currentPageLogs === 1 ? 'disabled' : ''}`}>
                                                                                                <button className="page-link" onClick={() => paginateLogs(currentPageLogs - 1)}>
                                                                                                    &laquo;
                                                                                                </button>
                                                                                            </li>
                                                                                            {currentPageLogs > 3 && <li className="page-item"><span className="page-link">...</span></li>}
                                                                                            {Array(totalPagesLogs).fill().map((_, index) => {
                                                                                                if (
                                                                                                    index + 1 === currentPageLogs ||
                                                                                                    (index + 1 >= currentPageLogs - 5 && index + 1 <= currentPageLogs + 5)
                                                                                                ) {
                                                                                                    return (
                                                                                                        <li key={index} className={`page-item ${currentPageLogs === index + 1 ? 'active' : ''}`}>
                                                                                                            <button className="page-link" onClick={() => paginateLogs(index + 1)}>
                                                                                                                {index + 1}
                                                                                                            </button>
                                                                                                        </li>
                                                                                                    )
                                                                                                }
                                                                                            })}
                                                                                            {currentPageLogs < totalPagesLogs - 2 && <li className="page-item"><span className="page-link">...</span></li>}
                                                                                            <li className={`page-item ${currentPageLogs === totalPagesLogs ? 'disabled' : ''}`}>
                                                                                                <button className="page-link" onClick={() => paginateLogs(currentPageLogs + 1)}>
                                                                                                    &raquo;
                                                                                                </button>
                                                                                            </li>
                                                                                            <li className={`page-item ${currentPageLogs === totalPagesLogs ? 'disabled' : ''}`}>
                                                                                                <button className="page-link" onClick={() => paginateLogs(totalPagesLogs)}>
                                                                                                    &#8811;
                                                                                                </button>
                                                                                            </li>
                                                                                        </ul>
                                                                                    </nav>
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <div class="list_cont ">
                                                                                <p>Hi</p>
                                                                            </div>
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="card">
                                                <div class="card-header case-detail" role="tab" id="headingOne">
                                                    <h5 class="mb-0 d-flex ">
                                                        <a onClick={toggleCollapseDiscussion} class="pointer" aria-expanded={isOpenDiscussion} aria-controls="collapseOne">
                                                            Discussion
                                                        </a>
                                                        <FontAwesomeIcon icon={isOpenDiscussion ? faAngleLeft : faAngleDown} className={`size-18 ml-auto mt-1 color_angle_down pointer ${isOpenDiscussion ? 'rotate-icon' : ''}`} onClick={toggleCollapseDiscussion} />
                                                    </h5>
                                                </div>
                                                <div id="collapseOne" className={`collapse bg-message ${isOpenDiscussion ? 'show' : ''}`} role="tabpanel" aria-labelledby="headingOne">
                                                    <div class="card-block ">
                                                        <div class="col-md-12">
                                                            <div class="info-case">
                                                                <div class="messages-wrapper">

                                                                    <div class="message-container received">
                                                                        {/* <img class="message-image" src="path_to_image_received.jpg" alt="Received message image" /> */}
                                                                        <p>
                                                                            Contrary to popular belief, Lorem Ipsum is not simply random text.
                                                                            It has in a piece of classical Latin literature from 45 BC, making it over 2000 old.
                                                                            Richard McClintock, a Latin professor at Hampden-Sydney College in 9. looked up one of
                                                                            the more obscure Latin words.... Show more
                                                                        </p>
                                                                        <div class="message-timestamp">Nov 15th, 07:19</div>
                                                                    </div>
                                                                    <div class="message-container sent">
                                                                        {/* <img class="message-image" src="path_to_image_sent.jpg" alt="Sent message image" /> */}
                                                                        <p>is a long established fact that a reader will be distracted by the readable content
                                                                            of a page when looking at its layout. The point of using Lorem Ipsum is that it has
                                                                            a more-or-less normal distribution of letters, as opposed to us at Hampden-Sydney College in Virginia.
                                                                        </p>
                                                                        <img class="message-image" src="/images/helpdesk/1.png" />
                                                                        <img class="message-image" src="/images/helpdesk/1.png" />
                                                                        <img class="message-image" src="/images/helpdesk/1.png" />
                                                                        <div class="message-timestamp">Nov 16th, 08:23</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="chat-input-container">
                                                        <input type="text" placeholder="Type a message..." class="chat-input" />
                                                        <FontAwesomeIcon icon={faPaperclip} className={`size-24  mr-2 pointer `} />
                                                        <FontAwesomeIcon icon={faPaperPlane} className={`size-24 ml-auto mr-2 icon-add-production pointer `} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="card">
                                                <div class="card-header case-detail" role="tab" id="headingOne">
                                                    <h5 class="mb-0 d-flex ">
                                                        <a onClick={toggleCollapseSupport} class="pointer" aria-expanded={isOpenSupport} aria-controls="collapseOne">
                                                            Support Quality
                                                        </a>
                                                        <FontAwesomeIcon icon={isOpenSupport ? faAngleLeft : faAngleDown} className={`size-18 ml-auto mt-1 color_angle_down pointer ${isOpenSupport ? 'rotate-icon' : ''}`} onClick={toggleCollapseSupport} />
                                                    </h5>
                                                </div>
                                                <div id="collapseOne" className={`collapse ${isOpenSupport ? 'show' : ''}`} role="tabpanel" aria-labelledby="headingOne">
                                                    <div class="card-block">
                                                        <div class="col-md-12">
                                                            <div class="info-case align-center-case">
                                                                <span>You have not rated the quality of support</span>
                                                                <button class="btn btn-primary" data-toggle="modal" data-target="#viewLog">Rate Now</button>

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
                    )}
                </div>
                {/* View log */}
                <div class={`modal no-select-modal ${showModal ? 'show' : ''}`} id="viewLog">
                    <div class="modal-dialog modal-dialog-center ">
                        <div class="modal-content">
                            <div class="modal-header modal-header-review">
                                <h4 class="modal-title modal-title-review">SUPPORT QUALITY</h4>
                                <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="row">
                                        <div class="form-group col-lg-12 align-center">
                                            {/* <img class="icon-rate" src={"/images/icon/i1.png"}></img>
                                            <img class="icon-rate" src={"/images/icon/i2.png"}></img>
                                            <img class="icon-rate" src={"/images/icon/i3.png"}></img>
                                            <img class="icon-rate" src={"/images/icon/i4.png"}></img>
                                            <img class="icon-rate" src={"/images/icon/i5.png"}></img> */}
                                            <div class="form-group col-lg-12 align-center">
                                                <div class="icon-rate" data-text="Excellent">
                                                    <img class="icon-rate" src="/images/icon/i1.png" />
                                                    <span class="tooltip-text1">Excellent</span>
                                                </div>
                                                <div class="icon-rate" data-text="Good">
                                                    <img class="icon-rate" src="/images/icon/i2.png" />
                                                    <span class="tooltip-text2">Good</span>
                                                </div>
                                                <div class="icon-rate" data-text="Medium">
                                                    <img class="icon-rate" src="/images/icon/i3.png" />
                                                    <span class="tooltip-text3">Medium</span>
                                                </div>
                                                <div class="icon-rate" data-text="Poor">
                                                    <img class="icon-rate" src="/images/icon/i4.png" />
                                                    <span class="tooltip-text4">Poor</span>
                                                </div>
                                                <div class="icon-rate" data-text="Very Bad">
                                                    <img class="icon-rate" src="/images/icon/i5.png" />
                                                    <span class="tooltip-text5">Very Bad</span>
                                                </div>
                                            </div>


                                        </div>
                                        <div class="form-group col-lg-12">
                                            <textarea class="form-control" rows={8} placeholder="Let us know how you feel"></textarea>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer modal-footer-review ">
                                <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-primary modal-button-review">Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Add Production Infomation */}
                <div class={`modal no-select-modal ${showModal ? 'show' : ''}`} id="addProduct">
                    <div class="modal-dialog modal-dialog-center ">
                        <div class="modal-content">
                            <div class="modal-header ">
                                <h4 class="modal-title">Add Product</h4>
                                <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="row">
                                        <div class="form-group col-lg-12">
                                            <label>SERIAL NUMBER</label>
                                            <input type="text" class="form-control" />
                                        </div>
                                        <div class="form-group col-lg-12">
                                            <label>HARDWARE VERSION</label>
                                            <input type="text" class="form-control" />
                                        </div>
                                        <div class="form-group col-lg-12">
                                            <label>FIRMWARE VERSION</label>
                                            <input type="text" class="form-control" />
                                        </div>
                                        <div class="form-group col-lg-12">
                                            <label>SOFTWARE VERSION</label>
                                            <input type="text" class="form-control" />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-primary modal-button-review">Add Now</button>
                                <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger modal-button-review">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}

