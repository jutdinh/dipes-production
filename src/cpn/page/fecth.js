
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
                    if (!success) {
                        console.log("succcess", data)
                        // al.failure("Lỗi", "Không tìm thấy dữ liệu")

                    }
                    // setApi(api);

                    // callApi(api)
                })
        }
    }, [page])


    const callApi = (api) => {
        /* this must be fixed */

        fetch(`${proxy()}${page.apis.get}`).then(res => res.json()).then(res => {
            const { success, content, data } = res;

            //  al.failure("Lỗi", "Đọc dữ liệu thất bại ")

            setApiData(data)

        })
    }

    const redirectToInput = () => {
        // console.log(page)
        const id_str = page.components?.[0]?.api_post.split('/')[2];
        window.location.href = `apis/api/${id_str}/input_info`;

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
                                    <h5> <a onClick={() => navigate(-1)}><i class="fa fa-chevron-circle-left mr-3"></i></a>{page?.components?.[0]?.component_name}</h5>
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
                                            <button type="button" class="btn btn-primary custom-buttonadd ml-auto" onClick={() => redirectToInput()}>
                                                <i class="fa fa-plus"></i>
                                            </button>
                                        </div>

                                    </div>
                                    <div class="form-group col-lg-6">
                                        <label class="font-weight-bold text-small" for="firstname">{lang["fullname"]}<span className='red_star ml-1'>*</span></label>
                                        <input type="text" class="form-control" placeholder={lang["p.fullname"]} />

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

