
import { useParams } from "react-router-dom";
import Header from "../common/header"
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StatusEnum, StatusTask } from '../enum/status';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default () => {
    const { lang, proxy, auth, pages } = useSelector(state => state);
    const _token = localStorage.getItem("_token");
    const { project_id, version_id, url } = useParams();
    let navigate = useNavigate();
    const [uis, setUis] = useState([]);
    const [apiData, setApiData] = useState([])
    const [apiDataName, setApiDataName] = useState([])

    const [page, setPage] = useState([]);

    useEffect(() => {
        const result = pages?.find(page => page.url === `/${url}`);

        if (result) {
            setPage(result);
        } else {
            console.log('Không tìm thấy trang với URL: ' + url);
        }

    }, [pages, url]);
    console.log(page)
    useEffect(() => {
        if (page && page.components) {
            const id_str = page.components?.[0]?.api_get.split('/')[2];
            console.log(id_str)
            fetch(`${proxy()}/apis/api/${id_str}/input_info`)
                .then(res => res.json())
                .then(res => {
                    const { data, success, content } = res;
                    if (success) {
                        console.log("succcess", data)
                        // al.failure("Lỗi", "Không tìm thấy dữ liệu")
                    }
                    // setApi(api);
                    callApi()
                })
        }
    }, [page])

    const callApi = (api) => {
        /* this must be fixed */
        fetch(`${proxy()}${page.components?.[0]?.api_get}`).then(res => res.json()).then(res => {
            const { success, content, data, fields } = res;
            console.log(data)
            console.log(fields)
            //  al.failure("Lỗi", "Đọc dữ liệu thất bại ")

            setApiData(data)
            setApiDataName(fields)
        })
    }

    const redirectToInput = () => {
        // console.log(page)
        const id_str = page.components?.[0]?.api_post.split('/')[2];
        window.location.href = `apis/api/${id_str}/input_info`;
    }



    const redirectToInputPUT = (data) => {
        console.log(data)
        // const id_str = page.components?.[0]?.api_post.split('/')[2];
        // window.location.href = `apis/api/${id_str}/input_info`;
    }
    // const redirectToInputPut = (data) => {
    //     const id_str_put = page.apis.put.split(`/`)[4];
    //     let rawParams = page.apis.put.split(`/${id_str_put}/`)[1];
    //     // console.log(rawParams)
    //     const keys = Object.keys(data);
    //     keys.map(key => {
    //         const value = data[key];
    //         rawParams = rawParams.replaceAll(key, value);
    //     })
    //     openTab(`/su/api/put/input/${id_str_put}/${rawParams}`)
    // }



    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 15;

    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const current = apiData.slice(indexOfFirst, indexOfLast);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(apiData.length / rowsPerPage);

    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h4>Quản lý dữ liệu</h4>
                        </div>
                    </div>
                </div>
                {/* List table */}
                <div class="row">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head d-flex">
                                <div class="heading1 margin_0 ">
                                    <h5>{page?.components?.[0]?.component_name}</h5>
                                </div>
                                {/* <div class="ml-auto">
                                    <i class="fa fa-newspaper-o icon-ui"></i>
                                </div> */}
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
                                            <button type="button" class="btn btn-primary custom-buttonadd ml-auto" onClick={() => redirectToInput()}>
                                                <i class="fa fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="table-responsive">
                                        {
                                            current && current.length > 0 ? (
                                                <table class="table table-striped">
                                                    <thead>
                                                        {apiDataName.map((header, index) => (
                                                            <th class="font-weight-bold">{header.display_name}</th>
                                                        ))}
                                                        <th class=" font-weight-bold align-center">Thao tác</th>
                                                    </thead>
                                                    <tbody>
                                                        {current.map((row) => (
                                                            <tr key={row._id}>
                                                                {apiDataName.map((header) => (
                                                                    <td key={header.fomular_alias}>{row[header.fomular_alias]}</td>
                                                                ))}
                                                                <td class="align-center" style={{ minWidth: "80px" }}>
                                                                    <i class="fa fa-edit size pointer icon-margin icon-edit" onClick={() => redirectToInputPUT(row)} title={lang["edit"]}></i>
                                                                    <i class="fa fa-trash-o size pointer icon-margin icon-delete" title={lang["delete"]}></i>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div class="list_cont ">
                                                    <p>Chưa có dữ liệu</p>
                                                </div>
                                            )
                                        }

                                        <div className="d-flex justify-content-between align-items-center">
                                            <p>{lang["show"]} {indexOfFirst + 1}-{Math.min(indexOfLast, apiData.length)} {lang["of"]} {apiData.length} {lang["results"]}</p>
                                            <nav aria-label="Page navigation example">
                                                <ul className="pagination mb-0">
                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                                                            &laquo;
                                                        </button>
                                                    </li>
                                                    {Array(totalPages).fill().map((_, index) => (
                                                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                            <button className="page-link" onClick={() => paginate(index + 1)}>
                                                                {index + 1}
                                                            </button>
                                                        </li>
                                                    ))}
                                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                        <button className="page-link" onClick={() => paginate(currentPage + 1)}>
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
            </div >
        </div >
    )
}

