
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Header from "../common/header"
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ValidTypeEnum } from '../enum/type';

import Swal from 'sweetalert2';
import { Tables } from ".";
import { data } from "jquery";


const types = [
    ValidTypeEnum.INT,
    ValidTypeEnum.INT_UNSIGNED,
    ValidTypeEnum.BIGINT,
    ValidTypeEnum.BIGINT_UNSIGNED,
    ValidTypeEnum.BOOL,
    ValidTypeEnum.CHAR,
    ValidTypeEnum.DATE,
    ValidTypeEnum.DATETIME,
    ValidTypeEnum.DECIMAL,
    ValidTypeEnum.DECIMAL_UNSIGNED,
    ValidTypeEnum.EMAIL,
    ValidTypeEnum.PHONE,
    ValidTypeEnum.TEXT
]
const typenull = [
    { value: false, label: "Có" },
    { value: true, label: "Không" }

]
export default () => {

    const { lang, proxy, auth } = useSelector(state => state);
    const _token = localStorage.getItem("_token");
    const stringifiedUser = localStorage.getItem("user");
    const users = JSON.parse(stringifiedUser)

    const { project_id, version_id, table_id } = useParams();
    const [showModal, setShowModal] = useState(false);
    let navigate = useNavigate();
    const [fieldTemp, setFieldTemp] = useState({});
    // const [modalTemp, setModalTemp] = useState({ DATATYPE: types[0].value });
    const defaultValues = {
        field_name: '',
        DATATYPE: '',
        NULL: 'false',
        LENGTH: 255,
        AUTO_INCREMENT: true,
        MIN: '',
        MAX: '',
        FORMAT: '',
        DECIMAL_PLACE: '',
        DEFAULT: '',
        DEFAULT_TRUE: '',
        DEFAULT_FALSE: ''
    };

    const [modalTemp, setModalTemp] = useState(defaultValues);

    const [table, setTable] = useState({});
    const [tables, setTables] = useState([]);

    const { tempFields, tempCounter } = useSelector(state => state); // const tempFields = useSelector( state => state.tempFields );

    const dispatch = useDispatch();

    const handleCloseModal = () => {

        setModalTemp({
            field_name: '',
            DATATYPE: '',
            NULL: false,
            LENGTH: 255,
            AUTO_INCREMENT: true,
            MIN: '',
            MAX: '',
            FORMAT: '',
            DECIMAL_PLACE: '',
            DEFAULT: '',
            DEFAULT_TRUE: '',
            DEFAULT_FALSE: ''
        });
        setShowModal(false);

    };
    const handleSubmitModal = () => {

        setFieldTemp(modalTemp)
        if (isOn) {
            setPrimaryKey([...primaryKey, tempCounter])
        }

        if (isOnforenkey) {
            setForeignKeys([...foreignKeys, { ...foreignKey, index: tempCounter }])
        }

        setIsOn(false)
        setIsOnforenkey(false)

        dispatch({
            branch: "db",
            type: "addField",
            payload: {
                field: { ...modalTemp, index: tempCounter }

            }
        })
        setModalTemp((prevModalTemp) => ({
            ...prevModalTemp,
            ...defaultValues,
        }));

        console.log(tempFields)
        console.log(primaryKey)

    };

    const handleUpdatetModal = () => {
        // Kiểm tra xem trường `field_name` có rỗng không


        // setFieldTemp(modalTemp)
        if (!isOn && primaryKey.includes(fieldTempUpdate.index)) {
            const newPrimaryKey = primaryKey.filter(index => index !== fieldTempUpdate.index);
            setPrimaryKey(newPrimaryKey);
        }
        if (isOn) {
            const newPrimaryKey = new Set([...primaryKey, fieldTempUpdate.index]);
            const uniquePrimaryKey = [...newPrimaryKey];
            setPrimaryKey(uniquePrimaryKey)
        }


        if (isOnforenkey) {
            const updatedForeignKeys = foreignKeys.filter(foreignKey => foreignKey.index !== fieldTempUpdate.index);
            setForeignKeys([...updatedForeignKeys, { ...foreignKey, index: fieldTempUpdate.index }])
        }

        dispatch({
            branch: "db",
            type: "updateField",
            payload: {
                field: { ...modalTemp }

            }
        })

        setIsOn(!isOn);
        setModalTemp((prevModalTemp) => ({
            ...prevModalTemp,
            ...defaultValues,
        }));

    };

    console.log(modalTemp)


    const [fieldTempUpdate, setFieldTempupdate] = useState([]);
    ///add
    useEffect(() => {
        if (table_temp?.primary_key?.includes(fieldTempUpdate.id)) {
            setIsOn(true);
        }
        else {
            setIsOn(false);
        }
    }, [fieldTempUpdate]);

    useEffect(() => {

        if (foreignKeys.some((fk) => fk.index === fieldTempUpdate.index)) {
            setIsOnforenkey(true);
        }
        else {
            setIsOnforenkey(false);
        }
    }, [fieldTempUpdate]);
    ////update
    useEffect(() => {
        if (table_temp?.primary_key?.includes(fieldTempUpdate.id)) {
            setIsOn(true);
        }
        else {
            setIsOn(false);
        }
    }, [fieldTempUpdate]);
    useEffect(() => {

        if (table_temp?.foreign_keys?.some((fk) => fk.field_id === fieldTempUpdate.id)) {
            setIsOnforenkey(true);
        }
        else {
            setIsOnforenkey(false);
        }
    }, [fieldTempUpdate]);


    const loadModalTemp = (fieldData) => {
        setModalTemp({
            ...defaultValues,
            ...fieldData
        });
    }
    console.log(fieldTempUpdate)
    const getIdFieldTemp = (fieldId) => {
console.log(fieldId)
        setFieldTempupdate(fieldId);

        loadModalTemp(fieldId); // load data vào modalTemp khi mở form chỉnh sửa
        // const table_id_temp = getfield[0]?.table_id; // Lấy table_id từ trường
        // const table_temp = tables.tables?.find(table => table.id === table_id_temp);
        // setUpdateTable(table_temp);
    }

    const deleteFieldTemp = (fieldId) => {
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
                const tempFieldsUpdate = tempFields.filter((field) => field.index !== fieldId.index);
                const newPrimaryKey = primaryKey.filter(index => index !== fieldId.index);
                setPrimaryKey(newPrimaryKey);

                dispatch({
                    branch: "db",
                    type: "updateFields",
                    payload: {
                        tempFieldsUpdate
                    }
                })

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

    const [getfield, setGetAllfield] = useState([]);
    useEffect(() => {

        fetch(`${proxy}/db/tables/table/${table_id}/fields`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;
                console.log("data", data)
                if (success) {
                    if (data) {
                        setGetAllfield(data);
                    }
                } else {
                    // window.location = "/404-not-found"
                }
            })
    }, [])


    useEffect(() => {
        fetch(`${proxy}/db/tables/v/${version_id}`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;
                console.log("data", data)
                if (success) {
                    if (data) {
                        setTables(data);
                    }
                } else {
                    // window.location = "/404-not-found"
                }
            })
    }, [])
    //lấy table 

    const table_id_temp = getfield[0]?.table_id; // Lấy table_id từ trường
    const table_temp = tables.tables?.find(table => table.id === table_id_temp);


    const [fields, setFields] = useState([]);
    const [selectedTableId, setSelectedTableId] = useState(null);
    // Chọn bảng
    const handleSelectTable = async (event) => {
        const tableId = event.target.value;
        setSelectedTableId(tableId);
        setTableId_select(tableId)
        fetch(`${proxy}/db/tables/table/${tableId}/fields`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data } = resp;
                if (success) {
                    setFields(data);
                    console.log(data)
                } else {
                    // Xử lý lỗi ở đây
                    // window.location = "/404-not-found"
                }
            });
    };


    
    



    //primary
    const [isOn, setIsOn] = useState(false);
    const [primaryKey, setPrimaryKey] = useState([]);

    const handleClickPrimary = () => {
        setIsOn(!isOn);
    };

    //forenkey
    const [isOnforenkey, setIsOnforenkey] = useState(false);
    const [foreignKey, setForeignKey] = useState({ field_id: null, table_id: null, ref_field_id: null });
    const [foreignKeys, setForeignKeys] = useState([]);

    const handleClickForenkey = () => {
        setIsOnforenkey(!isOnforenkey);
    };

    const [tableUpdate, setUpdateTable] = useState([]);




    useEffect(() => {
        console.log(tableUpdate);
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



    const [currentPageTable, setCurrentPageTable] = useState(1);
    const rowsPerPageTable = 7;

    const indexOfLastTable = currentPageTable * rowsPerPageTable;
    const indexOfFirstTable = indexOfLastTable - rowsPerPageTable;
    const currentTable = getfield.slice(indexOfFirstTable, indexOfLastTable);


    const paginateTable = (pageNumber) => setCurrentPageTable(pageNumber);
    const totalPagesTable = Math.ceil(getfield.length / rowsPerPageTable);

    // console.log("p key", primaryKey)
    // console.log("f key", foreignKeys)
    console.log(table_temp)
    // console.log(table_temp?.foreign_keys?.table)

    const [tableId_select, setTableId_select] = useState(null);
    const [fieldId_select, setFieldId_select] = useState(null);
    
    useEffect(() => {
        if (table_temp && table_temp.foreign_keys && fieldTempUpdate) {
            const { foreign_keys, primary_key } = table_temp;
           
            const relevantForeignKey = foreign_keys.find(fk => fk.field_id === fieldTempUpdate.id);
            if (relevantForeignKey) {
                const tableId = relevantForeignKey.table_id;
                const ref_on = relevantForeignKey.ref_field_id;
                setTableId_select(tableId);
                setFieldId_select(ref_on);

                // setForeignKey(foreignKey => ({ ...foreignKey, table_id: tableId, ref_on }));

            }
            console.log(fieldTempUpdate)
           
        }
    }, [table_temp, fieldTempUpdate]);

    console.log(tableId_select)

    console.log(fieldId_select)

    useEffect(() => {
      
        fetch(`${proxy}/db/tables/table/${tableId_select}/fields`, {
            headers: {
                Authorization: _token
            }
        })
        .then(res => res.json())
        .then(resp => {
            const { success, data } = resp;
            if (success) {
                setFields(data);
                console.log(data);
            } else {
                // Xử lý lỗi ở đây
                // window.location = "/404-not-found"
            }
        });
setSelectedTableId(tableId_select)
       
    
}, [ tableId_select]);



    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h4>Quản lý bảng</h4>
                        </div>
                    </div>
                </div>

                {/* List table */}
                <div class="row">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head">
                                <div class="heading1 margin_0 ">
                                    <h5>Chỉnh sửa bảng</h5>
                                </div>
                            </div>
                            <div class="table_section padding_infor_info">
                                <div class="row column1">
                                    <div class="form-group col-lg-4">
                                        <label class="font-weight-bold">Tên bảng <span className='red_star'>*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            defaultValue={table_temp?.table_name}
                                            onChange={(e) => setUpdateTable({ ...table_temp, table_name: e.target.value })}
                                            placeholder=""
                                        />
                                    </div>

                                    <div class="col-md-12 col-lg-12">
                                        <div class="d-flex align-items-center mb-1">
                                            <p class="font-weight-bold">Danh sách các trường </p>
                                            <button type="button" class="btn btn-primary custom-buttonadd ml-auto" data-toggle="modal" data-target="#addField">
                                                <i class="fa fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="table-responsive">
                                            {
                                                currentTable && currentTable.length > 0 ? (
                                                    <>
                                                        <table class="table table-striped">
                                                            <thead>
                                                                <tr>
                                                                    <th class="font-weight-bold" scope="col">{lang["log.no"]}</th>
                                                                    <th class="font-weight-bold" scope="col">Khóa</th>
                                                                    <th class="font-weight-bold" scope="col">Tên trường</th>
                                                                    <th class="font-weight-bold" scope="col">Kiểu dữ liệu</th>
                                                                    <th class="font-weight-bold" scope="col">Yêu cầu dữ liệu</th>
                                                                    <th class="font-weight-bold" scope="col">Người tạo</th>
                                                                    <th class="font-weight-bold align-center" scope="col">Ngày tạo</th>
                                                                    <th class="font-weight-bold align-center" scope="col" >{lang["log.action"]}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>

                                                                {currentTable.map((field, index) => (
                                                                    <tr key={field.id}>
                                                                        <td scope="row">{index + 1}</td>
                                                                        <td class="align-center"> {table_temp?.primary_key?.includes(field.id) ? <img src="/images/icon/p-key.png" width={14} alt="Key" /> : null}
                                                                            {table_temp?.foreign_keys?.some((fk) => fk.field_id === field.id) && (
                                                                                <img src="/images/icon/f-key.png" width={14} alt="Foreign Key" />
                                                                            )}

                                                                        </td>
                                                                        <td style={{ maxWidth: "100px" }}>
                                                                            <div style={{
                                                                                width: "100%",
                                                                                overflow: "hidden",
                                                                                textOverflow: "ellipsis",
                                                                                whiteSpace: "nowrap"
                                                                            }}>
                                                                                {field.field_name}
                                                                            </div>
                                                                        </td>
                                                                        <td>{field.props.DATATYPE}</td>
                                                                        <td> {field.NULL ? (
                                                                            <span>Không cần dữ liệu</span>
                                                                        ) : (
                                                                            <span>Cần dữ liệu</span>
                                                                        )}
                                                                        </td>
                                                                        <td>{users.fullname}</td>
                                                                        <td>{field.create_at.toString()}</td>
                                                                        <td class="align-center" style={{ minWidth: "130px" }}>
                                                                            <i class="fa fa-edit size pointer icon-margin icon-edit" onClick={() => getIdFieldTemp(field)} data-toggle="modal" data-target="#editFieldTemp" title={lang["edit"]}></i>
                                                                            <i class="fa fa-trash-o size pointer icon-margin icon-delete" onClick={() => deleteFieldTemp(field)} title={lang["delete"]}></i>
                                                                        </td>
                                                                    </tr>
                                                                ))}

                                                            </tbody>
                                                        </table>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <p>{lang["show"]} {indexOfFirstTable + 1}-{Math.min(indexOfLastTable, getfield.length)} {lang["of"]} {getfield.length} {lang["results"]}</p>
                                                            <nav aria-label="Page navigation example">
                                                                <ul className="pagination mb-0">
                                                                    <li className={`page-item ${currentPageTable === 1 ? 'disabled' : ''}`}>
                                                                        <button className="page-link" onClick={() => paginateTable(currentPageTable - 1)}>
                                                                            &laquo;
                                                                        </button>
                                                                    </li>
                                                                    {Array(totalPagesTable).fill().map((_, index) => (
                                                                        <li className={`page-item ${currentPageTable === index + 1 ? 'active' : ''}`}>
                                                                            <button className="page-link" onClick={() => paginateTable(index + 1)}>
                                                                                {index + 1}
                                                                            </button>
                                                                        </li>
                                                                    ))}
                                                                    <li className={`page-item ${currentPageTable === totalPagesTable ? 'disabled' : ''}`}>
                                                                        <button className="page-link" onClick={() => paginateTable(currentPageTable + 1)}>
                                                                            &raquo;
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </nav>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div class="list_cont ">
                                                        <p>Chưa có trường</p>
                                                    </div>
                                                )
                                            }
                                        </div>
                                        {
                                            currentTable && currentTable.length > 0 ? (
                                                <div className="button-container mt-4">

                                                    <button type="button" onClick={updateTable} class="btn btn-success ">{lang["btn.update"]}</button>
                                                    <button type="button" onClick={() => navigate(-1)} class="btn btn-danger ">{lang["btn.close"]}</button>
                                                </div>) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* addd */}
                <div class={`modal ${showModal ? 'show' : ''}`} id="addField">
                    <div class="modal-dialog modal-dialog-center">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h4 class="modal-title">Tạo mới trường</h4>
                                <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="row">
                                        <div class="form-group col-lg-12">
                                            <label>Tên trường <span className='red_star'>*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={modalTemp.field_name}
                                                onChange={(e) => setModalTemp({ ...modalTemp, field_name: e.target.value })}
                                                placeholder=""
                                            />
                                        </div>
                                        <div class="form-group col-lg-6">
                                            <label>Trạng thái khóa <span className='red_star'>*</span></label>
                                        </div>
                                        <div class="form-group col-lg-6"></div>
                                        <div class="form-group col-lg-12 d-flex align-items-center ml-4">
                                            <label class="mr-2">Khóa chính </label>
                                            <i
                                                className={`fa fa-toggle-${isOn ? 'on icon-toggle' : 'off'} fa-2x`}
                                                aria-hidden="true"
                                                onClick={handleClickPrimary}
                                            ></i>
                                        </div>
                                        <div class="form-group col-lg-12 d-flex align-items-center ml-4">
                                            <label class="mr-2">Khóa ngoại </label>
                                            <i
                                                className={`fa fa-toggle-${isOnforenkey ? 'on icon-toggle' : 'off'} fa-2x`}
                                                aria-hidden="true"
                                                onClick={handleClickForenkey}
                                            ></i>
                                        </div>
                                        <div className={`form-group col-lg-6`}>
                                            <label>Tên bảng <span className='red_star'>*</span></label>
                                            <select
                                                className="form-control"
                                                onChange={(e) => {
                                                    handleSelectTable(e);
                                                    setForeignKey({ ...foreignKey, table_id: e.target.value })
                                                }}
                                                disabled={!isOnforenkey}>
                                                <option value="">Chọn bảng</option>
                                                {tables.tables?.map((table, index) => {
                                                    return (
                                                        <option key={index} value={table.id}>
                                                            {table.table_name}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                        <div className={`form-group col-lg-6`}>
                                            <label>Tên trường <span className='red_star'>*</span></label>
                                            <select className="form-control" disabled={!isOnforenkey} onChange={(e) => {
                                                console.log(e.target.value);
                                                setForeignKey({ ...foreignKey, ref_field_id: e.target.value });
                                            }}
                                            > <option value="">Chọn trường</option>
                                                {
                                                    fields.filter(field => {
                                                        const selectedTableIdAsNumber = Number(selectedTableId);
                                                        const selectedTable = tables.tables.find(table => table.id === selectedTableIdAsNumber);
                                                        return selectedTable?.primary_key.includes(field.id);
                                                    }).map((field, index) => {
                                                        return (
                                                            <option key={index} value={field.id}>
                                                                {field.field_name}
                                                            </option>
                                                        );
                                                    })
                                                }
                                            </select>
                                        </div>
                                        <div class="form-group col-lg-12">
                                            <label>Yêu cầu dữ liệu <span className='red_star'>*</span></label>
                                            <select className="form-control" onChange={(e) => setModalTemp({ ...modalTemp, NULL: e.target.value == "true" ? true : false })}>
                                                <option value={false}>Chọn</option>
                                                {typenull.map((item, index) => {
                                                    return (
                                                        <option key={index} value={item.value} >
                                                            {item.label}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>



                                        <div class={`form-group col-lg-12`}>
                                            <select
                                                className="form-control"
                                                value={modalTemp.DATATYPE}
                                                onChange={(e) => {
                                                    const selectedDataType = e.target.value;
                                                    const selectedType = types.find((type) => type.name === selectedDataType);

                                                    if (selectedType) {
                                                        setModalTemp(prevModalTemp => {
                                                            const updateValues = {
                                                                DATATYPE: selectedDataType
                                                            };

                                                            // Nếu có giới hạn, gán giá trị min, max tương ứng

                                                            if (selectedType.limit) {
                                                                const { min, max } = selectedType.limit;
                                                                updateValues.MIN = min !== undefined ? String(min) : prevModalTemp.MIN;
                                                                updateValues.MAX = max !== undefined ? String(max) : prevModalTemp.MAX;
                                                            }

                                                            // Nếu là kiểu date, gán định dạng ngày
                                                            if (selectedType.type === 'date' || selectedType.type === 'datetime') {
                                                                updateValues.FORMAT = selectedType.format;
                                                            }

                                                            return {
                                                                ...prevModalTemp,
                                                                ...updateValues
                                                            };
                                                        });
                                                    } else {
                                                        setModalTemp(prevModalTemp => ({
                                                            ...prevModalTemp,
                                                            DATATYPE: selectedDataType,
                                                        }));
                                                    }
                                                }}
                                            >
                                                <option value="">Chọn kiểu dữ liệu</option>
                                                {types.map((type, index) => (
                                                    <option key={index} value={type.name}>
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {types.map((type) => {
                                            if (type.name !== modalTemp.DATATYPE) return null;

                                            return (
                                                <div key={type.id}>
                                                    {type.props.map((prop, index) => {
                                                        let inputType = prop.type;
                                                        let isBoolType = prop.type === "bool";
                                                        let defaultValue = modalTemp[prop.name];

                                                        if (inputType === "int") {
                                                            if (prop.name === 'MIN') defaultValue = type.limit.min;
                                                            if (prop.name === 'MAX') defaultValue = type.limit.max;
                                                        }

                                                        return (
                                                            <div key={index} className="form-group col-lg-12">
                                                                <label>{prop.label} <span className='red_star'>*</span></label>
                                                                {isBoolType ? (
                                                                    <select
                                                                        className="form-control"
                                                                        value={defaultValue}  // Sử dụng defaultValue thay vì value
                                                                        onChange={(e) => {
                                                                            setModalTemp((prevModalTemp) => ({
                                                                                ...prevModalTemp,
                                                                                [prop.name]: e.target.value === "true",
                                                                            }));
                                                                        }}
                                                                    >

                                                                        <option value="true">True</option>
                                                                        <option value="false">False</option>
                                                                    </select>
                                                                ) : (
                                                                    <input
                                                                        className="form-control"
                                                                        type={inputType === "int" ? "number" : inputType}
                                                                        defaultValue={defaultValue}  // Sử dụng defaultValue thay vì value
                                                                        onChange={(e) => {
                                                                            setModalTemp((prevModalTemp) => ({
                                                                                ...prevModalTemp,
                                                                                [prop.name]: e.target.value,
                                                                            }));
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    })}


                                                </div>
                                            );
                                        })}



                                        <div class="form-group col-lg-6">
                                            <label>Người tạo <span className='red_star'>*</span></label>
                                            <input class="form-control" type="text" value={users.fullname} readOnly />
                                        </div>
                                        <div class="form-group col-lg-6">
                                            <label>Thời gian <span className='red_star'>*</span></label>
                                            <input class="form-control" type="text" value={new Date().toISOString().substring(0, 10)} readOnly />
                                        </div>

                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" onClick={handleSubmitModal} data-dismiss="modal" class="btn btn-success ">{lang["btn.create"]}</button>
                                <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Edit Field */}
                <div class={`modal ${showModal ? 'show' : ''}`} id="editFieldTemp">
                    <div class="modal-dialog modal-dialog-center">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h4 class="modal-title">Cập nhật trường</h4>
                                <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="row">
                                        <div class="form-group col-lg-12">
                                            <label>Tên trường <span className='red_star'>*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={fieldTempUpdate.field_name}
                                                onChange={(e) => setFieldTempupdate({ ...fieldTempUpdate, field_name: e.target.value })}


                                                placeholder=""
                                            />
                                        </div>
                                        <div class="form-group col-lg-6">
                                            <label>Trạng thái khóa <span className='red_star'>*</span></label>
                                        </div>
                                        <div class="form-group col-lg-6"></div>
                                        <div class="form-group col-lg-12 d-flex align-items-center ml-4">
                                            <label class="mr-2">Khóa chính </label>
                                            <i
                                                className={`fa fa-toggle-${isOn ? 'on icon-toggle' : 'off'} fa-2x`}
                                                aria-hidden="true"
                                                onClick={handleClickPrimary}
                                            ></i>
                                        </div>
                                        <div class="form-group col-lg-12 d-flex align-items-center ml-4 ">
                                            <label class="mr-2">Khóa ngoại </label>
                                            <i
                                                className={`fa fa-toggle-${isOnforenkey ? 'on icon-toggle' : 'off'} fa-2x`}
                                                aria-hidden="true"
                                                onClick={handleClickForenkey}
                                            ></i>
                                        </div>
                                        <div className={`form-group col-lg-6`}>
                                            <label>Tên bảng <span className='red_star'>*</span></label>
                                            <select
                                                className="form-control"
                                                value={tableId_select}
                                                onChange={(e) => {
                                                    handleSelectTable(e);
                                                    setTableId_select({ ...tableId_select, table_id: e.target.value })
                                                }}
                                                disabled={!isOnforenkey}>

                                                {tables.tables?.map((table, index) => {
                                                    return (
                                                        <option key={index} value={table.id}>
                                                            {table.table_name}
                                                        </option>
                                                    );
                                                })}

                                            </select>
                                        </div>
                                        <div className={`form-group col-lg-6`}>
                                            <label>Tên trường <span className='red_star'>*</span></label>

                                            {/* <select className="form-control"
                                                value={fieldId_select}
                                                disabled={!isOnforenkey} onChange={(e) => {
                                                    setForeignKey({ ...foreignKey, ref_field_id: e.target.value });
                                                }}
                                            >
                                                
                                                {
                                                    fields.filter(field => {
                                                        const selectedTableIdAsNumber = Number(selectedTableId);
                                                        const selectedTable = tables.tables.find(table => table.id === selectedTableIdAsNumber);
                                                        return selectedTable?.primary_key.includes(field.id);
                                                    }).map((field, index) => {
                                                        return (
                                                            <option key={index} value={field.id}>
                                                                {field.field_name}
                                                            </option>
                                                        );
                                                    })
                                                }
                                            </select> */}
                                            <select className="form-control"
                                                value={fieldId_select}
                                                disabled={!isOnforenkey}
                                                onChange={(e) => {
                                                    setForeignKey({ ...fieldId_select, ref_field_id: e.target.value });
                                                }}
                                            >
                                                {fields && fields.length > 0 && (
                                                    
                                                    fields.map((field, index) => {
                                                        return (
                                                            <option key={index} value={field.id}>
                                                                {field.field_name}
                                                            </option>
                                                        );
                                                    })
                                                )}
                                            </select>

                                        </div>
                                        <div class="form-group col-lg-12">
                                            <label>Yêu cầu dữ liệu <span className='red_star'>*</span></label>
                                            <select className="form-control" value={fieldTempUpdate.NULL} onChange={(e) => setFieldTempupdate({ ...fieldTempUpdate, NULL: e.target.value == "true" ? true : false })}>

                                                {typenull.map((item, index) => {
                                                    return (
                                                        <option key={index} value={item.value} >
                                                            {item.label}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                        <div class={`form-group col-lg-12`}>
                                            <select
                                                className="form-control"
                                                value={fieldTempUpdate.props?.DATATYPE}
                                                // onChange={(e) => {
                                                //     const selectedDataType = e.target.value;
                                                //     const selectedType = types.find((type) => type.name === selectedDataType);

                                                //     if (selectedType) {
                                                //         setModalTemp(prevModalTemp => {
                                                //             const updateValues = {
                                                //                 DATATYPE: selectedDataType
                                                //             };

                                                //             // Nếu có giới hạn, gán giá trị min, max tương ứng
                                                //             if (selectedType.limit) {
                                                //                 const { min, max } = selectedType.limit;
                                                //                 updateValues.MIN = min !== undefined ? String(min) : prevModalTemp.MIN;
                                                //                 updateValues.MAX = max !== undefined ? String(max) : prevModalTemp.MAX;
                                                //             }

                                                //             // Nếu là kiểu date, gán định dạng ngày
                                                //             if (selectedType.type === 'date' || selectedType.type === 'datetime') {
                                                //                 updateValues.FORMAT = selectedType.format;
                                                //             }

                                                //             return {
                                                //                 ...prevModalTemp,
                                                //                 ...updateValues
                                                //             };
                                                //         });
                                                //     } else {
                                                //         setModalTemp(prevModalTemp => ({
                                                //             ...prevModalTemp,
                                                //             DATATYPE: selectedDataType,
                                                //         }));
                                                //     }
                                                // }}
                                                onChange={(e) => setFieldTempupdate({ ...fieldTempUpdate, DATATYPE: e.target.value })}
                                            >

                                                {types.map((type, index) => (
                                                    <option key={index} value={type.name}>
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {types.map((type) => {
                                            if (type.name !== fieldTempUpdate.props?.DATATYPE) return null;

                                            return (
                                                <div key={type.id}>
                                                    {type.props.map((prop, index) => {
                                                        let inputType = prop.type;
                                                        let isBoolType = prop.type === "bool";
                                                        let defaultValue = fieldTempUpdate.props?.[prop.name];

                                                        if (inputType === "int") {
                                                            if (prop.name === 'MIN') defaultValue = fieldTempUpdate.props?.MIN;
                                                            if (prop.name === 'MAX') defaultValue = fieldTempUpdate.props?.MAX;
                                                        }

                                                        return (
                                                            <div key={index} className="form-group col-lg-12">
                                                                <label>{prop.label} <span className='red_star'>*</span></label>
                                                                {isBoolType ? (
                                                                    <select
                                                                        className="form-control"
                                                                        value={defaultValue}  // Sử dụng defaultValue thay vì value
                                                                        onChange={(e) => {
                                                                            setFieldTempupdate((prevModalTemp) => ({
                                                                                ...prevModalTemp,
                                                                                [prop.name]: e.target.value === "true",
                                                                            }));
                                                                        }}
                                                                    >
                                                                        <option value="true">True</option>
                                                                        <option value="false">False</option>
                                                                    </select>
                                                                ) : (
                                                                    <input
                                                                        className="form-control"
                                                                        type={inputType === "int" ? "number" : inputType}
                                                                        value={defaultValue}  // Sử dụng defaultValue thay vì value
                                                                        onChange={(e) => {
                                                                            setFieldTempupdate((prevModalTemp) => ({
                                                                                ...prevModalTemp,
                                                                                [prop.name]: e.target.value,
                                                                            }));
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    })}


                                                </div>
                                            );
                                        })}



                                        <div class="form-group col-lg-6">
                                            <label>Người tạo <span className='red_star'>*</span></label>
                                            <input class="form-control" type="text" value={users.fullname} readOnly />
                                        </div>
                                        <div class="form-group col-lg-6">
                                            <label>Thời gian <span className='red_star'>*</span></label>
                                            <input class="form-control" type="text" value={new Date().toISOString().substring(0, 10)} readOnly />
                                        </div>

                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" onClick={handleUpdatetModal} data-dismiss="modal" class="btn btn-success ">{lang["btn.update"]}</button>
                                <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit table */}
                <div class={`modal ${showModal ? 'show' : ''}`} id="editTable">
                    <div class="modal-dialog modal-dialog-center">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h4 class="modal-title">Chỉnh sửa bảng</h4>
                                <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="row">
                                        <div class="form-group col-lg-12">
                                            <label>Tên bảng <span className='red_star'>*</span></label>
                                            <input type="text" class="form-control" value={tableUpdate.table_name} onChange={
                                                (e) => { setUpdateTable({ ...tableUpdate, table_name: e.target.value }) }
                                            } placeholder="" />
                                        </div>


                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" onClick={updateTable} class="btn btn-success ">{lang["btn.update"]}</button>
                                {/* <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}

