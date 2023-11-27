
import React, { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMaximize, faMinimize, faDownload, faCompress, faChartBar, faPlusCircle, faCirclePlus, faAngleDown, faEllipsisVertical, faPlusSquare, faPaperPlane, faPaperclip, faAngleLeft, faTrashCan, faShareSquare } from '@fortawesome/free-solid-svg-icons';
function EditableTable(props) {
    console.log(props)
    const { lang, proxy, auth } = useSelector(state => state);
    const stringifiedUser = localStorage.getItem("user");
    const _token = localStorage.getItem("_token");
    const _user = JSON.parse(stringifiedUser) || {}
    const username = _user.username === "administrator" ? "Mylan Digital Solution" : _user.username;
    const storedPwdString = localStorage.getItem("password_hash");
    const [data, setData] = useState([
        { id: 1, col1: '', col2: '', col3: '', col4: '', col5: '', isEditing: false },
    ]);
    const dataProduct = props.data
    const dataStateUpdate = props.stateUpdate
    const dataCaseId = props.caseId
    console.log(dataCaseId)
    const mappedArray = dataProduct?.map(item => ({
        "col1": item["2SN"],
        "col2": item["1SV"],
        "col3": item["1HV"],
        "col4": item["1FV"],
        "col5": item["10Q"],

    }));
    console.log(data)
    useEffect(() => {
        if (dataStateUpdate) {
            setData(mappedArray)
        }

    }, [dataCaseId]);

    const [selectedRowId, setSelectedRowId] = useState(null);

    const addRow = () => {
        const newRow = { id: data.length + 1, col1: '', col2: '', col3: '', col4: '', col5: '', isEditing: false };
        setData([...data, newRow]);



        const requestBodyProduct = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            "3CI": dataCaseId
           
        }
        fetch(`${proxy()}/api/C4F20640B94F4FEE85C35DF21D06F058`, {
            headers: {
                Authorization: _token,
                "content-type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(requestBodyProduct)
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, activated, status, content } = resp;
                console.log("Product infor", resp)
               

            })
    };










    const handleInputChange = (rowId, colName, value) => {
        // Cập nhật dữ liệu như trước
        const newData = data.map((row) =>
            row.id === rowId ? { ...row, [colName]: value } : row
        );
        setData(newData);
        // Gọi hàm callback để thông báo cho component cha
        props.onDataUpdate(newData);
    };

    const handleRowClick = (rowId) => {
        setSelectedRowId(rowId);
        // console.log('Row Clicked:', rowId);
        // Xác định hàng nào được nhấp vào và chỉ định trạng thái chỉnh sửa của nó
        setData((prevData) =>
            prevData.map((row) =>
                row.id === rowId ? { ...row, isEditing: true } : { ...row, isEditing: false }
            )
        );
    };

    const handleRowBlur = (rowId) => {
        // Chờ một khoảng thời gian ngắn để xem liệu người dùng có chuyển sang một input khác cùng hàng hay không
        setTimeout(() => {
            if (!document.activeElement.classList.contains('form-control')) {
                setData((prevData) =>
                    prevData.map((prevRow) =>
                        prevRow.id === rowId ? { ...prevRow, isEditing: false } : prevRow
                    )
                );
            }
        }, 100); // Thời gian chờ có thể điều chỉnh
    };

    const handleDeleteRow = (rowId) => {
        // Cập nhật state để loại bỏ hàng dựa trên rowId
        const newData = data.filter((row) => row.id !== rowId);
        setData(newData);
        // Gọi hàm callback để thông báo cho component cha
        props.onDataUpdate(newData);
    };

    const handleFocus = (rowId) => {
        // Đặt isEditing thành true khi một input được focus
        setData((prevData) =>
            prevData.map((row) =>
                row.id === rowId ? { ...row, isEditing: true } : row
            )
        );
    };

    return (
        <>

            <div class="d-flex mb-1 mt-1">
                <h5>Product information</h5>
                <FontAwesomeIcon icon={faPlusSquare} onClick={() => addRow()} className={`size-24 ml-auto  icon-add pointer `} title='Add Product Information' />
            </div>
            <div class="table-responsive">
                {

                    <table className="table">
                        <thead>
                            <tr className="color-tr font-weight-bold-black">
                                <th class="align-center" style={{ width: "40px" }}>{lang["log.no"]}</th>
                                <th style={{ width: "250px" }}>SERIAL NUMBER / LOT NUMBER</th>
                                <th style={{ width: "150px" }}>HARDWARE</th>
                                <th style={{ width: "150px" }}>FIRMWARE</th>
                                <th style={{ width: "150px" }}>SOFTWARE</th>
                                <th style={{ width: "150px" }}>QUALITY</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={row.id}>
                                    <td class="align-center">{index + 1}</td>
                                    <td class="table-td-product-pl-5"
                                        onClick={() => handleRowClick(row.id)}

                                    >
                                        {row.isEditing ? (
                                            <input
                                                type="text"
                                                className="form-control table-td-product-pl-5"
                                                value={row.col1}
                                                onChange={(e) => handleInputChange(row.id, 'col1', e.target.value)}
                                                onBlur={() => handleRowBlur(row.id)}
                                                onFocus={() => handleFocus(row.id)}
                                            />
                                        ) : (
                                            <span class="table-td-product-pl-6">{row.col1}</span>
                                        )}
                                    </td>

                                    <td class="table-td-product-pl-5"
                                        onClick={() => handleRowClick(row.id)}

                                    >
                                        {row.isEditing ? (
                                            <input
                                                type="text"
                                                className="form-control table-td-product-pl-5"
                                                value={row.col2}
                                                onChange={(e) => handleInputChange(row.id, 'col2', e.target.value)}
                                                onBlur={() => handleRowBlur(row.id)}
                                                onFocus={() => handleFocus(row.id)}
                                            />
                                        ) : (
                                            <span class="table-td-product-pl-6">{row.col2}</span>
                                        )}
                                    </td>

                                    <td class="table-td-product-pl-5"
                                        onClick={() => handleRowClick(row.id)}
                                    >
                                        {row.isEditing ? (
                                            <input
                                                type="text"
                                                className="form-control table-td-product-pl-5"
                                                value={row.col3}
                                                onChange={(e) => handleInputChange(row.id, 'col3', e.target.value)}
                                                onBlur={() => handleRowBlur(row.id)}
                                                onFocus={() => handleFocus(row.id)}
                                            />
                                        ) : (
                                            <span class="table-td-product-pl-6">{row.col3}</span>
                                        )}
                                    </td>
                                    <td class="table-td-product-pl-5"
                                        onClick={() => handleRowClick(row.id)}

                                    >

                                        {row.isEditing ? (

                                            <input
                                                type="text"
                                                className="form-control table-td-product-pl-5"
                                                value={row.col4}
                                                onChange={(e) => handleInputChange(row.id, 'col4', e.target.value)}
                                                onBlur={() => handleRowBlur(row.id)}
                                                onFocus={() => handleFocus(row.id)}
                                            />

                                        ) : (
                                            <span class="table-td-product-pl-6">{row.col4}</span>
                                        )}

                                    </td>
                                    <td class="table-td-product-pl-5"
                                        onClick={() => handleRowClick(row.id)}

                                    >

                                        {row.isEditing ? (
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    className="form-control table-td-product-pl-5"
                                                    value={row.col5}
                                                    onChange={(e) => {
                                                        // Kiểm tra nếu giá trị nhập vào không phải là số từ 0 đến 9, thì không cho phép cập nhật giá trị
                                                        if (/^[0-9]*$/.test(e.target.value)) {
                                                            handleInputChange(row.id, 'col5', e.target.value);
                                                        }
                                                    }}
                                                    onBlur={() => handleRowBlur(row.id)}
                                                    onFocus={() => handleFocus(row.id)}
                                                    pattern="[0-9]*" // Chỉ cho phép nhập số từ 0 đến 9
                                                    inputMode="numeric" // Chế độ nhập số
                                                />

                                                <FontAwesomeIcon icon={faTrashCan} onClick={() => handleDeleteRow(row.id)} className={`size-24 ml-2  icon-delete pointer `} />
                                            </div>
                                        ) : (
                                            <span class="table-td-product-pl-6">{row.col5}</span>
                                        )}

                                    </td>

                                </tr>
                            ))}

                        </tbody>
                    </table>

                }
            </div>

        </>

    );
}

export default EditableTable;
