import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMaximize, faMinimize, faDownload, faCompress, faChartBar, faPlusCircle, faCirclePlus, faAngleDown, faEllipsisVertical, faPlusSquare, faPaperPlane, faPaperclip, faAngleLeft, faTrashCan, faShareSquare } from '@fortawesome/free-solid-svg-icons';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const convertKeys = (data) => {
    return data.map((item, index) => ({
        id: index,
        col1: item["SERIALNUMBER/LOTNUMBER"],
        col2: item["HARDWARE"],
        col3: item["FIRMWARE"],
        col4: item["SOFTWARE"],
        col5: item["QUANTITY"]
    }));
}

const convertArrayToObjects = (dataArray) => {
    // Giả định hàng đầu tiên là tiêu đề cột
    const headers = dataArray[0];
    // Chuyển đổi mỗi hàng sau đó thành một đối tượng
    return dataArray.slice(1).map((row, index) => {
        // Sử dụng reduce để tạo đối tượng với các giá trị tương ứng từ mỗi cột
        const obj = row.reduce((acc, value, colIndex) => {
            acc['col' + (colIndex + 1)] = value;
            return acc;
        }, {});
        // Thêm thuộc tính id
        obj.id = index;
        return obj;
    });
}

// Hàm hỗ trợ để xử lý các giá trị đặc biệt như dấu phẩy trong dữ liệu
function replacer(key, value) {
    if (typeof value === 'string' && value.includes(',')) {
        return `${value}`;
    }
    return value;
}

const sampleData = [
    { "SERIALNUMBER/LOTNUMBER": "SN123456789", "HARDWARE": "1.3", "FIRMWARE": "1.3", "SOFTWARE": "1.3", "QUANTITY": "1.3" },
    { "SERIALNUMBER/LOTNUMBER": "SN123456789", "HARDWARE": "1.3", "FIRMWARE": "1.3", "SOFTWARE": "1.3", "QUANTITY": "1.3" },
    { "SERIALNUMBER/LOTNUMBER": "SN123456789", "HARDWARE": "1.3", "FIRMWARE": "1.3", "SOFTWARE": "1.3", "QUANTITY": "1.3" },
    // Thêm các hàng mẫu nếu cần
];

function EditableTable(props) {
    // console.log(props)
    const { lang, proxy, auth } = useSelector(state => state);
    const stringifiedUser = localStorage.getItem("user");
    const _token = localStorage.getItem("_token");
    const _user = JSON.parse(stringifiedUser) || {}
    const username = _user.username === "administrator" ? "Mylan Digital Solution" : _user.username;
    const storedPwdString = localStorage.getItem("password_hash");
    const [data, setData] = useState([
        // { id: 1, col1: '', col2: '', col3: '', col4: '', col5: '', isEditing: false },
    ]);
    console.log("DATA NÈ", data)
    //CHọn file
    const fileInputRef = useRef();
    const handleImportClick = () => {
        fileInputRef.current.click();
    };
    // Tạo ID
    let currentMaxId = data?.reduce((max, item) => item.id > max ? item.id : max, 0);

    function getNextId() {
        return ++currentMaxId; // Tăng ID lên mỗi lần gọi
    }

    function updateIdsForNewData(newData) {
        return newData.map(item => ({ ...item, id: getNextId() }));
    }

    const [prevData, setPrevData] = useState(data ? [...data] : []);
    const dataDetail = props.dataDetail
    const dataProduct = props.data
    const dataStateUpdate = props.stateUpdate
    const dataCaseId = props.caseId
    // console.log(dataCaseId)

    const mappedArray = dataProduct?.map(item => ({
        "detailId": item["1DI"],
        "caseId": item["3CI"],
        "col1": item["2SN"],
        "col2": item["1SV"],
        "col3": item["1HV"],
        "col4": item["1FV"],
        "col5": item["10Q"],

    }));

    // console.log(data)
    useEffect(() => {
        if (dataStateUpdate) {
            setData(mappedArray)
        }

    }, [dataProduct]);
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const fileType = file.name.split('.').pop();

        const reader = new FileReader();
        reader.onload = async (e) => {
            let newData = [];

            if (fileType === 'csv') {
                newData = await new Promise(resolve => {
                    Papa.parse(e.target.result, {
                        complete: (result) => {
                            const convertedData = convertArrayToObjects(result.data);
                            newData = updateIdsForNewData(convertedData);
                            resolve(newData);
                        }
                    });
                });
            } else if (fileType === 'xlsx' || fileType === 'xls') {
                const bstr = e.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const dataFile = XLSX.utils.sheet_to_json(ws);
                newData = updateIdsForNewData(convertKeys(dataFile));
            }

            // Loại bỏ dữ liệu khởi tạo trống nếu có
            const filteredData = data.filter(item => item.col1 || item.col2 || item.col3 || item.col4 || item.col5);
            setData([...filteredData, ...newData]);

            // Thêm mỗi hàng mới
            for (const row of newData) {
                const detailId = await addRow(row ,false);
                const updatedRow = { ...row, detailId: detailId, caseId: dataCaseId };
                await updateRow(updatedRow);
            }

            event.target.value = '';
        };

        if (fileType === 'csv') {
            reader.readAsText(file);
        } else if (fileType === 'xlsx' || fileType === 'xls') {
            reader.readAsBinaryString(file);
        }
    };


    const exportToExcel = (csvData, fileName) => {
        const worksheet = XLSX.utils.json_to_sheet(csvData);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        FileSaver.saveAs(data, fileName + '.xlsx');
    }

    const exportToCSV = (csvData, fileName) => {
        // Tạo tiêu đề cột từ khóa của đối tượng đầu tiên (giả định tất cả các đối tượng có cùng khóa)
        const headers = Object.keys(csvData[0]);

        // Chuyển đổi dữ liệu thành CSV
        const csvRows = [
            headers.join(','), // Tiêu đề cột
            ...csvData.map(row => headers.map(fieldName => String(row[fieldName])).join(',')) // Dữ liệu
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        FileSaver.saveAs(blob, fileName + '.csv');
    }
    const [selectedRowId, setSelectedRowId] = useState(null);

    const addRow = async (row, shouldUpdateState = true) => {
        const requestBodyProduct = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            "3CI": dataCaseId
        };

        try {
            const response = await fetch(`${proxy()}/api/C4F20640B94F4FEE85C35DF21D06F058`, {
                headers: {
                    Authorization: _token,
                    "content-type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(requestBodyProduct)
            });
            const resp = await response.json();
            console.log("Tạo hàng", resp);

            if (resp && resp.Detail && resp.Detail["1DI"]) {
                const newRow = {
                    detailId: resp.Detail["1DI"].toString(),
                    caseId: dataCaseId,
                    col1: '',
                    col2: '',
                    col3: '',
                    col4: '',
                    col5: 0,
                    isEditing: false
                };
                if (shouldUpdateState) {
                    setData(currentData => [...currentData, newRow]);
                }

                props.onDataUpdate(currentData => [...currentData, newRow]);
                return resp.Detail["1DI"].toString();
            } else {
                throw new Error('Không nhận được detailId từ phản hồi');
            }
        } catch (error) {
            console.error('Lỗi khi thêm hàng mới:', error);
        }
    };


    const updateRow = (updatedRows) => {
        // const updatedRow = newData.find((row) => row.detailId === rowId);
        console.log("data", updatedRows)

        const requestBodyProduct = {

            checkCustomer: {
                username,
                password: storedPwdString
            },
            "3CI": updatedRows.caseId,
            "1DI": updatedRows.detailId.toString(),
            "2SN": updatedRows.col1,
            "1SV": updatedRows.col2,
            "1HV": updatedRows.col3,
            "1FV": updatedRows.col4,
            "10Q": parseInt(updatedRows.col5)

        }
        console.log("data update product info", requestBodyProduct)
        fetch(`${proxy()}/api/988C23F3D58E4885A93EEE22D7FE4C6E`, {
            headers: {
                Authorization: _token,
                "content-type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(requestBodyProduct)
        })
            .then(res => res.json())
            .then(resp => {
                const { success, activated, status, content } = resp;

                console.log("data respon", resp)
            })
    };

    //Debouncing
    const debounce = (func, delay) => {
        let inDebounce;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(inDebounce);
            inDebounce = setTimeout(() => func.apply(context, args), delay);
        };
    };

    const debouncedUpdateRow = debounce(updateRow, 1000);
    const handleInputChange = (event, rowId, colName, value) => {
        event.preventDefault();
        const newData = data?.map((row) =>
            row.detailId === rowId ? { ...row, [colName]: value } : row
        );

        // So sánh giá trị mới với giá trị trong prevData
        const hasValueChanged = JSON.stringify(newData) !== JSON.stringify(prevData);

        if (hasValueChanged) {
            setData(newData);
            props.onDataUpdate(newData);

            const updatedRows = newData.find((row) => row.detailId === rowId);
            // console.log(updatedRows)
            debouncedUpdateRow(updatedRows);
        }
    };

    const [focusedRowId, setFocusedRowId] = useState(null);

    // Hàm handleRowClick để đặt focusedRowId
    const handleRowClick = (rowId) => {
        setSelectedRowId(rowId);
        setFocusedRowId(rowId); // Đặt focusedRowId thành row.id
        setPrevData([...data]);
        // Xác định hàng nào được nhấp vào và chỉ định trạng thái chỉnh sửa của nó
        setData((prevData) =>
            prevData.map((row) =>
                row.detailId === rowId ? { ...row, isEditing: true } : { ...row, isEditing: false }
            )
        );
    }

    // Hàm handleFocus chỉ đặt isEditing cho hàng được focus
    const handleFocus = (rowId) => {
        setData((prevData) =>
            prevData.map((row) =>
                row.detailId === rowId ? { ...row, isEditing: true } : row
            )
        );
    };

    const handleRowBlur = (rowId) => {
        // Chờ một khoảng thời gian ngắn để xem liệu người dùng có chuyển sang một input khác cùng hàng hay không
        setTimeout(() => {
            if (!document.activeElement.classList.contains('form-control')) {
                setData((prevData) =>
                    prevData.map((prevRow) =>
                        prevRow.detailId === rowId ? { ...prevRow, isEditing: false } : prevRow
                    )
                );
            }
            props.onDataUpdate(data);
        }, 100); // Thời gian chờ có thể điều chỉnh
    };

    const handleDeleteRow = (rowId) => {
        // console.log(rowId)
        // Cập nhật state để loại bỏ hàng dựa trên rowId
        const newData = data.filter((row) => row.detailId !== rowId.detailId);
        setData(newData);

        // Gọi hàm callback để thông báo cho component cha
        props.onDataUpdate(newData);
        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            "1DI": rowId.detailId,
            "3CI": rowId.caseId
        }
        fetch(`${proxy()}/api/D33CEA7BDD29485BBA0C09D9EFE57BA4`, {
            headers: {
                Authorization: _token,
                "content-type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(requestBody)
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, activated, status, content } = resp;
            })
    };


    return (
        <>
            {dataDetail.status === "Active" &&
                < div class="d-flex mb-1 mt-3">
                    <h5>{lang["PRODUCT INFORMATION"]}</h5>
                    {/* <FontAwesomeIcon icon={faPlusSquare} onClick={() => addRow()} className={`size-24 ml-auto  icon-add pointer `} title='Add Product Information' /> */}

                    <FontAwesomeIcon icon={faPlusSquare} className={`size-24 ml-auto icon-add pointer `} id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title={lang["ADD PRODUCT INFORMATION"]} />
                    <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} ref={fileInputRef} />
                    <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                        <li onClick={() => addRow()}><a class="dropdown-item" href="#"><span>Add Row</span></a></li>
                        <li onClick={handleImportClick}><span class="dropdown-item">Import file</span></li>
                        <li class="dropdown-submenu dropdown-submenu-left">
                            <a class="dropdown-item dropdown-toggle" href="#">File Example</a>
                            <ul class="dropdown-menu first-sub-menu">
                                <li onClick={() => exportToExcel(sampleData, "ten_file_mau")}><span class="dropdown-item" > Excel</span></li>
                                <li onClick={() => exportToCSV(sampleData, "ten_file_mau")}><span class="dropdown-item" >CSV</span></li>
                            </ul>
                        </li>
                    </ul>
                </div >
            }

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
                                <th style={{ width: "150px" }}>QUANTITY</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.length > 0 ? (

                                data.map((row, index) => (
                                    <tr key={row.detailId}>
                                        <td class="align-center">{index + 1}</td>
                                        <td
                                            className="table-td-product-pl-5"
                                            onClick={() => dataDetail.status === "Active" ? handleRowClick(row.detailId) : null}
                                        >
                                            {row.isEditing ? (
                                                <input
                                                    type="text"
                                                    className={`form-control table-td-product-pl-5 ${row.detailId === focusedRowId ? 'focused' : ''}`}
                                                    value={row.col1}
                                                    onChange={(e) => handleInputChange(e, row.detailId, 'col1', e.target.value)}
                                                    onBlur={() => handleRowBlur(row.detailId)}
                                                    onFocus={() => handleFocus(row.detailId)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            updateRow(row)

                                                        }
                                                    }}
                                                    spellCheck="false"
                                                />
                                            ) : (
                                                <span class="table-td-product-pl-6">{row.col1}</span>
                                            )}
                                        </td>

                                        <td
                                            className="table-td-product-pl-5"
                                            onClick={() => dataDetail.status === "Active" ? handleRowClick(row.detailId) : null}
                                        >
                                            {row.isEditing ? (
                                                <input
                                                    type="text"
                                                    className={`form-control table-td-product-pl-5 ${row.detailId === focusedRowId ? 'focused' : ''}`}
                                                    value={row.col2}
                                                    onChange={(e) => handleInputChange(e, row.detailId, 'col2', e.target.value)}
                                                    onBlur={() => handleRowBlur(row.detailId)}
                                                    onFocus={() => handleFocus(row.detailId)}
                                                    spellCheck="false"
                                                />
                                            ) : (
                                                <span class="table-td-product-pl-6">{row.col2}</span>
                                            )}
                                        </td>

                                        <td
                                            className="table-td-product-pl-5"
                                            onClick={() => dataDetail.status === "Active" ? handleRowClick(row.detailId) : null}
                                        >
                                            {row.isEditing ? (
                                                <input
                                                    type="text"
                                                    className={`form-control table-td-product-pl-5 ${row.detailId === focusedRowId ? 'focused' : ''}`}
                                                    value={row.col3}
                                                    onChange={(e) => handleInputChange(e, row.detailId, 'col3', e.target.value)}
                                                    onBlur={() => handleRowBlur(row.detailId)}
                                                    onFocus={() => handleFocus(row.detailId)}
                                                    spellCheck="false"
                                                />
                                            ) : (
                                                <span class="table-td-product-pl-6">{row.col3}</span>
                                            )}
                                        </td>
                                        <td
                                            className="table-td-product-pl-5"
                                            onClick={() => dataDetail.status === "Active" ? handleRowClick(row.detailId) : null}
                                        >

                                            {row.isEditing ? (

                                                <input
                                                    type="text"
                                                    className={`form-control table-td-product-pl-5 ${row.detailId === focusedRowId ? 'focused' : ''}`}
                                                    value={row.col4}
                                                    onChange={(e) => handleInputChange(e, row.detailId, 'col4', e.target.value)}
                                                    onBlur={() => handleRowBlur(row.detailId)}
                                                    onFocus={() => handleFocus(row.detailId)}
                                                    spellCheck="false"
                                                />

                                            ) : (
                                                <span class="table-td-product-pl-6">{row.col4}</span>
                                            )}

                                        </td>
                                        <td
                                            className="table-td-product-pl-5"
                                            onClick={() => dataDetail.status === "Active" ? handleRowClick(row.detailId) : null}
                                        >

                                            {row.isEditing ? (
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <input
                                                        type="text"
                                                        className={`form-control table-td-product-pl-5 ${row.detailId === focusedRowId ? 'focused' : ''}`}
                                                        value={row.col5}
                                                        onChange={(e) => {
                                                            // Kiểm tra nếu giá trị nhập vào không phải là số từ 0 đến 9, thì không cho phép cập nhật giá trị
                                                            if (/^[0-9]*$/.test(e.target.value)) {
                                                                handleInputChange(e, row.detailId, 'col5', e.target.value);
                                                            }
                                                        }}
                                                        onBlur={() => handleRowBlur(row.detailId)}
                                                        onFocus={() => handleFocus(row.detailId)}
                                                        pattern="[0-9]*" // Chỉ cho phép nhập số từ 0 đến 9
                                                        inputMode="numeric" // Chế độ nhập số
                                                    />

                                                    <FontAwesomeIcon icon={faTrashCan} onClick={() => handleDeleteRow(row)} className={`size-24 ml-2  icon-delete pointer `} />
                                                </div>
                                            ) : (
                                                <span class="table-td-product-pl-6">{row.col5}</span>
                                            )}

                                        </td>

                                    </tr>
                                ))
                            ) :
                                <tr>
                                    <td colspan={6} style={{ textAlign: 'center' }}><div>{lang["No data avasilable"]}</div></td>
                                </tr>
                            }
                        </tbody>
                    </table>
                }
            </div>
        </>
    );
}

export default EditableTable;
