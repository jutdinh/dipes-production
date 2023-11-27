
import { useParams } from "react-router-dom";

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMaximize, faMinimize, faDownload, faCompress, faChartBar, faPlusCircle, faCirclePlus, faAngleDown, faEllipsisVertical, faPlusSquare, faPaperPlane, faPaperclip, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import TableInputUpdate from './table/table-input-update'
import TableInputAdd from './table/table-input-add'
import $ from 'jquery'

export default () => {
    const { lang, proxy, auth, functions } = useSelector(state => state);
    const _token = localStorage.getItem("_token");
    const [logs, setLogs] = useState([]);
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser) || {}
    const username = _user.username === "administrator" ? "Mylan Digital Solution" : _user.username;
    const storedPwdString = localStorage.getItem("password_hash");
    const [view, setView] = useState([
        {
            "serial_Number": "C3412J1K011N055",
            "hardware": "1.3",
            "frimware": "",
            "software": "",

        }, {
            "serial_Number": "C1291J1P030N050",
            "hardware": "1.3",
            "frimware": "1.8.5.L.4",
            "software": "1.0.6.1",

        },
        {
            "serial_Number": "",
            "hardware": "",
            "frimware": "",
            "software": "",

        },
        {
            "serial_Number": "",
            "hardware": "",
            "frimware": "",
            "software": "",

        }
    ])
    const [serverImage, setServerImage] = useState("");
    const [cases, setCases] = useState([]);
    const [filter, setFilter] = useState({ type: 'info' });
    const [showModal, setShowModal] = useState(false);

    let langItem = localStorage.getItem("lang") ? localStorage.getItem("lang") : "Vi";

    const languages = langItem.toLowerCase();
    const [supportQuanlity, setSupportQuanlity] = useState(0);
    const [dataMessage, setDataMassage] = useState({});
    const [errorMessagesadd, setErrorMessagesadd] = useState({});
    //Post case 

    const [postCase, setPostCase] = useState({ casetype: "Undefined" });
    console.log("data post case:", postCase)
    // 
    // console.log(view)

    // Data table 
    const [tableData, setTableData] = useState([]);// Nhận từ Cpn
    const [tableDataProduct, setTableDataProduct] = useState([]);

    console.log(tableDataProduct)

    const mappedArray = tableData.map(item => ({
        "2SN": item.col1,
        "1SV": item.col2,
        "1HV": item.col3,
        "1FV": item.col4,
        "10Q": item.col5
    }));

    const resultObject = { "11P": mappedArray };

    console.log(resultObject)



    const handleDataFromChild = (newData) => {
        // Cập nhật state ở đây
        setTableData(newData);
    };
    // console.log(dataMessage)
    const handleCloseModal = () => {
        setShowModal(false);
    };


    const [currentTimestamp, setCurrentTimestamp] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            // Cập nhật thời gian hiện tại mỗi 60 giây
            setCurrentTimestamp(new Date());
        }, 60000);

        return () => {
            clearInterval(interval);
        };
    }, []);
    const getElapsedTime = (notifyAt) => {
        const notifyTimestamp = new Date(notifyAt);
        const elapsedMilliseconds = currentTimestamp - notifyTimestamp;
        const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
        const elapsedMinutes = Math.floor(elapsedSeconds / 60);
        const elapsedHours = Math.floor(elapsedMinutes / 60);
        const elapsedDays = Math.floor(elapsedHours / 24);
        const elapsedMonths = Math.floor(elapsedDays / 30);
        const elapsedYears = Math.floor(elapsedMonths / 12);

        if (elapsedYears > 0) {
            return `${elapsedYears} ${lang["years ago"]}`;
        } else if (elapsedMonths > 0) {
            return `${elapsedMonths} ${lang["months ago"]}`;
        } else if (elapsedDays > 0) {
            return `${elapsedDays} ${lang["days ago"]}`;
        } else if (elapsedHours > 0) {
            return `${elapsedHours} ${lang["hours ago"]}`;
        } else if (elapsedMinutes > 0) {
            return `${elapsedMinutes} ${lang["mins ago"]}`;
        } else if (elapsedMilliseconds > 0) {
            return `${elapsedSeconds} ${lang["secs ago"]}`;
        } else {
            return lang["just now"];
        }
    };
    const [dataCaseDetail, setDataCaseDetail] = useState({});
    console.log(dataCaseDetail)
    const [selectedCaseDetail, setSelectedCaseDetail] = useState("");
    const [showPageDetail, setShowPageDetail] = useState(false);
    const handlePageDetail = (caseid) => {
        console.log(caseid)
        setSelectedCaseDetail(caseid.id)
        setShowPageDetail(true)
        setShowPageAdd(false)
        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            "1CI": caseid.id
        }
        fetch(`${proxy()}/api/1281201C63B6454BB5629E2DFE1186BD`, {
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
                console.log(resp)
                const fieldMappings = resp.fields.reduce((acc, field) => {
                    acc[field.fomular_alias] = field.field_name;
                    return acc;
                }, {});


                const mappedCase = Object.keys(resp.Case).reduce((newCase, key) => {
                    const newKey = fieldMappings[key] || key;
                    newCase[newKey] = resp.Case[key];
                    return newCase;
                }, {});

                console.log(mappedCase);

                const caseDetail = {
                    id: mappedCase["CASE ID"],
                    title: mappedCase["CASE TITLE"],
                    date: mappedCase["CREATED DATE"],
                    issue: mappedCase["ISSUE DESCRIPTION"],
                    customer: mappedCase["CUSTOMER"],
                    status: mappedCase["STATUS"],
                    imgcase: mappedCase["CASE IMAGE"],
                    solution: mappedCase["SOLUTION DESCRIPTION"],
                    attachMedia: mappedCase["1CA"]
                };
                console.log(caseDetail);
                setDataCaseDetail(caseDetail);
            })

        // List Product information


        const requestBodyProduct = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            "3CI": caseid.id
        }
        fetch(`${proxy()}/api/F256DE8ACBC449F3A4B5E2056FF8F18E`, {
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
                setTableDataProduct(resp.Products)

            })


    }
    const [showPageAdd, setShowPageAdd] = useState(false);
    const handlePageAdd = () => {
        setShowPageAdd(true)
        setShowPageDetail(false)

    }

    const initialActiveTab = localStorage.getItem('activeTab') || 'general';
    const [activeTab, setActiveTab] = useState(initialActiveTab);

    // Hàm xử lý khi tab được chọn
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    // Sử dụng useEffect để lưu trạng thái activeTab vào localStorage khi có sự thay đổi
    useEffect(() => {
        localStorage.setItem('activeTab', activeTab);
    }, [activeTab]);

    // console.log("Chi tiết", showPageDetail)
    // console.log("Thêm", showPageAdd)
    const getInitialState = (key, defaultValue) => {
        const storedValue = localStorage.getItem(key);
        return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
    };

    const [isOpenGeneral, setIsOpenGeneral] = useState(getInitialState('isOpenGeneral', false));
    const [isOpenProduction, setIsOpenProduction] = useState(getInitialState('isOpenProduction', false));
    const [isOpenDiscussion, setIsOpenDiscussion] = useState(getInitialState('isOpenDiscussion', false));
    const [isOpenSupport, setIsOpenSupport] = useState(getInitialState('isOpenSupport', false));


    // Lưu trạng thái vào localStorage mỗi khi nó thay đổi
    useEffect(() => {
        localStorage.setItem('isOpenGeneral', JSON.stringify(isOpenGeneral));
    }, [isOpenGeneral]);

    useEffect(() => {
        localStorage.setItem('isOpenProduction', JSON.stringify(isOpenProduction));
    }, [isOpenProduction]);

    useEffect(() => {
        localStorage.setItem('isOpenDiscussion', JSON.stringify(isOpenDiscussion));
    }, [isOpenDiscussion]);

    useEffect(() => {
        localStorage.setItem('isOpenSupport', JSON.stringify(isOpenSupport));
    }, [isOpenSupport]);

    const toggleCollapseGeneral = () => {
        setIsOpenGeneral(!isOpenGeneral);
    };
    const toggleCollapseProduction = () => {
        setIsOpenProduction(!isOpenProduction);
    };
    const toggleCollapseDiscussion = () => {
        setIsOpenDiscussion(!isOpenDiscussion);
    };
    const toggleCollapseSupport = () => {
        setIsOpenSupport(!isOpenSupport);
    };

    const eventType = [
        { id: 0, label: lang["log.information"], value: 1, color: "#3029F7", icon: "fa fa-info-circle size-log " },
        { id: 1, label: lang["log.warning"], value: 2, color: "#f3632e", icon: "fa fa-warning size" },
        { id: 2, label: lang["log.error"], value: 3, color: "#FF0000", icon: "fa fa-times-circle fa-2x" },

    ]
    useEffect(() => {
        const stringifiedUser = localStorage.getItem("user");
        const user = JSON.parse(stringifiedUser)
        const { role } = user;
        const validPrivileges = ["uad"]

        if (validPrivileges.indexOf(role) == -1) {
            window.location = "/404-notfound"
        }

    }, [])
    // List case
    useEffect(() => {
        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            }
        }
        fetch(`${proxy()}/api/B65ACE825222422694B02D850D18C3BA`, {
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
                console.log(resp)
                setServerImage(resp.remote_server)
                const fieldMappings = resp.fields.reduce((acc, field) => {
                    acc[field.fomular_alias] = field.field_name;
                    return acc;
                }, {});

                // Bước 2: Map dữ liệu Cases sang tên trường mới
                const mappedCases = resp.Cases.map((caseItem) => {
                    return Object.keys(caseItem).reduce((newCase, key) => {
                        const newKey = fieldMappings[key] || key; // Sử dụng field_name mới nếu tồn tại, nếu không giữ nguyên key
                        newCase[newKey] = caseItem[key];
                        return newCase;
                    }, {});
                });

                console.log(mappedCases);
                const caseTitlesAndDates = mappedCases.map((caseItem) => ({
                    id: caseItem["CASE ID"],
                    title: caseItem["CASE TITLE"],
                    date: caseItem["CREATED DATE"],
                    issue: caseItem["ISSUE DESCRIPTION"],
                    customer: caseItem["CUSTOMER"]

                }));

                console.log(caseTitlesAndDates);
                setCases(caseTitlesAndDates)
            })

    }, [])








    useEffect(() => {
        $('#messages-wrapper').css({
            height: 0
        })
    }, [view])

    //////Ảnh chính
    const [selectedImage, setSelectedImage] = useState(null);
    // console.log(selectedImage)
    const [errorMessage, setErrorMessage] = useState('');
    console.log("ảnh chính", selectedImage)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.match('image.*') && file.size <= 20971520) { // 20MB limit (20*1024*1024)
                const reader = new FileReader();
                reader.onload = (e) => {
                    setSelectedImage(e.target.result);
                    setErrorMessage('');
                };
                reader.readAsDataURL(file);
            } else {
                setErrorMessage('File is too large. Please upload an image less than 25MB.');
                setSelectedImage(null);
            }
        }
    };
    //Ảnh phụ

    const removeImageCase = () => {

        setSelectedImage(null)
    };

    const [attachMedia, setAttachMedia] = useState([]);

    console.log("anh phụ", attachMedia)
    const handleAttachMedia = (e) => {
        const newFiles = Array.from(e.target.files);

        const newMediaPromises = newFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                    const mediaObject = {
                        name: file.name,
                        size: file.size,
                        url: URL.createObjectURL(file),
                        type: file.type.startsWith('video/') ? 'video' : 'image',
                        dataUrl: readerEvent.target.result, // Base64 string
                    };
                    // If it's a video, get additional info like thumbnail and duration
                    if (file.type.startsWith('video/')) {
                        getVideoThumbnail(file).then(({ thumbnailUrl, duration }) => {
                            mediaObject.cover = thumbnailUrl;
                            mediaObject.duration = duration;
                            resolve(mediaObject);
                        });
                    } else {
                        // For images, we already have everything we need
                        resolve(mediaObject);
                    }
                };
                reader.readAsDataURL(file); // This converts the file to a Base64 string
            });
        });

        Promise.all(newMediaPromises).then(newMediaFiles => {
            const totalSize = calculateTotalSize(newMediaFiles);

            if (totalSize > 20971520) { // Check for the total size limit
                Swal.fire({
                    title: lang["error"],
                    text: "Total file size exceeds 35MB.",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonText: lang["confirm"],
                    allowOutsideClick: false,
                });
            } else {
                setAttachMedia(prevImages => [...prevImages, ...newMediaFiles]);
            }
        });
    };
    const removeAttachMedia = (media) => {
        const updatedMediaList = attachMedia.filter(item => item.url !== media.url);
        setAttachMedia(updatedMediaList)
    };
    const [dataPreviewMedia, setDataPreviewMedia] = useState();
    const openModalPreview = (media) => {
        setDataPreviewMedia(media)
    };


    //Popup dấu 3 chấm
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = (event) => {
        event.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };


    const menuRef = useRef();
    useEffect(() => {
        function handleClickOutside(event) {
            // Nếu click ra ngoài menu, đóng menu
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }

        // Thêm event listener khi menu được mở
        if (isMenuOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        // Dọn dẹp event listener
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isMenuOpen]);
    ////Message
    const [showFullMessage, setShowFullMessage] = useState(false);

    const text = "Contrary to popular belief, Lorem Ipsum is not simply random text.It has in a piece of classical Latin literature from 45 BC, making it over 2000 old Richard McClintock, a Latin professor at Hampden-Sydney College in 9. looked up one ofthe more obscure Latin words."
    const toggleShowFullMessage = () => {
        setShowFullMessage(!showFullMessage);
    };


    // Chia nội dung tin nhắn thành các từ
    const words = text.split(' ');
    // Nếu số từ nhiều hơn 100 và không hiển thị toàn bộ nội dung
    const shouldTruncate = words.length > 20 && !showFullMessage;
    const textToDisplay = shouldTruncate ? words.slice(0, 20).join(' ') + '...' : text;

    const submitPostCase = (e) => {
        e.preventDefault();
        const { casetitle, casetype, productname, issue } = postCase;
        const errors = {};
        if (!casetitle) {
            errors.casetitle = "Lỗi casetile";
        }
        if (!productname) {
            errors.productname = "Lỗi Productname";
        }
        if (!issue) {
            errors.issue = "Lỗi mô tả";
        }


        if (Object.keys(errors).length > 0) {
            setErrorMessagesadd(errors);
            return;
        }


        // console.log(_token);
        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            "1CT": postCase.casetitle,
            "2CT": postCase.casetype,
            "2PN": postCase.productname,
            "2CI": selectedImage,
            "1ID": postCase.issue,
            "1CA": attachMedia.map(item => item.dataUrl),
            "11P": mappedArray
        }
        console.log(requestBody)

        fetch(`${proxy()}/api/EF381DD02A6A4FF8B087D5B6BCDE36C9`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(requestBody),
        })
            .then((res) => res.json())
            .then((resp) => {
                const { Success, content, data, status } = resp;
                if (Success) {
                    Swal.fire({
                        title: lang["success"],
                        text: lang["success create"],
                        icon: "success",
                        showConfirmButton: false,
                        timer: 2000
                    })
                } else {
                    Swal.fire({
                        title: lang["faild"],
                        text: lang["faild create"],
                        icon: "error",
                        showConfirmButton: true,
                        // confirmButtonText: lang["back"],
                        cancelButtonText: lang["btn.cancel"],
                        // showCancelButton: true,
                    })
                }
            });

    };

    const [currentPageLogs, setCurrentPageLogs] = useState(1);
    const rowsPerPageLogs = 4;
    const indexOfLastMemberLogs = currentPageLogs * rowsPerPageLogs;
    const indexOfFirstMemberLogs = indexOfLastMemberLogs - rowsPerPageLogs;
    const currentMembersLogs = view.slice(indexOfFirstMemberLogs, indexOfLastMemberLogs);
    const paginateLogs = (pageNumber) => setCurrentPageLogs(pageNumber);
    const totalPagesLogs = Math.ceil(view.length / rowsPerPageLogs);


    const [selectedImagesSent, setSelectedImagesSent] = useState([]);
    // console.log(selectedImagesSent)
    // Hàm check totalSize
    const calculateTotalSize = (additionalFiles) => {
        return selectedImagesSent.reduce((acc, file) => acc + file.size, 0) + additionalFiles.reduce((acc, file) => acc + file.size, 0);
    };
    const handleImageChangeSent = (e) => {
        const newFiles = Array.from(e.target.files);
        // console.log(newFiles);

        const newMediaPromises = newFiles.map(file => {
            const name = file.name;
            if (file.type.startsWith('video/')) {
                // Sử dụng hàm getVideoThumbnail để lấy thông tin thumbnail và duration
                return getVideoThumbnail(file).then(({ thumbnailUrl, duration }) => ({
                    name: name,
                    size: file.size,
                    url: URL.createObjectURL(file),
                    type: 'video',
                    cover: thumbnailUrl, // Sử dụng URL của ảnh bìa từ hàm getVideoThumbnail
                    duration, // Sử dụng thời lượng từ hàm getVideoThumbnail
                }));
            } else {
                return Promise.resolve({
                    name: name,
                    size: file.size,
                    url: URL.createObjectURL(file),
                    type: 'image',
                });
            }
        });

        Promise.all(newMediaPromises).then(newMediaFiles => {
            const totalSize = calculateTotalSize(newMediaFiles);
            // console.log(totalSize / 1000000);
            // Kiểm tra nếu tổng kích thước file vượt quá 35MB (test 350000) 35 000 000
            if (totalSize > 20971520) {
                // alert('Total file size exceeds 35MB.');
                Swal.fire({
                    title: lang["error"],
                    text: "Total file size exceeds 35MB.",
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonText: lang["confirm"],
                    allowOutsideClick: false,
                });
            } else {
                setSelectedImagesSent(prevImages => [...prevImages, ...newMediaFiles]);
            }
        });
    };

    // Hàm trợ giúp để chụp ảnh bìa từ video
    const getVideoThumbnail = (file) => new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => {
            video.currentTime = 0.1; // Đặt thời điểm để chụp thumbnail ở một thời điểm ngắn sau khi bắt đầu
        };
        video.onseeked = () => { // Sự kiện này được kích hoạt khi video đã tìm đến thời điểm cụ thể
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                const thumbnailUrl = URL.createObjectURL(blob);
                resolve({ thumbnailUrl, duration: video.duration }); // Trả về cả thumbnail và duration
            }, 'image/jpeg', 0.95);
        };
        video.onerror = () => {
            reject('Failed to load video for thumbnail generation.');
        };
    });

    const removeMedia = (media) => {
        const updatedMediaList = selectedImagesSent.filter(item => item.url !== media.url);
        setSelectedImagesSent(updatedMediaList)
    };

    return (
        <div class="container-case-main">
            <div class="midde_cont">
                <div class="container-fluid">
                    <div class="row column_title">
                        <div class="col-md-12">
                            <div class="page_title">
                                <h4>Trang test</h4>
                            </div>
                        </div>
                    </div>

                    {/* <div class="row">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head">
                                <div class="heading1 margin_0">
                                    <h5>{lang["log.statis"]}</h5>
                                </div>
                            </div>
                            <div class="table_section padding_infor_info-logs">
                                <div class="member-cus">
                                    <div class="msg_list_main">
                                        <div className="row column1 mb-3 mt-3">
                                            <div className="col-lg-3">
                                                <label>{lang["log.type"]}:</label>
                                                <select className="form-control" value={filter.type} onChange={(e) => { setFilter({ ...filter, type: e.target.value }) }}>
                                                    <option value="info">{lang["log.information"]}</option>
                                                    <option value="warn">{lang["log.warning"]}</option>
                                                    <option value="error">{lang["log.error"]}</option>

                                                </select>
                                            </div>
                                            <div className="col-lg-3">
                                                <label>{lang["log.daystart"]}:</label>
                                                <input type="datetime-local" className="form-control" value={filter.start} onChange={
                                                    (e) => { setFilter({ ...filter, start: e.target.value }) }
                                                } />
                                            </div>
                                            <div className="col-lg-3">
                                                <label>{lang["log.dayend"]}:</label>
                                                <input type="datetime-local" className="form-control" value={filter.end} onChange={
                                                    (e) => { setFilter({ ...filter, end: e.target.value }) }
                                                } />
                                            </div>
                                            <div className="col-lg-3 d-flex align-items-end justify-content-end">
                                                <button className="btn btn-primary mr-2 mt-2 btn-log" onClick={submitFilter}>{lang["btn.ok"]}</button>
                                                <button className="btn btn-secondary btn-log" onClick={() => {
                                                    setView(logs)
                                                }}>{lang["btn.clear"]}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}
                    <div class="row">
                        {/* List Case */}
                        <div class="col-md-5" style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                            <div class="search-container">
                                <input type="search" class="search-input" placeholder="Case title, case description, or anything" />
                            </div>

                            <div class="mt-3" >
                                <span class="pointer" onClick={handlePageAdd}>
                                    < FontAwesomeIcon icon={faCirclePlus} className="size-16  color_icon_plus" /> <span class="lable_add">Post Your Case </span>
                                </span>

                            </div>

                            <hr></hr>
                            <div class="sort-case">
                                <div class="d-flex ">
                                    {/* <p style={{ marginBottom: 0 }}>Sorted by: Created date   <FontAwesomeIcon icon={faAngleDown} className="size-16  ml-auto pointer" /> </p> */}

                                    <div class="dropdown">
                                        <span data-toggle="dropdown" aria-expanded="false">
                                            Sorted by: Created date  < FontAwesomeIcon icon={faAngleDown} className="size-16  ml-auto pointer" />
                                        </span>

                                        <div class="dropdown-menu">
                                            <a class="dropdown-item" href="#">Action</a>
                                            <a class="dropdown-item" href="#">Another action</a>
                                            <a class="dropdown-item" href="#">Something else here</a>
                                        </div>
                                    </div>
                                    <div class="ml-auto"> Total: <span class="font-weight-bold  ">{cases.length || 0}</span> case(s)</div>
                                </div>
                            </div>

                            <div class="container-case">

                                {cases.map((item) => (
                                    <div class={`box-case ${selectedCaseDetail === item.id ? "selected" : ""}`} onClick={() => handlePageDetail(item)}>
                                        <div class="d-flex">
                                            <h4>{item.title}</h4>
                                            <div class="ml-auto">
                                                <div className="dropdown-custom">
                                                    <FontAwesomeIcon icon={faEllipsisVertical} className="size-24 ml-auto pointer" onClick={toggleMenu} />
                                                    {isMenuOpen && (
                                                        <div className="popup-menu-custom show" ref={menuRef}>
                                                            <span className="menu-item-custom" data-toggle="modal" data-target="#updateCase">Update Case</span>
                                                            <span className="menu-item-custom">Delete Case</span>
                                                            <span className="menu-item-custom">Cancel Case</span>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                        <p>{item.issue}</p>
                                        <div class="d-flex ">
                                            <p class="italic" style={{ marginBottom: 0 }}>{functions.formatDateCase(item.date)} by <span class="italic-non font-weight-bold-black">{item.customer}</span> </p>
                                            <div class="ml-auto"> <img width={32} src={"/images/review/ex.png"}></img></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add Case */}
                        {showPageAdd &&
                            (
                                < div class="col-md-7" style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                                    <div class="white_shd full margin_bottom_30">
                                        <div class="full graph_head_cus">
                                            <div class="heading1 margin_0 d-flex">
                                                <h4 class="margin-bottom-0">New Case </h4>
                                                <FontAwesomeIcon icon={faPaperPlane} onClick={submitPostCase} className={`size-24 ml-auto icon-add-production pointer `} />
                                            </div>
                                        </div>
                                        <div class="table_section padding_infor_info_case_add">
                                            <div class="add-case">
                                                <div class="row field-case">
                                                    <div class="col-md-8">

                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <h5 class="mb-2" style={{ margin: '0', marginRight: '10px' }}>Case Title<span className='red_star'>*</span></h5>
                                                            {errorMessagesadd.casetitle && (
                                                                <span class="error-message mb-1">{errorMessagesadd.casetitle}</span>
                                                            )}
                                                        </div>

                                                        <input type="text" class="form-control" value={postCase.casetitle} onChange={
                                                            (e) => { setPostCase({ ...postCase, casetitle: e.target.value }) }} placeholder="Enter case title" ></input>
                                                    </div>
                                                    <div class="col-md-4">
                                                        <h5 class="mb-2">Case Type</h5>
                                                        <select className="form-control" name="role" value={postCase.casetype} onChange={
                                                            (e) => { setPostCase({ ...postCase, casetype: e.target.value }) }}>
                                                            <option value={"Undefined"}>Undefined</option>
                                                            <option value={"Troublshooting"}>Troublshooting</option>
                                                            <option value={"Error"}>Error</option>
                                                            <option value={"Question"}>Question</option>
                                                            <option value={"Feature"}>Feature</option>
                                                            <option value={"Project"}>Project</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="col-md-12 field-case">

                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <h5 class="mb-2" style={{ margin: '0', marginRight: '10px' }}>PRODUCT NAME<span className='red_star'>*</span></h5>
                                                        {errorMessagesadd.casetitle && (
                                                            <span class="error-message mb-1">{errorMessagesadd.productname}</span>
                                                        )}
                                                    </div>
                                                    <input type="text" class="form-control" value={postCase.productname} onChange={
                                                        (e) => { setPostCase({ ...postCase, productname: e.target.value }) }} placeholder="Enter Product Name" ></input>
                                                </div>

                                                <div class="col-md-12">

                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <h5 class="mb-2" style={{ margin: '0', marginRight: '10px' }}>ISSUE DESCRIPTION<span className='red_star'>*</span></h5>
                                                        {errorMessagesadd.casetitle && (
                                                            <span class="error-message mb-1">{errorMessagesadd.issue}</span>
                                                        )}
                                                    </div>
                                                    <textarea class="form-control" rows={6} value={postCase.issue} onChange={
                                                        (e) => { setPostCase({ ...postCase, issue: e.target.value }) }}></textarea>
                                                </div>
                                                <div class="row field-case">
                                                    <div className="col-md-4">
                                                        <h5 className="mb-2">ATTACHMENT</h5>
                                                        <div className="upload-container-case">
                                                            {!selectedImage && (
                                                                <label style={{ margin: 0 }} htmlFor="file-upload" className="custom-file-upload">
                                                                    CHOOSE FILE
                                                                </label>
                                                            )}
                                                            <input
                                                                id="file-upload"
                                                                type="file"
                                                                style={{ display: "none" }}
                                                                onChange={handleImageChange}
                                                                accept="image/*"
                                                            />
                                                            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                                                            {selectedImage && (
                                                                <>
                                                                    <img
                                                                        id="image-preview"
                                                                        src={selectedImage}
                                                                        alt="Image Preview"
                                                                        style={{
                                                                            maxWidth: 'calc(100% - 40px)',
                                                                            maxHeight: 'calc(100% - 10px)',
                                                                            objectFit: 'contain',
                                                                            borderRadius: '8px',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                        onClick={() => document.getElementById('file-upload').click()}
                                                                        title="Click to change image"
                                                                    />
                                                                    <button onClick={() => removeImageCase()} className="remove-image-case">X</button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div class="col-md-8">
                                                        <div class="d-flex">
                                                            <h5 className="mb-2"></h5>
                                                            <label style={{ marginBottom: 0 }} htmlFor="file-upload-media" class="ml-auto" >
                                                                <FontAwesomeIcon icon={faPlusSquare} className={`size-24 mb-1 icon-add pointer `} title="Choose File" />
                                                            </label>
                                                            <input
                                                                id="file-upload-media"
                                                                type="file"
                                                                style={{ display: "none" }}
                                                                onChange={handleAttachMedia}
                                                                accept="image/*,video/*"
                                                            />
                                                        </div>

                                                        <div className="upload-container-case-add">
                                                            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                                                            {attachMedia && (
                                                                <div className="selected-images-container-add">
                                                                    {attachMedia.map((media, index) => (
                                                                        <div key={index} className="selected-image-wrapper-add">
                                                                            {media.type === 'image' && (
                                                                                <img src={media.url} alt={`Selected ${index}`} className="selected-image-add" data-toggle="modal" data-target="#previewMedia" onClick={() => openModalPreview(media)} />
                                                                            )}
                                                                            {media.type === 'video' && (
                                                                                <div>
                                                                                    <img src={media.cover} alt={`Cover for ${index}`} className="selected-image-add" data-toggle="modal" data-target="#previewMedia" onClick={() => openModalPreview(media)} />
                                                                                    {/* <div class="video-duration"> {media.name}</div> */}
                                                                                    <div class="video-duration">Video</div>
                                                                                </div>
                                                                            )}
                                                                            <button onClick={() => removeAttachMedia(media)} className="remove-image">X</button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <TableInputAdd stateAdd={true} stateUpdate={false} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        {/* Non Case */}
                        {(!showPageDetail && !showPageAdd) && (
                            <div class="col-md-7" style={{ paddingLeft: "5px", paddingRight: "5px" }}>

                                <div class="white_shd full margin_bottom_30">

                                    <div class="table_section padding_infor_info_case_non">

                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detail Case */}
                        {showPageDetail && (
                            <div class="col-md-7" style={{ paddingLeft: "5px", paddingRight: "5px" }}>

                                <div class="white_shd full margin_bottom_30">
                                    <div class="full graph_head_cus">
                                        <div class="heading1 margin_0 case-detail">
                                            <h4>{dataCaseDetail.title}</h4>
                                            <div class="d-flex ">
                                                <p class="italic" style={{ marginBottom: 0 }}>Posted on {functions.formatDateCase(dataCaseDetail.date)} ({getElapsedTime(dataCaseDetail.date)}). <b class="status_label">{dataCaseDetail.status}</b></p>
                                                <div class="ml-auto">
                                                    <img class="icon-rate-small" src={"/images/icon/i1.png"}></img>
                                                    <img class="icon-rate-small" src={"/images/icon/i2.png"}></img>
                                                    <img class="icon-rate-small" src={"/images/icon/i3.png"}></img>
                                                    <img class="icon-rate-small" src={"/images/icon/i4.png"}></img>
                                                    <img class="icon-rate-small" src={"/images/icon/i5.png"}></img>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="table_section padding_infor_info_case_detail">
                                        <div>
                                            <div className="custom-tab-container">
                                                <div className={`custom-tab ${activeTab === 'general' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('general')}>
                                                    General
                                                </div>
                                                {/* <div className={`custom-tab ${activeTab === 'products' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('products')}>
                                                    Products
                                                </div> */}
                                                <div className={`custom-tab ${activeTab === 'discussion' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('discussion')}>
                                                    Discussion
                                                </div>
                                                <div className={`custom-tab ${activeTab === 'support' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('support')}>
                                                    Support Quality
                                                </div>
                                            </div>

                                            <div>
                                                {activeTab === 'general' &&
                                                    <div>  <div class="card-block">
                                                        <div class="col-md-12">
                                                            <div class="info-case">
                                                                <h5 class="mt-1">Issue Description</h5>
                                                                <span>{dataCaseDetail.issue}</span>

                                                                <div class="row field-case">
                                                                    <div className="col-md-4">

                                                                        <div className="upload-container-case">
                                                                            <img class=""
                                                                                style={{
                                                                                    maxWidth: 'calc(100% - 40px)',
                                                                                    maxHeight: 'calc(100% - 10px)',
                                                                                    objectFit: 'contain',
                                                                                    borderRadius: '8px',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                                src={serverImage + dataCaseDetail.imgcase}
                                                                                onClick={() => openModalPreview({ type: "imageDetail", url: dataCaseDetail.imgcase })}
                                                                                data-toggle="modal" data-target="#previewMedia" />
                                                                        </div>
                                                                    </div>
                                                                    {/* <div class="col-md-8">
                                                                        <div className="upload-container-case">
                                                                            <img class="" src="/images/helpdesk/r10.png" />
                                                                        </div>
                                                                    </div> */}
                                                                    <div class="col-md-8">
                                                                        

                                                                        <div className="upload-container-case-add">
                                                                            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                                                                           
                                                                                <div className="selected-images-container-add">
                                                                                    {dataCaseDetail?.attachMedia?.map((media, index) => (
                                                                                        <div key={index} className="selected-image-wrapper-add">
                                                                                            {media.type === 'image' && (
                                                                                                <img src={serverImage + media["6U"]} alt={`Selected ${index}`} className="selected-image-add" data-toggle="modal" data-target="#previewMedia" onClick={() => openModalPreview(media)} />
                                                                                            )}
                                                                                            {media.type === 'video' && (
                                                                                                <div>
                                                                                                    <img src={serverImage + media["6U"]} alt={`Cover for ${index}`} className="selected-image-add" data-toggle="modal" data-target="#previewMedia" onClick={() => openModalPreview(media)} />
                                                                                                    {/* <div class="video-duration"> {media.name}</div> */}
                                                                                                    <div class="video-duration">Video</div>
                                                                                                </div>
                                                                                            )}
                                                                                            
                                                                                            
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                           
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="title-suggest">Suggested Solution</div>
                                                                <span class="content-suggest">{dataCaseDetail.solution}</span>
                                                                <TableInputUpdate onDataUpdate={handleDataFromChild} data={tableDataProduct} stateAdd={false} caseId={dataCaseDetail.id} stateUpdate={true} />
                                                            </div>
                                                        </div>
                                                    </div></div>
                                                }
                                                {/* {activeTab === 'products' &&
                                                    <div class="card-block">
                                                        <div class="col-md-12">
                                                            <div class="info-case">
                                                                <div class="d-flex mb-2 mt-1">
                                                                    <h5>Production information</h5>
                                                                    <FontAwesomeIcon icon={faPlusSquare} data-toggle="modal" data-target="#addInfoProduct" className={`size-24 ml-auto icon-add-production pointer `} />
                                                                </div>
                                                                <div class="table-responsive">
                                                                    {
                                                                        view && view.length > 0 ? (
                                                                            <>
                                                                                <table class="table">
                                                                                    <thead>
                                                                                        <tr class="color-tr">
                                                                                            <th>{lang["log.no"]}</th>
                                                                                            <th>SERIAL NUMBER / LOT NUMBER</th>
                                                                                            <th>HARDWARE</th>
                                                                                            <th>FIRMWARE</th>
                                                                                            <th>SOFTWARE</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {currentMembersLogs.map((log, index) => {
                                                                                            return (
                                                                                                <tr key={log.id}>
                                                                                                    <td class="align-center">{indexOfFirstMemberLogs + index + 1}</td>
                                                                                                    <td style={{ width: "300px" }}>
                                                                                                        {log.serial_Number}
                                                                                                    </td>
                                                                                                    <td >{log.hardware}</td>
                                                                                                    <td>
                                                                                                        {log.frimware}
                                                                                                    </td>
                                                                                                    <td>{log.software}</td>
                                                                                                </tr>
                                                                                            );
                                                                                        })}
                                                                                    </tbody>
                                                                                </table>
                                                                                <div className="d-flex justify-content-between align-items-center">
                                                                                    <p>{lang["show"]} {indexOfFirstMemberLogs + 1}-{Math.min(indexOfLastMemberLogs, view.length)} {lang["of"]} {view.length} {lang["results"]}</p>
                                                                                    <nav aria-label="Page navigation example">
                                                                                        <ul className="pagination mb-0">
                                                                                            <li className={`page-item ${currentPageLogs === 1 ? 'disabled' : ''}`}>
                                                                                                <button className="page-link" onClick={() => paginateLogs(1)}>
                                                                                                    &#8810;
                                                                                                </button>
                                                                                            </li>
                                                                                            <li className={`page-item ${currentPageLogs === 1 ? 'disabled' : ''}`}>
                                                                                                <button className="page-link" onClick={() => paginateLogs(currentPageLogs - 1)}>
                                                                                                    &laquo;
                                                                                                </button>
                                                                                            </li>
                                                                                            {currentPageLogs > 3 && <li className="page-item"><span className="page-link">...</span></li>}
                                                                                            {Array(totalPagesLogs).fill().map((_, index) => {
                                                                                                if (
                                                                                                    index + 1 === currentPageLogs ||
                                                                                                    (index + 1 >= currentPageLogs - 5 && index + 1 <= currentPageLogs + 5)
                                                                                                ) {
                                                                                                    return (
                                                                                                        <li key={index} className={`page-item ${currentPageLogs === index + 1 ? 'active' : ''}`}>
                                                                                                            <button className="page-link" onClick={() => paginateLogs(index + 1)}>
                                                                                                                {index + 1}
                                                                                                            </button>
                                                                                                        </li>
                                                                                                    )
                                                                                                }
                                                                                            })}
                                                                                            {currentPageLogs < totalPagesLogs - 2 && <li className="page-item"><span className="page-link">...</span></li>}
                                                                                            <li className={`page-item ${currentPageLogs === totalPagesLogs ? 'disabled' : ''}`}>
                                                                                                <button className="page-link" onClick={() => paginateLogs(currentPageLogs + 1)}>
                                                                                                    &raquo;
                                                                                                </button>
                                                                                            </li>
                                                                                            <li className={`page-item ${currentPageLogs === totalPagesLogs ? 'disabled' : ''}`}>
                                                                                                <button className="page-link" onClick={() => paginateLogs(totalPagesLogs)}>
                                                                                                    &#8811;
                                                                                                </button>
                                                                                            </li>
                                                                                        </ul>
                                                                                    </nav>
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <div class="list_cont ">
                                                                                <p>Hi</p>
                                                                            </div>
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                } */}
                                                {activeTab === 'discussion' &&
                                                    <>
                                                        <div class="card-block bg-message">
                                                            <div class="col-md-12">
                                                                <div class="info-case">
                                                                    <div class="messages-wrapper" style={{ height: selectedImagesSent.length > 0 ? "545px" : "" }} id="messages-wrapper">

                                                                        <div class="message-container received">
                                                                            {/* <img class="message-image" src="path_to_image_received.jpg" alt="Received message image" /> */}
                                                                            <p>
                                                                                {textToDisplay}
                                                                                {shouldTruncate && (
                                                                                    <span className="show-more" onClick={toggleShowFullMessage}> Show more</span>
                                                                                )}
                                                                            </p>
                                                                            <div class="message-timestamp">Nov 15th, 07:19</div>
                                                                        </div>
                                                                        <div class="message-container sent">
                                                                            {/* <img class="message-image" src="path_to_image_sent.jpg" alt="Sent message image" /> */}
                                                                            <p>is a long established fact that a reader will be distracted by the readable content
                                                                                of a page when looking at its layout. The point of using Lorem Ipsum is that it has
                                                                                a more-or-less normal distribution of letters, as opposed to us at Hampden-Sydney College in Virginia.
                                                                            </p>
                                                                            <img class="message-image" src="/images/helpdesk/1.png" />
                                                                            <img class="message-image" src="/images/helpdesk/1.png" />
                                                                            <img class="message-image" src="/images/helpdesk/1.png" />
                                                                            <div class="message-timestamp">Nov 16th, 08:23</div>
                                                                        </div>
                                                                        <div class="message-container sent">
                                                                            {/* <img class="message-image" src="path_to_image_sent.jpg" alt="Sent message image" /> */}
                                                                            <p>is a long established fact that a reader will be distracted by the readable content
                                                                                of a page when looking at its layout. The point of using Lorem Ipsum is that it has
                                                                                a more-or-less normal distribution of letters, as opposed to us at Hampden-Sydney College in Virginia.
                                                                            </p>

                                                                            <div class="message-timestamp">Nov 16th, 08:23</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* {selectedImagesSent.length > 0 ?
                                                            (<div className="selected-images-container">
                                                                {selectedImagesSent.map((image, index) => (
                                                                    <div key={index} className="selected-image-wrapper">
                                                                        <img src={image} alt={`Selected ${index}`} className="selected-image" />
                                                                        <button onClick={() => removeMedia(image)} className="remove-image">X</button>
                                                                    </div>
                                                                ))}
                                                            </div>) : null

                                                        } */}
                                                        {selectedImagesSent.length > 0 && (
                                                            <div className="selected-images-container">
                                                                {selectedImagesSent.map((media, index) => (
                                                                    <div key={index} className="selected-image-wrapper">
                                                                        {media.type === 'image' && (
                                                                            <img src={media.url} alt={`Selected ${index}`} className="selected-image" />
                                                                        )}
                                                                        {media.type === 'video' && (
                                                                            <div>
                                                                                <img src={media.cover} alt={`Cover for ${index}`} className="selected-image" />
                                                                                {/* <div class="video-duration"> {media.name}</div> */}
                                                                                <div class="video-duration">Video</div>
                                                                            </div>
                                                                        )}
                                                                        <button onClick={() => removeMedia(media)} className="remove-image">X</button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div class="chat-input-container">

                                                            <input type="text" class="chat-input" value={dataMessage.message} onChange={
                                                                (e) => { setDataMassage({ ...dataMessage, message: e.target.value }) }
                                                            } placeholder="Type a message..." />
                                                            <input
                                                                type="file"
                                                                id="imageInput"
                                                                hidden="hidden"
                                                                onChange={handleImageChangeSent}
                                                                accept="image/*,video/*"
                                                            />
                                                            <FontAwesomeIcon
                                                                icon={faPaperclip}
                                                                className="size-24 mr-2 pointer"
                                                                onClick={() => document.getElementById('imageInput').click()}
                                                            />
                                                            <FontAwesomeIcon icon={faPaperPlane} className={`size-24 ml-auto mr-2 icon-add-production pointer `} />
                                                        </div>
                                                    </>
                                                }
                                                {activeTab === 'support' &&
                                                    <div class="card-block">
                                                        {supportQuanlity === 0 &&
                                                            <div class="col-md-12">
                                                                <div class="info-case align-center-case">
                                                                    <span>You have not rated the quality of support</span>
                                                                    <button class="btn btn-primary" onClick={() => { setSupportQuanlity(1) }}>Rate Now</button>
                                                                </div>
                                                            </div>
                                                        }
                                                        {supportQuanlity === 1 &&
                                                            <>
                                                                <h5 class="mt-1 mb-3">APPRICIATE THE SERVICE QUALITY</h5>
                                                                <div class="row">

                                                                    <div class="form-group col-lg-12 align-center">

                                                                        <div class="form-group col-lg-12 align-center">
                                                                            <div class="icon-rate" data-text="Excellent">
                                                                                <img class="icon-rate" src="/images/icon/i1.png" />
                                                                                <span class="tooltip-text1">Excellent</span>
                                                                            </div>
                                                                            <div class="icon-rate" data-text="Good">
                                                                                <img class="icon-rate" src="/images/icon/i2.png" />
                                                                                <span class="tooltip-text2">Good</span>
                                                                            </div>
                                                                            <div class="icon-rate" data-text="Medium">
                                                                                <img class="icon-rate" src="/images/icon/i3.png" />
                                                                                <span class="tooltip-text3">Medium</span>
                                                                            </div>
                                                                            <div class="icon-rate" data-text="Poor">
                                                                                <img class="icon-rate" src="/images/icon/i4.png" />
                                                                                <span class="tooltip-text4">Poor</span>
                                                                            </div>
                                                                            <div class="icon-rate" data-text="Very Bad">
                                                                                <img class="icon-rate" src="/images/icon/i5.png" />
                                                                                <span class="tooltip-text5">Very Bad</span>
                                                                            </div>
                                                                        </div>


                                                                    </div>
                                                                    <div class="form-group col-lg-12">
                                                                        <textarea class="form-control" rows={8} placeholder="Let us know how you feel"></textarea>
                                                                    </div>

                                                                </div>
                                                                <div class="form-group col-md-12">
                                                                    <div class="d-flex">

                                                                        Last updated by <span class="font-weight-bold-black ml-1"> Van Cong Huynh</span>
                                                                        <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-primary ml-auto modal-button-review">Submit</button>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        }

                                                    </div>
                                                }
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                    {/* View log */}
                    <div class={`modal no-select-modal ${showModal ? 'show' : ''}`} id="viewLog">
                        <div class="modal-dialog modal-dialog-center ">
                            <div class="modal-content">
                                <div class="modal-header modal-header-review">
                                    <h4 class="modal-title modal-title-review">SUPPORT QUALITY</h4>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <div class="row">
                                            <div class="form-group col-lg-12 align-center">
                                                {/* <img class="icon-rate" src={"/images/icon/i1.png"}></img>
                                            <img class="icon-rate" src={"/images/icon/i2.png"}></img>
                                            <img class="icon-rate" src={"/images/icon/i3.png"}></img>
                                            <img class="icon-rate" src={"/images/icon/i4.png"}></img>
                                            <img class="icon-rate" src={"/images/icon/i5.png"}></img> */}
                                                <div class="form-group col-lg-12 align-center">
                                                    <div class="icon-rate" data-text="Excellent">
                                                        <img class="icon-rate" src="/images/icon/i1.png" />
                                                        <span class="tooltip-text1">Excellent</span>
                                                    </div>
                                                    <div class="icon-rate" data-text="Good">
                                                        <img class="icon-rate" src="/images/icon/i2.png" />
                                                        <span class="tooltip-text2">Good</span>
                                                    </div>
                                                    <div class="icon-rate" data-text="Medium">
                                                        <img class="icon-rate" src="/images/icon/i3.png" />
                                                        <span class="tooltip-text3">Medium</span>
                                                    </div>
                                                    <div class="icon-rate" data-text="Poor">
                                                        <img class="icon-rate" src="/images/icon/i4.png" />
                                                        <span class="tooltip-text4">Poor</span>
                                                    </div>
                                                    <div class="icon-rate" data-text="Very Bad">
                                                        <img class="icon-rate" src="/images/icon/i5.png" />
                                                        <span class="tooltip-text5">Very Bad</span>
                                                    </div>
                                                </div>


                                            </div>
                                            <div class="form-group col-lg-12">
                                                <textarea class="form-control" rows={8} placeholder="Let us know how you feel"></textarea>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div class="modal-footer modal-footer-review ">
                                    <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-primary modal-button-review">Submit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Add Production Infomation */}
                    <div class={`modal no-select-modal ${showModal ? 'show' : ''}`} id="addInfoProduct">
                        <div class="modal-dialog modal-dialog-center ">
                            <div class="modal-content">
                                <div class="modal-header ">
                                    <h4 class="modal-title">Add Product</h4>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <div class="row">
                                            <div class="form-group col-lg-12">
                                                <label>SERIAL NUMBER/LOT NUMBER</label>
                                                <input type="text" class="form-control" />
                                            </div>
                                            <div class="form-group col-lg-12">
                                                <label>HARDWARE VERSION</label>
                                                <input type="text" class="form-control" />
                                            </div>
                                            <div class="form-group col-lg-12">
                                                <label>FIRMWARE VERSION</label>
                                                <input type="text" class="form-control" />
                                            </div>
                                            <div class="form-group col-lg-12">
                                                <label>SOFTWARE VERSION</label>
                                                <input type="text" class="form-control" />
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div class="modal-footer">
                                    <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-primary modal-button-review">Add Now</button>
                                    <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger modal-button-review">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Case Update*/}
                    <div class={`modal no-select-modal ${showModal ? 'show' : ''}`} id="updateCase">
                        <div class="modal-dialog modal-dialog-center ">
                            <div class="modal-content">
                                <div class="modal-header ">
                                    <h4 class="modal-title">Case Update</h4>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <div class="row field-case">
                                            <div class="col-md-8">
                                                <h5 class="mb-2">Case Title</h5>
                                                <input type="text" class="form-control" placeholder="Enter case title" ></input>
                                            </div>
                                            <div class="col-md-4">
                                                <h5 class="mb-2">Case Type</h5>
                                                <select className="form-control" name="role">
                                                    <option value={0}>Undefined</option>
                                                    <option value={1}>Troublshooting</option>
                                                    <option value={2}>Error</option>
                                                    <option value={3}>Question</option>
                                                    <option value={4}>Feature</option>
                                                    <option value={5}>Project</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ paddingLeft: "0px", paddingRight: "0px" }} class="col-md-12 field-case">
                                            <h5 class="mb-2">PRODUCT NAME</h5>
                                            <input type="text" class="form-control" placeholder="Enter Product Name" ></input>
                                        </div>

                                        <div style={{ paddingLeft: "0px", paddingRight: "0px" }} class="col-md-12">
                                            <h5 class="mb-2">ISSUE DESCRIPTION</h5>
                                            <textarea class="form-control" rows={6}></textarea>
                                        </div>
                                        <div class="row field-case">
                                            <div className="col-md-4">
                                                <h5 className="mb-2">ATTACHMENT</h5>
                                                <div className="upload-container-case">
                                                    {!selectedImage && (
                                                        <label style={{ margin: 0 }} htmlFor="file-upload" className="custom-file-upload">
                                                            CHOOSE FILE
                                                        </label>
                                                    )}
                                                    <input
                                                        id="file-upload"
                                                        type="file"
                                                        style={{ display: "none" }}
                                                        onChange={handleImageChange}
                                                        accept="image/*"
                                                    />
                                                    {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                                                    {selectedImage && (
                                                        <>
                                                            <img
                                                                id="image-preview"
                                                                src={selectedImage}
                                                                alt="Image Preview"
                                                                style={{
                                                                    maxWidth: 'calc(100% - 40px)',
                                                                    maxHeight: 'calc(100% - 10px)',
                                                                    objectFit: 'contain',
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => document.getElementById('file-upload').click()}
                                                                title="Click to change image"
                                                            />
                                                            <button onClick={() => removeImageCase()} className="remove-image-case">X</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div class="col-md-8">
                                                <div class="d-flex">
                                                    <h5 className="mb-2"></h5>

                                                    <label style={{ marginBottom: 0 }} htmlFor="file-upload-media" class="ml-auto" >
                                                        <FontAwesomeIcon icon={faPlusSquare} className={`size-24 mb-1 icon-add pointer `} title="Choose File" />
                                                    </label>

                                                    <input
                                                        id="file-upload-media"
                                                        type="file"
                                                        style={{ display: "none" }}
                                                        onChange={handleAttachMedia}
                                                        accept="image/*,video/*"
                                                    />
                                                </div>

                                                <div className="upload-container-case-add">

                                                    {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                                                    {attachMedia && (
                                                        <div className="selected-images-container-add">
                                                            {attachMedia.map((media, index) => (
                                                                <div key={index} className="selected-image-wrapper-add">
                                                                    {media.type === 'image' && (
                                                                        <img src={media.url} alt={`Selected ${index}`} className="selected-image-add" />
                                                                    )}
                                                                    {media.type === 'video' && (
                                                                        <div>
                                                                            <img src={media.cover} alt={`Cover for ${index}`} className="selected-image-add" />
                                                                            {/* <div class="video-duration"> {media.name}</div> */}
                                                                            <div class="video-duration">Video</div>
                                                                        </div>
                                                                    )}
                                                                    <button onClick={() => removeAttachMedia(media)} className="remove-image">X</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>



                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-primary modal-button-review">Update</button>
                                    <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger modal-button-review">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Image*/}
                    <div class={`modal no-select-modal ${showModal ? 'show' : ''}`} id="previewMedia">
                        <div class="modal-dialog modal-dialog-center ">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h4 class="modal-title">PreView Media</h4>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <div class="row">
                                            <div class="form-group col-lg-12 align-center">
                                                {/* <img width={500} src={dataPreviewMedia?.url}></img> */}
                                                {dataPreviewMedia?.type === 'imageDetail' && (
                                                    <img src={serverImage + dataPreviewMedia?.url} alt={dataPreviewMedia?.name} style={{ width: '70%' }} />
                                                )}
                                                {dataPreviewMedia?.type === 'image' && (
                                                    <img src={dataPreviewMedia?.url} alt={dataPreviewMedia?.name} style={{ width: '100%' }} />
                                                )}
                                                {dataPreviewMedia?.type === 'video' && (
                                                    <video autoplay controls style={{ width: '100%' }} src={dataPreviewMedia?.dataUrl} >
                                                        <source src={dataPreviewMedia?.dataUrl} type="video/*" />
                                                    </video>
                                                )}

                                            </div>

                                        </div>
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger modal-button-review">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            </div >
        </div >

    )
}

