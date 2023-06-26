
import { useParams } from "react-router-dom";
import Header from "../common/header"
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ValidTypeEnum } from '../enum/type';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';


export default () => {
    const { lang, proxy, auth } = useSelector(state => state);
    const _token = localStorage.getItem("_token");
    const stringifiedUser = localStorage.getItem("user");
    const users = JSON.parse(stringifiedUser)
    const { tempFieldParam } = useSelector(state => state);
    const dispatch = useDispatch();
    const { project_id, version_id } = useParams();
    const [showModal, setShowModal] = useState(false);
    let navigate = useNavigate();
    const [apiMethod, setApiMethod] = useState(1); // Default is GET

    const defaultValues = {
        title: "",
        status: true,
        layout_id: 0,
        parmas: [],
        tables: [],
        statistic_fields: [],

    };

    const [modalTemp, setModalTemp] = useState(defaultValues);/////tạo api

    const [errorUi, setErrorUi] = useState({});
    const validateUiname = () => {
        let temp = {};
        temp.title = modalTemp.title ? "" : "Trường này không được để trống.";
        temp.tables = tables && tables.length > 0 ? "" : "Bảng không được để trống.";
        setErrorUi({
            ...temp
        });
        return Object.values(temp).every(x => x === "");
    }

    // const handleSubmitModal = () => {
    //     if (validateApiname()) {
    //         setModalTemp(prevModalTemp => ({ ...prevModalTemp, api_method: apiMethod }));

    //         dispatch({
    //             branch: "api",
    //             type: "addFieldParam",
    //             payload: {
    //                 field: { ...modalTemp }

    //             }
    //         })
    //     }
    // }
    // useEffect(() => {
    //     if (tempFieldParam && Object.keys(tempFieldParam).length > 0) {
    //         addUI();
    //     }
    // }, [tempFieldParam]);
    const addUI = () => {
        if (validateUiname()) {
            const requestBody = {
                version_id: parseInt(version_id),
                ui: {
                    title: modalTemp.title,
                    status: modalTemp.status,
                },
                widget: {
                    table_id: modalTemp.tables,
                    layout_id: modalTemp.layout_id,
                    statistic: modalTemp.statistic_fields
                },


            }
            console.log(requestBody)
            fetch(`${proxy}/uis/ui`, {
                method: "POST",
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
        }

    };




    const [errorTable, setErrorTable] = useState({});
    const validateTable = () => {
        let temp = {};
        temp.selectedTables = selectedTables ? "" : "Trường này không được để trống.";

        setErrorTable({
            ...temp
        });
        return Object.values(temp).every(x => x === "");
    }
    const [getAllField, setAllField] = useState([]);
    const handleSubmitTables = () => {
        if (validateTable()) {
            setModalTemp(prevModalTemp => ({
                ...prevModalTemp,
                tables: selectedTables,
            }));

            if (selectedTables) {
                fetch(`${proxy}/db/tables/table/${selectedTables}`, {
                    headers: {
                        Authorization: _token
                    }
                })
                    .then(res => res.json())
                    .then(resp => {
                        const { success, data, status, content } = resp;

                        if (success) {
                            if (data) {
                                setAllField(data)
                            }
                        } else {
                            // window.location = "/404-not-found"
                        }
                    })
            }
        }

    };

    console.log(getAllField)

    const [allTable, setAllTable] = useState([]);

    useEffect(() => {
        fetch(`${proxy}/db/tables/v/${version_id}`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;

                if (success) {
                    if (data) {
                        setAllTable(data.tables);

                    }
                } else {
                    // window.location = "/404-not-found"
                }
            })
    }, [])

    const [selectedTables, setSelectedTables] = useState(null);



    //  hiển thị các tường của bảngđược chọn
    const [tables, setTables] = useState([]);

    useEffect(() => {
        const fetchTable = (tableId) => {
            return fetch(`${proxy}/db/tables/table/${tableId}`, {
                headers: {
                    Authorization: _token
                }
            }).then(res => res.json());
        };

        if (modalTemp.tables) {
            fetchTable(modalTemp.tables)
                .then(response => {
                    const tableName = response.success ? response.data : 'unknown';
                    setTables([tableName]);
                });
        }

    }, [modalTemp.tables]);




    const [tableFields, setTableFields] = useState([]);

    useEffect(() => {
        const fetchFields = async (tableId) => {
            const res = await fetch(`${proxy}/db/tables/table/${tableId}`, {
                headers: {
                    Authorization: _token
                }
            });
            const resp = await res.json();

            if (resp.success) {
                return resp.data; // Trả về toàn bộ đối tượng data
            } else {
                console.error('Error fetching fields:', resp.content);
                return null; // Trả về null nếu có lỗi
            }
        }



    }, [modalTemp.tables]);



    //console.log(selectedFields)
    //delete selected table 
    const [display_name, setDisplayname] = useState("");
    const [fomular, setFomular] = useState("");
    const [calculates, setCalculates] = useState([]);
    const [aliasCalculates, setaliasCalculates] = useState([]);
    const generateUniqueFormularAlias = async (display_name) => {

        const requestBody = { field_name: display_name };
        const response = await fetch(`${proxy}/apis/make/alias`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(requestBody),
        });

        const resp = await response.json();
        if (resp.success) {
            setaliasCalculates(resp.alias);
            return resp.alias;
        } else {
            // Handle error here
            return null;
        }
    };



    const [errorStatistical, setErrorStatistical] = useState({});
    const validateStatistical = () => {
        let temp = {};

        temp.display_name = display_name ? "" : "Trường này không được để trống.";
        temp.fomular = fomular ? "" : "Trường này không được để trống.";
        temp.field = field ? "" : "Trường này không được bỏ trống.";

        setErrorStatistical({
            ...temp
        });

        return Object.values(temp).every(x => x === "");
    }

    const [field, setField] = useState("");

    const [statistical, setStatistical] = useState([]);

    const handleSubmitFieldStatistical = async (event) => {

        event.preventDefault();
        if (validateStatistical()) {
            const fomular_alias = await generateUniqueFormularAlias(display_name);

            const newStatistical = { fomular_alias, display_name, field, fomular };




            // Cập nhật modalTemp
            setModalTemp(prev => ({
                ...prev,
                statistic_fields: [...prev.statistic_fields, newStatistical]
            }));
            setStatistical([...statistical, newStatistical])
            setDisplayname("");
            setField("");
            setFomular("");
        }

    };
    console.log(modalTemp)
    ///Cập nhât trường  thống kê
    const [statisticalUpdate, setStatisticalUpdate] = useState({
        display_name: "",
        field: "",
        fomular: "",
        fomular_alias: ""
    });
    const updateFieldStatistical = (sta) => {
        console.log(sta)
        setStatisticalUpdate(sta)


    }


    const submitupdateFieldStatistical = () => {
        const updatedStatistical = modalTemp.statistic_fields.map(item =>
            item.fomular_alias === statisticalUpdate.fomular_alias ? statisticalUpdate : item
        );


        setModalTemp(prev => ({
            ...prev,
            statistic_fields: updatedStatistical
        }));

    };

    const handleDeleteStatistical = (sta) => {
        console.log(sta)

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
                const newCalculates = modalTemp.statistic_fields.filter(item => item.fomular_alias !== sta.fomular_alias);
                setModalTemp(prev => ({
                    ...prev,
                    statistic_fields: newCalculates
                }));


                Swal.fire({
                    title: 'Thành công!',
                    text: 'Trường đã được xóa thành công.',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                })
            }
        });

    }

    const fieldShow = (project) => {
        window.location.href = `/projects/${version_id}/apis/create/fieldshow`;
        // window.location.href = `tables`;
    };
    const fieldStatistical = (project) => {
        window.location.href = `/projects/${version_id}/apis/create/fieldstatis`;
        // window.location.href = `tables`;
    };

    const findTableAndFieldInfo = (fieldId) => {
        for (const [tableId, tableInfo] of Object.entries(tableFields)) {
            const fieldInfo = tableInfo.fields.find((field) => field.id === fieldId);

            if (fieldInfo) {
                return { tableId, fieldInfo };
            }
        }

        return { tableId: null, fieldInfo: null };
    };

    console.log(modalTemp)
    // console.log(tempFieldParam)
    const vietnameseChars = [
        {
            base: {
                base: "a",
                unicode: [ "ă", "â" ],
                unicodeWithSound: ["á", "à", "ả", "ã", "ạ", "ắ", "ằ", "ẳ", "ẵ", "ặ", "ấ", "ầ", "ẩ", "ẫ", "ậ"],
            }    
        },
        {
            base: {
                base: "d",
                unicode: ["đ"],
                unicodeWithSound: []
            }
        },
        {
            base: {
                base: "e",
                unicode: [ "ê" ],
                unicodeWithSound: ["é", "è", "ẻ", "ẽ", "ẹ", "ế", "ề", "ể", "ễ", "ệ"]
            }
        },
        {
            base: {
                base: "i",
                unicode: [],
                unicodeWithSound: [ "í", "ì", "ỉ", "ĩ", "ị" ]
            }
        },
        {
            base: {
                base: "o",
                unicode: [ "ô", "ơ" ],
                unicodeWithSound: [ "ó", "ò", "ỏ", "õ", "ọ", "ố", "ồ", "ổ", "ỗ", "ộ", "ớ", "ờ", "ở", "ỡ", "ợ" ]
            }
        },
        {
            base: {
                base: "u",
                unicode: [ "ư" ],
                unicodeWithSound: [ "ú", "ù", "ủ", "ũ", "ụ", "ứ", "ử", "ử", "ữ", "ự" ]
            }
        },
        {
            base: {
                base: "y",
                unicode: [],
                unicodeWithSound: [ "ý", "ỳ", "ỷ", "ỹ", "ỵ" ]
            }
        }
    ];
    function removeVietnameseTones(str) {
        vietnameseChars.forEach(char => {
            const { base, unicode, unicodeWithSound } = char.base;
            const allVariants = [...unicode, ...unicodeWithSound];
            allVariants.forEach(variant => {
                const regex = new RegExp(variant, 'g');
                str = str.replace(regex, base);
            });
        });
        return str;
    }
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
                            <div class="full graph_head">
                                <div class="heading1 margin_0 ">
                                    <h5><a onClick={() => navigate(-1)}><i class="fa fa-chevron-circle-left mr-3"></i></a>Tạo mới giao diện</h5>

                                </div>
                            </div>
                            <div class="table_section padding_infor_info">
                                <div class="row column1">
                                    <div class="form-group col-lg-6">
                                        <label class="font-weight-bold">Tiêu đề <span className='red_star'>*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={modalTemp.title}
                                            onChange={(e) => setModalTemp({ ...modalTemp, title: e.target.value })}
                                            placeholder=""
                                        />
                                        {errorUi.title && <p className="text-danger">{errorUi.title}</p>}
                                    </div>
                                    <div class="form-group col-lg-6">
                                    <label class="font-weight-bold">URL</label>
                                    <input
                                            type="text"
                                            className="form-control"
                                            value={"/"+ removeVietnameseTones(modalTemp.title).replace(/\s/g, '-')} readOnly
                                        />
                                    </div>
                                    <div class="form-group col-lg-6">
                                        <label class="font-weight-bold">Layout <span className='red_star'>*</span></label>
                                        <select
                                            className="form-control mb-3"
                                            value={modalTemp.layout_id}
                                            onChange={(e) => setModalTemp({ ...modalTemp, layout_id: e.target.value })}
                                        >
                                            <option value={0}>Layout 1</option>
                                            <option value={1}>Layout 2</option>
                                        </select>
                                    </div>
                                    {/* Chọn các bảng */}
                                    <div class="col-md-12 col-lg-12 bordered mb-3">
                                        <div class="d-flex align-items-center mb-1">
                                            <p class="font-weight-bold">Bảng đã chọn <span className='red_star'> *</span> </p>
                                            {errorUi.tables && <p className="text-danger">{(errorUi.tables)}</p>}
                                            <button type="button" class="btn btn-primary custom-buttonadd ml-auto" data-toggle="modal" data-target="#addTables">
                                                <i class="fa fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="table-responsive">
                                            {
                                                tables && tables.length > 0 ? (
                                                    <>
                                                        <table class="table table-striped">
                                                            <thead>
                                                                <tr>

                                                                    <th class="font-weight-bold" scope="col">Tên bảng</th>
                                                                    <th class="font-weight-bold" scope="col">Người tạo</th>
                                                                    <th class="font-weight-bold" scope="col">Thời gian</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {tables.map((table, index) => (
                                                                    <tr key={index}>
                                                                        <td>{table.table_name}</td>
                                                                        <td>{table.create_by.fullname}</td>
                                                                        <td>{table.create_at}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </>
                                                ) : (
                                                    <div class="list_cont ">
                                                        <p>Chưa có dữ liệu bảng</p>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>
                                    {
                                        tables && tables.length > 0 ? (
                                            <>
                                                {/* Chọn trường thống kê */}
                                                <div class="col-md-12 col-lg-12 bordered">
                                                    <div class="d-flex align-items-center mb-1">
                                                        <p class="font-weight-bold">Danh sách các trường thống kê</p>
                                                        <button type="button" class="btn btn-primary custom-buttonadd ml-auto" data-toggle="modal" data-target="#addFieldStatistical">
                                                            <i class="fa fa-plus"></i>
                                                        </button>
                                                    </div>
                                                    <div class="table-responsive">
                                                        {modalTemp.statistic_fields && modalTemp.statistic_fields.length > 0 ? (
                                                            <table class="table table-striped">
                                                                <thead>
                                                                    <tr>
                                                                        <th class="font-weight-bold">STT</th>
                                                                        <th class="font-weight-bold">Tên trường</th>
                                                                        <th class="font-weight-bold">Tên trường thống kê</th>
                                                                        <th class="font-weight-bold">Phép tính</th>
                                                                        <th class="font-weight-bold align-center">Thao tác</th>

                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {modalTemp.statistic_fields.map((statistic, index) => (
                                                                        <tr key={index}>
                                                                            <td>{index + 1}</td>
                                                                            <td>{statistic.display_name}</td>
                                                                            <td>{statistic.field}</td>
                                                                            <td>{statistic.fomular}</td>
                                                                            <td class="align-center" style={{ minWidth: "130px" }}>
                                                                                <i class="fa fa-edit size pointer icon-margin icon-edit" onClick={() => updateFieldStatistical(statistic)} data-toggle="modal" data-target="#editFieldStatistical" title={lang["edit"]}></i>
                                                                                <i class="fa fa-trash-o size pointer icon-margin icon-delete" onClick={() => handleDeleteStatistical(statistic)} title={lang["delete"]}></i>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        ) : (
                                                            <div class="list_cont ">
                                                                <p>Chưa có dữ liệu trường tính toán</p>
                                                            </div>
                                                        )
                                                        }
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            null
                                        )
                                    }
                                    <div className="mt-2 d-flex justify-content-end ml-auto">
                                        <button type="button" onClick={addUI} class="btn btn-success mr-2">{lang["btn.create"]}</button>
                                        <button type="button" onClick={() => navigate(-1)} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}
                                        </button>
                                    </div>
                                    {/* </>
                                        ) : (
                                            null
                                        )
                                    } */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*add table */}
                <div class={`modal ${showModal ? 'show' : ''}`} id="addTables">
                    <div class="modal-dialog modal-dialog-center">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h4 class="modal-title">Chọn bảng</h4>
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div className={`form-group col-lg-12`}>
                                        <label>Tên bảng <span className='red_star'>*</span></label>
                                        <select className="form-control"
                                            value={selectedTables}
                                            onChange={(e) => setSelectedTables(parseInt(e.target.value, 10))}>
                                            <option value="">Chọn</option>
                                            {allTable.map(table => (
                                                <option key={table.id} value={table.id}>
                                                    {table.table_name}
                                                </option>
                                            ))}
                                        </select>
                                        {errorTable.selectedTables && <p className="text-danger">{errorTable.selectedTables}</p>}



                                    </div>
                                    <div class="form-group col-md-12">
                                        <label>Người tạo</label>
                                        <input class="form-control" type="text" value={users.fullname} readOnly></input>
                                    </div>
                                    <div class="form-group col-md-12">
                                        <label>Ngày tạo</label>
                                        <input class="form-control" type="text" value={new Date().toISOString().substring(0, 10)} readOnly></input>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-success" data-dismiss="modal" onClick={handleSubmitTables}> {lang["btn.create"]}</button>
                                <button type="button" data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/*add Field statistical */}
                <div class={`modal ${showModal ? 'show' : ''}`} id="addFieldStatistical">
                    <div class="modal-dialog modal-dialog-center">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h4 class="modal-title">Thêm trường thống kê </h4>
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div className={`form-group col-lg-12`}>
                                        <label>Tên trường thống kê <span className='red_star'>*</span></label>
                                        <input
                                            type="text"
                                            class="form-control"
                                            value={display_name}
                                            onChange={(e) => setDisplayname(e.target.value)}
                                            required
                                        />
                                        {errorStatistical.display_name && <p className="text-danger">{errorStatistical.display_name}</p>}
                                    </div>


                                    <div class="form-group col-md-12">
                                        <label>Danh sách trường của bảng: < p class="font-weight-bold">{getAllField.table_name}</p> </label>
                                        <div class="table-responsive">

                                            <table class="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th class="font-weight-bold">STT</th>
                                                        <th class="font-weight-bold">Tên trường</th>
                                                        <th class="font-weight-bold">Bí danh</th>
                                                        <th class="font-weight-bold">Kiểu dữ liệu</th>


                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {getAllField.fields?.map((field, index) =>
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>{field.field_name}</td>
                                                            <td>{field.fomular_alias}</td>
                                                            <td>{field.props.DATATYPE}</td>

                                                        </tr>
                                                    )}

                                                </tbody>
                                            </table>

                                        </div>
                                    </div>
                                    <div className={`form-group col-lg-12`}>
                                        <label>Chọn trường <span className='red_star'>*</span></label>
                                        <select className="form-control" value={field} onChange={(e) => setField(e.target.value)}>
                                            <option value="">Chọn trường</option>

                                            {getAllField.fields?.map((field, index) => (
                                                <option key={index} value={field.fomular_alias}>
                                                    {field.field_name}
                                                </option>
                                            ))}
                                        </select>
                                        {errorStatistical.field && <p className="text-danger">{errorStatistical.field}</p>}
                                    </div>

                                    <div className={`form-group col-lg-12`}>
                                        <label>Công thức <span className='red_star'>*</span></label>
                                        <select
                                            className="form-control"
                                            value={fomular}
                                            onChange={(e) => setFomular(e.target.value)}
                                            required
                                        >
                                            <option value="">Chọn công thức</option>
                                            <option value="SUM">SUM</option>
                                            <option value="AVERAGE">AVERAGE</option>
                                            <option value="COUNT">COUNT</option>
                                        </select>
                                        {errorStatistical.fomular && <p className="text-danger">{errorStatistical.fomular}</p>}
                                    </div>
                                    <div class="form-group col-md-12">
                                        <label>Người tạo </label>
                                        <input class="form-control" type="text" value={users.fullname} readOnly></input>
                                    </div>
                                    <div class="form-group col-md-12">
                                        <label>Ngày tạo </label>
                                        <input class="form-control" type="text" value={new Date().toISOString().substring(0, 10)} readOnly></input>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" data-dismiss="modal" onClick={handleSubmitFieldStatistical} class="btn btn-success ">{lang["btn.create"]}</button>
                                <button type="button" data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/*update Field statistical */}
                <div class={`modal ${showModal ? 'show' : ''}`} id="editFieldStatistical">
                    <div class="modal-dialog modal-dialog-center">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h4 class="modal-title">Cập nhật trường thống kê </h4>
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div className={`form-group col-lg-12`}>
                                        <label>Tên trường thống kê <span className='red_star'>*</span></label>
                                        <input
                                            type="text"
                                            class="form-control"
                                            value={statisticalUpdate.display_name}
                                            onChange={(e) => setStatisticalUpdate({ ...statisticalUpdate, display_name: e.target.value })}
                                            required
                                        />
                                        {errorStatistical.display_name && <p className="text-danger">{errorStatistical.display_name}</p>}
                                    </div>


                                    <div class="form-group col-md-12">
                                        <label>Danh sách trường của bảng: < p class="font-weight-bold">{getAllField.table_name}</p> </label>
                                        <div class="table-responsive">

                                            <table class="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th class="font-weight-bold">STT</th>
                                                        <th class="font-weight-bold">Tên trường</th>
                                                        <th class="font-weight-bold">Bí danh</th>
                                                        <th class="font-weight-bold">Kiểu dữ liệu</th>


                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {getAllField.fields?.map((field, index) =>
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>{field.field_name}</td>
                                                            <td>{field.fomular_alias}</td>
                                                            <td>{field.props.DATATYPE}</td>

                                                        </tr>
                                                    )}

                                                </tbody>
                                            </table>

                                        </div>
                                    </div>
                                    <div className={`form-group col-lg-12`}>
                                        <label>Chọn trường <span className='red_star'>*</span></label>
                                        <select className="form-control" value={statisticalUpdate.field} onChange={(e) => setStatisticalUpdate({ ...statisticalUpdate, field: e.target.value })}>
                                            <option value="">Chọn trường</option>

                                            {getAllField.fields?.map((field, index) => (
                                                <option key={index} value={field.fomular_alias}>
                                                    {field.field_name}
                                                </option>
                                            ))}
                                        </select>
                                        {errorStatistical.field && <p className="text-danger">{errorStatistical.field}</p>}
                                    </div>

                                    <div className={`form-group col-lg-12`}>
                                        <label>Công thức <span className='red_star'>*</span></label>
                                        <select
                                            className="form-control"
                                            value={statisticalUpdate.fomular}
                                            onChange={(e) => setStatisticalUpdate({ ...statisticalUpdate, fomular: e.target.value })}
                                            required
                                        >
                                            <option value="">Chọn công thức</option>
                                            <option value="SUM">SUM</option>
                                            <option value="AVERAGE">AVERAGE</option>
                                            <option value="COUNT">COUNT</option>
                                        </select>
                                        {errorStatistical.fomular && <p className="text-danger">{errorStatistical.fomular}</p>}
                                    </div>
                                    <div class="form-group col-md-12">
                                        <label>Người tạo </label>
                                        <input class="form-control" type="text" value={users.fullname} readOnly></input>
                                    </div>
                                    <div class="form-group col-md-12">
                                        <label>Ngày tạo </label>
                                        <input class="form-control" type="text" value={new Date().toISOString().substring(0, 10)} readOnly></input>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" data-dismiss="modal" onClick={submitupdateFieldStatistical} class="btn btn-success ">{lang["btn.create"]}</button>
                                <button type="button" data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div >
        </div >
    )
}

