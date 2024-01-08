import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import $ from 'jquery';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faDownload, faSquarePlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
export default (props) => {
    const { lang, proxy, auth, functions } = useSelector(state => state);
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');
    let navigate = useNavigate();
    const goToHomePage = () => {
        navigate(`/privileges`);
    };
    const [showModal, setShowModal] = useState(false);
    const _token = localStorage.getItem("_token");
    const stringifiedUser = localStorage.getItem("user");
    const users = JSON.parse(stringifiedUser)
    const [errorMessagesadd, setErrorMessagesadd] = useState({});
    const [errorMessagesedit, setErrorMessagesedit] = useState({});
    const [data, setData] = useState([]);
    console.log(data)
    const [statusActive, setStatusActive] = useState(false);
    const roles = [
        { id: 0, label: "Administrator", value: "ad" },
        // { id: 1, label: "Operator", value: "pm" },
        { id: 2, label: "Normal", value: "pd" },
        // { id: 3, label: "Người theo dõi dự án ( Monitor Staff )", value: "ps" },
    ]

    const [user, setUser] = useState({});
    const [editUser, setEditUser] = useState({});
    // Close Modal
    const handleCloseModal = () => {
        setErrorMessagesadd({});
        setErrorMessagesedit({});
        setEditUser({
            username: '',
            password: '',
            fullname: '',
            role: '',
            email: '',
            phone: '',
            address: '',
            note: ''
        });
        setUser({
            username: '',
            password: '',
            confirmPassword: '',
            fullname: '',
            role: '',
            email: '',
            phone: '',
            address: '',
            note: ''
        });
        setShowModal(false);
    };
    // Get all user
    const [profiles, setProfile] = useState([]);
    useEffect(() => {

        fetch(`${proxy()}/auth/activation/check`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, activated, status, content } = resp;
                // console.log(resp)
                if (activated) {
                    fetch(`${proxy()}/auth/all/accounts`, {
                        headers: {
                            Authorization: _token
                        }
                    })
                        .then(res => res.json())
                        .then(resp => {
                            const { success, data, status, content } = resp;
                            // console.log(resp)
                            if (success) {
                                if (data != undefined && data.length > 0) {
                                    setProfile(data);
                                    // console.log(data)
                                }
                            } else {
                                window.location = "/login"
                            }
                        })
                    setStatusActive(true)
                }
                else {
                    Swal.fire({
                        title: lang["faild"],
                        text: lang["fail.active"],
                        icon: "error",
                        showConfirmButton: true,
                        customClass: {
                            confirmButton: 'swal2-confirm my-confirm-button-class'
                        }

                    }).then(function () {
                        // window.location.reload();
                    });
                    setStatusActive(false)
                }

            })

    }, [])
    const callDataPrivileges = () => {
        fetch(`${proxy()}/privileges/accounts`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, activated, status, content } = resp;
                // console.log(resp)
                if (success) {
                    const user = data.find(item => item.username === username);
                    setData(user.privileges)
                }
            })
    };
    useEffect(() => {
        callDataPrivileges()
    }, [])

    // console.log(data)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prevUser => ({
            ...prevUser,
            [name]: value
        }));
    };
    // Check email, phone
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const isValidPhone = (phone) => {
        const phoneRegex = /^[0-9]{10}$/; // Kiểm tra 10 chữ số
        return phoneRegex.test(phone);
    };




    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 13;
    const indexOfLastUser = currentPage * rowsPerPage;
    const indexOfFirstUser = indexOfLastUser - rowsPerPage;
    const currentData = data.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(data.length / rowsPerPage);
    // console.log(data)

    const updatePermissionsAPI = (newData) => {

        const requestBody = {
            privileges: {
                read: newData.read,
                write: newData.write,
                modify: newData.modify,
                purge: newData.purge
            }

        }
        // console.log(requestBody)
        fetch(`${proxy()}/privileges/account/${newData.username}/${newData.table_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: _token,
            },
            body: JSON.stringify(requestBody),
        })
            .then((res) => res.json())
            .then((resp) => {
                const { success, content, data, status } = resp;
                console.log(resp)
                if (success) {
                    callDataPrivileges()
                }
                // functions.showApiResponseMessage(status)
            });

    };

    const handleCheckboxChange = async (index, permissionType) => {
        const newData = { ...currentData[index] };
        newData[permissionType] = !newData[permissionType];
        // console.log(newData)
        // Gọi API để cập nhật trạng thái
        try {
            await updatePermissionsAPI(newData);
            setData(prevData => {
                const updatedData = [...prevData];
                updatedData[index] = newData;
                return updatedData;
            });
        } catch (error) {
            console.error('Failed to update permissions', error);
            // Xử lý lỗi ở đây (ví dụ, bằng cách hiển thị thông báo lỗi)
        }
    };
    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title d-flex align-items-center">
                            <h4 class="ml-1">{lang["privileges manager"]}</h4>
                        </div>
                    </div>
                </div>
                <div class="row column1">
                    <div class="col-md-12">
                        <div class="white_shd full">
                            <div class="white_shd full ">
                                <div class="full graph_head">
                                    <div class="heading1 margin_0">
                                        <h5><label class="pointer" onClick={() => goToHomePage()}>
                                            <a title={lang["back"]}><i class=" fa fa-chevron-circle-left mr-1 nav-item nav-link"></i></a>{lang["privileges"]}
                                        </label></h5>
                                    </div>

                                </div>
                            </div>




                            {/* List user */}
                            <div class="full price_table padding_infor_info">
                                <div class="col-md-12 mt-1 mb-2 font-weight-bold ">
                                    {lang["privileges username"]}: {username}
                                </div>
                                <div class="col-md-12">
                                    <div class="table-responsive mb-2">
                                        {
                                            currentData && currentData.length > 0 ? (
                                                <>
                                                    <table className="table table">
                                                        <thead>
                                                            <tr className="color-tr">
                                                                <th className="font-weight-bold" style={{ width: "30px" }} scope="col">
                                                                    {lang["log.no"]}
                                                                </th>
                                                                <th className="font-weight-bold" scope="col">
                                                                    {lang["table name"]}
                                                                </th>
                                                                <th className="font-weight-bold" style={{ width: "400px" }} scope="col">
                                                                    {lang["permission"]}
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentData.map((data, index) => (
                                                                <tr key={index}>
                                                                    <td>{indexOfFirstUser + index + 1}</td>
                                                                    <td>{data.table.table_name}</td>
                                                                    <td>
                                                                        <label className="pointer">
                                                                            <input
                                                                                className="ml-4 mr-2 pointer"
                                                                                type="checkbox"
                                                                                checked={data.read}
                                                                                onChange={() => handleCheckboxChange(index, 'read')}
                                                                            />
                                                                            {lang["read"]}
                                                                        </label>
                                                                        <label className="pointer">
                                                                            <input
                                                                                className="ml-4 mr-2 pointer"
                                                                                type="checkbox"
                                                                                checked={data.write}
                                                                                onChange={() => handleCheckboxChange(index, 'write')}
                                                                            />
                                                                            {lang["write"]}
                                                                        </label>
                                                                        <label className="pointer">
                                                                            <input
                                                                                className="ml-4 mr-2 pointer"
                                                                                type="checkbox"
                                                                                checked={data.modify}
                                                                                onChange={() => handleCheckboxChange(index, 'modify')}
                                                                            />
                                                                            {lang["modify"]}
                                                                        </label>
                                                                        <label className="pointer ">
                                                                            <input
                                                                                className="ml-4 mr-2 pointer"
                                                                                type="checkbox"
                                                                                checked={data.purge}
                                                                                onChange={() => handleCheckboxChange(index, 'purge')}
                                                                            />

                                                                            {lang["purge"]}
                                                                        </label>

                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </>
                                            ) : (
                                                <div class="d-flex justify-content-center align-items-center w-100 responsive-div">
                                                    {lang["not found user"]}
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <p>
                                            {lang["show"]} {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, data.length)} {lang["of"]} {data.length} {lang["results"]}
                                        </p>
                                        <nav aria-label="Page navigation example">
                                            <ul className="pagination mb-0">
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => paginate(1)}>
                                                        &#8810;
                                                    </button>
                                                </li>
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => paginate(Math.max(1, currentPage - 1))}>
                                                        &laquo;
                                                    </button>
                                                </li>
                                                {currentPage > 2 && <li className="page-item"><span className="page-link">...</span></li>}
                                                {Array(totalPages).fill().map((_, index) => {
                                                    if (
                                                        index + 1 === currentPage ||
                                                        (index + 1 >= currentPage - 1 && index + 1 <= currentPage + 1)
                                                    ) {
                                                        return (
                                                            <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                                <button className="page-link" onClick={() => paginate(index + 1)}>
                                                                    {index + 1}
                                                                </button>
                                                            </li>
                                                        );
                                                    }
                                                    return null;  // Đảm bảo trả về null nếu không có gì được hiển thị
                                                })}
                                                {currentPage < totalPages - 1 && <li className="page-item"><span className="page-link">...</span></li>}
                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => paginate(Math.min(totalPages, currentPage + 1))}>
                                                        &raquo;
                                                    </button>
                                                </li>
                                                {/* Nút đến trang cuối */}
                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => paginate(totalPages)}>
                                                        &#8811;
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}