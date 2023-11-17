
import { useParams } from "react-router-dom";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMaximize, faMinimize, faDownload, faCompress, faChartBar, faPlusCircle, faCirclePlus, faAngleDown, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
export default () => {
    const { lang, proxy, auth } = useSelector(state => state);
    const _token = localStorage.getItem("_token");
    const [logs, setLogs] = useState([]);

    const [view, setView] = useState([])
    const [filter, setFilter] = useState({ type: 'info' });



    const [showModal, setShowModal] = useState(false);

    let langItem = localStorage.getItem("lang") ? localStorage.getItem("lang") : "Vi";

    const languages = langItem.toLowerCase();
    // console.log(_token)
    const handleCloseModal = () => {
        setShowModal(false);
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

    useEffect(() => {

        fetch(`${proxy()}/logs/${languages}`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;
                // console.log(resp)
                if (success) {
                    if (data != undefined && data.length > 0) {


                        setLogs(data);
                        setView(data);
                    }
                } else {
                    window.location = "/login"
                }
            })
    }, [])


    const [logDetail, setLogDetail] = useState([]);

    const detailLogs = async (logid) => {
        // console.log(logid)
        setLogDetail(logid)
    };

    const submitFilter = (e) => {
        e.preventDefault();
        filter["lang"] = languages



        fetch(`${proxy}/logs/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(filter),
        })
            .then(res => res && res.json())
            .then((resp) => {
                if (resp) {
                    const { success, content, data, status } = resp;
                    // console.log(resp)
                    if (success) {

                        setView(data)
                        // window.location.reload();
                        setShowModal(false);

                    } else {
                        Swal.fire({
                            title: "Thất bại!",
                            text: content,
                            icon: "error",
                            showConfirmButton: false,
                            timer: 2000,
                        });
                    }
                }
            })
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
                    <div class="col-md-5" style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                        <div class="form-outline mb-2 box-shadow input-search">
                            <input type="search" class="form-control" placeholder={`Sửa lại chổ này `} />
                        </div>


                        <FontAwesomeIcon icon={faCirclePlus} className="size-16  color_icon_plus pointer" /> <span class="lable_add">Post Your Case </span>
                        <hr></hr>
                        <div class="sort-case">

                            <div class="d-flex ">
                                <p style={{ marginBottom: 0 }}>Sorted by: Created date   <FontAwesomeIcon icon={faAngleDown} className="size-16  ml-auto pointer" /> </p>
                                <div class="ml-auto"> Total: <span class="font-weight-bold  ">12</span> case(s)</div>
                            </div>
                        </div>
                        <div class="container-case">
                            <div class="box-case">
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
                    <div class="col-md-7" style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                        <div class="col-md-12">
                            <div class="white_shd full margin_bottom_30">
                                <div class="full graph_head">
                                    <div class="heading1 margin_0">
                                        <h4>Bad Print quality_RMA for APC901 #8080</h4>

                                        <div class="d-flex ">
                                            <p class="italic" style={{ marginBottom: 0 }}>Posted 25 days ago. <b class="status_label">Resolved</b></p>
                                            <div class="ml-auto"> <img width={32} src={"/images/review/ex.png"}></img></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="table_section padding_infor_info_case_detail">
                                    <div id="accordion" role="tablist" aria-multiselectable="true">
                                        <div class="card">
                                            <div class="card-header" role="tab" id="headingOne">
                                                <h5 class="mb-0 d-flex">
                                                    <a data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                                        Collapsible Group Item #1
                                                    </a>
                                                    <FontAwesomeIcon icon={faAngleDown} className="size-18 ml-auto mt-1 color_angle_down pointer" />
                                                </h5>
                                            </div>

                                            <div id="collapseOne" class="collapse show" role="tabpanel" aria-labelledby="headingOne">
                                                <div class="card-block">
                                                    Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
                                                </div>
                                            </div>
                                        </div>
                                        <div class="card">
                                            <div class="card-header" role="tab" id="headingTwo">
                                                <h5 class="mb-0 d-flex">
                                                    <a class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                                        Collapsible Group Item #2
                                                    </a>
                                                    <FontAwesomeIcon icon={faAngleDown} className="size-18 ml-auto mt-1 color_angle_down pointer" />
                                                </h5>
                                            </div>
                                            <div id="collapseTwo" class="collapse" role="tabpanel" aria-labelledby="headingTwo">
                                                <div class="card-block">
                                                    Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
                                                </div>
                                            </div>
                                        </div>
                                        <div class="card">
                                            <div class="card-header" role="tab" id="headingThree">
                                                <h5 class="mb-0 d-flex">
                                                    <a class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                                        Collapsible Group Item #3
                                                    </a>
                                                    <FontAwesomeIcon icon={faAngleDown} className="size-18 ml-auto mt-1 color_angle_down pointer" />
                                                </h5>
                                            </div>
                                            <div id="collapseThree" class="collapse" role="tabpanel" aria-labelledby="headingThree">
                                                <div class="card-block">
                                                    Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                {/* View log */}
                <div class={`modal no-select-modal ${showModal ? 'show' : ''}`} id="viewLog">
                    <div class="modal-dialog modal-dialog-center ">
                        <div class="modal-content">
                            <div class="modal-header modal-header-review">
                                <h4 class="modal-title modal-title-review">Đánh giá hỗ trợ</h4>
                                <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="row">
                                        <div class="form-group col-lg-12">
                                            <textarea class="form-control" cols={20}></textarea>
                                        </div>
                                        <div class="form-group col-lg-12">
                                            <textarea class="form-control" cols={20}></textarea>
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
            </div >

        </div >
    )
}

