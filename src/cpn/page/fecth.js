
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


  
    const [page, setPage] = useState([]);

    useEffect(() => {
        const result = pages?.find(page => page.url === `/${url}`);

    if (result) {
        setPage(result);
        console.log(result)
    } else {
        console.log('Không tìm thấy trang với URL: ' + url);
    }
        
    }, [pages, url]);
 
    useEffect(() => {
        if (pages ) {
            const id_str = page.components?.[0]?.api_get.split('/')[2];
            console.log(id_str)
            fetch(`${proxy()}/apis/api/${id_str}/input_info`)
                .then(res => res.json())
                .then(res => {
                    const { api, success } = res;
                    if (!success) {
                        // al.failure("Lỗi", "Không tìm thấy dữ liệu")
                        return;
                    }
                    // setApi(api);
                    console.log(api)
                    // callApi(api)
                })
        }
    }, [page])

    const apisManager = (project) => {
        window.location.href = `/projects/${version_id}/uis/create`;
        // window.location.href = `tables`;
    };
    const updateApi = (apiData) => {
        console.log(apiData)
        window.location.href = `/projects/${version_id}/apis/update/${apiData.api_id}`;
        // window.location.href = `tables`;
    };
    console.log(url)
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
                                            <button type="button" class="btn btn-primary custom-buttonadd ml-auto" onClick={() => apisManager()}>
                                                <i class="fa fa-plus"></i>
                                            </button>
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

