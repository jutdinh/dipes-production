import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faDownload, faSquarePlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import StatisTable from '../statistic/table_chart'
import Swal from 'sweetalert2';
import ReactECharts from 'echarts-for-react';
import $ from 'jquery'
import XLSX from 'xlsx-js-style';
import { PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, AreaChart, Area, ComposedChart, ScatterChart, Scatter } from 'recharts';

const RECORD_PER_PAGE = 10

export default (props) => {
    const { lang, proxy, auth, pages, functions, socket } = useSelector(state => state);
    const { openTab, renderDateTimeByFormat } = functions
    const { project_id, version_id, url } = useParams();
    const _token = localStorage.getItem("_token");
    const { formatNumber } = functions
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser) || {}
    const username = _user.username === "administrator" ? "" : _user.username;
    const page = props.page
    const [isActivated, setIsActivated] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [enableNext, setEnableNext] = useState(false)
    const [enable, setEnable] = useState(false)
    const [enableSave, setEnableSave] = useState(false)
    const [dataKey, setDatKey] = useState({})
    const [apiDataName, setApiDataName] = useState([])
    const [data, setData] = useState({});
    const [dataFile, setDataFile] = useState({})

    const [reason, setReason] = useState("")
    const [showModal, setShowModal] = useState(false);

    const fileInputRef = useRef();
    const isEmptyObject = (obj) => Object.keys(obj).length === 0;

    const handleReStep = (e) => {
        setCurrentStep(1);
        handleCloseModal()
    }

    const handleNextStep = (e) => {
        e.preventDefault();
        setCurrentStep(3);

        const requestBody = {
            ...dataFile,
            reason: reason,
            customer: username,
        }
        console.log(requestBody)
        fetch(`${proxy()}${page?.components?.[0]?.api_post}`, {
            method: "POST",
            headers: {
                Authorization: _token,
                "content-type": "application/json"
            },
            body: JSON.stringify(requestBody)
        })
            .then(res => res.json())
            .then(res => {

                const { keyLicense, success } = res;
                console.log(res)
                if (success) {
                    Swal.fire({
                        title: lang["success"],
                        text: lang["success create key"],
                        icon: "success",
                        showConfirmButton: false,
                        timer: 2000,
                    });
                    setDatKey(keyLicense)
                }
                // socket.emit("/dipe-production-new-data-added", dataSubmit);
            })
            .catch(error => {

            });
    };

    // Check input Seiral Number
    const [errorMessage, setErrorMessage] = useState('');
    const [isFocused, setIsFocused] = useState([]);
    const setErrorMessageForPrinthead = (index, message) => {
        let newErrorMessages = [...errorMessage];
        newErrorMessages[index] = message;
        setErrorMessage(newErrorMessages);
    };

    const [fileName, setFileName] = useState('');
    const [fileError, setFileError] = useState('');

    const [controllerData, setControllerData] = useState(null);
    const [printheadsData, setPrintheadsData] = useState([]);

    const handleFileChange = (event) => {

        const file = event.target.files[0];
        if (event.target.files.length > 0) {
            setFileName(event.target.files[0].name);
        }

        if (file) {
            // Kiểm tra phần mở rộng của tệp
            if (file.name.split('.').pop() !== 'txt') {
                setFileError(`${lang["error.file"]}`);
                return;
            } else {
                setFileError('')
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target.result;
                let parsedContent;
                try {
                    parsedContent = JSON.parse(fileContent);
                } catch (error) {
                    setFileError(`${lang["correct format"]}`);
                    return;
                }

                // Cập nhật điều kiện kiểm tra, chấp nhận printhead không có key
                if (
                    !parsedContent.controller ||
                    typeof parsedContent.controller.key !== 'string' ||
                    typeof parsedContent.controller.serialNumber !== 'string' ||
                    parsedContent.controller.serialNumber === '' // Kiểm tra nếu serialNumber của controller rỗng
                ) {
                    // setFileError(`${lang["correct format"]}`);
                    $('#modalTrigger').click();
                } else if (
                    Array.isArray(parsedContent.printhead) &&
                    !parsedContent.printhead.every(printhead =>
                        (printhead.key && typeof printhead.serialNumber === 'string' && printhead.serialNumber !== '') || // nếu có key thì serialNumber phải không rỗng
                        (!printhead.key) // không có key là hợp lệ
                    )
                ) {
                    // Nếu một printhead nào đó có key nhưng không có serialNumber, hiển thị lỗi
                    // setFileError(`${lang["correct format"]}`);
                    $('#modalTrigger').click();
                }

                // Lọc printhead có key rỗng
                const validPrintheads = parsedContent.printhead.filter(ph => ph.key);

                setControllerData(parsedContent.controller);
                setPrintheadsData(parsedContent.printhead); // Cập nhật state với danh sách đã lọc

                const transformedData = {
                    data: {
                        ...parsedContent,
                        printhead: validPrintheads, // Cập nhật dữ liệu đã transform với danh sách đã lọc
                    }
                };
                setDataFile(transformedData);
                setEnableNext(true);
            };

            reader.readAsText(file);
        }
    };

    // const areAllSerialNumbersEmpty = () => {
    //     if (controllerData.serialNumber) return false;
    //     for (let printhead of printheadsData) {
    //         if (printhead.serialNumber) return false;
    //     }
    //     return true;
    // };

    const updateSerialNumber = (index, value) => {
        if (index === -1) { // Cập nhật cho controller
            const updatedControllerData = { ...controllerData, serialNumber: value };
            setControllerData(updatedControllerData);
        } else { // Cập nhật cho printhead cụ thể
            const updatedPrintheadsData = printheadsData.map((printhead, currentIndex) => {
                if (currentIndex === index && printhead.key) {
                    return {
                        ...printhead,
                        serialNumber: value
                    };
                }
                return printhead;
            });
            setPrintheadsData(updatedPrintheadsData);
        }
    };

    // Cập nhật trạng thái nút lưu
    const areSerialNumbersValid = (data) => {
        for (const item of data) {
            if (item.key && !item.serialNumber) {
                // Nếu "key" không rỗng nhưng "serialNumber" rỗng
                return false;
            }
            // Nếu "key" rỗng, chúng ta không kiểm tra "serialNumber"
        }
        return true; // Tất cả "serialNumber" của đối tượng có "key" không rỗng đều hợp lệ
    };

    const isControllerValid = (controller) => {
        return controller?.serialNumber;
    };

    useEffect(() => {
        const isValidPrintHead = areSerialNumbersValid(printheadsData);
        const isValidController = isControllerValid(controllerData);

        console.log(isValidPrintHead)
        console.log(isValidController)

        if (isValidController && isValidPrintHead) {
            setEnableSave(false)

        } else {
            setEnableSave(true)
        }
        const updatedDataFile = {
            data: {
                controller: controllerData,
                printhead: printheadsData
            }
        };
        setDataFile(updatedDataFile);
    }, [controllerData, printheadsData])

    const handleUpdate = () => {
        // Cập nhật cho controller
        const controllerInput = document.getElementById('controllerSerialNumber');
        const updatedControllerData = { ...controllerData, serialNumber: controllerInput.value };
        setControllerData(updatedControllerData);

        // Cập nhật cho printheads
        const newPrintheadsData = printheadsData.map((printhead, index) => {
            const printheadInput = document.getElementById(`printheadSerialNumber_${index}`);
            if (printheadInput) {
                printhead.serialNumber = printheadInput.value;
            }
            return printhead;
        });
        setPrintheadsData(newPrintheadsData);


        const validPrintheads = newPrintheadsData.filter(ph => ph.key);
        // cập nhật dataFile 
        const updatedDataFile = {
            data: {
                controller: controllerData,
                printhead: printheadsData
            }
        };
        setDataFile(updatedDataFile);
    };

    const handleCloseModal = () => {
        // Reset trạng thái
        setFileName('');
        setFileError('');
        setDataFile({});
        setControllerData({})
        setPrintheadsData([])
        setEnableNext(false)
        console.log("hehe")
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        if (page && page.components) {
            // const id_str = page.components?.[0]?.api_post.split('/')[2];
            const id_str = page.components?.[0]?.api_get.split('/')[2];
            // console.log(id_str)
            fetch(`${proxy()}/apis/api/${id_str}/input_info`, {
                headers: {
                    Authorization: _token
                }
            })
                .then(res => res.json())
                .then(res => {
                    const { data, success, content } = res;
                    console.log(res)
                    if (success) {

                        setApiDataName(data.fields)
                        // setDataTableID(data.tables[0].id)
                        // setDataFields(data.body)
                        // setLoaded(true)
                    }
                })
        }
    }, [page])
console.log(_token)
    const submit = () => {
        const requestBody = {
            ...dataFile,
            reason: reason,
            customer: username,
            username: "MLG_ITC"

        }
        console.log(requestBody)
        fetch(`${proxy()}${page?.components?.[0]?.api_get}`, {
            method: "POST",
            headers: {
                Authorization: _token,
                "content-type": "application/json"
            },
            body: JSON.stringify(requestBody)
        })
            .then(res => res.json())
            .then(res => {

                const { data, success, content } = res;
                console.log(res)
                if (success) {
                    if (data && Object.keys(data).length > 0) {
                        setData(data)
                        setCurrentStep(2);
                        setEnable(true)
                    }
                    // Ghi log
                    fetch(`${proxy()}/logs/save/import/devices/json`, {
                        method: "POST",
                        headers: {
                            Authorization: _token,
                            "content-type": "application/json"
                        },
                        body: JSON.stringify(requestBody)
                    })
                        .then(res => res.json())
                        .then(res => {
            
                            const { data, success, content } = res;
                            console.log(res)
                            
                        })
                        .catch(error => {
                            // Xử lý lỗi nếu cần
                        });
                }
                // socket.emit("/dipe-production-new-data-added", dataSubmit);
            })
            .catch(error => {
                // Xử lý lỗi nếu cần
            });

    };

    const renderData = (field, data) => {
        if (data) {
            switch (field.DATATYPE) {
                case "DATE":
                case "DATETIME":
                    // console.log(renderDateTimeByFormat(data[field.fomular_alias], field.FORMAT))
                    // return renderDateTimeByFormat(data[field.fomular_alias], field.FORMAT);
                    return data[field.fomular_alias];
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
        } else {
            return "Invalid value"
        }
    };

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
    const current = data.printhead
    console.log(current)
    const getCurrentFormattedDate = () => {
        const date = new Date();
        const year = String(date.getFullYear()).slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}_${hours}${minutes}${seconds}`;
    };

    const exportLicense = () => {
        const blob = new Blob([dataKey], { type: 'text/plain' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `${getCurrentFormattedDate()}_License.lic`; // Năm tháng ngày_ Giờ phút giây 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <>
            <div class="col-md-12">
                <div class="white_shd full">
                    <div class="tab_style2 layout2">
                        <div class="tabbar">
                            <nav>
                                <div className="nav nav-tabs" style={{ borderBottomStyle: "0px" }} >
                                    <div class="full graph_head_cus d-flex">
                                        <div class="heading1_cus margin_0 nav-item nav-link ">
                                            <h5>{page?.components?.[0]?.component_name}</h5>
                                            <div id="modalTrigger" class="ml-4 mt-2 pointer" data-toggle="modal" data-target="#file" ></div>
                                        </div>
                                    </div>
                                </div>
                            </nav>
                        </div>
                    </div>
                    {/* Modal Add File  */}
                    <div class="modal no-select-modal" id="file" >
                        <div class="modal-dialog modal-lg modal-dialog-center" role="document">
                            <div class="modal-content p-md-3">
                                <div class="modal-header">
                                    <h4 class="modal-title">{lang["update.config"]} </h4>

                                    <button class="close" type="button" onClick={handleCloseModal} data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <div class="row">
                                            {/* Thông tin Controller */}
                                            <div class="col-md-12">
                                                <h5>Controller</h5>
                                                <div class="form-group">
                                                    <label >UUID: {controllerData?.key}</label><br />
                                                    <div class="input-group">
                                                        <label for="controllerSerialNumber" class="input-group-text">
                                                            Serial Number
                                                        </label>
                                                        <input
                                                            type="text"
                                                            class="form-control"
                                                            id="controllerSerialNumber"
                                                            placeholder={lang["enter serialnumber"]}
                                                            value={controllerData?.serialNumber || ''}
                                                            // readOnly

                                                            onChange={(e) => {
                                                                const upperValue = e.target.value.toUpperCase();
                                                                // Chỉ cho phép ký tự in hoa và số
                                                                const regex = /^[A-Z0-9]*$/;
                                                                if (regex.test(upperValue) && upperValue.length <= 15) {
                                                                    updateSerialNumber(-1, upperValue);
                                                                    setErrorMessageForPrinthead(-1, ''); // Clear any existing error message
                                                                } else {
                                                                    setErrorMessageForPrinthead(-1, 'Chỉ được nhập ký tự từ A-Z và số từ 0-9');
                                                                }
                                                            }}
                                                            maxLength="15"
                                                            onKeyPress={(e) => {
                                                                if (e.key === ' ') {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        />


                                                    </div>
                                                    <div style={{ height: "10px" }}>
                                                        {errorMessage[-1] && <div style={{ color: 'red' }}>{errorMessage[-1]}</div>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Thông tin Printheads */}
                                            <div class="col-md-12 mt-2">
                                                <h5>Print Heads</h5>
                                                {
                                                    (() => {
                                                        let validPrintheadCount = 0;
                                                        return printheadsData.map((printhead, index) => {
                                                            validPrintheadCount++;
                                                            if (printhead.key) {

                                                                return (
                                                                    <div key={index}>
                                                                        <label class="font-weight-bold">Print Head {validPrintheadCount}</label><br />
                                                                        <div class="form-group">
                                                                            <label>UUID: {printhead.key}</label><br />

                                                                            <div class="input-group">
                                                                                <label for="printheadSerialNumber" class="input-group-text">
                                                                                    Serial Number
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    class="form-control"
                                                                                    id={`printheadSerialNumber_${index}`}
                                                                                    placeholder={lang["enter serialnumber"]}
                                                                                    value={printhead?.serialNumber || ''}
                                                                                    onChange={(e) => {
                                                                                        // Chuyển ký tự nhập vào thành chữ in hoa
                                                                                        const upperValue = e.target.value.toUpperCase();

                                                                                        // Kiểm tra ký tự chỉ cho phép in hoa và số
                                                                                        const regex = /^[A-Z0-9]*$/;
                                                                                        if (regex.test(upperValue) && upperValue.length <= 15) {
                                                                                            updateSerialNumber(index, upperValue);  // Cập nhật giá trị đã được chuyển thành chữ in hoa
                                                                                            setErrorMessageForPrinthead(index, ''); // Xóa tất cả các lỗi
                                                                                        } else {
                                                                                            setErrorMessageForPrinthead(index, 'Chỉ được nhập ký tự từ A-Z và số từ 0-9');
                                                                                        }
                                                                                    }}
                                                                                    onBlur={() => {
                                                                                        setErrorMessageForPrinthead(index, ''); // Xóa lỗi khi dừng focus
                                                                                    }}
                                                                                    maxLength="15"
                                                                                    onKeyPress={(e) => {
                                                                                        if (e.key === ' ') {
                                                                                            e.preventDefault();
                                                                                        }
                                                                                    }}
                                                                                />

                                                                            </div>
                                                                            <div style={{ height: "15px" }}>
                                                                                {errorMessage[index] && <div style={{ color: 'red' }}>{errorMessage[index]}</div>}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            } else {
                                                                return (
                                                                    // <div key={index}>
                                                                    //     <div class="form-group">
                                                                    //         <label class="font-weight-bold mt-2 mb-2">Print Head {validPrintheadCount}: Not Connect</label><br />
                                                                    //     </div>
                                                                    // </div>
                                                                    null
                                                                );
                                                            }
                                                        }).filter(Boolean);  // filter out the nulls
                                                    })()
                                                }
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" onClick={handleUpdate} style={{ minWidth: "100px" }} data-dismiss="modal" disabled={enableSave ? true : false} class="btn btn-success" title={lang["btn.update"]}>{lang["btn.update"]}</button>
                                    <button type="button" onClick={handleCloseModal} style={{ minWidth: "100px" }} data-dismiss="modal" class="btn btn-danger" title={lang["btn.close"]}>{lang["btn.close"]}</button>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="table_section padding_infor_info_layout2 ">
                        <div class="col-md-12">
                            <div class="tab-content">
                                <div className="container justify-content-center mt-3">
                                    <div className="step-indicator mlr-5">
                                        <ul className="step-list">

                                            <li className={`step-item ${currentStep === 1 ? "step-active" : ""} step-arrow-right`}>
                                                <a className="step-link">{lang["step"]} 1: {lang["upload file"]}</a>
                                            </li>

                                            <li className={`step-item ${currentStep === 2 ? "step-active" : ""} step-arrow-both`}>
                                                <a className="step-link">{lang["step"]} 2: {lang["get data"]}</a>
                                            </li>

                                            <li className={`step-item ${currentStep === 3 ? "step-active" : ""} step-arrow-left-flat-right`}>
                                                <a className="step-link">{lang["step"]} 3: {lang["get result"]}</a>
                                            </li>

                                        </ul>
                                    </div>
                                    {currentStep === 1 && (
                                        <div class="row justify-content-center mt-3">

                                            <div class="col-md-12 p-20">
                                                <div id="step1">

                                                    <div className="form-group mt-4">
                                                        <div className="upload-container">
                                                            <input
                                                                type="file"
                                                                className="input-file"
                                                                accept=".txt"
                                                                onChange={handleFileChange}
                                                                onClick={handleCloseModal}
                                                                ref={fileInputRef}
                                                            />
                                                            <div className="icon">
                                                                📄
                                                            </div>
                                                            <button className="upload-button">
                                                                {lang["upload file"]}
                                                            </button>
                                                            <label class="mt-2" style={{ minHeight: "20px" }}>
                                                                {!fileError ? fileName : ''}
                                                                {fileError && <div className="error-text">{fileError}</div>}
                                                            </label>

                                                        </div>
                                                    </div>

                                                    <div class="form-group">
                                                        <label for="serialNumber">Reason</label>
                                                        <input
                                                            type="text"
                                                            class="form-control"
                                                            placeholder=""
                                                            value={reason}
                                                            onChange={(e) => setReason(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="button-group">
                                                        <button onClick={submit} style={{ minWidth: "100px" }} className="btn btn-primary" disabled={!enableNext}>{lang["next"]}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <>
                                            <div class="row justify-content-center mt-3">
                                                <div class="col-md-12 p-20">
                                                    <div class="table-responsive">
                                                        <>
                                                            <div style={{ overflowX: 'auto' }}>
                                                                <table className={"table"} style={{ marginBottom: "10px", width: '100%' }}>
                                                                    <thead>
                                                                        <tr className="color-tr">
                                                                            <th className="font-weight-bold" style={{ width: "50px" }} scope="col">Key</th>
                                                                            <th className="font-weight-bold" style={{ width: "100px" }} scope="col">Value</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {apiDataName?.map((header, index) => {
                                                                            const key = header.display_name ? header.display_name : header.field_name;
                                                                            let value = data.controller[header.fomular_alias];

                                                                            if (value === undefined || value === null || value === '') {
                                                                                value = lang["no data"];
                                                                            }

                                                                            return (
                                                                                <tr key={index}>
                                                                                    <td>{key}</td>
                                                                                    <td>{value}</td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </>
                                                    </div>
                                                </div>
                                                { // Điều kiện hiển thị
                                                    !isEmptyObject(data.controller) && (
                                                        <div className="col-md-12 p-20">
                                                            <div className="table-responsive">
                                                                <>
                                                                    <div style={{ overflowX: 'auto' }}>
                                                                        <table className={"table"} style={{ marginBottom: "10px", width: '100%' }}>
                                                                            <thead>
                                                                                <tr className="color-tr">
                                                                                    <th className="font-weight-bold" style={{ minWidth: "100px" }}>{lang["log.no"]}</th>
                                                                                    {apiDataName?.map((header, index) => (
                                                                                        <th key={index} className="font-weight-bold" style={{ minWidth: "200px" }}>
                                                                                            {header.display_name ? header.display_name : header.field_name}
                                                                                        </th>
                                                                                    ))}
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {(() => {
                                                                                    const printheadIndices = [];
                                                                                    current.forEach((row, index) => {
                                                                                        if (Object.keys(row).length > 0) {
                                                                                            printheadIndices.push(index + 1);
                                                                                        }
                                                                                    });

                                                                                    let printheadCounter = 0;
                                                                                    return current.map((row, index) => {
                                                                                        if (Object.keys(row).length > 0) {
                                                                                            return (
                                                                                                <tr key={index}>
                                                                                                    <td className="cell">{`Printhead ${printheadIndices[printheadCounter++]}`}</td>
                                                                                                    {apiDataName?.map((header) => (
                                                                                                        <td key={header.fomular_alias} className="cell">{renderData(header, row)}</td>
                                                                                                    ))}
                                                                                                </tr>
                                                                                            )
                                                                                        } else {
                                                                                            return (
                                                                                                <tr>
                                                                                                    <td class="font-weight-bold cell" colspan={`${apiDataName.length + 2}`} style={{ textAlign: 'center' }}><div>{lang["not found"]}</div></td>
                                                                                                </tr>
                                                                                            )
                                                                                        }
                                                                                    })
                                                                                })()}
                                                                            </tbody>

                                                                        </table>
                                                                    </div>
                                                                </>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                <div className="col-md-12 p-20">
                                                    <div className="button-group">
                                                        <button onClick={handleReStep} style={{ minWidth: "100px" }} className="btn btn-info mr-2">{lang["back"]}</button>
                                                        {enable && (

                                                            <button onClick={handleNextStep} style={{ minWidth: "100px" }} className="btn btn-primary" disabled={isEmptyObject(data.controller)} title={lang["export to file"]}>{lang["create key"]}</button>

                                                        )
                                                        }
                                                    </div>


                                                </div>



                                            </div>
                                        </>
                                    )}
                                    {currentStep === 3 && (
                                        <>
                                            <div class="row justify-content-center mt-3">

                                                <div class="col-md-12 p-20">
                                                    <div id="step1">


                                                        <div className="form-group">
                                                            <label class="font-weight-bold">Key License</label>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <input
                                                                    type="text"

                                                                    className="form-control cell-key"
                                                                    value={!isEmptyObject(dataKey) ? dataKey : ''}
                                                                    style={{ marginRight: '10px' }}
                                                                    readOnly
                                                                />
                                                                <button className="btn btn-primary" style={{ minWidth: "100px" }} onClick={exportLicense} title={lang["export to file"]}>
                                                                    <i class="fa fa-download mr-2 size-18 pointer" aria-hidden="true"></i>
                                                                    Export
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}