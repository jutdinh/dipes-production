
import { useParams } from "react-router-dom";
import ReactDOM from 'react-dom';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMaximize, faMinimize, faDownload, faCompress, faChartBar, faPlusCircle, faCirclePlus, faCirclePlay, faRectangleXmark, faCircle, faCircleXmark, faAngleDown, faEllipsisVertical, faPlusSquare, faPaperPlane, faPaperclip, faAngleLeft, faClose } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import TableInputUpdate from './table/table-input-update'
import TableInputAdd from './table/table-input-add'
import $ from 'jquery'
import isEqual from 'lodash/isEqual';

export default () => {
    const { lang, proxy, auth, functions } = useSelector(state => state);

    let langItemCheck = localStorage.getItem("lang");

    const _token = localStorage.getItem("_token");
    const [logs, setLogs] = useState([]);
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser) || {}
    const username = _user.username === "nhan.to" ? "Mylan Digital Solution" : _user.username;
    // const username = (_user.username === "administrator" || _user.username === "nhan.to") ? "Mylan Digital Solution" : _user.username;

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
    console.log(cases)
    const [caseUpdate, setCaseUpdate] = useState({});
    const [filter, setFilter] = useState({ type: 'info' });
    const [showModal, setShowModal] = useState(false);

    let langItem = localStorage.getItem("lang") ? localStorage.getItem("lang") : "Vi";

    const languages = langItem.toLowerCase();
    const [supportQuanlity, setSupportQuanlity] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [dataMessageSent, setDataMessageSent] = useState({});
    const [dataMessage, setDataMessage] = useState([]);
    const [dataMessageMedia, setDataMessageMedia] = useState([]);
    const [errorMessagesadd, setErrorMessagesadd] = useState({});
    const [dataMessageMerged, setDataMessageMerged] = useState([]);
    const [errorMessagesUpdate, setErrorMessagesUpdate] = useState({});

    console.log("data message", dataMessage)
    console.log("data media", dataMessageMedia)
    console.log("data merged", dataMessageMerged)
    const qualityToImage = {
        "Good": "i1.png",
        "Pretty good": "i2.png",
        "Medium": "i3.png",
        "Bad": "i4.png",
        "No Reply": "i5.png"
    };

    // console.log(dataMessage)
    //Post case 
    const [postCase, setPostCase] = useState({ casetype: "Undefined" });
    // console.log("data post case:", postCase)
    // 
    // console.log(view)

    // Data table 
    const [tableData, setTableData] = useState([]);// Nhận từ Cpn
    const [tableDataProduct, setTableDataProduct] = useState([]);
    // console.log("Data Table", tableData)
    // console.log(tableDataProduct)

    const textareaRef = useRef(null);
    const filteredTableData = tableData.filter(item => {
        // Kiểm tra xem có ít nhất một trong các thuộc tính col1, col2, col3, col4, col5 có giá trị không
        return item.col1 || item.col2 || item.col3 || item.col4 || item.col5;
    });



    const mappedArray = filteredTableData.map(item => ({
        "2SN": item.col1,
        "1SV": item.col2,
        "1HV": item.col3,
        "1FV": item.col4,
        "10Q": item.col5
    }));

    const resultObject = { "11P": mappedArray };

    // console.log(resultObject)

    const handleDataFromChild = (newData) => {
        // Cập nhật state ở đây
        setTableData(newData);
    };
    // console.log(dataMessage)
    const handleCloseModal = () => {
        setShowModal(false);
    };





    // search
    const [searchValue, setSearchValue] = useState('');
    const [filteredCases, setFilteredCases] = useState(cases);

    // Hàm xử lý sự kiện khi giá trị của input thay đổi
    const handleInputChangeSearch = (event) => {
        const value = event.target.value;
        setSearchValue(value);

        // Lọc danh sách cases dựa trên giá trị nhập vào
        const filtered = cases.filter((caseItem) => {
            const { title, issue, customer } = caseItem;
            const searchString = `${title} ${issue} ${customer}`.toLowerCase();
            return searchString.includes(value.toLowerCase());
        });

        setFilteredCases(filtered);
    };

    //sort
    const [sortBy, setSortBy] = useState('newest'); // Mặc định là 'newest'
    const [sortedCases, setSortedCases] = useState([]);
    console.log(sortedCases)
    const handleSortChange = (sortType) => {
        setSortBy(sortType);
    };
    const isToday = (date) => {
        const today = new Date();
        const d = new Date(date);
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    };
    const sortCases = (cases, sortBy) => {
        switch (sortBy) {

            case 'today':
                return cases.filter(caseItem => isToday(caseItem.date));
            case 'aToZ':
                return [...cases].sort((a, b) => a.title.localeCompare(b.title));
            case 'zToA':
                return [...cases].sort((a, b) => b.title.localeCompare(a.title));
            case 'newest':
                return [...cases].sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'oldest':
                return [...cases].sort((a, b) => new Date(a.date) - new Date(b.date));
            default:
                return cases;
        }
    };

    useEffect(() => {
        // Cập nhật danh sách cases khi sortBy thay đổi
        const sortedCases = sortCases(cases, sortBy);
        setSortedCases(sortedCases)
        // Cập nhật UI hoặc state với danh sách đã sắp xếp
    }, [sortBy, cases]);



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
    console.log(selectedCaseDetail)

    const fetchData = async (caseid) => {
        try {
            const requestBodyProduct = {
                checkCustomer: {
                    username,
                    password: storedPwdString
                },
                "3CI": caseid.id
            }
            // Trước khi gọi API, đặt giá trị của tableDataProduct thành một mảng rỗng
            setTableDataProduct([]);

            const response = await fetch(`${proxy()}/api/F256DE8ACBC449F3A4B5E2056FF8F18E`, {
                headers: {
                    Authorization: _token,
                    "content-type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(requestBodyProduct)
            });

            const resp = await response.json();

            const { success, data, activated, status, content } = resp;
            // console.log("Product infor", resp)
            setTableDataProduct(resp.Products);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const dataUpdateCase = (dataUpdate) => {
        // console.log(dataUpdate)
        setCaseUpdate(dataUpdate)
    }



    const handlePageDetail = (caseid) => {
        // đặt lại giá trị support quality
        setRating(null)
        setPostRating({})
        setDataCaseDetail({})
        // 
        fetchData(caseid);
        // console.log(caseid)
        setTableDataProduct([]);

        setSelectedCaseDetail(caseid.id)

        setShowPageDetail(true)
        setShowPageAdd(false)


        callApiCaseDetail(caseid)
        // List Product informatio

    }
    const callApiCaseDetail = (caseid) => {
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
                const { Success, data, activated, status, content } = resp;
                // console.log(resp)
                const fieldMappings = resp.fields.reduce((acc, field) => {
                    acc[field.fomular_alias] = field.field_name;
                    return acc;
                }, {});


                const mappedCase = Object.keys(resp.Case).reduce((newCase, key) => {
                    const newKey = fieldMappings[key] || key;
                    newCase[newKey] = resp.Case[key];
                    return newCase;
                }, {});

                // console.log(mappedCase);

                const caseDetail = {
                    id: mappedCase["CASE ID"],
                    title: mappedCase["CASE TITLE"],
                    date: mappedCase["CREATED DATE"],
                    issue: mappedCase["ISSUE DESCRIPTION"],
                    customer: mappedCase["CUSTOMER"],
                    status: mappedCase["STATUS"],
                    imgcase: mappedCase["CASE IMAGE"],
                    solution: mappedCase["SOLUTION DESCRIPTION"],
                    attachMedia: mappedCase["1CA"],
                    supportquanlity: mappedCase["SUPPORT QUALITY"],
                    supportdescription: mappedCase["SUPPORT QUALITY DESCRIPTION"]
                };
                // console.log(caseDetail);
                setDataCaseDetail(caseDetail);

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

    // useEffect(() => {
    //     if (dataCaseDetail.supportquanlity !== undefined) {
    //         setSupportQuanlity(1)

    //         setRating(dataCaseDetail.supportquanlity)

    //         setPostRating({ content: dataCaseDetail.supportdescription });
    //     }
    //     else {
    //         setSupportQuanlity(0)
    //     }
    // }, [dataCaseDetail, selectedCaseDetail]);

    useEffect(() => {
        // Thiết lập thời gian trễ trước khi hiển thị nội dung
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500); // Thời gian trễ 1 giây

        if (dataCaseDetail.supportquanlity !== undefined) {
            setSupportQuanlity(1);
            setRating(dataCaseDetail.supportquanlity);
            setPostRating({ content: dataCaseDetail.supportdescription });
        } else {
            setSupportQuanlity(0);
        }
        setIsLoading(true);

        // Dọn dẹp khi component unmount
        return () => clearTimeout(timer);
    }, [dataCaseDetail, selectedCaseDetail]);
    ////// Mặc định chọn trang đầu theo sắp xếp 
    useEffect(() => {
        if (sortedCases.length > 0 && selectedThenRate === "") {
            const idCase = sortedCases?.[0]
            handlePageDetail(idCase)
        }

    }, [sortedCases]);



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
    // useEffect(() => {
    //     const stringifiedUser = localStorage.getItem("user");
    //     const user = JSON.parse(stringifiedUser)
    //     const { role } = user;
    //     const validPrivileges = ["uad"]

    //     if (validPrivileges.indexOf(role) == -1) {
    //         window.location = "/404-notfound"
    //     }

    // }, [])
    // List case
    const callApiListCase = () => {
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
                // console.log(resp)
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

                // console.log(mappedCases);
                const caseTitlesAndDates = mappedCases.map((caseItem) => ({
                    id: caseItem["CASE ID"],
                    title: caseItem["CASE TITLE"],
                    date: caseItem["CREATED DATE"],
                    issue: caseItem["ISSUE DESCRIPTION"],
                    customer: caseItem["CUSTOMER"],
                    casetype: caseItem["CASE TYPE"],
                    productname: caseItem["2PN"],
                    caseimage: caseItem["CASE IMAGE"],
                    attachMedia: caseItem["1CA"],
                    supportquanlity: caseItem["SUPPORT QUALITY"],
                    supportdescription: caseItem["SUPPORT QUALITY DESCRIPTION"]

                }));

                // console.log(caseTitlesAndDates);
                setCases(caseTitlesAndDates)
            })
    }

    useEffect(() => {
        callApiListCase()
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
        // e.target.value = '';
        const file = e.target.files[0];
        if (file) {
            if (file.type.match('image.*') && file.size <= 20971520) { // 20MB limit (20*1024*1024)
                const reader = new FileReader();
                reader.onload = (e) => {
                    setSelectedImage(e.target.result);
                    setErrorMessage('');
                    e.target.value = '';
                };
                reader.readAsDataURL(file);
            } else {
                setErrorMessage('File is too large. Please upload an image less than 25MB.');
                setSelectedImage(null);
            }
        }
    };
    //Ảnh phụ
    const removeImageCase = (e) => {
        e.preventDefault();
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
                    text: lang["File is too large"],
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonText: lang["confirm"],
                    allowOutsideClick: false,
                });
            } else {
                setAttachMedia(prevImages => [...prevImages, ...newMediaFiles]);
            }
            e.target.value = null;
        });
    };

    const removeAttachMedia = (media) => {
        const updatedMediaList = attachMedia.filter(item => item.url !== media.url);
        setAttachMedia(updatedMediaList)
    };

    const removeImageCaseUpdate = (e) => {
        e.preventDefault();
        setCaseUpdate(prevState => ({
            ...prevState,
            caseimage: '' // Cập nhật caseimage thành rỗng
        }));
    };

    const removeAttachMediaUpdate = (e, media) => {
        e.preventDefault();
        // console.log(media);

        // Tạo một bản sao của caseUpdate
        const updatedCaseUpdate = { ...caseUpdate };

        // Lọc ra các phần tử khỏi mảng attachMedia
        updatedCaseUpdate.attachMedia = updatedCaseUpdate.attachMedia.filter(item => item["6U"] !== media["6U"]);

        // Cập nhật caseUpdate
        setCaseUpdate(updatedCaseUpdate);
    };

    const [dataPreviewMedia, setDataPreviewMedia] = useState();
    const openModalPreview = (media) => {
        setDataPreviewMedia(media)
    };
    // console.log(dataPreviewMedia)
    //Popup dấu 3 chấm

    const [openMenuCaseId, setOpenMenuCaseId] = useState(null);

    // Hàm mở menu cho case cụ thể
    const toggleMenu = (event, caseId) => {
        event.stopPropagation();
        // Kiểm tra xem menu cho case này đã được mở chưa
        if (openMenuCaseId === caseId) {
            // Nếu đã mở, đóng lại
            setOpenMenuCaseId(null);
        } else {
            // Nếu chưa mở, mở menu cho case này
            setOpenMenuCaseId(caseId);
        }
    };


    const menuRef = useRef();
    useEffect(() => {
        function handleClickOutside(event) {
            // Nếu click ra ngoài menu, đóng menu
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuCaseId(false);
            }
        }

        // Thêm event listener khi menu được mở
        if (openMenuCaseId) {
            document.addEventListener('click', handleClickOutside);
        }

        // Dọn dẹp event listener
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [openMenuCaseId]);
    ////Message
    const [showFullMessage, setShowFullMessage] = useState(false);


    const toggleShowFullMessage = (id) => {
        setShowFullMessage(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };


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
            "1CA": attachMedia.map(item => ({
                "1FN": item.name,
                "Base64": item.dataUrl.split('base64,').pop()
            })),
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
                    callApiListCase()
                    setShowPageAdd(false)
                    setShowPageDetail(false)
                    setPostCase({ casetype: "Undefined" })
                    setSelectedImage(null)
                    setAttachMedia([])

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

    const submitUpdateCase = (e) => {
        e.preventDefault();

        const { title, productname, issue } = caseUpdate;
        const errors = {};
        if (!title) {
            errors.title = "Lỗi casetile";
        }
        if (!productname) {
            errors.productname = "Lỗi Productname";
        }
        if (!issue) {
            errors.issue = "Lỗi mô tả";
        }


        if (Object.keys(errors).length > 0) {
            setErrorMessagesUpdate(errors);
            return;
        }


        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            "1CI": caseUpdate.id,
            "1CT": caseUpdate.title,
            "2CT": caseUpdate.casetype,
            "2PN": caseUpdate.productname,
            "2CI": selectedImage, //selectedImage caseUpdate.caseimage
            "1ID": caseUpdate.issue,
            "1CA": attachMedia.map(item => ({ Base64: item.dataUrl })).concat(caseUpdate.attachMedia.map(item => item))
        }
        // console.log(requestBody)

        fetch(`${proxy()}/api/56ABDE49FFD24A09B89174526314F4B8`, {
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
                        text: lang["success.update"],
                        icon: "success",
                        showConfirmButton: false,
                        timer: 2000
                    })
                    $('#closeModalUpdateCase').click();
                    callApiListCase()
                    callApiCaseDetail(caseUpdate)
                } else {
                    Swal.fire({
                        title: lang["faild"],
                        text: lang["fail.update"],
                        icon: "error",
                        showConfirmButton: true,
                        // confirmButtonText: lang["back"],
                        cancelButtonText: lang["btn.cancel"],
                        // showCancelButton: true,
                    })
                }
            });

    };

    const [selectedImagesSent, setSelectedImagesSent] = useState([]);
    // console.log(selectedImagesSent)
    // Hàm check totalSize
    const calculateTotalSize = (additionalFiles) => {
        return selectedImagesSent.reduce((acc, file) => acc + file.size, 0) + additionalFiles.reduce((acc, file) => acc + file.size, 0);
    };
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    })

    const handleImageChangeSent = async (e) => {
        const newFiles = Array.from(e.target.files);
        // console.log(newFiles);

        const newMediaPromises = newFiles.map(async file => {
            const name = file.name;
            const base64 = await toBase64(file);
            if (file.type.startsWith('video/')) {
                // Sử dụng hàm getVideoThumbnail để lấy thông tin thumbnail và duration
                return getVideoThumbnail(file).then(({ thumbnailUrl, duration }) => ({
                    name: name,
                    size: file.size,
                    url: URL.createObjectURL(file),
                    type: 'video',
                    base64: base64,
                    cover: thumbnailUrl, // Sử dụng URL của ảnh bìa từ hàm getVideoThumbnail
                    duration, // Sử dụng thời lượng từ hàm getVideoThumbnail
                }));
            } else {
                return Promise.resolve({
                    name: name,
                    size: file.size,
                    base64: base64,
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

                Swal.fire({
                    title: lang["error"],
                    text: lang["File is too large"],
                    icon: "error",
                    showConfirmButton: true,
                    confirmButtonText: lang["confirm"],
                    allowOutsideClick: false,
                });
            } else {
                setSelectedImagesSent(prevImages => [...prevImages, ...newMediaFiles]);
            }
            e.target.value = null;
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

    // Đánh giá 
    const [rating, setRating] = useState(null);
    const handleRatingClick = (newRating) => {
        setRating(newRating);
    };

    const [postRating, setPostRating] = useState({});
    // console.log(postRating)
    const [selectedThenRate, setSelectedThenRate] = useState("");
    const submitRate = (e) => {
        e.preventDefault();
        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            "1CI": selectedCaseDetail,
            "1SQ": rating,
            "1SQD": postRating.content
        }
        const caseId = { id: selectedCaseDetail }
        // console.log(requestBody)
        fetch(`${proxy()}/api/188CD259D6E742A2B31334767298337D`, {
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
                    console.log(resp)
                    console.log(resp.Case["1CI"])
                    setSelectedCaseDetail(selectedCaseDetail)
                    setSelectedThenRate(selectedCaseDetail)
                    // callApiListCase()
                    callApiCaseDetail(caseId)
                    // Đồng bộ trạng thái đánh giá 
                    const updateSortedCases = (resp) => {
                        const updatedCases = sortedCases.map(caseItem => {
                            if (caseItem.id === resp.Case["1CI"]) {
                                return { ...caseItem, supportquanlity: resp.Case["1SQ"] };
                            }
                            return caseItem;
                        });
                        console.log(updatedCases)
                        // Cập nhật state cho trạng thái
                        setSortedCases(updatedCases);
                    };
                    // Gọi hàm cập nhật khi nhận được phản hồi
                    updateSortedCases(resp);


                    Swal.fire({
                        title: lang["success"],
                        text: lang["success.rate"],
                        icon: "success",
                        showConfirmButton: false,
                        timer: 2000
                    })
                } else {
                    Swal.fire({
                        title: lang["faild"],
                        text: lang["fail.update"],
                        icon: "error",
                        showConfirmButton: true,
                        // confirmButtonText: lang["back"],
                        cancelButtonText: lang["btn.cancel"],
                        // showCancelButton: true,
                    })
                }
            });
    };



    const withDrawMessage = () => {
        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            "4CI": contextMenu.item["4CI"],
            "1MI": contextMenu.item["1MI"]
        }
        fetch(`${proxy()}/api/600303965B5F45299EDDBB47AFF407E1`, {
            headers: {
                Authorization: _token,
                "content-type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(requestBody)
        })
            .then(res => res.json())
            .then(resp => {
                const { Success, data, activated, status, content } = resp;
                // console.log(resp)
                // setDataMessageMedia(resp.Media)
                if (Success) {
                    callApiMessage()
                    callApiMessageMedia()
                    Promise.all([callApiMessage(), callApiMessageMedia()])
                        .then(() => {
                            mergedDataMessage();
                        });
                }
            })
    }


    // useEffect(() => {
    //     callApiMessage()
    //     callApiMessageMedia()
    //     Promise.all([callApiMessage(), callApiMessageMedia()])
    //         .then(() => {
    //             mergedDataMessage();
    //         });

    // }, [selectedCaseDetail])



    const submitMessage = (e) => {
        e.preventDefault();
        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            "4CI": selectedCaseDetail,
            "1MC": dataMessageSent.message,
            "1MM": selectedImagesSent.map(item => ({ "9MT": item.type, "5U": item.base64 }))
        }
        // console.log(requestBody)
        if (/\S/.test(dataMessageSent.message || dataMessageSent.length > 0)) {
            fetch(`${proxy()}/api/50DA7C504DF5439AA5FFE8D734D7CA79`, {
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
                    // console.log(resp) 
                    if (Success) {
                        callApiMessage()
                        callApiMessageMedia()
                        Promise.all([callApiMessage(), callApiMessageMedia()])
                            .then(() => {
                                mergedDataMessage();
                            });
                        setDataMessageSent({ message: '' });

                        if (textareaRef.current) {
                            textareaRef.current.style.height = '40px';
                        }
                        setHeightChat(40)
                        // Cập nhật các states khác
                        setSelectedImagesSent([]);
                    }
                });
        }


    };

    //Tin nhắn
    // Goi api sau 10s
    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([callApiMessage(), callApiMessageMedia()]);
            mergedDataMessage();
        };

        fetchData();

        const intervalId = setInterval(fetchData, 10000); // 10 giây
        return () => clearInterval(intervalId);
    }, [selectedCaseDetail]); // Thêm các phụ thuộc nếu cần 
    const [dataMessagePrev, setDataMessagePrev] = useState(null);
    const [dataMessageMediaPrev, setDataMessageMediaPrev] = useState(null);
    const callApiMessage = () => {
        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            "4CI": selectedCaseDetail
        }
        return fetch(`${proxy()}/api/35DAEDC33BF24327A03373D4D66B1D2B`, {
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

                if (!isEqual(resp.Messages, dataMessagePrev)) {
                    setDataMessage(resp.Messages);
                    setDataMessagePrev(resp.Messages); // Lưu bản sao mới
                }
                return resp;

            })
    }
    const callApiMessageMedia = () => {
        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            "5CI": selectedCaseDetail
        }
        return fetch(`${proxy()}/api/C859083907874976BA90AAA4D14D8E61`, {
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
                // console.log(resp)
                if (!isEqual(resp.Media, dataMessageMediaPrev)) {
                    setDataMessageMedia(resp.Media);
                    setDataMessageMediaPrev(resp.Media); // Lưu bản sao mới
                }

            })
    }




    const [dataMessageMergedPrev, setDataMessageMergedPrev] = useState(null);
    const mergedDataMessage = () => {
        // Tạo một map với key là sự kết hợp của '2MI' và '5CI'
        const mediaMap = new Map();
        dataMessageMedia?.forEach(mediaItem => {
            const key = `${mediaItem["2MI"]}_${mediaItem["5CI"]}`;
            if (!mediaMap.has(key)) {
                mediaMap.set(key, []);
            }
            mediaMap.get(key).push(mediaItem);
        });

        // Duyệt qua mảng messages và gộp thông tin từ media
        const mergedArray = dataMessage?.map(messageItem => {
            const key = `${messageItem["1MI"]}_${messageItem["4CI"]}`;
            return {
                ...messageItem,
                media: mediaMap.get(key) || [],
            };
        });

        // So sánh và cập nhật state nếu có sự thay đổi
        if (!isEqual(mergedArray, dataMessageMergedPrev)) {
            setDataMessageMerged(mergedArray);
            setDataMessageMergedPrev(mergedArray);
        }
    };




    // useEffect(() => {
    //     mergedDataMessage()
    // }, [ dataMessage]); // Chỉ chạy effect này khi dataMessageMedia thay đổi

    useEffect(() => {
        mergedDataMessage()
    }, [dataMessage, dataMessageMedia]);






    const messagesEndRef = useRef(null);

    // Hàm cuộn đến cuối container
    // const scrollToBottom = () => {
    //     if (messagesEndRef.current) {
    //         messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    //     }
    // };
    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
            }
        }, 100); // Trì hoãn 100 ms hoặc thời gian phù hợp
    };

    // Cuộn đến cuối sau mỗi lần danh sách tin nhắn thay đổi
    useEffect(scrollToBottom, [dataMessageMerged, dataMessage, dataMessageMedia, activeTab]);


    const [contextMenu, setContextMenu] = useState({ visible: false, position: { x: 0, y: 0 }, item: null });

    // Hàm xử lý chuột phải
    const handleContextMenu = (event, item) => {
        event.preventDefault();
        setContextMenu({
            visible: true,
            position: { x: event.pageX, y: event.pageY },
            item: item,
        });
    };

    // Hàm để ẩn context menu
    const closeContextMenu = () => {
        setContextMenu({ visible: false, position: { x: 0, y: 0 }, item: null });
    };

    // Đóng menu khi click bên ngoài
    const handleOutsideClick = (event) => {
        if (contextMenu.visible) {
            const isContextMenuClicked = event.target.closest('.context-menu'); // Kiểm tra xem có click vào context menu không
            if (!isContextMenuClicked) {
                closeContextMenu();
            }
        }
    };

    // Sử dụng useEffect để thêm và loại bỏ event listener cho sự kiện cuộn và click
    useEffect(() => {
        document.addEventListener('scroll', handleOutsideClick);
        document.addEventListener('click', handleOutsideClick);

        return () => {
            document.removeEventListener('scroll', handleOutsideClick);
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [contextMenu.visible]);





    // Textarea Chat
    const [heightChat, setHeightChat] = useState(40);

    const handleInputChange = (e) => {

        const textarea = e.target;
        // Đặt chiều cao ban đầu để scrollHeight có thể được đo lường chính xác
        textarea.style.height = 'auto';
        // Đặt lại chiều cao dựa trên chiều cao nội dung
        textarea.style.height = `${textarea.scrollHeight}px`;

        setHeightChat(textarea.scrollHeight)
        // Cập nhật nội dung tin nhắn
        setDataMessageSent({ ...dataMessageSent, message: e.target.value });
    };



    const calculateHeight = () => {
        let baseHeight = 625;
        const imageAdjustment = selectedImagesSent.length > 0 ? 70 : 0; // Điều chỉnh nếu có hình ảnh
        const maxHeightReduction = 96 - 40; // Giới hạn giảm chiều cao tối đa

        if (heightChat > 40) {
            const heightReduction = Math.min(heightChat - 40, maxHeightReduction);
            baseHeight -= heightReduction;
        }
        // Trừ đi imageAdjustment trước khi áp dụng giới hạn tối thiểu 588


        // Đảm bảo baseHeight không thấp hơn 588
        baseHeight = Math.max(baseHeight, 585);
        baseHeight -= imageAdjustment;
        // console.log('heightChat:', heightChat);
        // console.log('selectedImagesSent:', selectedImagesSent.length);
        // console.log('imageAdjustment:', imageAdjustment);
        // console.log('baseHeight:', baseHeight);
        return `${baseHeight}px`;
    };


    // const [isIconDisabled, setIsIconDisabled] = useState(true);
    // useEffect(() => {
    //     // Kiểm tra điều kiện và cập nhật trạng thái của biến isIconDisabled
    //     if (dataMessageSent.message !== '' || selectedImagesSent.length > 0) {
    //         setIsIconDisabled(false);
    //     } else {
    //         setIsIconDisabled(true);
    //     }
    // }, [dataMessageSent.message, selectedImagesSent]);

    return (
        <div class="container-case-main">
            <div class="midde_cont">
                <div class="container-fluid">
                    <div class="row column_title">
                        <div class="col-md-12">
                            <div class="page_title">
                                <h4>TECHNICAL SERVICE</h4>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div id="portal-root"></div>

                        {/* List Case */}
                        <div class="col-md-5" style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                            <div class="search-container">
                                <input
                                    type="search"
                                    className="search-input"
                                    placeholder={lang["Case title, case description, or anything"]}
                                    value={searchValue}
                                    onChange={handleInputChangeSearch}
                                />
                            </div>

                            <div class="mt-2" >
                                <span class="pointer" onClick={handlePageAdd}>
                                    < FontAwesomeIcon icon={faCirclePlus} className="size-18 color_icon_plus" title={lang["post your case"]} /> <span class="lable_add">{lang["post your case"]}</span>
                                </span>
                            </div>

                            <hr></hr>
                            <div class="sort-case">
                                <div class="d-flex ">
                                    <div className="dropdown">
                                        <span class="pointer" data-toggle="dropdown" aria-expanded="false">
                                            {lang["sorted by"]}: {sortBy === 'today' ? lang["today"] : sortBy === 'aToZ' ? 'A-Z' : sortBy === 'zToA' ? 'Z-A' : sortBy === 'newest' ? lang["newest"] : lang["oldest"]}
                                            <FontAwesomeIcon icon={faAngleDown} className="size-15 ml-1 pointer" title={lang["sorted by"]} />
                                        </span>
                                        <div className="dropdown-menu">
                                            <a className="dropdown-item " href="#" onClick={() => handleSortChange('today')}>
                                                {lang["today"]}
                                            </a>
                                            <a className="dropdown-item" href="#" onClick={() => handleSortChange('aToZ')}>
                                                A-Z
                                            </a>
                                            <a className="dropdown-item" href="#" onClick={() => handleSortChange('zToA')}>
                                                Z-A
                                            </a>
                                            <a className="dropdown-item" href="#" onClick={() => handleSortChange('newest')}>
                                                {lang["newest"]}
                                            </a>
                                            <a className="dropdown-item" href="#" onClick={() => handleSortChange('oldest')}>
                                                {lang["oldest"]}
                                            </a>
                                        </div>
                                    </div>
                                    <div class="ml-auto"> {lang["total"]}: <span class="font-weight-bold  ">{(searchValue === '' ? sortedCases.length : filteredCases.length) || 0}</span> {lang["case(s)"]}</div>
                                </div>
                            </div>

                            <div class="container-case">

                                {(searchValue === '' ? sortedCases : filteredCases).map((item, index) => (
                                    <div key={index} className={`box-case ${selectedCaseDetail === item.id ? "selected" : ""}`} onClick={() => handlePageDetail(item)}>
                                        <div className="d-flex">
                                            <h4 class="ellipsis-header-case" title={item.title}>{item.title}</h4>
                                            <div className="ml-auto">
                                                <div className="dropdown-custom">
                                                    <FontAwesomeIcon icon={faEllipsisVertical} className="size-24 ml-auto pointer" onClick={(e) => toggleMenu(e, item.id)} title={lang["update"]} />
                                                    {openMenuCaseId === item.id && (
                                                        <div className="popup-menu-custom show" ref={menuRef}>
                                                            <span className="menu-item-custom pointer" data-toggle="modal" onClick={() => dataUpdateCase(item)} data-target="#updateCase">{lang["update"]}</span>
                                                            {/* <span className="menu-item-custom">Delete Case</span>
                                                            <span className="menu-item-custom">Cancel Case</span> */}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <p class="ellipsis-header-case">{item.issue}</p>
                                        <div className="d-flex">
                                            <p className="italic" style={{ marginBottom: 0 }}>{lang["latest support on"]} {langItemCheck === "Vi" ? functions.translateDateToVietnamese(functions.formatDateCase(item.date)) : functions.formatDateCase(item.date)} {lang["by"]}<span className="italic-non font-weight-bold-black">{item.customer}</span> </p>
                                            <div className="ml-auto">


                                                <div>
                                                    {(!functions.isEmpty(dataCaseDetail) && dataCaseDetail.id === item.id && dataCaseDetail.supportquanlity !== undefined) ? (
                                                        <img
                                                            width={24}
                                                            src={`/images/icon/${qualityToImage[dataCaseDetail.supportquanlity]}`}
                                                            alt="ex"
                                                        />
                                                    ) : (
                                                        item.supportquanlity !== undefined && (
                                                            <img
                                                                width={24}
                                                                src={`/images/icon/${qualityToImage[item.supportquanlity]}`}
                                                                alt="ex"
                                                            />
                                                        )
                                                    )}

                                                    {/* {(
                                                        item.supportquanlity !== undefined && (
                                                            <img
                                                                width={24}
                                                                src={`/images/icon/${qualityToImage[item.supportquanlity]}`}
                                                                alt="ex"
                                                            />
                                                        )
                                                    )} */}
                                                </div>

                                            </div>
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
                                                <h4 class="margin-bottom-0">{lang["new case"]} </h4>
                                                <FontAwesomeIcon icon={faPaperPlane} onClick={submitPostCase} className={`size-24 ml-auto icon-add-production pointer `} title={lang["submit case"]} />
                                            </div>
                                        </div>
                                        <div class="table_section padding_infor_info_case_add">
                                            <div class="add-case">
                                                <div class="row field-case">
                                                    <div class="col-md-8">

                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <h5 class="mb-2" style={{ margin: '0', marginRight: '10px' }}>{lang["case title"]}<span className='red_star'>*</span></h5>
                                                            {errorMessagesadd.casetitle && (
                                                                <span class="error-message mb-1">{errorMessagesadd.casetitle}</span>
                                                            )}
                                                        </div>

                                                        <input type="text" class="form-control" value={postCase.casetitle}
                                                            // onChange={ (e) => { setPostCase({ ...postCase, casetitle: e.target.value }) }}

                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                setPostCase({ ...postCase, casetitle: value });
                                                                if (value.trim() && errorMessagesadd.casetitle) {
                                                                    setErrorMessagesadd({ ...errorMessagesadd, casetitle: '' });
                                                                }
                                                            }}

                                                            placeholder={lang["Enter case title"]} ></input>
                                                    </div>
                                                    <div class="col-md-4">
                                                        <h5 class="mb-2">{lang["case type"]}</h5>
                                                        <select className="form-control" name="role" value={postCase.casetype}
                                                            onChange={
                                                                (e) => { setPostCase({ ...postCase, casetype: e.target.value }) }}
                                                        >
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
                                                        <h5 class="mb-2" style={{ margin: '0', marginRight: '10px' }}>{lang["product name"]}<span className='red_star'>*</span></h5>
                                                        {errorMessagesadd.productname && (
                                                            <span class="error-message mb-1">{errorMessagesadd.productname}</span>
                                                        )}
                                                    </div>
                                                    <input type="text" class="form-control" value={postCase.productname}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            setPostCase({ ...postCase, productname: value });

                                                            if (value.trim() && errorMessagesadd.productname) {
                                                                setErrorMessagesadd({ ...errorMessagesadd, productname: '' });
                                                            }
                                                        }}
                                                        placeholder={lang["Enter product name"]} ></input>
                                                </div>

                                                <div class="col-md-12">

                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <h5 class="mb-2" style={{ margin: '0', marginRight: '10px' }}>{lang["ISSUE DESCRIPTION"]}<span className='red_star'>*</span></h5>
                                                        {errorMessagesadd.issue && (
                                                            <span class="error-message mb-1">{errorMessagesadd.issue}</span>
                                                        )}
                                                    </div>
                                                    <textarea class="form-control" rows={6} value={postCase.issue} onChange={(e) => {
                                                        const value = e.target.value;
                                                        setPostCase({ ...postCase, issue: value });

                                                        if (value.trim() && errorMessagesadd.issue) {
                                                            setErrorMessagesadd({ ...errorMessagesadd, issue: '' });
                                                        }
                                                    }} placeholder={lang["p.issue"]}></textarea>
                                                </div>
                                                <div class="row field-case">
                                                    <div className="col-md-4">
                                                        <h5 className="mb-2">{lang["attachment"]}</h5>
                                                        <div className="upload-container-case">
                                                            {!selectedImage && (
                                                                <label style={{ margin: 0 }} htmlFor="file-upload" className="custom-file-upload">
                                                                    {lang["Choose Image"]}
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
                                                                        title={lang["Click to change image"]}
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
                                                                <FontAwesomeIcon icon={faPlusSquare} className={`size-24 mb-1 icon-add pointer `} title={lang["attachment"]} />
                                                            </label>
                                                            <input
                                                                id="file-upload-media"
                                                                type="file"
                                                                style={{ display: "none" }}
                                                                onChange={handleAttachMedia}
                                                                accept="image/*,video/*"
                                                            />
                                                        </div>
                                                        {attachMedia.length > 0 ?
                                                            (
                                                                <>
                                                                    <div className="upload-container-case-add">
                                                                        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

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
                                                                    </div>
                                                                </>
                                                            ) :
                                                            <div className="container-no-attachment">
                                                                <span className="span-no-attachment">{lang["No attachment"]}</span>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                                <TableInputAdd onDataUpdate={handleDataFromChild} stateAdd={true} stateUpdate={false} />
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
                                            <h4 class="ellipsis-header-case" title={dataCaseDetail.title}>{dataCaseDetail.title}</h4>
                                            <div class="d-flex ">
                                                <p class="italic" style={{ marginBottom: 0 }}>{lang["Posted on"]} {dataCaseDetail && langItemCheck === "Vi" ? functions.translateDateToVietnamese(functions.formatDateCase(dataCaseDetail.date)) : functions.formatDateCase(dataCaseDetail.date)} ({getElapsedTime(dataCaseDetail.date)}). <b class="status_label">{dataCaseDetail.status}</b></p>
                                                {/* <div class="ml-auto">
                                                    {dataCaseDetail.supportquanlity !== undefined ?
                                                        <img width={32} src={`/images/icon/${qualityToImage[dataCaseDetail.supportquanlity]}`} alt="ex" />
                                                        :
                                                        <div style={{ height: "32px" }}></div>
                                                    }
                                                </div> */}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="table_section padding_infor_info_case_detail">
                                        <div>
                                            <div className="custom-tab-container">
                                                <div className={`custom-tab ${activeTab === 'general' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('general')}>
                                                    {lang["general"]}
                                                </div>
                                                {/* <div className={`custom-tab ${activeTab === 'products' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('products')}>
                                                    Products
                                                </div> */}
                                                <div className={`custom-tab ${activeTab === 'discussion' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('discussion')}>
                                                    {lang["DISCUSSION"]}
                                                </div>
                                                <div className={`custom-tab ${activeTab === 'support' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('support')}>
                                                    {lang["SUPPORT QUALITY"]}

                                                </div>
                                            </div>

                                            <div>
                                                {activeTab === 'general' &&
                                                    <div>  <div class="card-block">
                                                        <div class="col-md-12">
                                                            <div class="info-case">
                                                                <h5 class="mt-1">{lang["ISSUE DESCRIPTION"]}</h5>
                                                                <span>{dataCaseDetail.issue}</span>

                                                                <div class="row field-case">
                                                                    <div className="col-md-4">

                                                                        <div className="upload-container-case">
                                                                            {dataCaseDetail.imgcase !== null ?
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
                                                                                    data-toggle="modal" data-target="#previewMedia"
                                                                                    title={lang["Click to preview"]} />
                                                                                :
                                                                                <span>{lang["no image case"]}</span>

                                                                            }

                                                                        </div>
                                                                    </div>
                                                                    {/* <div class="col-md-8">
                                                                        <div className="upload-container-case">
                                                                            <img class="" src="/images/helpdesk/r10.png" />
                                                                        </div>
                                                                    </div> */}
                                                                    <div class="col-md-8">

                                                                        {dataCaseDetail?.attachMedia?.length > 0 ?
                                                                            (
                                                                                <>
                                                                                    <div className="upload-container-case-add">
                                                                                        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

                                                                                        <div className="selected-images-container-add">
                                                                                            {dataCaseDetail?.attachMedia?.map((media, index) => (
                                                                                                <div key={index} className="selected-image-wrapper-add">
                                                                                                    {functions.isImageFormat(media["1FN"]) && (
                                                                                                        <img src={serverImage + media["6U"]} alt={`Selected ${index}`}
                                                                                                            className="selected-image-add pointer" data-toggle="modal" data-target="#previewMedia"
                                                                                                            onClick={() => openModalPreview({ type: "attachImageDetail", url: serverImage + media["6U"] })}
                                                                                                            title={lang["Click to preview"]} />
                                                                                                    )}
                                                                                                    {functions.isVideoFormat(media["1FN"]) && (
                                                                                                        <div>
                                                                                                            <video autoplay controls={false} src={serverImage + media["6U"]}
                                                                                                                className="selected-image-add pointer"
                                                                                                                data-toggle="modal" data-target="#previewMedia"
                                                                                                                onClick={() => openModalPreview({ type: "attachVideoDetail", url: serverImage + media["6U"] })}
                                                                                                                title={lang["Click to preview"]}   >
                                                                                                            </video>
                                                                                                            <div class="video-duration">Video</div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                </>
                                                                            ) :
                                                                            <div className="container-no-attachment">
                                                                                <span className="span-no-attachment">{lang["No attachment"]}</span>
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div class="title-suggest">{lang["SUGGESTED SOLUTION"]}</div>
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
                                                        <div class="card-block-message  bg-message">
                                                            <div class="col-md-12">
                                                                <div class="info-case">
                                                                    <div className="messages-wrapper" style={{ height: calculateHeight() }} ref={messagesEndRef} id="messages-wrapper">


                                                                        {contextMenu.visible && ReactDOM.createPortal(
                                                                            <div
                                                                                className="custom-context-menu"
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    top: `${contextMenu.position.y}px`,
                                                                                    left: `${contextMenu.position.x}px`,
                                                                                    zIndex: 1000,
                                                                                }}
                                                                            >
                                                                                <ul>
                                                                                    <li onClick={() => withDrawMessage()}>
                                                                                        <FontAwesomeIcon icon={faRectangleXmark} className={`size-16 mr-2 icon-close-message pointer`} />
                                                                                        Remove
                                                                                    </li>
                                                                                </ul>
                                                                            </div>,
                                                                            document.getElementById('portal-root')
                                                                        )}
                                                                        {(dataMessageMerged && dataMessageMerged.length > 0) && dataMessageMerged.map((item, index) => {
                                                                            const words = (item["1MC"] || "").split(' ');
                                                                            const shouldTruncate = words.length > 50 && !showFullMessage[item["1MI"]];
                                                                            const truncatedText = words.slice(0, 50).join(' ');
                                                                            const isSentByUser = item["1PB"] === username;

                                                                            return (
                                                                                <div
                                                                                    key={index}
                                                                                    className={`message-container ${isSentByUser ? "sent" : "received"}`}
                                                                                    onContextMenu={(event) => {
                                                                                        if (isSentByUser) {
                                                                                            handleContextMenu(event, item);
                                                                                        }
                                                                                    }}>
                                                                                    <span className="message-image-user">{item["1PB"] || "Unknown"}</span>
                                                                                    <p style={{ margin: 0 }}>
                                                                                        {shouldTruncate ? (
                                                                                            <>
                                                                                                {truncatedText}
                                                                                                <a onClick={() => toggleShowFullMessage(item["1MI"])} className="font-weight-bold pointer">... {lang["Show more"]}</a>
                                                                                            </>
                                                                                        ) : (
                                                                                            item["1MC"]
                                                                                        )}
                                                                                    </p>
                                                                                    {item.media && (
                                                                                        <div className="media-container">
                                                                                            {item.media.map(media => (
                                                                                                media["9MT"] === "image" ? (
                                                                                                    <img className="message-image pointer" src={serverImage + media["5U"]}
                                                                                                        data-toggle="modal" data-target="#previewMedia"
                                                                                                        onClick={() => openModalPreview({ type: "imageMessageMedia", url: serverImage + media["5U"] })}
                                                                                                        alt="Media content"
                                                                                                        title={lang["Click to preview"]} />
                                                                                                ) : (
                                                                                                    <div className="video-container">
                                                                                                        <video className="message-image pointer" controls={false} src={serverImage + media["5U"]} type="video/mp4"

                                                                                                        >
                                                                                                        </video>

                                                                                                        <div className="video-overlay pointer" data-toggle="modal" data-target="#previewMedia"
                                                                                                            onClick={() => openModalPreview({ type: "videoMessageMedia", url: serverImage + media["5U"] })}
                                                                                                            title={lang["Click to preview"]}></div>
                                                                                                        <div className="video-icon play-icon">
                                                                                                            < FontAwesomeIcon icon={faCirclePlay} className="size-16  color_icon_plus" />
                                                                                                        </div>

                                                                                                    </div>
                                                                                                )
                                                                                            ))}
                                                                                        </div>
                                                                                    )}

                                                                                    <div className="message-timestamp"> {dataCaseDetail && langItemCheck === "Vi" ? functions.translateDateTimeToVietnamese(functions.formatDateMessage(item["1PA"])) : functions.formatDateMessage(item["1PA"])} </div>
                                                                                </div>
                                                                            );
                                                                        })}

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
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

                                                            {/* <input type="text" class="chat-input" value={dataMessageSent.message} onChange={
                                                                (e) => { setDataMessageSent({ ...dataMessageSent, message: e.target.value }) }
                                                            } placeholder="Type a message..." />
                                                             */}
                                                            <textarea
                                                                ref={textareaRef}
                                                                className="chat-input no-change-textarea"
                                                                value={dataMessageSent.message}
                                                                onChange={handleInputChange}
                                                                placeholder={lang["Type a message"]}
                                                                rows={1}

                                                            />
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
                                                                title={lang["attachment"]}
                                                            />
                                                            <FontAwesomeIcon onClick={submitMessage} icon={faPaperPlane} className={`size-24 ml-auto mr-2 icon-add-production pointer`} title={lang["send message"]} />
                                                        </div>
                                                    </>
                                                }
                                                {activeTab === 'support' &&
                                                    <div class="card-block">

                                                        {isLoading ? (
                                                            // Hiển thị hình ảnh loading
                                                            <div class="row">
                                                                <div class="mt-4 col-lg-12 align-center">
                                                                    <img
                                                                        width={32}
                                                                        className="mb-1"
                                                                        src="/images/icon/load.gif"
                                                                        alt="Loading..."
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            // Nội dung chính
                                                            <div>
                                                                {dataCaseDetail.supportquanlity === undefined && supportQuanlity === 0 &&
                                                                    <div class="col-md-12">
                                                                        <div class="info-case align-center-case mt-2">
                                                                            <span>{lang["You have not rated the quality of support"]}</span>
                                                                            <button class="btn btn-primary" onClick={() => { setSupportQuanlity(1) }}>{lang["rate now"]}</button>
                                                                        </div>
                                                                    </div>
                                                                }
                                                                {(dataCaseDetail.supportquanlity !== undefined || supportQuanlity === 1) &&
                                                                    <>
                                                                        <h5 class="mt-1 mb-3">{lang["APPRICIATE THE SERVICE QUALITY"]}</h5>
                                                                        <div class="row">
                                                                            <div class="form-group col-lg-12 align-center">
                                                                                <div class="form-group col-lg-12 align-center">
                                                                                    <div className={`icon-rate ${rating === 'No Reply' ? 'icon-rate-selected' : ''}`} data-text="No Reply" onClick={() => handleRatingClick('No Reply')}>
                                                                                        <img class="icon-rate" style={{ filter: rating === 'No Reply' ? 'grayscale(0%)' : 'grayscale(100%)' }} src="/images/icon/i5.png" />
                                                                                        <span class="tooltip-text5">No Reply</span>
                                                                                    </div>
                                                                                    <div className={`icon-rate ${rating === 'Bad' ? 'icon-rate-selected' : ''}`} data-text="Bad" onClick={() => handleRatingClick('Bad')}>
                                                                                        <img class="icon-rate" style={{ filter: rating === 'Bad' ? 'grayscale(0%)' : 'grayscale(100%)' }} src="/images/icon/i4.png" />
                                                                                        <span class="tooltip-text4">Bad</span>
                                                                                    </div>

                                                                                    <div className={`icon-rate ${rating === 'Medium' ? 'icon-rate-selected' : ''}`} data-text="Medium" onClick={() => handleRatingClick('Medium')}>
                                                                                        <img class="icon-rate" style={{ filter: rating === 'Medium' ? 'grayscale(0%)' : 'grayscale(100%)' }} src="/images/icon/i3.png" />
                                                                                        <span class="tooltip-text3">Medium</span>
                                                                                    </div>


                                                                                    <div className={`icon-rate ${rating === 'Pretty good' ? 'icon-rate-selected' : ''}`} data-text="Pretty good" onClick={() => handleRatingClick('Pretty good')}>
                                                                                        <img class="icon-rate" style={{ filter: rating === 'Pretty good' ? 'grayscale(0%)' : 'grayscale(100%)' }} src="/images/icon/i2.png" />
                                                                                        <span class="tooltip-text2">Pretty good</span>
                                                                                    </div>

                                                                                    <div className={`icon-rate ${rating === 'Good' ? 'icon-rate-selected' : ''}`} data-text="Good" onClick={() => handleRatingClick('Good')}>
                                                                                        <img className="icon-rate" style={{ filter: rating === 'Good' ? 'grayscale(0%)' : 'grayscale(100%)' }} src="/images/icon/i1.png" />
                                                                                        <span className="tooltip-text1">Good</span>
                                                                                    </div>

                                                                                </div>
                                                                            </div>
                                                                            <div class="form-group col-lg-12">
                                                                                <textarea class="form-control" value={postRating.content} onChange={
                                                                                    (e) => { setPostRating({ ...postRating, content: e.target.value }) }}
                                                                                    rows={10}
                                                                                    style={{ resize: 'none' }}
                                                                                    placeholder={lang["Let us know how you feel"]}></textarea>
                                                                            </div>

                                                                        </div>
                                                                        <div class="form-group col-md-12">
                                                                            <div class="d-flex">
                                                                                <p style={{ marginBottom: 0 }}> {lang["Last updated by"]} <span className="italic-non font-weight-bold-black">{dataCaseDetail.customer}</span> </p>
                                                                                <button type="button" onClick={submitRate} data-dismiss="modal" class="btn mt-0 btn-primary ml-auto modal-button-review">{lang["Submit Review"]}</button>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                }
                                                            </div>
                                                        )}




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
                                                    <div class="icon-rate" data-text="Good">
                                                        <img class="icon-rate" src="/images/icon/i1.png" />
                                                        <span class="tooltip-text1">Good</span>
                                                    </div>
                                                    <div class="icon-rate" data-text="Pretty good">
                                                        <img class="icon-rate" src="/images/icon/i2.png" />
                                                        <span class="tooltip-text2">Pretty good</span>
                                                    </div>
                                                    <div class="icon-rate" data-text="Medium">
                                                        <img class="icon-rate" src="/images/icon/i3.png" />
                                                        <span class="tooltip-text3">Medium</span>
                                                    </div>
                                                    <div class="icon-rate" data-text="Bad">
                                                        <img class="icon-rate" src="/images/icon/i4.png" />
                                                        <span class="tooltip-text4">Bad</span>
                                                    </div>
                                                    <div class="icon-rate" data-text="No Reply">
                                                        <img class="icon-rate" src="/images/icon/i5.png" />
                                                        <span class="tooltip-text5">No Reply</span>
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
                                    <h4 class="modal-title modal-header-f18">{lang["Case Update"]}</h4>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <div class="row field-case">
                                            <div class="col-md-8">

                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <h5 class="mb-2" style={{ margin: '0', marginRight: '10px' }}>{lang["case title"]}<span className='red_star'>*</span></h5>
                                                    {errorMessagesUpdate.title && (
                                                        <span class="error-message mb-1">{errorMessagesUpdate.title}</span>
                                                    )}
                                                </div>

                                                <input type="text" class="form-control"
                                                    value={caseUpdate.title} onChange={
                                                        (e) => { setCaseUpdate({ ...caseUpdate, title: e.target.value }) }}
                                                    placeholder="Enter case title" ></input>

                                            </div>
                                            <div class="col-md-4">
                                                <h5 class="mb-2">{lang["case type"]}</h5>
                                                <select className="form-control" name="role" value={caseUpdate.casetype} onChange={
                                                    (e) => { setCaseUpdate({ ...caseUpdate, casetype: e.target.value }) }}>
                                                    <option value={"Undefined"}>Undefined</option>
                                                    <option value={"Troublshooting"}>Troublshooting</option>
                                                    <option value={"Error"}>Error</option>
                                                    <option value={"Question"}>Question</option>
                                                    <option value={"Feature"}>Feature</option>
                                                    <option value={"Project"}>Project</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ paddingLeft: "0px", paddingRight: "0px" }} class="col-md-12 field-case">

                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <h5 class="mb-2" style={{ margin: '0', marginRight: '10px' }}>{lang["product name"]}<span className='red_star'>*</span></h5>
                                                {errorMessagesUpdate.productname && (
                                                    <span class="error-message mb-1">{errorMessagesUpdate.productname}</span>
                                                )}
                                            </div>

                                            <input type="text" class="form-control"
                                                value={caseUpdate.productname} onChange={
                                                    (e) => { setCaseUpdate({ ...caseUpdate, productname: e.target.value }) }}
                                                placeholder="Enter Product Name" ></input>
                                        </div>

                                        <div style={{ paddingLeft: "0px", paddingRight: "0px" }} class="col-md-12">

                                            <div style={{ display: 'flex', alignItems: 'center' }}>

                                                <h5 class="mb-2" style={{ margin: '0', marginRight: '10px' }}>{lang["ISSUE DESCRIPTION"]}<span className='red_star'>*</span></h5>
                                                {errorMessagesUpdate.issue && (
                                                    <span class="error-message mb-1">{errorMessagesUpdate.issue}</span>
                                                )}
                                            </div>
                                            <textarea class="form-control no-change-textarea" rows={8}
                                                value={caseUpdate.issue} onChange={
                                                    (e) => { setCaseUpdate({ ...caseUpdate, issue: e.target.value }) }}></textarea>
                                        </div>
                                        <div class="row field-case">
                                            <div className="col-md-4">
                                                <h5 className="mb-2">{lang["attachment"]}</h5>
                                                <div className="upload-container-case">
                                                    {((caseUpdate.caseimage === "" && selectedImage == null)) && (
                                                        <label style={{ margin: 0 }} htmlFor="file-upload" className="custom-file-upload">
                                                            {lang["Choose Image"]}
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
                                                    {!selectedImage && caseUpdate.caseimage !== "" && (
                                                        <>
                                                            <img
                                                                id="image-preview"
                                                                src={serverImage + caseUpdate.caseimage}
                                                                alt="Image Preview"
                                                                style={{
                                                                    maxWidth: 'calc(100% - 40px)',
                                                                    maxHeight: 'calc(100% - 10px)',
                                                                    objectFit: 'contain',
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => document.getElementById('file-upload').click()}
                                                                title={lang["Click to change image"]}
                                                            />
                                                            <button onClick={(e) => removeImageCaseUpdate(e)} className="remove-image-case">X</button>
                                                        </>
                                                    )}
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
                                                                title={lang["Click to change image"]}
                                                            />
                                                            <button onClick={(e) => removeImageCase(e)} className="remove-image-case">X</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div class="col-md-8">
                                                <div class="d-flex">
                                                    <h5 className="mb-2"></h5>
                                                    <label style={{ marginBottom: 0 }} htmlFor="file-upload-media" class="ml-auto" >
                                                        <FontAwesomeIcon icon={faPlusSquare} className={`size-24 mb-1 icon-add pointer `} title="Choose Image" />
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

                                                    <div className="selected-images-container-add">
                                                        {/* Hình cũ */}
                                                        {caseUpdate.attachMedia?.map((media, index) => (
                                                            <div key={index} className="selected-image-wrapper-add">
                                                                {media["28T"] === 'image' && (
                                                                    <img src={serverImage + media["6U"]} alt={`Selected ${index}`} className="selected-image-add" />
                                                                )}
                                                                {media["28T"] === 'video' && (
                                                                    <div>
                                                                        <video autoplay controls={false} src={serverImage + media["6U"]} className="selected-image-add pointer" >
                                                                        </video>
                                                                        {/* <div class="video-duration"> {media.name}</div> */}
                                                                        <div class="video-duration">Video</div>
                                                                    </div>
                                                                )}
                                                                <button onClick={(e) => removeAttachMediaUpdate(e, media)} className="remove-image">X</button>
                                                            </div>
                                                        ))}

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


                                                </div>
                                            </div>
                                        </div>



                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" onClick={submitUpdateCase} class="btn btn-primary modal-button-review">Update</button>
                                    <button type="button" onClick={handleCloseModal} data-dismiss="modal" id="closeModalUpdateCase" class="btn btn-danger modal-button-review">Close</button>
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
                                                    <img src={serverImage + dataPreviewMedia?.url}
                                                        style={{
                                                            maxWidth: 'calc(100% - 40px)',
                                                            maxHeight: 'calc(100% - 10px)',
                                                            objectFit: 'contain',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer'
                                                        }}
                                                        alt={dataPreviewMedia?.name} />
                                                )}
                                                {dataPreviewMedia?.type === 'attachImageDetail' && (
                                                    <img src={dataPreviewMedia?.url} alt={dataPreviewMedia?.name} style={{ width: '70%' }} />
                                                )}
                                                {dataPreviewMedia?.type === 'attachVideoDetail' && (
                                                    <video autoplay controls style={{ width: '100%' }} src={dataPreviewMedia?.url} >

                                                    </video>
                                                )}
                                                {dataPreviewMedia?.type === 'image' && (
                                                    <img src={dataPreviewMedia?.url} alt={dataPreviewMedia?.name} style={{ width: '100%' }} />
                                                )}
                                                {dataPreviewMedia?.type === 'video' && (
                                                    <video autoplay controls style={{ width: '100%' }} src={dataPreviewMedia?.dataUrl} >
                                                        <source src={dataPreviewMedia?.dataUrl} type="video/*" />
                                                    </video>
                                                )}
                                                {/* Chat */}
                                                {dataPreviewMedia?.type === 'imageMessageMedia' && (
                                                    <img src={dataPreviewMedia?.url} alt={dataPreviewMedia?.name} style={{ width: '70%' }} />
                                                )}
                                                {dataPreviewMedia?.type === 'videoMessageMedia' && (
                                                    <video autoplay controls style={{ width: '100%' }} src={dataPreviewMedia?.url} >

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

