
import { useParams } from "react-router-dom";
import ReactDOM from 'react-dom';
import { useState, useEffect, useRef, React } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMaximize, faMinimize, faDownload, faCompress, faChartBar, faPlusCircle, faCirclePlus, faCirclePlay, faRectangleXmark, faCircle, faCircleXmark, faAngleDown, faEllipsisVertical, faPlusSquare, faPaperPlane, faPaperclip, faAngleLeft, faClose, faSquare, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import TableInputUpdate from './table/table-input-update'
import TableInputAdd from './table/table-input-add'
import $ from 'jquery'
import isEqual from 'lodash/isEqual';
import ReactImageMagnify from 'react-image-magnify';
import Zoom from "./table/image-zoom"
import platform from "platform";




import ReCAPTCHA from "react-google-recaptcha";






export default () => {
    const { lang, proxy, auth, functions } = useSelector(state => state);

    let langItemCheck = localStorage.getItem("lang");
    let langItem = localStorage.getItem("lang") ? localStorage.getItem("lang") : "Vi";
    const _token = localStorage.getItem("_token");
    // console.log(_token)
    const [logs, setLogs] = useState([]);
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser) || {}
    const username = _user.username === "nhan.to" ? "Mylan Digital Solution" : _user.username;
    const storedPwdString = localStorage.getItem("password_hash");
    const [serverImage, setServerImage] = useState("");
    const [cases, setCases] = useState([]);
    const [caseUpdate, setCaseUpdate] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [supportQuanlity, setSupportQuanlity] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [dataMessageSent, setDataMessageSent] = useState({ message: "" });
    const [dataMessage, setDataMessage] = useState([]);
    const [dataMessageMedia, setDataMessageMedia] = useState([]);
    const [errorMessagesadd, setErrorMessagesadd] = useState({});
    const [dataMessageMerged, setDataMessageMerged] = useState([]);
    const [errorMessagesUpdate, setErrorMessagesUpdate] = useState({});
    const [postCase, setPostCase] = useState({ casetype: "Undefined" });
    const [dataCaseDetail, setDataCaseDetail] = useState({});
    const [selectedCaseDetail, setSelectedCaseDetail] = useState("");
    const [showPageDetail, setShowPageDetail] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [filteredCases, setFilteredCases] = useState(cases);

    // console.log(cases)

    const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
    const recaptchaRef = useRef();

    // Hàm xử lý khi captcha thay đổi (được giải quyết)
    const onReCAPTCHAChange = (value) => {
        if (value) {
            console.log("Thành công, gọi hàm Thêm case")
        } else {
            console.log("Thất bại")
        }
    };


    // console.log(47, dataCaseDetail)
    // console.log("data update", caseUpdate)
    // console.log(_token)
    // console.log(dataMessage)
    // console.log(dataMessageMedia)
    // console.log(dataMessageMerged)

    const listError = [
        { id: 0, label: "Undefined", value: 1, color: "#808080" }, // Màu xám
        { id: 1, label: "Troubleshooting", value: 2, color: "#007BFF" }, // Màu xanh dương
        { id: 2, label: "Error", value: 3, color: "#FF0000" }, // Màu đỏ
        { id: 3, label: "Question", value: 4, color: "#15bd4c" }, // Màu xanh lá cây nhạt
        { id: 4, label: "Feature", value: 5, color: "#800080" }, // Màu tím
        { id: 5, label: "Project", value: 6, color: "#0f46bb" }, // Màu xanh lam nhạt
    ];


    const qualityToImage = {
        "Good": "i1.png",
        "Pretty good": "i2.png",
        "Medium": "i3.png",
        "Bad": "i4.png",
        "No reply": "i5.png"
    };
    // Data table 
    const [tableData, setTableData] = useState([]);// Nhận từ Cpn con
    const [tableDataProduct, setTableDataProduct] = useState([]);
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

    const handleDataFromChild = (newData) => {
        setTableData(newData);
    };

    // Hàm đóng modal
    const handleCloseModal = () => {
        setShowModal(false);
        setAttachMedia([])
    };

    // Gọi hàm để cập nhật token
    // search
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
    // console.log(sortedCases)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // const filterCasesByDate = () => {
    //     if (!startDate || !endDate) {
    //         return sortedCases;
    //     }
    //     const start = new Date(startDate).getTime();
    //     const end = new Date(endDate).getTime() + (23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000); // Thêm gần một ngày
    //     return sortedCases.filter((item) => {
    //         const itemDate = new Date(parseInt(item.date.match(/\d+/)[0])).getTime();
    //         return itemDate >= start && itemDate <= end;
    //     });
    // };

    const filterCases = () => {
        let filtered = sortedCases;

        // Lọc theo ngày nếu có
        if (startDate && endDate) {
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime() + (23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000); // Thêm gần một ngày
            filtered = filtered.filter((item) => {
                const itemDate = new Date(parseInt(item.date.match(/\d+/)[0])).getTime();
                return itemDate >= start && itemDate <= end;
            });
        }

        // Lọc theo từ khóa tìm kiếm nếu có
        if (searchValue) {
            filtered = filtered.filter((caseItem) => {
                const { title, issue, customer } = caseItem;
                const searchString = `${title} ${issue} ${customer}`.toLowerCase();
                return searchString.includes(searchValue.toLowerCase());
            });
        }

        return filtered;
    };

    const handleSortChange = (sortType) => {
        setSortBy(sortType);
    };

    const isToday = (date) => {
        const today = new Date();
        const dateParts = date.match(/\d+/g); // Trích xuất các phần số từ chuỗi ngày
        if (dateParts && dateParts.length >= 2) {
            const timestamp = parseInt(dateParts[0], 10); // Lấy timestamp
            const timezoneOffset = parseInt(dateParts[1], 10) / 100; // Lấy offset múi giờ

            // Tạo đối tượng Date từ timestamp và offset múi giờ
            const d = new Date(timestamp + timezoneOffset * 3600000);

            return (
                d.getDate() === today.getDate() &&
                d.getMonth() === today.getMonth() &&
                d.getFullYear() === today.getFullYear()
            );
        }
        return false; // Trả về false nếu không xử lý được định dạng ngày
    };

    const sortCases = (cases, sortBy) => {
        if (!Array.isArray(cases)) {
            return [];
        }
        switch (sortBy) {
            case 'today':
                return cases.filter((caseItem) => isToday(caseItem.date));

            case 'aToZ':
                return [...cases].sort((a, b) => a.title.localeCompare(b.title));

            case 'zToA':
                return [...cases].sort((a, b) => b.title.localeCompare(a.title));

            case 'newest':
                return [...cases].sort((a, b) => {
                    const datePartsA = a.date.match(/\d+/g);
                    const datePartsB = b.date.match(/\d+/g);
                    if (datePartsA && datePartsA.length >= 2 && datePartsB && datePartsB.length >= 2) {
                        const timestampA = parseInt(datePartsA[0], 10);
                        const timestampB = parseInt(datePartsB[0], 10);
                        const timezoneOffsetA = parseInt(datePartsA[1], 10) / 100;
                        const timezoneOffsetB = parseInt(datePartsB[1], 10) / 100;
                        const dateA = new Date(timestampA + timezoneOffsetA * 3600000);
                        const dateB = new Date(timestampB + timezoneOffsetB * 3600000);
                        return dateB - dateA;
                    }
                    return 0;
                });

            case 'oldest':
                return [...cases].sort((a, b) => {
                    const datePartsA = a.date.match(/\d+/g);
                    const datePartsB = b.date.match(/\d+/g);
                    if (datePartsA && datePartsA.length >= 2 && datePartsB && datePartsB.length >= 2) {
                        const timestampA = parseInt(datePartsA[0], 10);
                        const timestampB = parseInt(datePartsB[0], 10);
                        const timezoneOffsetA = parseInt(datePartsA[1], 10) / 100;
                        const timezoneOffsetB = parseInt(datePartsB[1], 10) / 100;

                        const dateA = new Date(timestampA + timezoneOffsetA * 3600000);
                        const dateB = new Date(timestampB + timezoneOffsetB * 3600000);

                        return dateA - dateB;
                    }
                    return 0;
                });
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

    //  Day ISO
    // const getElapsedTime = (notifyAt) => {
    //     const notifyTimestamp = new Date(notifyAt);
    //     const elapsedMilliseconds = currentTimestamp - notifyTimestamp;
    //     const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
    //     const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    //     const elapsedHours = Math.floor(elapsedMinutes / 60);
    //     const elapsedDays = Math.floor(elapsedHours / 24);
    //     const elapsedMonths = Math.floor(elapsedDays / 30);
    //     const elapsedYears = Math.floor(elapsedMonths / 12);
    //     if (elapsedYears > 0) {
    //         return `${elapsedYears} ${lang["years ago"]}`;
    //     } else if (elapsedMonths > 0) {
    //         return `${elapsedMonths} ${lang["months ago"]}`;
    //     } else if (elapsedDays > 0) {
    //         return `${elapsedDays} ${lang["days ago"]}`;
    //     } else if (elapsedHours > 0) {
    //         return `${elapsedHours} ${lang["hours ago"]}`;
    //     } else if (elapsedMinutes > 0) {
    //         return `${elapsedMinutes} ${lang["mins ago"]}`;
    //     } else if (elapsedMilliseconds > 0) {
    //         return `${elapsedSeconds} ${lang["secs ago"]}`;
    //     } else {
    //         return lang["just now"];
    //     }
    // };

    //  Hàm tính thời gian kể từ
    const getElapsedTime = (notifyAt) => {
        if (!notifyAt) {
            return "";
        }
        try {
            // Trích xuất phần số từ chuỗi ngày
            const match = notifyAt.match(/\/Date\((\d+)\+\d+\)\//);
            if (!match) {
                throw new Error("Invalid date format");
            }

            const notifyTimestamp = new Date(parseInt(match[1], 10));
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
        } catch (error) {
            console.error(error);
            return "";
        }
    };

    const fetchDataProduct = async (caseid) => {
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
            setTableDataProduct(resp.Details);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };



    const dataUpdateCase = (dataUpdate) => {
        // console.log(dataUpdate)
        setShowPageUpdate(true)
        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            "1CI": dataUpdate.id
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
                const { Success, data, activated, status, content, Case, fields } = resp;
                // console.log(429, resp)
                if (!Case || !fields) {

                    return;
                }
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
                // console.log(427, mappedCase);
                const caseDetail = {
                    id: mappedCase["CASE ID"],
                    title: mappedCase["CASE TITLE"],
                    casetype: mappedCase["CASE TYPE"],
                    productname: mappedCase["PRODUCT NAME"],
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
                // console.log(442, caseDetail);
                setCaseUpdate(caseDetail)
            })
    }

    const handlePageDetail = (caseid) => {

        setRating(null)

        setPostRating({})

        setDataCaseDetail({})

        fetchDataProduct(caseid)

        setTableDataProduct([]);

        setSelectedCaseDetail(caseid.id)
        localStorage.setItem('selectedCaseDetail', caseid.id);

        setShowPageDetail(true)

        setPostCase({ casetype: "Undefined" })
        setSelectedImage(null)
        setAttachMedia([])


        setShowPageAdd(false)

        setShowPageUpdate(false)

        callApiMessage()

        callApiMessageMedia()

        callApiCaseDetail(caseid)

    }


    useEffect(() => {
        const storedSelectedCaseDetail = localStorage.getItem('selectedCaseDetail');
        if (storedSelectedCaseDetail) {
            setSelectedCaseDetail(storedSelectedCaseDetail);
            const caseid = { id: storedSelectedCaseDetail }
            handlePageDetail(caseid)
        }
        setDataMessageSent({ message: "" })
        setSelectedImagesSent([])
        setPostCase({ casetype: "Undefined" })
        setSelectedImage(null)
        setAttachMedia([])
    }, [selectedCaseDetail]);


    const callApiCaseDetail = (caseid) => {
        if (caseid.id !== "") {
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
                    const { Success, data, activated, status, content, Case, fields } = resp;
                    // console.log(429, resp)
                    if (!Case || !fields) {

                        return;
                    }
                    const fieldMappings = resp.fields.reduce((acc, field) => {
                        acc[field.fomular_alias] = field.field_name;
                        return acc;
                    }, {});

                    const mappedCase = Object.keys(resp.Case).length > 0 && Object.keys(resp.Case).reduce((newCase, key) => {
                        const newKey = fieldMappings[key] || key;
                        newCase[newKey] = resp.Case[key];
                        return newCase;
                    }, {});

                    // console.log(427, mappedCase);
                    const caseDetail = {

                        id: mappedCase["CASE ID"],
                        title: mappedCase["CASE TITLE"],
                        date: mappedCase["CREATED DATE"],
                        casetype: mappedCase["CASE TYPE"],
                        issue: mappedCase["ISSUE DESCRIPTION"],
                        customer: mappedCase["CUSTOMER"],
                        status: mappedCase["STATUS"],
                        imgcase: mappedCase["CASE IMAGE"],
                        solution: mappedCase["SOLUTION DESCRIPTION"],
                        attachMedia: mappedCase["1CA"],
                        supportquanlity: mappedCase["SUPPORT QUALITY"],
                        supportdescription: mappedCase["SUPPORT QUALITY DESCRIPTION"],
                        lastedsupport: mappedCase["APPRICATOR"],
                        possibleFeature: mappedCase["POSSIBLE FEATURE"],
                        caseSuggest: mappedCase["CASE SUGGEST"],
                        warranty: mappedCase["WARRANTY CLAIM"]

                    };
                    // console.log(442, caseDetail);
                    setDataCaseDetail(caseDetail);

                })

        }

    }

    const [showPageAdd, setShowPageAdd] = useState(false);
    const [showPageUpdate, setShowPageUpdate] = useState(false);


    const handlePageAdd = () => {
        setShowPageAdd(true)
        setShowPageDetail(false)
        setShowPageUpdate(false)
    }

    const initialActiveTab = localStorage.getItem('activeTab') || 'general';
    const [activeTab, setActiveTab] = useState(initialActiveTab);

    // Hàm xử lý khi tab được chọn
    const handleTabClick = (tab, caseid) => {
        setActiveTab(tab);
        fetchDataProduct(caseid)
    };

    // Sử dụng useEffect để lưu trạng thái activeTab vào localStorage khi có sự thay đổi
    useEffect(() => {
        localStorage.setItem('activeTab', activeTab);
    }, [activeTab]);



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


    // Mặc định chọn trang đầu theo sắp xếp (nếu localStorage chưa lưu id của Case)
    useEffect(() => {
        if (selectedCaseDetail === "" && sortedCases.length > 0 && selectedThenRate === "") {
            const idCase = sortedCases?.[0]
            handlePageDetail(idCase)
        }

    }, [sortedCases]);

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
                const mappedCases = resp.Cases?.map((caseItem) => {
                    return Object.keys(caseItem).reduce((newCase, key) => {
                        const newKey = fieldMappings[key] || key; // Sử dụng field_name mới nếu tồn tại, nếu không giữ nguyên key
                        newCase[newKey] = caseItem[key];
                        return newCase;
                    }, {});
                });

                // console.log(610, mappedCases);
                const caseTitlesAndDates = mappedCases?.map((caseItem) => ({

                    id: caseItem["CASE ID"],
                    title: caseItem["CASE TITLE"],
                    date: caseItem["CREATED DATE"],
                    issue: caseItem["ISSUE DESCRIPTION"],
                    customer: caseItem["CUSTOMER"],
                    status: caseItem["STATUS"],
                    casetype: caseItem["CASE TYPE"],
                    productname: caseItem["2PN"],
                    caseimage: caseItem["CASE IMAGE"],
                    attachMedia: caseItem["1CA"],
                    supportquanlity: caseItem["SUPPORT QUALITY"],
                    supportdescription: caseItem["SUPPORT QUALITY DESCRIPTION"],
                    lastpostedby: caseItem["1LPB"],
                    lastpostedat: caseItem["1LPA"]

                }));
                // console.log(626, caseTitlesAndDates);
                setCases(caseTitlesAndDates)
            })
    }

    useEffect(() => {
        callApiListCase()
    }, [])

    //Image Case
    const [selectedImage, setSelectedImage] = useState(null);
    // useEffect(() => {
    //     // Cập nhật lại hình ảnh
    //     if(caseUpdate && Object(caseUpdate).length > 0){
    //       setCaseUpdate({imgcase: ""})
    //     }
    // }, [selectedImage]);

    // console.log(selectedImage)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.match('image.*')) {
                //    console.log("Kích thước ban đầu (bytes):", (file.size / 1024))
                const reader = new FileReader();
                reader.onload = (event) => {
                    setSelectedImage(event.target.result);
                };
                reader.onerror = (error) => {
                    // console.error('Error reading file:', error);
                    Swal.fire({
                        title: lang["error"],
                        text: lang["An error occurred while reading the file."],
                        icon: "error",
                        confirmButtonText: lang["confirm"]
                    });
                };
                // if (file.size <= 0.4 * 1024 * 1024) {
                //     reader.readAsDataURL(file);
                // } else {
                //     functions.resizeImageToFit(file, 1024, 768, 2000, (resizedBlob, isResized) => {
                //         //  console.log("Kích thước sau khi resize (bytes):", (resizedBlob.size/1024));
                //         // if (isResized) {
                //         // console.log("Ảnh đã được r/esize");
                //         // } else {
                //         // console.log("Ảnh giữ nguyên kích thước gốc");
                //         // }
                //         reader.readAsDataURL(resizedBlob);
                //     });
                // }
                reader.readAsDataURL(file);
            } else {
                Swal.fire({
                    title: lang["error"],
                    text: lang["Please upload an image file."],
                    icon: "error",
                    confirmButtonText: lang["confirm"]
                });
                e.target.value = null;
            }
            e.target.value = null;
        }
    };

    // Xóa ảnh Case
    const removeImageCase = (e) => {
        e.preventDefault();
        setSelectedImage(null)



    };

    // Attach Media
    const [attachMedia, setAttachMedia] = useState([]);
    // console.log(830, attachMedia)
    // const handleAttachMedia = (e) => {
    //     const newFiles = Array.from(e.target.files).filter(file =>
    //         file.type.startsWith('image/') || file.type.startsWith('video/')
    //     );

    //     if (newFiles.length < e.target.files.length) {
    //         Swal.fire({
    //             title: lang['error'],
    //             text: lang['Only image and video files are accepted'],
    //             icon: 'error',
    //             showConfirmButton: true,
    //             confirmButtonText: lang['confirm'],
    //             allowOutsideClick: false,
    //         });
    //         e.target.value = null;
    //         return;
    //     }

    //     const newMediaPromises = newFiles.map(file => {
    //         return new Promise((resolve) => {
    //             const reader = new FileReader();

    //             reader.onload = (readerEvent) => {
    //                 const mediaObject = {
    //                     name: file.name,
    //                     size: file.size,
    //                     url: URL.createObjectURL(file),

    //                     type: file.type.startsWith('video/') ? 'video' : 'image',
    //                     dataUrl: readerEvent.target.result, // Base64 string
    //                 };

    //                 if (file.type.startsWith('video/')) {
    //                     getVideoThumbnail(file).then(({ thumbnailUrl, duration }) => {
    //                         mediaObject.cover = thumbnailUrl;
    //                         mediaObject.duration = duration;
    //                         resolve(mediaObject);
    //                     });
    //                 } else {
    //                     resolve(mediaObject);
    //                 }
    //             };
    //             reader.readAsDataURL(file);
    //         });
    //     });

    //     Promise.all(newMediaPromises).then(newMediaFiles => {
    //         const totalSize = calculateTotalSizeAttach(newMediaFiles);
    //         // console.log("Dung lượng tổng", totalSize / 1024)
    //         if (totalSize > 20 * 1024 * 1024) {
    //             Swal.fire({
    //                 title: lang["error"],
    //                 text: lang["File is too large"],
    //                 icon: "error",
    //                 showConfirmButton: true,
    //                 confirmButtonText: lang["confirm"],
    //                 allowOutsideClick: false,
    //             });
    //         } else {
    //             setAttachMedia(prevImages => [...prevImages, ...newMediaFiles]);
    //         }

    //     });
    //     e.target.value = '';
    // };

    const handleAttachMedia = (e) => {
        console.log(e)

        const newFiles = Array.from(e.target.files).filter(file => {
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                return true;
            } else if (file.type === 'application/pdf' || fileExtension === 'pdf') {
                return true;
            } else if (file.type.includes('excel') || fileExtension === 'xls' || fileExtension === 'xlsx') {
                return true;
            } else if (fileExtension === 'zip') {
                return true;
            }
            return false;
        });
        // console.log(830, newFiles)

        if (newFiles.length < e.target.files.length) {
            Swal.fire({
                title: lang['error'],
                text: lang['Only image, video, PDF, and Excel files are accepted'],
                icon: 'error',
                showConfirmButton: true,
                confirmButtonText: lang['confirm'],
                allowOutsideClick: false,
            });
            e.target.value = '';
            return;
        }

        const newMediaPromises = newFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();

                reader.onload = (readerEvent) => {
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    let fileType;
                    if (file.type.startsWith('video/')) {
                        fileType = 'video';
                    } else if (file.type.startsWith('image/')) {
                        fileType = 'image';
                    } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
                        fileType = 'excel';
                    } else if (fileExtension === 'pdf') {
                        fileType = 'pdf';
                    } else if (fileExtension === 'zip') {
                        fileType = 'zip';
                    } else {
                        fileType = 'unknown'; // Hoặc một giá trị mặc định khác
                    }

                    const mediaObject = {
                        name: file.name,
                        size: file.size,
                        url: URL.createObjectURL(file),
                        type: fileType,
                        dataUrl: readerEvent.target.result, // Base64 string
                    };

                    if (file.type.startsWith('video/')) {
                        getVideoThumbnail(file).then(({ thumbnailUrl, duration }) => {
                            mediaObject.cover = thumbnailUrl;
                            mediaObject.duration = duration;
                            resolve(mediaObject);
                        });
                    } else {
                        resolve(mediaObject);
                    }
                };

                if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                    reader.readAsDataURL(file);
                } else {
                    // Đọc file PDF và Excel dưới dạng base64
                    reader.readAsDataURL(file);
                }
            });
        });

        Promise.all(newMediaPromises).then(newMediaFiles => {
            const totalSize = calculateTotalSizeAttach(newMediaFiles);
            if (totalSize > 20 * 1024 * 1024) {
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
        });
        e.target.value = '';
    };

    const handleFileContainerClick = (e) => {
        e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền ra ngoài
        e.preventDefault();
        document.getElementById('file-upload-media').click();
    }
    //  Xóa Attach Media
    const removeAttachMedia = (e, media) => {
        e.stopPropagation();
        e.preventDefault();
        const updatedMediaList = attachMedia.filter(item => item.url !== media.url);
        setAttachMedia(updatedMediaList)
    };
    // Xóa ảnh Case khi cập nhật
    const removeImageCaseUpdate = (e) => {
        e.preventDefault();
        setCaseUpdate(prevState => ({
            ...prevState,
            imgcase: '' // Cập nhật caseimage thành rỗng
        }));
    };
    // Xóa attah Media Case khi cập nhật
    const removeAttachMediaUpdate = (e, media) => {
        e.stopPropagation();
        e.preventDefault();
        // console.log(media)
        // Tạo một bản sao của caseUpdate
        const updatedCaseUpdate = { ...caseUpdate };

        // Lọc ra các phần tử khỏi mảng attachMedia
        updatedCaseUpdate.attachMedia = updatedCaseUpdate.attachMedia.filter(item => item["1II"] !== media["1II"]);

        // Cập nhật caseUpdate
        setCaseUpdate(updatedCaseUpdate);
    };

    // Lấy dữ liệu preview media
    const [dataPreviewMedia, setDataPreviewMedia] = useState();
    const openModalPreview = (media) => {
        setDataPreviewMedia(media)
    };

    // Lấy dữ liệu preview file
    const [dataPreviewFile, setDataPreviewFile] = useState();
    // console.log(dataPreviewFile)
    const openModalPreviewFile = (media) => {
        setDataPreviewFile(media)
    };


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

    // Thu gọn tin nhắn
    const [showFullMessage, setShowFullMessage] = useState(false);
    const toggleShowFullMessage = (id) => {
        setShowFullMessage(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    // Thêm Case mới
    const submitPostCase = (e) => {
        e.preventDefault();

        const { casetitle, casetype, productname, issue } = postCase;
        const errors = {};

        if (!casetitle) {
            errors.casetitle = lang["error.input"];
        }

        if (!productname) {
            errors.productname = lang["error.input"];
        }

        if (!issue) {
            errors.issue = lang["error.input"];
        }

        if (Object.keys(errors).length > 0) {
            setErrorMessagesadd(errors);
            return;
        }

        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            "1CT": postCase.casetitle,
            "2CT": postCase.casetype,
            "2PN": postCase.productname,
            "2CI": selectedImage ? selectedImage.split('base64,').pop() : null, // Kiểm tra nếu selectedImage có giá trị
            "1ID": postCase.issue,
            "1CA": functions.renameDuplicateFiles(
                attachMedia.map(item => ({
                    "1FN": item.name,
                    "Base64": item.dataUrl ? item.dataUrl.split('base64,').pop() : null // Kiểm tra nếu item.dataUrl có giá trị
                }))
            ),
            "11P": mappedArray
        };
        // console.log(936, requestBody)
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
                console.log(881, resp)
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

                    localStorage.setItem('selectedCaseDetail', resp["1CI"]);

                } else {
                    Swal.fire({
                        title: lang["faild"],
                        text: lang["faild create"],
                        icon: "error",
                        showConfirmButton: true,
                        cancelButtonText: lang["btn.cancel"],
                    })
                }
            });

    };
    // Cập nhật Case
    const submitUpdateCase = (e) => {
        e.preventDefault();

        const { title, productname, issue } = caseUpdate;
        const errors = {};

        if (!title) {
            errors.title = lang["error.input"];
        }

        if (!productname) {
            errors.productname = lang["error.input"];
        }

        if (!issue) {
            errors.issue = lang["error.input"];
        }

        if (Object.keys(errors).length > 0) {
            setErrorMessagesUpdate(errors);
            return;
        }

        if (recaptchaRef.current) {
            const recaptchaValue = recaptchaRef.current.getValue();
            // console.log(recaptchaValue)
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
            "2CI": (selectedImage && selectedImage !== null) ? selectedImage?.split('base64,').pop() :
                (caseUpdate.imgcase !== '' ? caseUpdate.imgcase : null),
            "1ID": caseUpdate.issue
        };

        // Kiểm tra selectedImage và thêm "2CI" nếu có giá trị
        if (selectedImage && selectedImage !== undefined) {
            requestBody["2CI"] = selectedImage?.split('base64,').pop();
        }

        // Kiểm tra attachMedia và thêm "1CA" nếu có giá trị
        if (attachMedia) {
            const mediaItems = attachMedia.map(item => ({
                "1II": null,
                "1FN": item.name,
                "Base64": item.dataUrl.split('base64,').pop()
            }));

            if (caseUpdate?.attachMedia) {
                const existingMediaItems = caseUpdate.attachMedia.map(item => ({
                    "1II": `${item["1II"]}`,
                    "1FN": item["1FN"],
                    "Base64": null
                }));

                requestBody["1CA"] = functions.renameDuplicateFiles(mediaItems.concat(existingMediaItems))
            } else {
                requestBody["1CA"] = functions.renameDuplicateFiles(mediaItems);
            }
        }

        // console.log("data body", requestBody)
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
                    setAttachMedia([])
                    setSelectedImage(null)
                    setIsCaptchaVerified(false)
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
    // Hàm kiểm tra dung lượng file tải lên
    const calculateTotalSize = (additionalFiles) => {
        return selectedImagesSent.reduce((acc, file) => acc + file.size, 0) + additionalFiles.reduce((acc, file) => acc + file.size, 0);
    };

    const calculateTotalSizeAttach = (additionalFiles) => {
        return attachMedia.reduce((acc, file) => acc + file.size, 0) + additionalFiles.reduce((acc, file) => acc + file.size, 0);
    };

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    })

    const handleImageChangeSent = async (e) => {
        const newFiles = Array.from(e.target.files).filter(file => {
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                return true;
            } else if (file.type === 'application/pdf' || fileExtension === 'pdf') {
                return true;
            } else if (file.type.includes('excel') || fileExtension === 'xls' || fileExtension === 'xlsx') {
                return true;
            }

            return false;
        });

        if (newFiles.length < e.target.files.length) {
            Swal.fire({
                title: lang['error'],
                text: lang['Only image, video, PDF, and Excel files are accepted'],
                icon: 'error',
                showConfirmButton: true,
                confirmButtonText: lang['confirm'],
                allowOutsideClick: false,
            });
            e.target.value = '';
            return;
        }

        const newMediaPromises = newFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                    const fileType = functions.determineFileType(file);
                    const mediaObject = {
                        name: file.name,
                        size: file.size,
                        base64: readerEvent.target.result,
                        url: URL.createObjectURL(file),
                        type: fileType,
                        dataUrl: readerEvent.target.result, // Base64 string
                    };

                    // Logic for video thumbnail
                    if (fileType === 'video') {
                        getVideoThumbnail(file).then(({ thumbnailUrl, duration }) => {
                            mediaObject.cover = thumbnailUrl;
                            mediaObject.duration = duration;
                            resolve(mediaObject);
                        });
                    } else {
                        resolve(mediaObject);
                    }
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newMediaPromises).then(newMediaFiles => {
            // console.log(newMediaFiles)
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
            e.target.value = '';
        });

        if (textareaRef.current) {
            textareaRef.current.focus();
        }
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
        if (dataCaseDetail.status === "Active") {
            setRating(newRating);
        }

    };

    const [postRating, setPostRating] = useState({});
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
                    // console.log(resp)
                    // console.log(resp.Case["1CI"])
                    setSelectedCaseDetail(selectedCaseDetail)
                    setSelectedThenRate(selectedCaseDetail)
                    // callApiListCase()
                    callApiCaseDetail(caseId)
                    callApiListCase()
                    // Đồng bộ trạng thái đánh giá 
                    const updateSortedCases = (resp) => {
                        const updatedCases = sortedCases.map(caseItem => {
                            if (caseItem.id === resp.Case["1CI"]) {
                                return { ...caseItem, supportquanlity: resp.Case["1SQ"] };
                            }
                            return caseItem;
                        });
                        // console.log(updatedCases)
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
    //  Thu hồi tin nhắn

    const withDrawMessage = () => {
        const requestBody = {
            checkCustomer: {
                username,
                password: storedPwdString
            },
            "4CI": contextMenu.item["4CI"],
            "1MI": parseInt(contextMenu.item["1MI"])
        }
        // console.log(requestBody)
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

                if (Success) {
                    callApiMessage()
                    callApiMessageMedia()
                    Promise.all([callApiMessage(), callApiMessageMedia()])
                        .then(() => {
                            mergedDataMessage();
                        });
                } else {
                    Swal.fire({
                        title: lang['notification'],
                        text: lang['withdraw'],
                        icon: 'warning',
                        showConfirmButton: true,
                        confirmButtonText: lang['confirm'],
                        allowOutsideClick: false,
                    });
                }
            })
    }


    const handleDownload = (url) => {
        window.open(url, '_blank');
    };




    // Gửi tin nhắn 
    const submitMessage = (e) => {
        e.preventDefault();

        // Kiểm tra nếu có tin nhắn hoặc hình ảnh thực sự
        if (dataMessageSent.message.trim() !== '' || selectedImagesSent.length > 0) {
            const requestBody = {
                checkCustomer: {
                    username,
                    password: storedPwdString
                },
                "4CI": selectedCaseDetail,
                "1MC": dataMessageSent.message,
                "1MM": selectedImagesSent.map(item => ({
                    "2FN": item.name,
                    "5U": item.base64.split('base64,').pop()
                }))
            };
            // console.log("body", requestBody);

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
                    // Xử lý phản hồi từ máy chủ
                    if (Success) {
                        // Gửi lại yêu cầu và xử lý phản hồi
                        Promise.all([callApiMessage(), callApiMessageMedia()])
                            .then(() => {
                                mergedDataMessage();
                            });

                        // Xóa tin nhắn và cài đặt lại chiều cao
                        setDataMessageSent({ message: "" });
                        if (textareaRef.current) {
                            textareaRef.current.style.height = '40px';
                        }
                        setHeightChat(40);

                        // Cập nhật các states khác
                        setSelectedImagesSent([]);
                    } else {
                        // Xử lý trường hợp lỗi nếu cần
                        console.error("Error:", content);
                        // Hiển thị thông báo lỗi cho người dùng nếu cần
                    }
                })
                .catch((error) => {
                    // Xử lý lỗi nếu có lỗi trong quá trình gửi yêu cầu
                    console.error('Error while sending request:', error);
                });
        }
    };

    const [isDragging, setIsDragging] = useState(false);
    // console.log(isDragging)
    const dragCounter = useRef(0);

    const handleDragEnter = (e) => {
        e.preventDefault();
        dragCounter.current++;
        if (dragCounter.current > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleFileDropMessage = async (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        const acceptedFileTypes = ['image/', 'video/', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'];
        const newMediaPromises = Array.from(files).map(async (file) => {
            if (acceptedFileTypes.some(type => file.type.startsWith(type) || file.name.endsWith('.zip'))) {
                const name = file.name;
                const base64 = await toBase64(file);
                const fileType = functions.determineFileType(file);

                let mediaObject = {
                    name: name,
                    size: file.size,
                    url: URL.createObjectURL(file),
                    type: fileType,
                    base64: base64,
                };

                if (fileType === 'video') {
                    const { thumbnailUrl, duration } = await getVideoThumbnail(file);
                    mediaObject.cover = thumbnailUrl;
                    mediaObject.duration = duration;
                }

                return mediaObject;
            } else {
                return null;
            }
        });

        const filteredMediaFiles = (await Promise.all(newMediaPromises)).filter(Boolean); // Remove any nulls

        if (filteredMediaFiles.length < files.length) {
            // There were some files that were not accepted
            Swal.fire({
                title: lang['error'],
                text: lang['Only image, video, PDF, and Excel files are accepted'],
                icon: 'error',
                showConfirmButton: true,
                confirmButtonText: lang['confirm'],
                allowOutsideClick: false,
            });
        }

        const totalSize = calculateTotalSize(filteredMediaFiles);

        // Check if total file size exceeds 20MB
        if (totalSize > 20971520) {
            Swal.fire({
                title: lang['error'],
                text: lang['File is too large'],
                icon: 'error',
                showConfirmButton: true,
                confirmButtonText: lang['confirm'],
                allowOutsideClick: false,
            });
        } else {
            setSelectedImagesSent((prevMedia) => [...prevMedia, ...filteredMediaFiles]);
        }
    };

    const handleFileDropAdd = async (e) => {
        e.preventDefault();

        const files = e.dataTransfer.files;
        const acceptedFileTypes = ['image/', 'video/', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'];

        const newMediaPromises = Array.from(files).map(async (file) => {
            // Lọc file dựa trên loại file
            if (acceptedFileTypes.some(type => file.type.startsWith(type) || file.name.endsWith('.zip'))) {
                const base64 = await toBase64(file);
                let fileType;

                if (file.type.startsWith('video/')) {
                    // Xử lý video
                    fileType = 'video';
                    return getVideoThumbnail(file).then(({ thumbnailUrl, duration }) => ({
                        name: file.name,
                        size: file.size,
                        url: URL.createObjectURL(file),
                        type: fileType,
                        base64: base64,
                        cover: thumbnailUrl,
                        duration,
                    }));
                } else if (file.type.startsWith('image/')) {
                    // Xử lý hình ảnh
                    fileType = 'image';
                } else if (file.type === 'application/pdf') {
                    // Xử lý file PDF
                    fileType = 'pdf';
                } else if (file.name.endsWith('.zip')) {
                    // Xử lý file zip
                    fileType = 'zip';
                    // ...xử lý zip...
                } else {
                    // Xử lý file Excel
                    fileType = 'excel';
                }

                return Promise.resolve({
                    name: file.name,
                    size: file.size,
                    url: URL.createObjectURL(file),
                    type: fileType,
                    base64: base64,
                    dataUrl: base64,
                });
            } else {
                throw new Error('Invalid file type');
            }
        });

        try {
            const newMediaFiles = await Promise.all(newMediaPromises);
            const totalSize = calculateTotalSizeAttach(newMediaFiles);

            if (totalSize > 20971520) { // 20 MB
                Swal.fire({
                    title: lang['error'],
                    text: lang['File is too large'],
                    icon: 'error',
                    showConfirmButton: true,
                    confirmButtonText: lang['confirm'],
                    allowOutsideClick: false,
                });
            } else {
                setAttachMedia((prevMedia) => [...prevMedia, ...newMediaFiles]);
            }
        } catch (error) {
            Swal.fire({
                title: lang['error'],
                text: lang['Only image, video, PDF, and Excel files are accepted'],
                icon: 'error',
                showConfirmButton: true,
                confirmButtonText: lang['confirm'],
                allowOutsideClick: false,
            });
        }
        setIsDragging(false);
    };




    const handleFileDropUpdate = async (e) => {
        e.preventDefault();

        const files = e.dataTransfer.files;
        const acceptedFileTypes = ['image/', 'video/', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'];

        const newMediaPromises = Array.from(files).map(async (file) => {
            // Lọc file dựa trên loại file
            if (acceptedFileTypes.some(type => file.type.startsWith(type) || file.name.endsWith('.zip'))) {
                const base64 = await toBase64(file);
                let fileType;

                if (file.type.startsWith('video/')) {
                    // Xử lý video
                    fileType = 'video';
                    // ...xử lý video...
                } else if (file.type.startsWith('image/')) {
                    // Xử lý hình ảnh
                    fileType = 'image';
                    // ...xử lý hình ảnh...
                } else if (file.type === 'application/pdf') {
                    // Xử lý file PDF
                    fileType = 'pdf';
                    // ...xử lý PDF...
                } else if (file.name.endsWith('.zip')) {
                    // Xử lý file zip
                    fileType = 'zip';
                    // ...xử lý zip...
                } else {
                    // Xử lý file Excel
                    fileType = 'excel';
                    // ...xử lý Excel...
                }

                return Promise.resolve({
                    name: file.name,
                    size: file.size,
                    url: URL.createObjectURL(file),
                    type: fileType,
                    base64: base64,
                    dataUrl: base64,
                });
            } else {
                throw new Error('Invalid file type');
            }
        });

        try {
            const newMediaFiles = await Promise.all(newMediaPromises);
            const totalSize = calculateTotalSizeAttach(newMediaFiles);

            if (totalSize > 20971520) { // 20 MB
                Swal.fire({
                    title: lang['error'],
                    text: lang['File is too large'],
                    icon: 'error',
                    showConfirmButton: true,
                    confirmButtonText: lang['confirm'],
                    allowOutsideClick: false,
                });
            } else {
                setAttachMedia((prevMedia) => [...prevMedia, ...newMediaFiles]);
            }
        } catch (error) {
            Swal.fire({
                title: lang['error'],
                text: lang['Only image, video, PDF, and Excel files are accepted'],
                icon: 'error',
                showConfirmButton: true,
                confirmButtonText: lang['confirm'],
                allowOutsideClick: false,
            });
        }
        setIsDragging(false);
    };


    const getPlaceholder = () => {
        if (isDragging) {
            return <span className="custom-placeholder ">{lang["Drag and drop images here"]}</span>;
        } else {
            return dataMessageSent.message ? '' : <span className="custom-placeholder">{lang["Type a message"]}</span>;
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
    // Gọi dữ liệu tin nhắn
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
                // console.log("datamessage", resp)

                if (!functions.arraysAreEqual(resp.Messages, dataMessagePrev)) {
                    setDataMessage(resp.Messages);
                    setDataMessagePrev(resp.Messages); // Lưu bản sao mới
                }
                // console.log(functions.arraysAreEqual(resp.Messages, dataMessagePrev))
                return resp;

            })
    }
    // Gọi dữ liệu Media 
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
                // console.log("data media", resp)
                if (!functions.arraysAreEqual(resp.Media, dataMessageMediaPrev)) {
                    setDataMessageMedia(resp.Media);
                    setDataMessageMediaPrev(resp.Media); // Lưu bản sao mới
                }
                return resp;
            })
    }
    // Merged tin nhắn và media
    const [dataMessageMergedPrev, setDataMessageMergedPrev] = useState(null);
    const mergedDataMessage = () => {
        if (!dataMessage || !dataMessageMedia) {
            // Xử lý trường hợp dữ liệu không tồn tại
            return;
        }

        // Sử dụng Set để lưu trữ khóa duy nhất
        const uniqueKeys = new Set();

        // Tìm các khóa duy nhất từ dataMessage
        dataMessage.forEach(messageItem => {
            const key = `${messageItem["1MI"]}_${messageItem["4CI"]}`;
            uniqueKeys.add(key);
        });

        // Tạo mảng gộp
        const mergedArray = Array.from(uniqueKeys).map(key => {
            const [key1MI, key4CI] = key.split("_");

            // Lọc dữ liệu từ dataMessage
            const messageItem = dataMessage.find(item => item["1MI"] === key1MI && item["4CI"] === key4CI);

            // Lọc dữ liệu từ dataMessageMedia
            const mediaItems = dataMessageMedia.filter(mediaItem => mediaItem["2MI"].toString() === key1MI && mediaItem["5CI"] === key4CI);

            return {
                ...messageItem,
                media: mediaItems || [],
            };
        });
        // setDataMessageMerged(mergedArray);

        if (!functions.arraysAreEqual(mergedArray, dataMessageMergedPrev)) {
            setDataMessageMerged(mergedArray);
            setDataMessageMergedPrev(mergedArray);
        }
    };


    useEffect(() => {
        mergedDataMessage()
    }, [dataMessage, dataMessageMedia]);

    useEffect(() => {
        if (dataMessage.length === 0 && dataMessageMedia.length === 0) {
            setDataMessageMerged([])
        }
    }, []);
    //  Auto scroll Bottom
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
            }
        }, 10); // Trì hoãn 100 ms hoặc thời gian phù hợp
    };

    useEffect(scrollToBottom, [dataMessageMerged, activeTab]);

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

    // Hàm xử lý sự kiện cuộn
    const handleScroll = () => {
        if (contextMenu.visible) {
            closeContextMenu();
        }
    };

    // Đăng ký và hủy đăng ký sự kiện cuộn và click
    useEffect(() => {
        // Đăng ký sự kiện cuộn
        document.addEventListener('scroll', handleScroll, true); // `true` để capture sự kiện trong phase capturing

        // Đăng ký sự kiện click
        document.addEventListener('click', handleOutsideClick);

        return () => {
            // Hủy đăng ký sự kiện cuộn
            document.removeEventListener('scroll', handleScroll, true);

            // Hủy đăng ký sự kiện click
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [contextMenu.visible]);



    // Textarea Chat
    const [heightChat, setHeightChat] = useState(0);

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
    const windowHeightRespon = window.innerHeight;

    const calculateHeight = () => {
        let baseHeight = windowHeightRespon;
        // console.log("Chieu cao man hinh:", baseHeight)
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
        return `${baseHeight}`;
    };
    // const calculateMessageWrapperHeight = () => {
    //     // Giả sử chiều cao tổng cộng của cửa sổ hoặc khối chứa là fixedHeight
    //     const fixedHeight = 500; // Thay đổi giá trị này theo nhu cầu
    //     // Chiều cao của khối tin nhắn sẽ là hiệu số giữa chiều cao cố định và chiều cao của textarea
    //     return fixedHeight - textareaHeight;
    // }






    // const calculateHeight = (baseHeightPx = 610) => {
    //     const windowHeight = window.innerHeight; // Lấy chiều cao của cửa sổ trình duyệt
    //     console.log(windowHeight)
    //     const imageAdjustmentPx = selectedImagesSent.length > 0 ? 70 : 0;
    //     const maxHeightReductionPx = 96 - 40;

    //     if (heightChat > 40) {
    //         const heightReduction = Math.min(heightChat - 40, maxHeightReductionPx);
    //         baseHeightPx -= heightReduction;
    //     }
    //     baseHeightPx = Math.max(baseHeightPx, 585);
    //     baseHeightPx -= imageAdjustmentPx;
    //     let baseHeightVH = 60
    //     // Chuyển đổi chiều cao từ px sang vh
    //     // if (browser === "chrome") {
    //     //     baseHeightVH = (baseHeightPx / windowHeight) * 100 + (windowHeight > 919 ? 2 : -1.1);
    //     // } else if (browser === "edge-chromium") {
    //     //     baseHeightVH = (baseHeightPx / windowHeight) * 100 + (windowHeight > 932 ? 3 : 0);
    //     // }
    //     return `${baseHeightVH}vh`;
    // };

    // const browser = functions.getBrowser();
    // // console.log(browser)
    // let setHeight;

    // if (browser === "edge-chromium") {
    //     setHeight = 626;
    // } else if (browser === "chrome") {
    //     setHeight = 624;
    // }
    // else if (browser === "firefox") {
    //     setHeight = 598;
    // }
    // else if (browser === "opera") {
    //     setHeight = 615;
    // } else {
    //     setHeight = 615; // Giá trị mặc định cho các trình duyệt khác
    // }

    // const heightStyle = calculateHeight(setHeight);
    // console.log(calculateHeight())

    // console.log(calculateHeight())

    const [name, setName] = useState("");
    const [heightListCase, setHeightListCase] = useState(0);
    useEffect(() => {
        // setName(platform.name);

        const messageContainerHeight = $('#heightMessage').height()
        const containerListCaseHeight = $('#listCaseHeight').height()
        setHeightListCase(messageContainerHeight - containerListCaseHeight)

    }, [$('#heightMessage')]);

    // console.log("name:", name)

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

                    <div class="row" id="heightMessage">
                        <div id="portal-root"></div>
                        {/* List Case */}
                        <div class="col-md-5 col-sm-12" style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                            <div id="listCaseHeight" style={{ height: calculateHeight() }}>
                                <div class="search-container">
                                    <input
                                        type="search"
                                        className="search-input"
                                        placeholder={lang["Case title, case description, or anything"]}
                                        value={searchValue}
                                        onChange={handleInputChangeSearch}
                                        spellCheck="false"
                                    />

                                </div>

                                <div class="mt-2 d-flex" >
                                    <span style={{ display: "flex", alignItems: "center" }}>
                                        <FontAwesomeIcon icon={faSquarePlus} onClick={handlePageAdd} className="size-24 color_icon_plus pointer" title={lang["post your case"]} />
                                        <span class="lable_add ml-2 pointer" onClick={handlePageAdd}>{lang["post your case"]}</span>
                                    </span>
                                    <div class="ml-auto"> {lang["total"]}: <span class="font-weight-bold  ">{(filterCases().length) || 0}</span> {lang["case(s)"]}</div>


                                </div>
                                <hr class="hr-case"></hr>
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


                                        <div class="search-date-container ml-auto">
                                            <input
                                                type="date"
                                                className="date-input"
                                                onChange={(e) => setStartDate(e.target.value)}
                                                max={endDate}
                                            />
                                            <input
                                                type="date"
                                                className="date-input"
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="container-case" style={{ height: heightListCase - 10 }}>
                                {(filterCases()).map((item, index) => (
                                    <div key={index} className={`box-case ${selectedCaseDetail === item.id ? "selected" : ""}`} onClick={() => handlePageDetail(item)}>
                                        <div className="d-flex">
                                            <h4 class="ellipsis-header-case" title={item.title}>{item.title}</h4>
                                            <div className="ml-auto">
                                                <div className="dropdown-custom">
                                                    {item.status === "Active" &&
                                                        <button className="icon-button" onClick={(e) => toggleMenu(e, item.id)} title={lang["update"]}>
                                                            <FontAwesomeIcon icon={faEllipsisVertical} className="size-24" />
                                                        </button>
                                                    }

                                                    {openMenuCaseId === item.id && (
                                                        <div className="popup-menu-custom show" ref={menuRef}>
                                                            <span className="menu-item-custom pointer" data-toggle="modal" onClick={() => dataUpdateCase(item)} data-target="#updateCase">{lang["update"]}</span>
                                                            {/* <span className="menu-item-custom pointer" onClick={() => dataUpdateCase(item)}>{lang["update"]}</span> */}
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                        <p class="ellipsis-header-case">{item.issue}</p>
                                        <div className="d-flex">
                                            <p className="italic" style={{ marginBottom: 0 }}>
                                                {
                                                    (item.lastpostedat !== null ? (
                                                        <>
                                                            {lang["latest support on"]}
                                                            {langItemCheck === "Vi"
                                                                ? functions.translateDateToVietnamese(functions.formatDateCase(item.lastpostedat))
                                                                : functions.formatDateCase(item.lastpostedat)}
                                                            {lang["by"]} <span className="italic-non font-weight-bold-black">{item.lastpostedby}</span>
                                                        </>
                                                    ) :
                                                        <div style={{ height: "25.3px", width: "24px" }}>
                                                        </div>)
                                                }
                                                {/* {(() => {
                                                    const relatedMessages = dataMessageMerged.filter(message => message["4CI"] === item.id);
                                                    if (relatedMessages.length > 0) {
                                                        const latestMessage = relatedMessages[relatedMessages.length - 1];
                                                        return (
                                                            <p>
                                                                {lang["latest support on"]}
                                                                {langItemCheck === "Vi"
                                                                    ? functions.translateDateToVietnamese(functions.formatDateCase(latestMessage["1PA"]))
                                                                    : functions.formatDateCase(latestMessage["1PA"])}
                                                                {lang["by"]}
                                                                <span className="italic-non font-weight-bold-black">
                                                                    {latestMessage["1PB"].split(' - ')[0]}
                                                                </span>
                                                            </p>
                                                        );
                                                    } else {
                                                        return (
                                                            <p>
                                                                {lang["no latest support info available"]}
                                                            </p>
                                                        );
                                                    }
                                                })()} */}
                                            </p>
                                            <div className="ml-auto">
                                                <div>
                                                    {(!functions.isEmpty(dataCaseDetail) && dataCaseDetail.id === item.id && dataCaseDetail.supportquanlity !== "") ? (
                                                        <img
                                                            width={24}
                                                            src={`/images/icon/${qualityToImage[dataCaseDetail.supportquanlity]}`}
                                                            alt="ex1"
                                                        />
                                                    ) : (
                                                        item.supportquanlity !== "" && (
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
                                        <div class="full graph_head_cus min-h-58">
                                            <div class="heading1 margin_0 d-flex">
                                                <h5 class="margin-bottom-0">{lang["new case"]}</h5>
                                                <FontAwesomeIcon icon={faPaperPlane} onClick={(e) => submitPostCase(e)} className={`size-24 mt-2 ml-auto icon-add-production pointer `} title={lang["submit case"]} />
                                                {/* <FontAwesomeIcon icon={faPaperPlane} data-toggle="modal" className={`size-24 mt-2 ml-auto icon-add-production pointer `} data-target="#captcha" title={lang["submit case"]} /> */}
                                            </div>
                                        </div>
                                        <div class="table_section padding_infor_info_case_add">
                                            <div class="add-case" style={{ height: calculateHeight() - 255 }}>
                                                <div class="row field-case">
                                                    <div class="col-md-8">
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <h5 class="mb-2" style={{ margin: '0', marginRight: '10px' }}>{lang["case title"]}<span className='red_star'>*</span></h5>
                                                            {errorMessagesadd.casetitle && (
                                                                <span class="error-message mb-2">{errorMessagesadd.casetitle}</span>
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
                                                            placeholder={lang["Enter case title"]} spellCheck="false"></input>
                                                    </div>
                                                    <div class="col-md-4">
                                                        <h5 class="mb-2">{lang["case type"]}</h5>
                                                        <select className="form-control pointer" name="role" value={postCase.casetype}
                                                            onChange={
                                                                (e) => { setPostCase({ ...postCase, casetype: e.target.value }) }}
                                                        >
                                                            <option value={"Undefined"}>Undefined</option>
                                                            <option value={"Troubleshooting"}>Troubleshooting</option>
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
                                                            <span class="error-message mb-2">{errorMessagesadd.productname}</span>
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
                                                        placeholder={lang["Enter product name"]} spellCheck="false"></input>
                                                </div>
                                                <div class="col-md-12">
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <h5 class="mb-2" style={{ margin: '0', marginRight: '10px' }}>{lang["ISSUE DESCRIPTION"]}<span className='red_star'>*</span></h5>
                                                        {errorMessagesadd.issue && (
                                                            <span class="error-message mb-2">{errorMessagesadd.issue}</span>

                                                        )}
                                                    </div>
                                                    <textarea class="form-control" rows={6} maxLength={2000}
                                                        style={{ resize: 'none' }} value={postCase.issue} onChange={(e) => {
                                                            const value = e.target.value;
                                                            setPostCase({ ...postCase, issue: value });

                                                            if (value.trim() && errorMessagesadd.issue) {
                                                                setErrorMessagesadd({ ...errorMessagesadd, issue: '' });
                                                            }
                                                        }} placeholder={lang["p.issue"]} spellCheck="false"></textarea>
                                                </div>

                                                <div class="row field-case">
                                                    <div className="col-md-4">
                                                        <h5 class="mb-2">{lang["case image"]}</h5>
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
                                                                accept=".png, .jpg, .jpeg"

                                                            />
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
                                                    <div class={`col-md-8`}
                                                    >
                                                        <h5 className="mb-2">{lang["attachment"]} ({lang["maximum"]}: 20MB)</h5>
                                                        <div class="d-flex"
                                                        >
                                                            {/* <h5 className="mb-2"></h5>
                                                            <label style={{ marginBottom: 0 }} htmlFor="file-upload-media" class="ml-auto" >
                                                                <FontAwesomeIcon icon={faPlusSquare} className={`size-24 mb-1 icon-add pointer `}  title={lang["attachment"]} /> 
                                                            </label> */}
                                                            <input
                                                                id="file-upload-media"
                                                                type="file"
                                                                style={{ display: "none" }}
                                                                onChange={handleAttachMedia}
                                                                // accept="image/*,video/*"
                                                                accept="image/*,video/*,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip"
                                                                multiple
                                                            />
                                                        </div>
                                                        {attachMedia.length > 0 ?

                                                            (
                                                                <>
                                                                    <div className={`upload-container-case-add pointer  ${isDragging ? "container-no-attachment-dragging" : ""}`} title={lang["Drag and drop images here and click"]}
                                                                        onDragEnter={handleDragEnter}
                                                                        onDragLeave={handleDragLeave}
                                                                        onDragOver={handleDragOver}
                                                                        onDrop={handleFileDropAdd}
                                                                        onClick={(e) => handleFileContainerClick(e)}>
                                                                        <div className={`selected-images-container-add`} >

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
                                                                                    {media.type === 'pdf' && (
                                                                                        <img src={"/images/icon/pdf.svg"} alt={`Selected ${index}`} className="selected-image-add" title={media.name} />
                                                                                    )}
                                                                                    {media.type === 'excel' && (
                                                                                        <img src={"/images/icon/excel.svg"} alt={`Selected ${index}`} className="selected-image-add" title={media.name} />
                                                                                    )}

                                                                                    {media.type === 'zip' && (
                                                                                        <img src={"/images/icon/zip.png"} alt={`Selected ${index}`} className="selected-image-add" title={media.name} />
                                                                                    )}
                                                                                    <button onClick={(e) => removeAttachMedia(e, media)} className="remove-image" title={lang["delete image"]}>X</button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) :
                                                            <>
                                                                <div className={`container-no-attachment pointer  ${isDragging ? "container-no-attachment-dragging" : ""}`}
                                                                    onDragEnter={handleDragEnter}
                                                                    onDragLeave={handleDragLeave}
                                                                    onDragOver={handleDragOver}
                                                                    onDrop={handleFileDropAdd}
                                                                    onClick={(e) => handleFileContainerClick(e)}
                                                                >
                                                                    <label style={{ margin: 0 }} htmlFor="file-upload-media" className="custom-file-upload">
                                                                        {lang["Drag and drop images here and click"]}
                                                                    </label>
                                                                    <span class="type-file"> (Image, Video, Pdf, Excel) </span>
                                                                    {/* <span class="type-file"> (Tối đa: 20MB) </span> */}
                                                                </div>

                                                            </>
                                                        }
                                                    </div>
                                                </div>
                                                <TableInputAdd onDataUpdate={handleDataFromChild} stateAdd={true} stateUpdate={false} />
                                                {/* <ReCAPTCHA
                                                    ref={recaptchaRef}
                                                    sitekey="6LdWVTwpAAAAAHn2EaiOZ7GMnhilokYg2hanEx63"
                                                    onChange={onReCAPTCHAChange}
                                                /> */}
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
                                <div class="white_shd full " style={{ height: "99%" }}>
                                    <div class="full graph_head_cus min-h-58">
                                        <div class="heading1 margin_0 case-detail">
                                            <div class="d-flex ">
                                                <h4 class="ellipsis-header-case mr-2" title={dataCaseDetail.title}>{dataCaseDetail.title}</h4>
                                                <span
                                                    class="ml-auto font-weight-bold-black"
                                                    style={{
                                                        color: (listError.find((s) => s.label === dataCaseDetail.casetype) || {}).color || '#000000'
                                                    }}>
                                                    {(listError.find((s) => s.label === dataCaseDetail.casetype) || {}).label || ''}
                                                </span>
                                            </div>
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
                                                <div className={`custom-tab ${activeTab === 'general' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('general', dataCaseDetail)}>
                                                    {lang["general"]}
                                                </div>
                                                {/* <div className={`custom-tab ${activeTab === 'products' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('products')}>
                                                    Products
                                                </div> */}
                                                <div className={`custom-tab ${activeTab === 'discussion' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('discussion', dataCaseDetail)}>
                                                    {lang["DISCUSSION"]}
                                                </div>
                                                <div className={`custom-tab ${activeTab === 'support' ? 'custom-tab-active' : ''}`} onClick={() => handleTabClick('support', dataCaseDetail)}>
                                                    {lang["SUPPORT QUALITY"]}

                                                </div>
                                            </div>
                                            <div>
                                                {activeTab === 'general' &&
                                                    <div class="container-general" >
                                                        <div class="card-block">
                                                            <div class="col-md-12">
                                                                <div class="info-case" style={{ height: calculateHeight() - 270 + 3 }}>
                                                                    <h5 class="mt-2 mb-1">{lang["ISSUE DESCRIPTION"]}</h5>
                                                                    {/* <textarea
                                                                            readOnly
                                                                            class=" form-control"
                                                                            style={{ resize: 'none' }}
                                                                            value={dataCaseDetail.issue}
                                                                            spellCheck="false"
                                                                        ></textarea> */}
                                                                    {
                                                                        dataCaseDetail.issue && dataCaseDetail.issue.split('\n').map(s => <span style={{ display: "block" }}>{s}</span>)
                                                                    }
                                                                    <div class="row field-case">

                                                                        <div className="col-md-4">
                                                                            <h5 className="mt-2 mb-2">{lang["case image"]}</h5>
                                                                            <div className="upload-container-case">
                                                                                {dataCaseDetail.imgcase !== "" ?
                                                                                    <img class=""
                                                                                        style={{
                                                                                            maxWidth: 'calc(100% - 40px)',
                                                                                            maxHeight: 'calc(100% - 10px)',
                                                                                            objectFit: 'contain',
                                                                                            borderRadius: '8px',
                                                                                            cursor: 'pointer'
                                                                                        }}
                                                                                        src={dataCaseDetail.imgcase + '?ver=' + new Date().getTime()}
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
                                                                            <h5 className="mt-2 mb-2">{lang["attachment"]}</h5>
                                                                            {dataCaseDetail?.attachMedia?.length > 0 ?
                                                                                (
                                                                                    <>
                                                                                        <div className="upload-container-case-add">
                                                                                            <div className="selected-images-container-add">
                                                                                                {dataCaseDetail?.attachMedia?.map((media, index) => (
                                                                                                    <div key={index} className="selected-image-wrapper-add">
                                                                                                        {functions.isImageFormat(media["6U"]) && (
                                                                                                            <img src={media["6U"]} alt={`Selected ${index}`}
                                                                                                                className="selected-image-add pointer" data-toggle="modal" data-target="#previewMedia"
                                                                                                                onClick={() => openModalPreview({ type: "attachImageDetail", url: media["6U"] })}
                                                                                                                title={lang["Click to preview"]} />
                                                                                                        )}
                                                                                                        {functions.isVideoFormat(media["6U"]) && (
                                                                                                            <div>
                                                                                                                <video autoplay controls={false} src={media["6U"]}
                                                                                                                    className="selected-image-add pointer"
                                                                                                                    data-toggle="modal" data-target="#previewMedia"
                                                                                                                    onClick={() => openModalPreview({ type: "attachVideoDetail", url: media["6U"] })}
                                                                                                                    title={lang["Click to preview"]}   >
                                                                                                                </video>
                                                                                                                <div class="video-duration">Video</div>
                                                                                                            </div>
                                                                                                        )}
                                                                                                        {functions.isPdfFormat(media["6U"]) && (
                                                                                                            <img src={"/images/icon/pdf.svg"}
                                                                                                                alt={`Selected ${index}`}
                                                                                                                className="selected-image-add pointer"
                                                                                                                title={media["1FN"]}
                                                                                                                // data-toggle="modal" data-target="#previewFile"
                                                                                                                onClick={() => handleDownload(media["6U"])} />
                                                                                                        )}
                                                                                                        {functions.isExcelFormat(media["6U"]) && (
                                                                                                            <img src={"/images/icon/excel.svg"}
                                                                                                                alt={`Selected ${index}`}
                                                                                                                className="selected-image-add pointer"
                                                                                                                title={media["1FN"]}

                                                                                                                onClick={() => handleDownload(media["6U"])} />
                                                                                                        )}
                                                                                                        {functions.isZipFormat(media["6U"]) && (
                                                                                                            <img src={"/images/icon/zip.png"}
                                                                                                                alt={`Selected ${index}`}
                                                                                                                className="selected-image-add pointer"
                                                                                                                title={media["1FN"]}
                                                                                                                onClick={() => handleDownload(media["6U"])}
                                                                                                            />
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
                                                                    <TableInputUpdate onDataUpdate={handleDataFromChild} fetchDataProduct={fetchDataProduct} dataDetail={dataCaseDetail} data={tableDataProduct} stateAdd={false} caseId={dataCaseDetail.id} stateUpdate={true} />
                                                                    <div class="title-suggest mb-1">{lang["SUGGESTED SOLUTION"]}</div>
                                                                    <span class="content-suggest">
                                                                        {/* {dataCaseDetail.solution} */}

                                                                        {dataCaseDetail.solution === "" && lang["No data avasilable"]}
                                                                        {dataCaseDetail.solution && dataCaseDetail.solution.split('\n').map(s => <span style={{ display: "block" }}>{s}</span>)}
                                                                    </span>
                                                                    <div class="row mt-1">
                                                                        <div className="col-sm-12">
                                                                            <h5 className="mt-3"> {lang["Warranty Claim"]}</h5>
                                                                            {/* W23-0000736 */}
                                                                            {dataCaseDetail.warranty !== "" ? dataCaseDetail.warranty : lang["No data avasilable"]}
                                                                        </div>
                                                                        <div className="col-sm-12">
                                                                            <h5 className="mt-3">{lang["Case Suggest"]}</h5>
                                                                            {dataCaseDetail.caseSuggest !== "" ? dataCaseDetail.warrcaseSuggestanty : lang["No data avasilable"]}
                                                                        </div>
                                                                        <div className="col-sm-12">
                                                                            <h5 className="mt-3">{lang["Possible Feature"]}</h5>
                                                                            {dataCaseDetail.possibleFeature !== "" ? dataCaseDetail.possibleFeature : lang["No data avasilable"]}
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                                {activeTab === 'discussion' &&
                                                    <>
                                                        <div class={`card-block-message bg-message`} style={{ height: dataCaseDetail.status === "Active" ? "" : calculateHeight() - 270 }} >
                                                            <div class="col-md-12">
                                                                <div class="info-case">
                                                                    <div className="messages-wrapper" style={{ height: calculateHeight() - 270 - 47 }} ref={messagesEndRef} id="messages-wrapper">
                                                                        {/* <div className="messages-wrapper" ref={messagesEndRef} id="messages-wrapper"> */}
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
                                                                            const isSentByUser = item["1PB"] === _user.fullname;

                                                                            return (
                                                                                <div
                                                                                    key={index}
                                                                                    className={`message-container ${isSentByUser ? "sent" : "received "}`}
                                                                                    onContextMenu={(event) => {
                                                                                        if (!isSentByUser) {
                                                                                            // Vô hiệu hóa nhấn chuột phải nếu không phải tin nhắn của người dùng
                                                                                            event.preventDefault();
                                                                                            return;
                                                                                        }
                                                                                        handleContextMenu(event, item);
                                                                                    }}>
                                                                                    <span className="message-image-user">{item["1PB"] || "Unknown"}</span>
                                                                                    <p style={{ margin: 0 }}>
                                                                                        {shouldTruncate ? (
                                                                                            <>

                                                                                                {
                                                                                                    truncatedText && truncatedText.split('\n').map(s => <span style={{ display: "block" }}>{s}</span>)
                                                                                                }
                                                                                                <a onClick={() => toggleShowFullMessage(item["1MI"])} className="font-weight-bold pointer">... {lang["Show more"]}</a>
                                                                                            </>
                                                                                        ) : (


                                                                                            item["1MC"] && item["1MC"].split('\n').map(s => <span style={{ display: "block" }}>{s}</span>)

                                                                                        )}
                                                                                    </p>
                                                                                    {item.media && (
                                                                                        <div className="media-container mt-2">
                                                                                            {item.media.map(media => (
                                                                                                <>
                                                                                                    {functions.isImageFormat(media["5U"]) && (
                                                                                                        <img className="message-image pointer" src={media["5U"]}
                                                                                                            data-toggle="modal" data-target="#previewMedia"
                                                                                                            onClick={() => openModalPreview({ type: "imageMessageMedia", url: media["5U"] })}
                                                                                                            alt="Media content"
                                                                                                            title={lang["Click to preview"]} />
                                                                                                    )}
                                                                                                    {functions.isVideoFormat(media["5U"]) && (
                                                                                                        <div className="video-container">
                                                                                                            <video className="message-image pointer" controls={false} src={media["5U"]} type="video/mp4"
                                                                                                            >
                                                                                                            </video>
                                                                                                            <div className="video-overlay pointer" data-toggle="modal" data-target="#previewMedia"
                                                                                                                onClick={() => openModalPreview({ type: "videoMessageMedia", url: media["5U"] })}
                                                                                                                title={lang["Click to preview"]}></div>
                                                                                                            <div className="video-icon play-icon">
                                                                                                                < FontAwesomeIcon icon={faCirclePlay} className="size-16  color_icon_plus" />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {functions.isPdfFormat(media["5U"]) && (
                                                                                                        <div className="file-container">
                                                                                                            <div className="file-icon">
                                                                                                                <img src="/images/icon/pdf.svg" alt="PDF" title={media["2FN"]} />
                                                                                                            </div>
                                                                                                            <div className="file-name">{media["2FN"]}</div>
                                                                                                            <button className="file-download-btn" onClick={() => handleDownload(media["5U"])}>
                                                                                                                <img src={"/images/icon/download.png"} alt="Download" />
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {functions.isExcelFormat(media["5U"]) && (
                                                                                                        <div className="file-container" >
                                                                                                            <div className="file-icon">
                                                                                                                <img src="/images/icon/excel.svg" alt="PDF" title={media["2FN"]} />
                                                                                                            </div>
                                                                                                            <div className="file-name">{media["2FN"]}</div> <div className="shorten-filename"> {functions.shortenFileName(media["2FN"])}</div>
                                                                                                            <button className="file-download-btn ml-3" onClick={() => handleDownload(media["5U"])}>
                                                                                                                {/* <i class="fa fa-download size-24 icon-download-black" aria-hidden="true"></i> */}
                                                                                                                <img src={"/images/icon/download.png"} ></img>

                                                                                                            </button>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {functions.isZipFormat(media["5U"]) && (
                                                                                                        <div className="file-container" >
                                                                                                            <div className="file-icon">
                                                                                                                <img src="/images/icon/zip.png" alt="PDF" title={media["2FN"]} />
                                                                                                            </div>
                                                                                                            <div className="file-name">{media["2FN"]}</div> <div className="shorten-filename"> {functions.shortenFileName(media["2FN"])}</div>
                                                                                                            <button className="file-download-btn ml-3" onClick={() => handleDownload(media["5U"])}>
                                                                                                                {/* <i class="fa fa-download size-24 icon-download-black" aria-hidden="true"></i> */}
                                                                                                                <img src={"/images/icon/download.png"} ></img>

                                                                                                            </button>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </>
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
                                                                        {media.type === 'pdf' && (
                                                                            <img src={"/images/icon/pdf.svg"} alt={`Selected ${index}`} className="selected-image-add" title={media.name} />
                                                                        )}
                                                                        {media.type === 'excel' && (
                                                                            <img src={"/images/icon/excel.svg"} alt={`Selected ${index}`} className="selected-image-add" title={media.name} />
                                                                        )}
                                                                        {media.type === 'zip' && (
                                                                            <img src={"/images/icon/zip.png"} alt={`Selected ${index}`} className="selected-image-add" title={media.name} />
                                                                        )}
                                                                        <button onClick={() => removeMedia(media)} className="remove-image" title={lang["delete image"]}>X</button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <hr class="hr-message"></hr>
                                                        {dataCaseDetail.status === "Active" &&
                                                            <div
                                                                className="chat-input-container"
                                                                style={{ bottom: "-2px " }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                        e.preventDefault();
                                                                        if (dataMessageSent.message.trim() !== '' || selectedImagesSent.length > 0) {
                                                                            submitMessage(e);
                                                                        }
                                                                    }
                                                                }}
                                                                tabIndex={0}
                                                            >
                                                                {getPlaceholder()}
                                                                <textarea
                                                                    ref={textareaRef}
                                                                    onDragEnter={handleDragEnter}
                                                                    onDragLeave={handleDragLeave}
                                                                    onDragOver={handleDragOver}
                                                                    onDrop={handleFileDropMessage}
                                                                    className={`chat-input no-change-textarea ${isDragging ? 'dragging custom-placeholder-bg' : ''}`}
                                                                    value={dataMessageSent.message}
                                                                    onChange={handleInputChange}
                                                                    // placeholder={getPlaceholderText()}
                                                                    rows={1}
                                                                    spellCheck="false"
                                                                    maxLength={4000}
                                                                />
                                                                <input
                                                                    type="file"
                                                                    id="imageInput"
                                                                    hidden="hidden"
                                                                    onChange={handleImageChangeSent}
                                                                    // accept="image/*,video/*"
                                                                    accept="image/*,video/*,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                                                    multiple
                                                                />
                                                                <FontAwesomeIcon
                                                                    icon={faPaperclip}
                                                                    className="size-24 mr-2 pointer"
                                                                    onClick={() => document.getElementById('imageInput').click()}
                                                                    title={lang["attachment"]}
                                                                />
                                                                <FontAwesomeIcon onClick={submitMessage} icon={faPaperPlane} className={`size-24 ml-auto mr-2 icon-add-production pointer`} title={lang["send message"]} />
                                                            </div>
                                                        }
                                                    </>
                                                }
                                                {activeTab === 'support' &&
                                                    <div class="card-block" style={{ marginRight: "5px" }}>
                                                        {isLoading ? (
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
                                                                                    <div className={`icon-rate ${rating === 'No reply' ? 'icon-rate-selected' : ''}`} data-text="No reply"
                                                                                        onClick={() => handleRatingClick('No reply')}>
                                                                                        <img class="icon-rate" style={{ filter: rating === 'No reply' ? 'grayscale(0%)' : 'grayscale(100%)' }} src="/images/icon/i5.png" />
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


                                                                                    <div className={`icon-rate ${rating === 'Pretty good' ? 'icon-rate-selected' : ''}`} data-text="Pretty good" onClick={() =>  handleRatingClick('Pretty good')}>
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
                                                                                    maxLength={2000}
                                                                                    style={{ resize: 'none' }}
                                                                                    placeholder={lang["Let us know how you feel"]} spellCheck="false"
                                                                                    disabled={dataCaseDetail.status === "Active" ? false : true}
                                                                                ></textarea>

                                                                            </div>

                                                                        </div>
                                                                        <div class="form-group col-md-12">
                                                                            <div class="d-flex">

                                                                                <p style={{ marginBottom: 0 }}>{dataCaseDetail.lastedsupport !== "" && (
                                                                                    <>
                                                                                        {lang["by"]} <span className="italic-non font-weight-bold-black">{dataCaseDetail.lastedsupport}</span>
                                                                                    </>
                                                                                )}
                                                                                </p>

                                                                                <button type="button" onClick={submitRate} data-dismiss="modal" disabled={dataCaseDetail.status === "Active" ? false : true} class="btn mt-0 btn-primary ml-auto modal-button-review">{lang["Submit Review"]}</button>
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
                                                    <div class="icon-rate" data-text="No reply">
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
                                    <h5 class="modal-title">{lang["Case Update"]}</h5>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal" title={lang["btn.close"]}>&times;</button>
                                </div>
                                <div class="modal-body">
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
                                                placeholder="Enter case title" spellCheck="false"></input>

                                        </div>
                                        <div class="col-md-4">
                                            <h5 class="mb-2">{lang["case type"]}</h5>
                                            <select className="form-control pointer" name="role" value={caseUpdate.casetype} onChange={
                                                (e) => { setCaseUpdate({ ...caseUpdate, casetype: e.target.value }) }}>
                                                <option value={"Undefined"}>Undefined</option>
                                                <option value={"Troubleshooting"}>Troubleshooting</option>
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
                                            placeholder="Enter Product Name" spellCheck="false" ></input>
                                    </div>

                                    <div style={{ paddingLeft: "0px", paddingRight: "0px" }} class="col-md-12">

                                        <div style={{ display: 'flex', alignItems: 'center' }}>

                                            <h5 class="mb-2" style={{ margin: '0', marginRight: '10px' }}>{lang["ISSUE DESCRIPTION"]}<span className='red_star'>*</span></h5>
                                            {errorMessagesUpdate.issue && (
                                                <span class="error-message mb-1">{errorMessagesUpdate.issue}</span>
                                            )}
                                        </div>
                                        <textarea class="form-control no-change-textarea" rows={8} maxLength={2000}
                                            value={caseUpdate.issue} onChange={
                                                (e) => { setCaseUpdate({ ...caseUpdate, issue: e.target.value }) }} spellCheck="false"></textarea>
                                    </div>

                                    <div class="row field-case">

                                        <div className="col-md-4">
                                            <h5 className="mb-2">{lang["case image"]}</h5>
                                            <div className="upload-container-case">
                                                {((caseUpdate.imgcase === "" && selectedImage == null)) && (
                                                    <label style={{ margin: 0 }} htmlFor="file-upload" className="custom-file-upload">
                                                        {lang["Choose Image"]}
                                                    </label>
                                                )}
                                                <input
                                                    id="file-upload"
                                                    type="file"
                                                    style={{ display: "none" }}
                                                    onChange={handleImageChange}
                                                    accept=".png, .jpg, .jpeg"
                                                />
                                                {!selectedImage && caseUpdate.imgcase !== "" && (
                                                    <>
                                                        <img
                                                            id="image-preview"
                                                            src={caseUpdate.imgcase + '?ver=' + new Date().getTime()}

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
                                                )
                                                }
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
                                        <div class="col-md-8"
                                        >
                                            <h5 className="mb-2">{lang["attachment"]} ({lang["maximum"]}: 20MB)</h5>
                                            <div class="d-flex">
                                                {/* <h5 className="mb-2"></h5>
                                                <label style={{ marginBottom: 0 }} htmlFor="file-upload-media" class="ml-auto" >
                                                    <FontAwesomeIcon icon={faPlusSquare} className={`size-24 mb-1 icon-add pointer `} title="Choose Image" />
                                                </label> */}
                                                <input
                                                    id="file-upload-media"
                                                    type="file"
                                                    style={{ display: "none" }}
                                                    onChange={handleAttachMedia}
                                                    // accept="image/*,video/*"
                                                    accept="image/*,video/*,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip"
                                                    multiple
                                                />
                                            </div>
                                            {(caseUpdate?.attachMedia?.length > 0 || attachMedia.length > 0) ?
                                                (
                                                    <>
                                                        <div className={`upload-container-case-add pointer ${isDragging ? "container-no-attachment-dragging" : ""}`} title={lang["Drag and drop images here and click"]}
                                                            onDragEnter={handleDragEnter}
                                                            onDragLeave={handleDragLeave}
                                                            onDragOver={handleDragOver}
                                                            onDrop={handleFileDropUpdate}
                                                            onClick={(e) => handleFileContainerClick(e)}>
                                                            <div className="selected-images-container-add">
                                                                {/* Attach cũ */}
                                                                {caseUpdate.attachMedia?.length > 0 && (caseUpdate.attachMedia?.map((media, index) => (
                                                                    <div key={index} className="selected-image-wrapper-add">
                                                                        {functions.isImageFormat(media["6U"]) && (
                                                                            <img src={media["6U"]} alt={`Selected ${index}`} className="selected-image-add" />
                                                                        )}
                                                                        {functions.isVideoFormat(media["6U"]) && (
                                                                            <div>
                                                                                <video autoplay controls={false} src={media["6U"]} className="selected-image-add pointer" >
                                                                                </video>
                                                                                {/* <div class="video-duration"> {media.name}</div> */}
                                                                                <div class="video-duration">Video</div>
                                                                            </div>
                                                                        )}
                                                                        {functions.isPdfFormat(media["6U"]) && (
                                                                            <img src={"/images/icon/pdf.svg"} alt={`Selected ${index}`} className="selected-image-add" title={media["1FN"]} />
                                                                        )}
                                                                        {functions.isExcelFormat(media["6U"]) && (
                                                                            <img src={"/images/icon/excel.svg"} alt={`Selected ${index}`} className="selected-image-add" title={media["1FN"]} />
                                                                        )}
                                                                        {functions.isZipFormat(media["6U"]) && (
                                                                            <img src={"/images/icon/zip.png"} alt={`Selected ${index}`} className="selected-image-add" title={media["1FN"]} />
                                                                        )}

                                                                        <button onClick={(e) => removeAttachMediaUpdate(e, media)} className="remove-image" title={lang["delete image"]} >X</button>
                                                                    </div>
                                                                )))}
                                                                {/* Attach mới */}
                                                                {attachMedia.length > 0 && (attachMedia.map((media, index) => (
                                                                    <div key={index} className="selected-image-wrapper-add">
                                                                        {media.type === 'image' && (
                                                                            <img src={media.dataUrl} alt={`Selected ${index}`} className="selected-image-add" data-toggle="modal" data-target="#previewMedia" onClick={() => openModalPreview(media)} />
                                                                        )}
                                                                        {media.type === 'video' && (
                                                                            <div>
                                                                                <img src={media.cover} alt={`Cover for ${index}`} className="selected-image-add" data-toggle="modal" data-target="#previewMedia" onClick={() => openModalPreview(media)} />
                                                                                {/* <div class="video-duration"> {media.name}</div> */}
                                                                                <div class="video-duration">Video</div>
                                                                            </div>
                                                                        )}
                                                                        {media.type === 'pdf' && (
                                                                            <img src={"/images/icon/pdf.svg"} alt={`Selected ${index}`} className="selected-image-add" title={media.name} />
                                                                        )}
                                                                        {media.type === 'excel' && (
                                                                            <img src={"/images/icon/excel.svg"} alt={`Selected ${index}`} className="selected-image-add" title={media.name} />
                                                                        )}
                                                                        {media.type === 'zip' && (
                                                                            <img src={"/images/icon/zip.png"} alt={`Selected ${index}`} className="selected-image-add" title={media.name} />
                                                                        )}
                                                                        <button onClick={(e) => removeAttachMedia(e, media)} className="remove-image" title={lang["delete image"]}>X</button>
                                                                    </div>
                                                                )))}

                                                            </div>
                                                        </div>
                                                    </>
                                                ) :
                                                <div className={`container-no-attachment pointer  ${isDragging ? "container-no-attachment-dragging" : ""}`}
                                                    onDragEnter={handleDragEnter}
                                                    onDragLeave={handleDragLeave}
                                                    onDragOver={handleDragOver}
                                                    onDrop={handleFileDropUpdate}
                                                    onClick={(e) => handleFileContainerClick(e)}
                                                >
                                                    <label style={{ margin: 0 }} htmlFor="file-upload" className="custom-file-upload">
                                                        {lang["Drag and drop images here and click"]}
                                                    </label>
                                                    <span class="type-file"> (Image, Video, Pdf, Excel) </span>
                                                </div>
                                            }
                                        </div>

                                    </div>

                                </div>
                                <div class="modal-footer">
                                    <button type="button" onClick={submitUpdateCase} class="btn btn-primary modal-button-review">{lang["update"]}</button>
                                    <button type="button" onClick={handleCloseModal} data-dismiss="modal" id="closeModalUpdateCase" class="btn btn-danger modal-button-review">{lang["btn.close"]}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Preview Image*/}
                    <div class={`modal no-select-modal modal-open-no-overflow-y ${showModal ? 'show' : ''}`} id="previewMedia">
                        <div class="modal-dialog modal-dialog-center ">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h4 class="modal-title">Media Preview</h4>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal" title={lang["btn.close"]}>&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <div class="row">
                                            <div class="form-group col-lg-12 align-center">

                                                {dataPreviewMedia?.type === 'imageDetail' && (
                                                    <img class="image-responsive" src={dataPreviewMedia?.url}
                                                        style={{ width: '70%' }}
                                                        alt={dataPreviewMedia?.name} />
                                                )}

                                                {dataPreviewMedia?.type === 'attachImageDetail' && (
                                                    <img class="image-responsive" src={dataPreviewMedia?.url} alt={dataPreviewMedia?.name} style={{ width: '70%' }} />
                                                )}

                                                {dataPreviewMedia?.type === 'attachVideoDetail' && (
                                                    <video class="image-responsive" autoplay controls style={{ width: '100%' }} src={dataPreviewMedia?.url} >
                                                    </video>
                                                )}

                                                {dataPreviewMedia?.type === 'image' && (
                                                    <img class="image-responsive" src={dataPreviewMedia?.url} alt={dataPreviewMedia?.name} style={{ width: '100%' }} />
                                                )}

                                                {dataPreviewMedia?.type === 'video' && (
                                                    <video class="image-responsive" autoplay controls style={{ width: '100%' }} src={dataPreviewMedia?.dataUrl} >
                                                        <source src={dataPreviewMedia?.dataUrl} type="video/*" />
                                                    </video>
                                                )}

                                                {/* Chat */}
                                                {dataPreviewMedia?.type === 'imageMessageMedia' && (
                                                    <>
                                                        {/* <Zoom
                                                            width={"70%"}
                                                            src={dataPreviewMedia?.url}
                                                        /> */}
                                                        <img class="image-responsive" src={dataPreviewMedia?.url} alt={dataPreviewMedia?.name} style={{ width: '70%' }} />
                                                    </>
                                                )}

                                                {dataPreviewMedia?.type === 'videoMessageMedia' && (
                                                    <video class="image-responsive" autoplay controls style={{ width: '100%' }} src={dataPreviewMedia?.url} >

                                                    </video>
                                                )}

                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger modal-button-review">{lang["btn.close"]}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Preview PDF/Excel*/}
                    <div class={`modal no-select-modal modal-open-no-overflow-y ${showModal ? 'show' : ''}`} id="previewFile">
                        <div class="modal-dialog modal-dialog-center ">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h4 class="modal-title">Preview</h4>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal" title={lang["btn.close"]}>&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <div class="row">
                                            <div class="form-group col-lg-12 align-center">

                                                {dataPreviewFile?.type === 'imageDetail' && (
                                                    <img class="image-responsive" src={dataPreviewFile?.url}
                                                        style={{ width: '70%' }}
                                                        alt={dataPreviewFile?.name} />
                                                )}

                                                {/* Hiển thị PDF */}
                                                {dataPreviewFile?.type === 'PDF' && (
                                                    <iframe src={dataPreviewFile?.url} style={{ width: '100%', height: '650px' }} frameBorder="0"></iframe>
                                                )}
                                                {/* Hiển thị EXcel */}
                                                {dataPreviewFile?.type === 'EXCEL' && (
                                                    <iframe src={dataPreviewFile?.url} style={{ width: '100%', height: '600px' }} frameBorder="0"></iframe>
                                                )}
                                                {/* Hiển thị Zip */}
                                                {dataPreviewFile?.type === 'zip' && (
                                                    <iframe src={dataPreviewFile?.url} style={{ width: '100%', height: '600px' }} frameBorder="0"></iframe>
                                                )}

                                                {/*  */}

                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger modal-button-review">{lang["btn.close"]}</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Captcha*/}
                    {/* <div class={`modal no-select-modal modal-open-no-overflow-y ${showModal ? 'show' : ''}`} id="captcha">
                        <div class="modal-dialog modal-dialog-center ">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h4 class="modal-title">Captcha</h4>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal" title={lang["btn.close"]}>&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <div class="row">
                                            <div class="form-group col-lg-12 align-center">
                                                <ReCAPTCHA
                                                    ref={recaptchaRef}
                                                    sitekey="6LdWVTwpAAAAAHn2EaiOZ7GMnhilokYg2hanEx63"
                                                    onChange={onReCAPTCHAChange}
                                                />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger modal-button-review">{lang["btn.close"]}</button>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div >
            </div >
        </div >
    )
}

