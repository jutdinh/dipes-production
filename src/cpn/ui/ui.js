
import { useParams } from "react-router-dom";
import Header from "../common/header"
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StatusEnum, StatusTask } from '../enum/status';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { Tables } from ".";
export default () => {
    const { lang, proxy, auth } = useSelector(state => state);
    const _token = localStorage.getItem("_token");
    const { project_id, version_id } = useParams();
    let navigate = useNavigate();
    const [uis, setUis] = useState([]);
    useEffect(() => {
        fetch(`${proxy}/uis/v/${version_id}`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;

                if (success) {
                    if (data) {
                        setUis(data.uis);

                    }
                } else {
                    // window.location = "/404-not-found"
                }
            })
    }, [])
    console.log(uis)

  


    const handleUpdateStatus = (uiid) => {
        console.log("api", uiid)
        // const newStatus = !uiid.status;
        // const requestBody = {
        //     version_id: version_id,
        //     api: { ...uiid, status: newStatus }
        // };

        // console.log(requestBody)
        // fetch(`${proxy}/apis/api`, {
        //     method: 'PUT',
        //     headers: {
        //         "content-type": "application/json",
        //         Authorization: `${_token}`,
        //     },
        //     body: JSON.stringify(requestBody)
        // })
        //     .then(res => res.json())
        //     .then((resp) => {
        //         const { success, content, data, status } = resp;
        //         if (success) {
        //             Swal.fire({
        //                 title: "Thành công!",
        //                 text: content,
        //                 icon: "success",
        //                 showConfirmButton: false,
        //                 timer: 1500,
        //             }).then(function () {
        //                 window.location.reload();
        //             });
        //         } else {
        //             Swal.fire({
        //                 title: "Thất bại!",
        //                 text: content,
        //                 icon: "error",
        //                 showConfirmButton: false,
        //                 timer: 2000,
        //             }).then(function () {
        //                 // Không cần reload trang
        //             });
        //         }
        //     });


    }
    const handleDeleteApi = (uiid) => {
        console.log(uiid)
        const requestBody = {
            version_id: version_id,
            ui_id: uiid.id
        };
        console.log(requestBody)
        Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc chắn muốn xóa api này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            confirmButtonColor: 'rgb(209, 72, 81)',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${proxy}/uis/ui`, {
                    method: 'DELETE',
                    headers: {
                        "content-type": "application/json",
                        Authorization: `${_token}`,
                    },
                    body: JSON.stringify(requestBody)
                })
                    .then(res => res.json())
                    .then((resp) => {
                        const { success, content, data, status } = resp;
                        if (status === "0x52404") {
                            Swal.fire({
                                title: "Cảnh báo!",
                                text: content,
                                icon: "warning",
                                showConfirmButton: false,
                                timer: 1500,
                            }).then(function () {
                                window.location.reload();
                            });
                            return;
                        }
                        if (success) {
                            Swal.fire({
                                title: "Thành công!",
                                text: content,
                                icon: "success",
                                showConfirmButton: false,
                                timer: 1500,
                            }).then(function () {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire({
                                title: "Thất bại!",
                                text: content,
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

    const [currentPageUi, setCurrentPageUi] = useState(1);
    const rowsPerPageUi = 11;

    const indexOfLastUi = currentPageUi * rowsPerPageUi;
    const indexOfFirstUi = indexOfLastUi - rowsPerPageUi;
    const currentUi = uis.slice(indexOfFirstUi, indexOfLastUi);

    const paginateUi = (pageNumber) => setCurrentPageUi(pageNumber);
    const totalPagesUi = Math.ceil(uis.length / rowsPerPageUi);

    const apisManager = (project) => {
        window.location.href = `/projects/${version_id}/uis/create`;
        // window.location.href = `tables`;
    };
    const updateApi = (apiData) => {
        console.log(apiData)
        window.location.href = `/projects/${version_id}/apis/update/${apiData.api_id}`;
        // window.location.href = `tables`;
    };
    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h4>Quản lý giao diện</h4>
                        </div>
                    </div>
                </div>
                {/* List table */}
                <div class="row">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head d-flex">
                                <div class="heading1 margin_0 ">
                                    <h5> <a onClick={() => navigate(-1)}><i class="fa fa-chevron-circle-left mr-3"></i></a>Quản lý giao diện</h5>
                                </div>
                                <div class="ml-auto">
                                    <i class="fa fa-newspaper-o icon-ui"></i>
                                </div>
                            </div>
                            <div class="table_section padding_infor_info">
                                <div class="row column1">
                                    <div class="form-group col-lg-4">
                                        {/* <label class="font-weight-bold">Tên bảng <span className='red_star'>*</span></label>
                                                <input type="text" class="form-control" 
                                                 placeholder="" /> */}
                                    </div>
                                    <div class="col-md-12 col-lg-12">
                                        <div class="d-flex align-items-center mb-1">
                                            {/* <p class="font-weight-bold">Danh sách bảng </p> */}
                                            {/* <button type="button" class="btn btn-primary custom-buttonadd ml-auto" data-toggle="modal" data-target="#addTable">
                                                <i class="fa fa-plus"></i>
                                            </button> */}
                                            <button type="button" class="btn btn-primary custom-buttonadd ml-auto" onClick={() => apisManager()}>
                                                <i class="fa fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="table-responsive">
                                            {
                                                currentUi && currentUi.length > 0 ? (
                                                    <table class="table table-striped">
                                                        <thead>
                                                            <tr>
                                                                <th class="font-weight-bold">STT</th>
                                                                <th class="font-weight-bold">Tên UI</th>
                                                                <th class="font-weight-bold">Người tạo</th>
                                                                <th class="font-weight-bold">Thời gian tạo</th>
                                                                <th class="font-weight-bold">Trạng thái</th>
                                                                <th class="font-weight-bold align-center" scope="col" >{lang["log.action"]}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentUi.map((ui, index) => (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{ui.title}</td>
                                                                    


                                                                    <td>{ui.create_by.fullname}</td>
                                                                    <td>{ui.create_at}</td>
                                                                    <td class="font-weight-bold align-center">
                                                                        <select className="form-control" onChange={() => handleUpdateStatus(ui)}>
                                                                            <option value={true} selected={ui.status} style={{ color: 'green' }}>On</option>
                                                                            <option value={false} selected={!ui.status} style={{ color: 'red' }}>Off</option>
                                                                        </select>
                                                                    </td>
                                                                    <td class="align-center" style={{ minWidth: "130px" }}>
                                                                        
                                                                        {/* <i class="fa fa-edit size pointer icon-margin icon-edit" onClick={() => updateApi(ui)} title={lang["edit"]}></i> */}
                                                                        <i class="fa fa-trash-o size pointer icon-margin icon-delete" onClick={() => handleDeleteApi(ui)} title={lang["delete"]}></i>
                                                                    </td>
                                                                    
                                                                 
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div class="list_cont ">
                                                        <p>Chưa có trang</p>
                                                    </div>
                                                )
                                            }

                                            <div className="d-flex justify-content-between align-items-center">
                                                <p>{lang["show"]} {indexOfFirstUi + 1}-{Math.min(indexOfLastUi, uis.length)} {lang["of"]} {uis.length} {lang["results"]}</p>
                                                <nav aria-label="Page navigation example">
                                                    <ul className="pagination mb-0">
                                                        <li className={`page-item ${currentPageUi === 1 ? 'disabled' : ''}`}>
                                                            <button className="page-link" onClick={() => paginateUi(currentPageUi - 1)}>
                                                                &laquo;
                                                            </button>
                                                        </li>
                                                        {Array(totalPagesUi).fill().map((_, index) => (
                                                            <li key={index} className={`page-item ${currentPageUi === index + 1 ? 'active' : ''}`}>
                                                                <button className="page-link" onClick={() => paginateUi(index + 1)}>
                                                                    {index + 1}
                                                                </button>
                                                            </li>
                                                        ))}
                                                        <li className={`page-item ${currentPageUi === totalPagesUi ? 'disabled' : ''}`}>
                                                            <button className="page-link" onClick={() => paginateUi(currentPageUi + 1)}>
                                                                &raquo;
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
                </div>
            </div >
        </div >
    )
}

