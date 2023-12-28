import { useState, useEffect, useRef, React } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMaximize, faMinimize, faDownload, faCompress, faChartBar, faFileMedical, faPlusCircle, faCirclePlus, faAngleDown, faEllipsisVertical, faPlusSquare, faPaperPlane, faPaperclip, faAngleLeft, faTrashCan, faShareSquare } from '@fortawesome/free-solid-svg-icons';
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
        { id: 1, col1: '', col2: '', col3: '', col4: '', col5: '', isEditing: false },
    ]);

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

    // console.log(50, data)

    const dataProduct = props.data
    const dataStateUpdate = props.stateUpdate

    const mappedArray = dataProduct?.map(item => ({
        "col1": item["2SN"],
        "col2": item["1SV"],
        "col3": item["1HV"],
        "col4": item["1FV"],
        "col5": item["10Q"],
    }));

    useEffect(() => {
        if (dataStateUpdate) {
            setData(mappedArray)
        }
    }, [props]);

    const [selectedRowId, setSelectedRowId] = useState(null);

    function isInitialData(data) {
        return data.length === 1 && data[0].id === 1 &&
            Object.keys(data[0]).every(key => key === 'id' || data[0][key] === '');
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const fileType = file.name.split('.').pop();

        const reader = new FileReader();
        reader.onload = (e) => {
            if (fileType === 'csv') {
                Papa.parse(e.target.result, {
                    complete: (result) => {
                        console.log(80, result.data)
                        const convertedData = convertArrayToObjects(result.data);

                        let newData = convertArrayToObjects(result.data);
                        newData = updateIdsForNewData(newData);

                        // Loại bỏ dữ liệu khởi tạo trống nếu có
                        const filteredData = data.filter(item => item.col1 || item.col2 || item.col3 || item.col4 || item.col5);

                        setData([...data, ...newData]);
                        props.onDataUpdate([...data, ...newData]);
                        console.log('Converted CSV Data:', convertedData);
                        // Xử lý dữ liệu CSV ở đây
                    }
                });
            } else if (fileType === 'xlsx' || fileType === 'xls') {
                const bstr = e.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const dataFile = XLSX.utils.sheet_to_json(ws);
                const convertedData = convertKeys(dataFile);
                let newData = convertKeys(dataFile);
                newData = updateIdsForNewData(newData);

                // Loại bỏ dữ liệu khởi tạo trống nếu có
                const filteredData = data.filter(item => item.col1 || item.col2 || item.col3 || item.col4 || item.col5);

                setData([...data, ...newData]);
                props.onDataUpdate([...data, ...newData]);
                console.log('Converted Excel Data:', convertedData);
                // Xử lý dữ liệu Excel ở đây
            }
            event.target.value = '';
        };
        if (fileType === 'csv') {
            reader.readAsText(file);
        } else if (fileType === 'xlsx' || fileType === 'xls') {
            reader.readAsBinaryString(file);
        }
    }

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

    const addRow = () => {
        const newRow = { id: 'id' + data.length + 1, col1: '', col2: '', col3: '', col4: '', col5: '', isEditing: false };
        setData([...data, newRow]);

        props.onDataUpdate([...data, newRow]);
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
            props.onDataUpdate(data);
        }, 100);
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
                <h5>{lang["PRODUCT INFORMATION"]}</h5>
                {/* <FontAwesomeIcon icon={faPlusSquare} onClick={() => addRow()} className={`size-24 ml-auto  icon-add pointer `} title={lang["ADD PRODUCT INFORMATION"]} /> */}
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
                                <th style={{ width: "150px" }}>QUANTITY</th>
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
                                                spellCheck="false"
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
                                                spellCheck="false"
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
                                                spellCheck="false"
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
                                                spellCheck="false"
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
                                                        if (/^[0-9]*$/.test(e.target.value)) {
                                                            handleInputChange(row.id, 'col5', e.target.value);
                                                        }
                                                    }}
                                                    onBlur={() => handleRowBlur(row.id)}
                                                    onFocus={() => handleFocus(row.id)}
                                                    pattern="[0-9]*"
                                                    inputMode="numeric"
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
