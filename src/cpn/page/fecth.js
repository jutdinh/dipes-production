
import { useParams } from "react-router-dom";
import Header from "../common/header"
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StatusEnum, StatusTask } from '../enum/status';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { version } from "react-dom";

export default () => {
    const { lang, proxy, auth, pages, functions } = useSelector(state => state);

    const { openTab, renderDateTimeByFormat } = functions
    const _token = localStorage.getItem("_token");
    const { project_id, version_id, url } = useParams();
    let navigate = useNavigate();
    const [dataTables, setDataTables] = useState([]);
    const [dataFields, setDataFields] = useState([]);
    const [apiData, setApiData] = useState([])
    const [apiDataName, setApiDataName] = useState([])
    const [dataStatis, setDataStatis] = useState({})

    const [page, setPage] = useState([]);

    useEffect(() => {
        if( pages && pages.length > 0){
            const result = pages.find(page => page.url === `/${url}`);
            console.log( result )
            if (result) {
                setPage(result);
            } else {
                // openTab('/page/not/found')
            }
        }
    }, [pages, url]);
    // console.log(page)
    useEffect(() => {
        if (page && page.components) {
            const id_str = page.components?.[0]?.api_post.split('/')[2];
            // console.log(id_str)
            fetch(`${proxy()}/apis/api/${id_str}/input_info`)
                .then(res => res.json())
                .then(res => {
                    const { data, success, content } = res;
                    if (success) {
                        console.log("succcess", data)
                        setDataTables(data.tables)
                        setDataFields(data.body)
                    }
                    // setApi(api);
                    callApi()
                })
        }
    }, [page])
    // console.log(dataFields)




    const callApi = (api) => {
        /* this must be fixed */
        fetch(`${proxy()}${page.components?.[0]?.api_get}`).then(res => res.json()).then(res => {
            const { success, content, data, fields, statistic } = res;
            console.log(res)
            // console.log(fields)
            //  al.failure("Lỗi", "Đọc dữ liệu thất bại ")
            const statisticValues = res.statistic.values;

            setApiData(data)
            setApiDataName(fields)
            setDataStatis(statisticValues)
        })
    }
    console.log(dataStatis)

    const redirectToInput = () => {
        // console.log(page)
        const id_str = page.components?.[0]?.api_post.split('/')[2];
        window.location.href = `apis/api/${id_str}/input_info`;
    }

    const deleteData = (data) => {
        let rawParams = page.apis.delete;
        // const keys = Object.keys(data);
        // keys.map(key => {
        //     const value = data[key];
        //     rawParams = rawParams.replaceAll(key, value);
        // })

        fetch(`${proxy()}${rawParams}`, {
            method: "DELETE",
            headers: {
                "content-type": "application/json"
            }
        }).then(res => res.json()).then(res => {
            const { success, content } = res;
            if (success) {
                // al.success("Thành công", "Xóa dữ liệu thành công")
                setTimeout(() => {
                    window.location.reload();
                }, 1600);
            } else {
                // al.failure("Thất bại", "Xóa thất bại")
            }
        })
    }
    const handleDelete = (data) => {
        // console.log(data)


        let api_delete = page.components[0].api_delete;

        let primaryKeys = dataTables && dataTables[0] && dataTables[0].primary_key ? dataTables[0].primary_key : null;
        let newParams = api_delete;
        if (primaryKeys) {
            let foundObjects = dataFields.filter((obj) => primaryKeys.includes(obj.id));

            if (foundObjects.length > 0) {
                // Lấy ra mảng các id từ foundObjects
                let fomular_alias = foundObjects.map(obj => obj.fomular_alias);
                // console.log(fomular_alias)

                const newData = [];
                if (data.hasOwnProperty(fomular_alias)) {
                    newData.push(data[fomular_alias]);
                }

                // console.log(newData);
                // Tạo chuỗi newParams bằng cách nối api_delete và ids
                newParams = `${api_delete}/${newData.join("/")}`;


            } else {
                console.log('Không tìm thấy đối tượng nào có id trong primaryKeys');
            }
        } else {
            console.log('Không tìm thấy primaryKeys');
        }

        // console.log(newParams);

        Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc chắn muốn xóa trường này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            confirmButtonColor: 'rgb(209, 72, 81)',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${proxy()}${newParams}`, {
                    method: 'DELETE',
                    headers: {
                        "content-type": "application/json",
                        Authorization: `${_token}`,
                    }
                })
                    .then(res => res.json())
                    .then((resp) => {
                        const { success, content, data, status } = resp;
                        console.log(resp)
                        if (success) {
                            Swal.fire({
                                title: "Thành công!",
                                text: "Xoá thành công",
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
    const redirectToInputPUT = async (record) => {

        const { components } = page;
        const cpn = components[0]
        const { api_put } = cpn;
        if (api_put != undefined) {
            const id_str = api_put.split('/')[2]

            const response = await new Promise((resolve, reject) => {
                fetch(`${proxy()}/apis/api/${id_str}/input_info`)
                    .then(res => res.json())
                    .then(res => {
                        const { data, success, content } = res;
                        if (success) {
                            // console.log("succcess", data)
                            setDataTables(data.tables)
                            setDataFields(data.body)
                        }
                        resolve(res)
                    })
            })
            const { success, data } = response;
            if (success) {
                const { params } = data;
                const stringifiedParams = params.map(param => {
                    const { fomular_alias } = param
                    return record[fomular_alias]
                }).join('/')
                openTab(`/put/api/${id_str}/${stringifiedParams}`)
            }
        } else {
            Swal.fire({
                title: "Thất bại!",
                text: "Không tìm thấy tính năng cập nhật",
                icon: "error",
                showConfirmButton: false,
                timer: 2000,
            })
        }
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

    const renderBoolData = (data, field) => {
        const IF_TRUE = field.DEFAULT_TRUE;
        const IF_FALSE = field.DEFAULT_FALSE
        if (data != undefined) {
            if (data) {
                return IF_TRUE ? IF_TRUE : "true"
            }
            return IF_FALSE ? IF_FALSE : "false"
        } else {
            return IF_FALSE ? IF_FALSE : "false"
        }
    }
    const renderData = (field, data) => {
        console.log(field)
        switch (field.DATATYPE) {
            case "DATE":
            case "DATETIME":
                return renderDateTimeByFormat(data[field.fomular_alias], field.FORMAT);
            case "DECIMAL":
            case "DECIMAL UNSIGNED":
                const { DECIMAL_PLACE } = field;
                const decimalNumber = parseFloat(data[field.fomular_alias]);
                return decimalNumber.toFixed(DECIMAL_PLACE)
            case "BOOL":
                return renderBoolData(data[field.fomular_alias], field)
            default:
                return data[field.fomular_alias];
        }
    };
    const downloadAPI = () => {
        console.log(apiData);
      
        // const header = ["API ID", "Tên API", "Phương thức API", "Ngày tạo"];
      
        // const reportData = apis.map(item => {
        //   return [
        //     item.api_id,
        //     item.api_name,
        //     item.api_method,
        //     item.create_at,
        //   ];
        // });
      
        // const now = new Date();
        // const date = now.toLocaleDateString("vi-VN", {
        //   day: "numeric",
        //   month: "numeric",
        //   year: "numeric"
        // });
      
        // const title = ["THÔNG TIN MÔ TẢ API"];
        // const projectMasterInfo = [`Nhân viên xuất: ${auth.fullname}`];
        // const datex = [`Ngày xuất: ${date}`];
        // const formattedData = [
        //   title,
        //   projectMasterInfo,
        //   datex,
        //   header,
        //   ...reportData
        // ];
      
        // const ws = XLSX.utils.aoa_to_sheet(formattedData);
      
        // const mergeTitle = { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } };
        // const mergeInfo = { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }; // gộp hàng từ A2 đến D2
        // const mareDate = { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } };
        //  // gộp hàng từ A1 đến D1
        //  ws["!merges"] = [mergeTitle, mergeInfo, mareDate];
      
        // const titleStyle = {
        //   font: { bold: true, color: { rgb: "FFFFFF" } },
        //   fill: { fgColor: { rgb: "008000" } },
        //   alignment: { horizontal: "center", vertical: "center" },
        // };
        // const infoStyle = {
        //   alignment: { horizontal: "center", vertical: "center" },
        // };
        // const headerStyle = {
        //   font: { bold: true, color: { rgb: "FFFFFF" } },
        //   fill: { fgColor: { rgb: "008000" } },
        //   alignment: { horizontal: "center", vertical: "center" },
        // };
      
        // // Thêm định dạng cho tiêu đề
        // ws["A1"].s = titleStyle;
      
        // // Thêm định dạng cho thông tin
        // // ws["A2"].s = infoStyle;
        // // ws["A3"].s = infoStyle;
      
        // // Thêm định dạng cho header
        // ws["A4"].s = headerStyle;
        // ws["B4"].s = headerStyle;
        // ws["C4"].s = headerStyle;
        // ws["D4"].s = headerStyle;
      
        // ws["!cols"] = [{ width: 45}, { width: 60 }, { width: 20 }, { width: 35 }, { width: 20 }, { width: 40 }];
        // ws["!rows"] = [{ height: 40 }, { height: 30 }, { height: 30 }, { height: 40 }];
        // // Tạo một Workbook mới và thêm Worksheet vào Workbook
        // const wb = XLSX.utils.book_new();
        // XLSX.utils.book_append_sheet(wb, ws, "APIs");
      
        // // Ghi Workbook ra file Excel
        // XLSX.writeFile(wb, "APIs.xlsx");
      };
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
                                  <div class="ml-auto" onClick={downloadAPI}>
                                    <i class="fa fa-download icon-ui"></i>
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
                                                                    <td key={header.fomular_alias}>{renderData(header, row)}</td>
                                                                ))}
                                                                <td class="align-center" style={{ minWidth: "80px" }}>
                                                                    <i class="fa fa-edit size pointer icon-margin icon-edit" onClick={() => redirectToInputPUT(row)} title={lang["edit"]}></i>
                                                                    <i class="fa fa-trash-o size pointer icon-margin icon-delete" onClick={() => handleDelete(row)} title={lang["delete"]}></i>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {dataStatis.map((data) => (
                                                            <tr>
                                                                <td class="font-weight-bold" colspan={`${apiDataName.length + 1}`} style={{ textAlign: 'right' }}>{data.display_name}: {data.result} </td>

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

