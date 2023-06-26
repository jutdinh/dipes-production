
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
    const [apis, setApis] = useState([]);
    useEffect(() => {
        fetch(`${proxy}/apis/v/${version_id}`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;

                if (success) {
                    if (data) {
                        setApis(data.apis);

                    }
                } else {
                    // window.location = "/404-not-found"
                }
            })
    }, [])
    console.log(apis)

    const handleGetApi = (apiid) => {
        console.log("api", apiid)
    }


    const handleUpdateStatus = (apiid) => {
        console.log("api", apiid)
        const newStatus = !apiid.status;
        const requestBody = {
            version_id: version_id,
            api: { ...apiid, status: newStatus }
        };

        console.log(requestBody)
        fetch(`${proxy}/apis/api`, {
            method: 'PUT',
            headers: {
                "content-type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(requestBody)
        })
            .then(res => res.json())
            .then((resp) => {
                const { success, content, data, status } = resp;
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
    const handleDeleteApi = (apiid) => {
        console.log(apiid)
        const requestBody = {
            version_id: version_id,
            api_id: apiid.api_id
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
                fetch(`${proxy}/apis/api`, {
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

    const [currentPageApi, setCurrentPageApi] = useState(1);
    const rowsPerPageApi = 11;

    const indexOfLastApi = currentPageApi * rowsPerPageApi;
    const indexOfFirstApi = indexOfLastApi - rowsPerPageApi;
    const currentApi = apis.slice(indexOfFirstApi, indexOfLastApi);

    const paginateApi = (pageNumber) => setCurrentPageApi(pageNumber);
    const totalPagesApi = Math.ceil(apis.length / rowsPerPageApi);

    const apisManager = (project) => {
        window.location.href = `/projects/${version_id}/apis/create`;
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
                            <h4>Quản lý API</h4>
                        </div>
                    </div>
                </div>
                {/* List table */}
                <div class="row">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head">
                                <div class="heading1 margin_0 ">
                                    <h5><a onClick={() => navigate(-1)}><i class="fa fa-chevron-circle-left mr-3"></i></a>Quản lý API</h5>
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
                                                currentApi && currentApi.length > 0 ? (
                                                    <table class="table table-striped">
                                                        <thead>
                                                            <tr>
                                                                <th class="font-weight-bold">STT</th>
                                                                <th class="font-weight-bold">Tên API</th>
                                                                <th class="font-weight-bold">Phương thức </th>
                                                                <th class="font-weight-bold">Phạm vi</th>
                                                                <th class="font-weight-bold">Người tạo</th>
                                                                <th class="font-weight-bold">Thời gian tạo</th>
                                                                <th class="font-weight-bold align-center">Trạng thái</th>
                                                                <th class="font-weight-bold align-center" scope="col" >{lang["log.action"]}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentApi.map((api, index) => (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{api.api_name}</td>
                                                                    <td style={{ textTransform: 'uppercase' }}>{api.api_method}</td>

                                                                    <td>{api.api_scope}</td>


                                                                    <td>{api.create_by.fullname}</td>
                                                                    <td>{api.create_at}</td>
                                                                    <td class="font-weight-bold align-center">
                                                                        <select className="form-control" onChange={() => handleUpdateStatus(api)}>
                                                                            <option value={true} selected={api.status} style={{ color: 'green' }}>On</option>
                                                                            <option value={false} selected={!api.status} style={{ color: 'red' }}>Off</option>
                                                                        </select>
                                                                    </td>

                                                                    <td class="align-center" style={{ minWidth: "130px" }}>
                                                                        {/* {api.status ?
                                                                            <i class="fa fa-times-circle-o size pointer icon-margin icon-check" onClick={() => handleUpdateStatus(api)} title={lang["updatestatus"]}></i>
                                                                            : <i class="fa fa-check-circle-o size pointer icon-margin icon-close" onClick={() => handleUpdateStatus(api)} title={lang["updatestatus"]}></i>
                                                                        } */}
                                                                        <i class="fa fa-edit size pointer icon-margin icon-edit" onClick={() => updateApi(api)} title={lang["edit"]}></i>
                                                                        <i class="fa fa-trash-o size pointer icon-margin icon-delete" onClick={() => handleDeleteApi(api)} title={lang["delete"]}></i>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div class="list_cont ">
                                                        <p>Chưa có api</p>
                                                    </div>
                                                )
                                            }

                                            <div className="d-flex justify-content-between align-items-center">
                                                <p>{lang["show"]} {indexOfFirstApi + 1}-{Math.min(indexOfLastApi, apis.length)} {lang["of"]} {apis.length} {lang["results"]}</p>
                                                <nav aria-label="Page navigation example">
                                                    <ul className="pagination mb-0">
                                                        <li className={`page-item ${currentPageApi === 1 ? 'disabled' : ''}`}>
                                                            <button className="page-link" onClick={() => paginateApi(currentPageApi - 1)}>
                                                                &laquo;
                                                            </button>
                                                        </li>
                                                        {Array(totalPagesApi).fill().map((_, index) => (
                                                            <li key={index} className={`page-item ${currentPageApi === index + 1 ? 'active' : ''}`}>
                                                                <button className="page-link" onClick={() => paginateApi(index + 1)}>
                                                                    {index + 1}
                                                                </button>
                                                            </li>
                                                        ))}
                                                        <li className={`page-item ${currentPageApi === totalPagesApi ? 'disabled' : ''}`}>
                                                            <button className="page-link" onClick={() => paginateApi(currentPageApi + 1)}>
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

