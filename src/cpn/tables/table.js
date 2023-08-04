
import { useParams } from "react-router-dom";
import Header from "../common/header"
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StatusEnum, StatusTask } from '../enum/status';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { Tables } from ".";
import Diagram from './diagram/digram.js';

const TABLES = "tables";
const DIAGRAM = "diagram"

export default () => {
    const { lang, proxy, auth } = useSelector(state => state);
    const _token = localStorage.getItem("_token");
    const { project_id, version_id } = useParams();
    const [showModal, setShowModal] = useState(false);

    const dispatch = useDispatch();

    let navigate = useNavigate();
    const handleCloseModal = () => {
        setShowModal(false);
    };
    const [table, setTable] = useState({});
    const [tables, setTables] = useState({});



    useEffect(() => {



        fetch(`${proxy()}/apis/all/tables/and/fields`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;
                console.log(resp)
                if (success) {

                    if (data) {
                        setTables(data);
                        const { tables, fields } = data;
                        dispatch({
                            branch: "db",
                            type: "initializeData",
                            payload: { tables, fields }
                        })
                       
                    }
                } else {
                    Swal.fire({
                        title: lang["faild"],
                        text: lang["fail.active"],
                        icon: "error",
                        showConfirmButton: true,
                       
                    }).then(function () {
                        // window.location.reload();
                    });
                }
            })
    }, [])

    const [tableUpdate, setUpdateTable] = useState([]);
    const getIdTable = (tableid) => {
        setUpdateTable(tableid);

    }
    useEffect(() => {
        // console.log(tableUpdate);

    }, [tableUpdate]);

    const updateTable = (e) => {
        e.preventDefault();
        const requestBody = {
            table_id: tableUpdate.id,
            table_name: tableUpdate.table_name,

        };
        console.log(requestBody)
        fetch(`${proxy}/db/tables/table`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(requestBody),
        })
            .then((res) => res.json())
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
                        setShowModal(false);
                    });
                } else {
                    Swal.fire({
                        title: "Thất bại!",
                        text: content,
                        icon: "error",
                        showConfirmButton: false,
                        timer: 2000,
                    });
                }
            })


    };
    const handleDeleteTable = (tableid) => {
        const requestBody = {
            table_id: parseInt(tableid.id)
        };
        Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc chắn muốn xóa bảng này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            confirmButtonColor: 'rgb(209, 72, 81)',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${proxy}/db/tables/table`, {
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
    const [currentPageTable, setCurrentPageTable] = useState(1);
    const rowsPerPageTable = 7;

    const indexOfLastTable = currentPageTable * rowsPerPageTable;
    const indexOfFirstTable = indexOfLastTable - rowsPerPageTable;
    const currentTable = tables.tables?.slice(indexOfFirstTable, indexOfLastTable);

    const paginateTable = (pageNumber) => setCurrentPageTable(pageNumber);
    const totalPagesTable = Math.ceil(tables.tables?.length / rowsPerPageTable);
    const openPageAddTable = (project) => {
        window.location.href = `/projects/${version_id}/tables/field`;
    };

    const openPageUpdateTable = (tableid) => {
        window.location.href = `/projects/${version_id}/table/${tableid.id}`;
    };

    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            {/* <h4><a onClick={() => navigate(-1)}><i class="fa fa-chevron-circle-left mr-4"></i></a>Quản lý bảng</h4> */}
                            <h4>{lang["diagram"]}</h4>
                        </div>
                    </div>
                </div>

                {/* List table */}
                <div class="row">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                           
                            <div class={`table_section padding_infor_info`}>
                              

                                <div class={`row column1`}>
                                    <Diagram />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            </div >
        </div >
    )
}

