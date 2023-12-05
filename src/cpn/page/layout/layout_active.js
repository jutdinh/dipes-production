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
    const storedPwdString = localStorage.getItem("password_hash");


    // const a = localStorage.getItem("username");
    // const b = localStorage.getItem("password_hash");
    // const c = localStorage.getItem("password");
    // const d = localStorage.getItem("remember_me");
    // console.log(a)
    // console.log(b)
    // console.log(c)
    // console.log(d)
    // console.log(storedPwdString)


    const username = _user.username === "administrator" ? "" : _user.username;
    const page = props.page
    const [isActivated, setIsActivated] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [enableNext, setEnableNext] = useState(false)
    const [enable, setEnable] = useState(false)
    const [checkDataValidityDataRespon, setCheckDataValidity] = useState(false)
    const [notificationErrorInfo, setNotificationErrorInfo] = useState('');
    const [enableSave, setEnableSave] = useState(false)
    const [dataKey, setDatKey] = useState({})
    const [apiDataName, setApiDataName] = useState([])
    const [data, setData] = useState({});
    const [error, setError] = useState([]);
    console.log(error)
    console.log(data)
    const [dataFile, setDataFile] = useState({})

    const [reason, setReason] = useState("")
    const [showModal, setShowModal] = useState(false);
    const [loadingCreateKey, setLoadingCreatekey] = useState(false);
    const fileInputRef = useRef();
    const isEmptyObject = (obj) => {
        return obj == null || Object.keys(obj).length === 0;
    };
    const handleDragStart = (e) => {
        e.preventDefault();
    };
    function goBack() {

        setCurrentStep(1);
    }

    const handleReStep = (e) => {
        setCurrentStep(1);
        handleCloseModal()
    }

    const handleNextStep = (e) => {
        e.preventDefault();
        setCurrentStep(3);
        setLoadingCreatekey(true)
        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            ...dataFile,
            reason: reason
        }
        // console.log(requestBody)
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
                // console.log(res)
                if (success) {
                    Swal.fire({
                        title: lang["success"],
                        text: lang["success create key"],
                        icon: "success",
                        showConfirmButton: false,
                        timer: 2000
                    }).then((result) => {
                        if (result.isConfirmed) {

                            document.getElementById("step3").style.display = "block";
                        }
                    });
                    setDatKey(keyLicense);
                    setLoadingCreatekey(false);
                } else {
                    Swal.fire({
                        title: lang["faild"],
                        text: lang["faild create key"],
                        icon: "error",
                        showConfirmButton: true,
                        confirmButtonText: lang["back"],
                        // cancelButtonText: lang["btn.cancel"],
                        // showCancelButton: true,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            goBack();
                        }
                    });
                }


                // socket.emit("/dipe-production-new-data-added", dataSubmit);
            })
            .catch(error => {

            });
    };
    // Error

    function checkErrors(data, errors) {
        let errorMessages = {
            'ERROR0': lang["ERROR0"],
            'ERROR1':  lang["ERROR1"],
            'ERROR2':  lang["ERROR2"],
            'ERROR3':  lang["ERROR3"]
        };
    
        let resultErrors = [];
    
        // Kiểm tra lỗi của controller
        if (data?.controller !== null && errors[0] !== 'ERROR0') {
            resultErrors.push(`Controller: ${errorMessages[errors[0]] || lang["Unknown error"]}`);
        }
    
        // Kiểm tra lỗi của printhead
        if (data?.printhead !== null) {
            data?.printhead?.forEach((head, index) => {
                let printheadErrorIndex = index + 1; // Chỉ số tương ứng trong mảng errors
                if (printheadErrorIndex < errors.length && errors[printheadErrorIndex] !== 'ERROR0') {
                    resultErrors.push(`Printhead ${index + 1}: ${errorMessages[errors[printheadErrorIndex]] || lang["Unknown error"]}`);
                }
            });
        }
    
        // Kiểm tra lỗi của printer
        if (data?.printer !== null && data?.controller === null && data?.printhead === null) {
            errors.forEach((error, index) => {
                if (error !== 'ERROR0') {
                    resultErrors.push(`Printer: ${errorMessages[error] || lang["Unknown error"]}`);
                }
            });
        }
    
        return resultErrors;
    }
    
    
    

    let errorList = checkErrors(data, error);
    console.log(errorList)
    function isNoError(errorList) {
        // Kiểm tra nếu mảng rỗng hoặc tất cả các lỗi là 'ERROR0'
        return errorList.length === 0 || errorList.every(error => error === 'ERROR0');
    }

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
        // console.log(file)
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
                    // console.log(error)
                    setFileError(`${lang["correct format"]}`);
                    return;
                }
                // console.log(parsedContent)
                if (
                    !Array.isArray(parsedContent.printhead) || // Đảm bảo printhead là một mảng
                    parsedContent.printhead.every(printhead =>
                        (printhead.key === "" && printhead.serialNumber === "") && // Nếu `key` rỗng thì `serialNumber` cũng phải rỗng
                        (parsedContent.controller.key === '' && parsedContent.controller.serialNumber === '')
                    )
                ) {
                    setFileError(`${lang["correct format"]}`);
                    return;
                }



                //  // // Kiểm tra cấu trúc của controller
                // if (!parsedContent.controller ||
                //     !parsedContent.controller.key||
                //     typeof parsedContent.controller.key !== 'string' ||
                //     !parsedContent.controller.serialNumber||
                //     typeof parsedContent.controller.serialNumber !== 'string' 

                //     ) {
                //     setFileError(`${lang["correct format"]}`);
                //     return;
                // }



                //  // // Kiểm tra cấu trúc của controller
                if (
                    !parsedContent.controller || parsedContent.controller.key === undefined || parsedContent.controller.serialNumber === undefined
                ) {
                    setFileError(`${lang["correct format"]}`);
                    // console.log("Lỗi controller")
                    return;
                }
                // Kiểm tra cấu trúc của printhead
                if (
                    !Array.isArray(parsedContent.printhead) || // Đảm bảo printhead là một mảng
                    !parsedContent.printhead.every(printhead =>
                        typeof printhead === 'object' &&
                        printhead.key !== undefined &&
                        printhead.serialNumber !== undefined &&
                        (printhead.key !== "" || printhead.serialNumber === "") &&
                        (printhead.serialNumber === "" || typeof printhead.serialNumber === 'string')
                    )
                ) {
                    setFileError(`${lang["correct format"]}`);
                    return;
                }
                // Kiểm tra cấu trúc của controller & printhead để add serialNumber
                if (
                    !parsedContent.controller ||
                    typeof parsedContent.controller.key !== 'string' ||
                    typeof parsedContent.controller.serialNumber !== 'string' ||
                    parsedContent.controller.key !== '' && parsedContent.controller.serialNumber === '' // Kiểm tra nếu serialNumber của controller rỗng
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

        if (controller?.key === "" && controller?.serialNumber === "") {
            return true
        } else {
            return controller?.serialNumber;
        }

    };

    useEffect(() => {
        const isValidPrintHead = areSerialNumbersValid(printheadsData);
        const isValidController = isControllerValid(controllerData);

        // console.log(isValidPrintHead)
        // console.log(isValidController)

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
        // console.log(controllerInput);

        if (controllerInput !== null) {
            const updatedControllerData = { ...controllerData, serialNumber: controllerInput.value };
            setControllerData(updatedControllerData);
        }


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

        // if (controllerData.serialNlength < 8) {
        //     setErrorMessageForPrinthead(-1, lang["error.number"]);
        //     return

        // }
        // $('#closeModal').click()


    };

    const handleCloseModal = () => {
        // Reset trạng thái
        setFileName('');
        setFileError('');
        setDataFile({});
        setControllerData({})
        setPrintheadsData([])
        setEnableNext(false)
        // console.log("hehe")
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
                    // console.log(res)
                    if (success) {

                        setApiDataName(data.fields)
                        // setDataTableID(data.tables[0].id)
                        // setDataFields(data.body)
                        // setLoaded(true)
                    }
                })
        }
    }, [page])
    // console.log(_token)

    const submit = () => {
        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            ...dataFile,
            reason: reason,

        }
        // console.log(requestBody)
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

                const { data, success, error, content } = res;
                console.log(res)
                if (success) {
                    if (data && Object.keys(data).length > 0) {
                        setData(data)
                        setError(error)
                        setCheckDataValidity(checkDataValidity(dataFile, data))

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
                            // console.log(res)

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
    // console.log(current)
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

        // const content = Object.keys(dataKey).length === 0 ? 'null' : JSON.stringify(dataKey);  //Check dataKey

        const blob = new Blob([dataKey], { type: 'text/plain' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `${getCurrentFormattedDate()}_License.lic`; // Năm tháng ngày_ Giờ phút giây 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    function checkDataValidity(dataFile, dataResponse) {
        // Kiểm tra nếu cả dataFile và dataResponse có tồn tại
        if (!dataFile?.data) {
            // console.log('Lỗi: Thiếu dataFile hoặc dataFile không có thuộc tính dữ liệu.');
            setNotificationErrorInfo('Lỗi: Thiếu dataFile hoặc dataFile không có thuộc tính dữ liệu.');
            return false;
        }

        if (!dataResponse) {
            // console.log('Lỗi: Thiếu dataResponse.');
            return false;
        }

        // Kiểm tra sự tồn tại của các trường cần thiết trong dataFile
        const fileController = dataFile.data.controller;
        const filePrintheads = dataFile.data.printhead;

        // Trường hợp dataResponse chỉ có printer có dữ liệu và controller và printhead là null
        // Kiểm tra nếu dataResponse có controller và printhead là null
        if (dataResponse.controller === null && dataResponse.printhead === null) {
            // Kiểm tra nếu dataResponse có printer
            if (dataResponse.printer) {
                // Từ dataResponse.printer, lấy ra các giá trị '1U' và '10S'
                const printerKeys = dataResponse.printer['1U'].split(', ').filter(key => key);
                const printerSerialNumbers = dataResponse.printer['10S'].split(', ').filter(sn => sn);

                // Kiểm tra khớp thông tin từ dataFile với dataResponse.printer
                if (fileController && fileController.key && !printerKeys.includes(fileController.key)) {
                    // console.log(`Lỗi: Khóa '${fileController.key}' từ bộ điều khiển dataFile không có trong máy in dataResponse.`);

                    return false;
                }
                if (fileController && fileController.serialNumber && !printerSerialNumbers.includes(fileController.serialNumber)) {
                    // console.log(`Lỗi: Số serial '${fileController.serialNumber}' từ bộ điều khiển dataFile không có trong máy in dataResponse.`);
                    return false;
                }

                // Nếu tất cả các printhead trong dataFile có key và serialNumber rỗng, và dataResponse không có printhead, hàm sẽ trả về true
                if (filePrintheads.every(printhead => printhead.key === "" && printhead.serialNumber === "")) {
                    return true;
                }
            } else {
                // console.log('Lỗi: dataResponse không có thông tin printer khi controller và printhead là null.');
                return false;
            }
        } else {

            // Kiểm tra sự tồn tại của các trường cần thiết trong dataResponse
            if (!dataResponse.controller || dataResponse.printhead === undefined) {
                // console.log('Lỗi: dataResponse thiếu bộ điều khiển hoặc đầu in.');
                return false;
            }

            // Kiểm tra cấu trúc của controller
            if (fileController.key && !dataResponse.controller['1U']) {
                // console.log(`Lỗi: Khóa '${fileController.key}' từ bộ điều khiển dataFile không khớp với dataResponse.`);
                return false;
            }
            if (fileController.serialNumber && !dataResponse.controller['10S']) {
                // console.log(`Lỗi: Số serial '${fileController.serialNumber}' từ bộ điều khiển dataFile không khớp với dataResponse.`);
                return false;
            }

            // Kiểm tra cấu trúc của printhead
            if (Array.isArray(filePrintheads)) {
                // Nếu dataResponse.printhead là null, kiểm tra xem tất cả các printhead trong dataFile có rỗng không
                if (dataResponse.printhead === null) {
                    const allPrintheadsEmpty = filePrintheads.every(printhead => !printhead.key && !printhead.serialNumber);
                    if (!allPrintheadsEmpty) {
                        // console.log('Lỗi: Không tất cả các printhead trong dataFile đều rỗng khi dataResponse.printhead là null.');
                        return false;
                    }
                } else {
                    // Nếu dataResponse.printhead không phải là null, thực hiện các kiểm tra cụ thể hơn
                    for (let i = 0; i < filePrintheads.length; i++) {
                        const filePrinthead = filePrintheads[i];
                        const responsePrinthead = dataResponse.printhead[i];

                        if (filePrinthead.key && (!responsePrinthead || !responsePrinthead['1U'])) {
                            // console.log(`Lỗi: Khóa '${filePrinthead.key}' từ đầu in dataFile không khớp với dataResponse.`);
                            return false;
                        }
                        if (filePrinthead.serialNumber && (!responsePrinthead || !responsePrinthead['10S'])) {
                            // console.log(`Lỗi: Số serial '${filePrinthead.serialNumber}' từ đầu in dataFile không khớp với dataResponse.`);
                            return false;
                        }
                    }
                }
            }
        }
        // Tất cả các kiểm tra đều đúng
        return true;
    }

    // Hàm kiểm tra xem tất cả giá trị trong đối tượng có phải là null không
    const isAllValuesNull = (obj) => Object.values(obj).every(value => value === null);
    // Hàm kiểm tra xem tất cả giá trị trong mảng có phải là null không
    function checkAllPrintheadsNull(printheads) {
        // Trả về true ngay lập tức nếu printheads không phải là một mảng hoặc rỗng
        if (!Array.isArray(printheads) || printheads.length === 0) {
            return true;
        }

        // Kiểm tra từng printhead
        for (let printhead of printheads) {
            // Nếu printhead có ít nhất một thuộc tính không phải là null, trả về true
            if (Object.values(printhead).some(value => value !== null)) {
                return true;
            }
        }

        // Nếu tất cả printhead đều chỉ chứa giá trị null, trả về false
        return false;
    }

    const checkPrinthead = checkAllPrintheadsNull(current);

    const shouldDisplayPrintHeads = printheadsData.some(printhead =>
        printhead.key !== "" || printhead.serialNumber !== ""
    );

    // console.log(printheadsData)

    return (
        <>
            <div class="col-md-12">
                <div class="white_shd full height-82">
                    <div class="tab_style2 layout2">
                        <div class="tabbar">
                            <nav>
                                <div className="nav nav-tabs" style={{ borderBottomStyle: "0px" }} >
                                    <div class="full graph_head_cus d-flex">
                                        <div class="heading1_cus margin_0 nav-item nav-link " style={{ borderColor: "none" }}>
                                            <h5>{page?.components?.[0]?.component_name}</h5>
                                            <div id="modalTrigger" data-toggle="modal" data-target="#file" ></div>
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
                                            {controllerData?.key !== "" &&
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
                                                                        setErrorMessageForPrinthead(-1, lang["error.serial"]);
                                                                    }
                                                                }}
                                                                maxLength="15"
                                                                minLength="8"
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
                                            }
                                            {/* Thông tin Printheads */}
                                            {shouldDisplayPrintHeads ? (
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
                                                                                                setErrorMessageForPrinthead(index, lang["error.serial"]);
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
                                            ) : null
                                            }

                                        </div>
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" onClick={handleUpdate} style={{ minWidth: "100px" }} data-dismiss="modal" disabled={enableSave ? true : false} class="btn btn-success" title={lang["btn.update"]}>{lang["btn.update"]}</button>
                                    <button type="button" onClick={handleCloseModal} style={{ minWidth: "100px" }} id="closeModal" data-dismiss="modal" class="btn btn-danger" title={lang["btn.cancel"]}>{lang["btn.cancel"]}</button>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="table_section padding_infor_info_layout2 " style={{ minHeight: "80vh" }}>
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
                                                                {(data.controller && !isAllValuesNull(data.controller) || data.printer && !isAllValuesNull(data.printer)) && (
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
                                                                                let value;
                                                                                if (data.printer) {
                                                                                    value = data.printer[header.fomular_alias];
                                                                                } else if (data.controller) {
                                                                                    value = data.controller[header.fomular_alias];
                                                                                }

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
                                                                )}
                                                            </div>
                                                        </>
                                                    </div>
                                                </div>
                                                {(!isEmptyObject(data.controller) && checkPrinthead && current !== null) && (
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
                                                                        {/* <tbody>
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
                                                                        </tbody> */}
                                                                        <tbody>
                                                                            {(() => {
                                                                                const printheadIndices = [];
                                                                                current.forEach((row, index) => {
                                                                                    // Kiểm tra xem row có phần tử nào không phải là null hay không
                                                                                    const isNotEmpty = Object.values(row).some(value => value !== null && value !== '');
                                                                                    if (isNotEmpty) {
                                                                                        printheadIndices.push(index + 1);
                                                                                    }
                                                                                });

                                                                                let printheadCounter = 0;
                                                                                return current.map((row, index) => {
                                                                                    // Lại kiểm tra một lần nữa trước khi render
                                                                                    const isNotEmpty = Object.values(row).some(value => value !== null && value !== '');
                                                                                    if (isNotEmpty) {
                                                                                        return (
                                                                                            <tr key={index}>
                                                                                                <td className="cell">{`Printhead ${printheadIndices[printheadCounter++]}`}</td>
                                                                                                {apiDataName?.map((header) => (
                                                                                                    <td key={header.fomular_alias} className="cell">{renderData(header, row)}</td>
                                                                                                ))}
                                                                                            </tr>
                                                                                        );
                                                                                    }
                                                                                    //  else {
                                                                                    //     return (
                                                                                    //         <tr key={`empty-${index}`}>
                                                                                    //             <td className="font-weight-bold cell" colSpan={`${apiDataName.length + 1}`} style={{ textAlign: 'center' }}><div>{lang["not found"]}</div></td>
                                                                                    //         </tr>
                                                                                    //     );
                                                                                    // }
                                                                                });
                                                                            })()}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </>
                                                        </div>
                                                    </div>
                                                )
                                                }
                                                <div className="col-md-12 p-20 d-flex" >
                                                    <div className="error-group">
                                                        {(errorList && errorList.length > 0) &&
                                                            <>
                                                                <h6 class="title-error">{lang["Please check the activation file"]}:</h6>
                                                                {errorList?.map((err, index) => (
                                                                    <p key={index} class="list-error ml-4"> {err}</p>
                                                                ))}
                                                            </>
                                                        }
                                                    </div>
                                                    <div className="ml-auto">
                                                        <button onClick={handleReStep} style={{ minWidth: "100px" }} className="btn btn-info mr-2" title={lang["back"]}>{lang["back"]}</button>
                                                        {/* {(enable && checkDataValidityDataRespon) && (
                                                            <button onClick={handleNextStep} style={{ minWidth: "100px" }} className="btn btn-primary" disabled={isEmptyObject(data.controller) && isEmptyObject(data.printer)} title={lang["create key"]}>{lang["create key"]}</button>
                                                        )
                                                        } */}

                                                        {(enable && isNoError(errorList)) && (
                                                            <button onClick={handleNextStep} style={{ minWidth: "100px" }} className="btn btn-primary" disabled={isEmptyObject(data.controller) && isEmptyObject(data.printer)} title={lang["create key"]}>{lang["create key"]}</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {currentStep === 3 && (
                                        <>
                                            <div class="row justify-content-center mt-4">
                                                <div class="col-lg-8 col-md-10 col-sm-12 p-2">
                                                    {loadingCreateKey ?
                                                        <div class="text-center mb-4">
                                                            <img src="/images/icon/loading.gif" alt="Success" class="img-fluid size-img-success" />
                                                        </div>
                                                        : (
                                                            <div id="step3">
                                                                <div class="text-center mb-4 ">
                                                                    <img src="/images/icon/success.png" alt="Success" class="img-fluid size-img-success" onDragStart={handleDragStart} />
                                                                </div>
                                                                <div class="form-group">
                                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                        <div class="mt-3 text-muted">

                                                                            {lang["create key success"]}
                                                                        </div>
                                                                        <button className="btn btn-primary mt-3" style={{ minWidth: "100px" }} onClick={exportLicense} title={lang["export to file"]}>
                                                                            <i class="fa fa-download mr-2 size-18 pointer" aria-hidden="true"></i>
                                                                            {lang["export file"]}
                                                                        </button>
                                                                        <div class="mt-3 text-success d-none d-sm-block">
                                                                            {lang["note not share"]}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
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