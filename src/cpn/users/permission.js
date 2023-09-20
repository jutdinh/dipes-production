import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import $ from 'jquery';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faDownload, faSquarePlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
export default (props) => {
    const { lang, proxy, auth, functions } = useSelector(state => state);

    const [showModal, setShowModal] = useState(false);
    const _token = localStorage.getItem("_token");
    const stringifiedUser = localStorage.getItem("user");
    const users = JSON.parse(stringifiedUser)
    const [errorMessagesadd, setErrorMessagesadd] = useState({});
    const [errorMessagesedit, setErrorMessagesedit] = useState({});
    const [isDataAdded, setIsDataAdded] = useState(false);
    const [statusActive, setStatusActive] = useState(false);
    const roles = [
        { id: 0, label: "Administrator", value: "ad" },
        // { id: 1, label: "Operator", value: "pm" },
        { id: 2, label: "Normal", value: "pd" },
        // { id: 3, label: "Người theo dõi dự án ( Monitor Staff )", value: "ps" },
    ]
    const [data, setData] = useState([]);
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

    useEffect(() => {

        fetch(`${proxy()}/privileges/accounts`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, activated, status, content } = resp;
                console.log(resp)
                if(success)
                {
                    setData(data)
                }
            })

    }, [])
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
    // Add user
    const submit = (e) => {
        e.preventDefault();
        const { username, password, fullname, role, email, phone, address } = user;
        const errors = {};
        if (!username) {
            errors.username = lang["error.username"];
        }
        if (!password) {
            errors.password = lang["error.password"];
        }
        if (!fullname) {
            errors.fullname = lang["error.fullname"];
        }
        if (!role) {
            errors.role = lang["error.permission"];
        }

        if (!email) {
            errors.email = lang["error.email"];
        } else if (!isValidEmail(email)) {
            errors.email = lang["error.vaildemail"];
        }
        if (!phone) {
            errors.phone = lang["error.phone"];
        }
        else if (!isValidPhone(phone)) {
            errors.phone = lang["error.vaildphone"];
        }
        if (!address) {
            errors.address = lang["error.address"];
        }
        if (user.password != user.confirmPassword) {
            errors.confirmPassword = lang["error.confirmpassowrd"];

        }

        if (Object.keys(errors).length > 0) {
            setErrorMessagesadd(errors);
            return;
        }
        // console.log(_token);
        if (user.username && user.password) {
            fetch(`${proxy()}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `${_token}`,
                },
                body: JSON.stringify({ account: user }),
            })
                .then((res) => res.json())
                .then((resp) => {
                    const { success, content, data, status } = resp;
                    functions.showApiResponseMessage(status)
                });
        }
    };
    // Remove user
    const handleDeleteUser = (user) => {
        const requestBody = {
            account: {
                username: user.username
            }
        };
        Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc chắn muốn xóa người dùng này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            confirmButtonColor: 'rgb(209, 72, 81)',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${proxy()}/auth/user`, {
                    method: 'DELETE',
                    headers: {
                        "content-type": "application/json",
                        Authorization: `${_token}`,
                    },
                    body: JSON.stringify(requestBody)
                })
                    .then(res => res.json())
                    .then((resp) => {
                        const { success, content, data, status } = resp;
                        functions.showApiResponseMessage(status)
                    });
            }
        });
        // console.log(requestBody)

    }
    // Update user
    const submitUpdate = (e) => {
        e.preventDefault();



        const errors = {};


        if (!editUser.fullname) {
            errors.fullname = lang["error.fullname"];
        }
        if (!editUser.role) {
            errors.role = lang["error.permission"];
        }

        if (!editUser.email) {
            errors.email = lang["error.email"];
        } else if (!isValidEmail(editUser.email)) {
            errors.email = lang["error.vaildemail"];
        }
        if (!editUser.phone) {
            errors.phone = lang["error.phone"];
        }
        else if (!isValidPhone(editUser.phone)) {
            errors.phone = lang["error.vaildphone"];
        }
        if (!editUser.address) {
            errors.address = lang["error.address"];
        }


        if (Object.keys(errors).length > 0) {
            setErrorMessagesedit(errors);
            return;
        }
        const requestBody = {
            account: {
                ...editUser
            }
        };
        fetch(`${proxy()}/auth/user`, {
            method: 'PUT',
            headers: {
                "content-type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(requestBody)
        })
            .then(res => res.json())
            .then((resp) => {
                const { success, content, status } = resp;

                const newProfiles = profiles.map(user => {
                    if (user.username == editUser.username) {
                        return editUser
                    } else {
                        return user;
                    }
                })
                setProfile(newProfiles)
                // close modal
                // console.log(resp)
                functions.showApiResponseMessage(status)
            });
    }
    const handleUpdateUser = (editUser) => {
        // console.log("Thông tin người dùng:", editUser.role);
        setEditUser(editUser)
        // if (editUser.role === users.role) {
        //     Swal.fire({
        //         title: "Thất bại!",
        //         text: "Không có quyền thực hiện thao tác",
        //         icon: "error",
        //         // showConfirmButton: false,

        //     }).then(function () {
        //          window.location.reload();
        //         $('.modal-backdrop').remove()
        //     });
        //     setShowModal(false);
        //     return;
        // } else {
        //     setEditUser(editUser)
        //     setShowModal(true); 
        // }
    }

    const redirectTo = (profile) => {
        window.location.href = `/privileges/detail?username=${profile.username}`;
    }
    
    const admins = profiles.filter(profile => profile.role === 'ad');
    const projectManagers = profiles.filter(profile => profile.role === 'pm');
    const implementers = profiles.filter(profile => profile.role === 'pd');
    const projectFollowers = profiles.filter(profile => profile.role === 'ps');


    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 15;

    const indexOfLastUser = currentPage * rowsPerPage;
    const indexOfFirstUser = indexOfLastUser - rowsPerPage;
    const currentUser = data.slice(indexOfFirstUser, indexOfLastUser);
    console.log(currentUser)
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(profiles.length / rowsPerPage);

    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title d-flex align-items-center">
                            <h4 class="ml-1">{lang["privileges manager"]}</h4>

                            {statusActive ? (
                                <button type="button" class="btn btn-primary custom-buttonadd ml-auto mr-4" data-toggle="modal" data-target="#quoteForm">
                                    <i class="fa fa-plus"></i>
                                </button>
                                // <div class="ml-auto pointer" data-toggle="modal" data-target="#quoteForm" title="Add">
                                //     <FontAwesomeIcon icon={faSquarePlus} className="icon-add" />
                                // </div>
                            ) : null}

                        </div>
                    </div>
                </div>
                
                <div class="row column1">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            {/* <div class="full graph_head">
                                <div class="heading1 margin_0">
                                    <div className="row justify-content-end">
                                        <div className="col-auto">
                                            <h5>{lang["accounts list"]}</h5>
                                        </div>

                                    </div>
                                </div>
                            </div> */}
                            {/* Modal add */}
                            <div class="modal fade" id="quoteForm" tabindex="-1" role="dialog" aria-labelledby="quoteForm" aria-hidden="true">
                                <div class="modal-dialog modal-lg modal-dialog-center" role="document">
                                    <div class="modal-content p-md-3">
                                        <div class="modal-header">
                                            <h4 class="modal-title">{lang["adduser.title"]} </h4>
                                            <button class="close" type="button" onClick={handleCloseModal} data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                        </div>
                                        <div class="modal-body">
                                            <form>
                                                <div class="row">
                                                    <div class="form-group col-lg-6">
                                                        <label class="font-weight-bold text-small" for="firstname">{lang["fullname"]}<span className='red_star ml-1'>*</span></label>
                                                        <input type="text" class="form-control" value={user.fullname} onChange={
                                                            (e) => { setUser({ ...user, fullname: e.target.value }) }
                                                        } placeholder={lang["p.fullname"]} />
                                                        {errorMessagesadd.fullname && <span class="error-message">{errorMessagesadd.fullname}</span>}
                                                    </div>
                                                    <div class="form-group col-lg-6">
                                                        <label class="font-weight-bold text-small" for="firstname">{lang["username"]}<span className='red_star ml-1'>*</span></label>
                                                        <input type="text" class="form-control" value={user.username} onChange={
                                                            (e) => { setUser({ ...user, username: e.target.value }) }
                                                        } placeholder={lang["p.username"]} />
                                                        {errorMessagesadd.username && <span class="error-message">{errorMessagesadd.username}</span>}
                                                    </div>
                                                    <div class="form-group col-lg-6">
                                                        <label class="font-weight-bold text-small" for="lastname">{lang["password"]}<span className='red_star ml-1'>*</span></label>
                                                        <input type="password" class="form-control" value={user.password} onChange={
                                                            (e) => { setUser({ ...user, password: e.target.value }) }
                                                        } placeholder={lang["p.password"]} />
                                                        {errorMessagesadd.password && <span class="error-message">{errorMessagesadd.password}</span>}
                                                    </div>
                                                    <div class="form-group col-lg-6">
                                                        <label class="font-weight-bold text-small" for="lastname">{lang["re-password"]}<span className='red_star ml-1'>*</span></label>
                                                        <input
                                                            type="password"
                                                            class="form-control"
                                                            value={user.confirmPassword}
                                                            onChange={(e) => {
                                                                setUser({ ...user, confirmPassword: e.target.value });
                                                            }}
                                                            placeholder={lang["p.re-password"]}
                                                        />
                                                        {errorMessagesadd.confirmPassword && <span class="error-message">{errorMessagesadd.confirmPassword}</span>}
                                                    </div>
                                                    <div class="form-group col-lg-12">
                                                        <label class="font-weight-bold text-small" for="email">{lang["email"]}<span class="red_star ml-1">*</span></label>
                                                        <input type="email" class="form-control" value={user.email} onChange={
                                                            (e) => { setUser({ ...user, email: e.target.value }) }
                                                        } placeholder={lang["p.email"]} />
                                                        {errorMessagesadd.email && <span class="error-message">{errorMessagesadd.email}</span>}
                                                    </div>
                                                    <div class="form-group col-lg-6">
                                                        <label class="font-weight-bold text-small" for="phone">{lang["phone"]}<span class="red_star ml-1">*</span></label>
                                                        <input type="phone" class="form-control" value={user.phone} onChange={
                                                            (e) => { setUser({ ...user, phone: e.target.value }) }
                                                        } placeholder={lang["p.phone"]} />
                                                        {errorMessagesadd.phone && <span class="error-message">{errorMessagesadd.phone}</span>}
                                                    </div>
                                                    <div class="form-group col-lg-6">
                                                        <label class="font-weight-bold text-small" for="projecttype">{lang["permission"]}<span class="red_star ml-1">*</span></label>
                                                        <select className="form-control" name="role" value={user.role} onChange={handleChange} >
                                                            <option value="">{lang["p.permission"]}</option>
                                                            {users.role === "ad" ? (
                                                                roles.slice(0, 4).map(role => (
                                                                    <option key={role.id} value={role.value}>{role.label}</option>
                                                                ))
                                                            ) : (
                                                                roles.map(role => (
                                                                    <option key={role.id} value={role.value}>{role.label}</option>
                                                                ))
                                                            )}
                                                        </select>
                                                        {errorMessagesadd.role && <span className="error-message">{errorMessagesadd.role}</span>}
                                                    </div>
                                                    <div class="form-group col-lg-12">
                                                        <label class="font-weight-bold text-small" for="projectdetail">{lang["address"]}<span class="red_star ml-1">*</span></label>
                                                        <textarea maxlength="500" rows="5" type="text" class="form-control" value={user.address} onChange={
                                                            (e) => { setUser({ ...user, address: e.target.value }) }
                                                        } placeholder={lang["p.address"]} />
                                                        {errorMessagesadd.address && <span class="error-message">{errorMessagesadd.address}</span>}
                                                    </div>
                                                    <div class="form-group col-lg-12">
                                                        <label class="font-weight-bold text-small" for="projectdetail">{lang["note"]}</label>
                                                        <textarea maxlength="500" rows="5" type="text" class="form-control" value={user.note} onChange={
                                                            (e) => { setUser({ ...user, note: e.target.value }) }
                                                        } placeholder={lang["p.note"]} />
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" onClick={submit} class="btn btn-success">{lang["btn.create"]}</button>
                                            <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Modal edit */}
                            <div class="modal fade" tabindex="-1" role="dialog" id="myEditmodal" aria-labelledby="edit" aria-hidden="true">
                                <div class="modal-dialog modal-lg modal-dialog-center" role="document">
                                    <div class="modal-content p-md-3">
                                        <div class="modal-header">
                                            <h4 class="modal-title">{lang["edituser.title"]} </h4>

                                            <button class="close" type="button" onClick={handleCloseModal} data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                        </div>
                                        <div class="modal-body">
                                            <form>
                                                <div class="row">
                                                    <div class="form-group col-lg-6">
                                                        <label class="font-weight-bold text-small" for="firstname">{lang["fullname"]}<span className='red_star ml-1'>*</span></label>
                                                        <input type="text" class="form-control" value={editUser.fullname} onChange={
                                                            (e) => { setEditUser({ ...editUser, fullname: e.target.value }) }
                                                        } placeholder={lang["p.fullname"]} />
                                                        {errorMessagesedit.fullname && <span class="error-message">{errorMessagesedit.fullname}</span>}
                                                    </div>
                                                    <div class="form-group col-lg-12">
                                                        <label class="font-weight-bold text-small" for="email">{lang["email"]}<span class="red_star ml-1">*</span></label>
                                                        <input type="email" class="form-control" value={editUser.email} onChange={
                                                            (e) => { setEditUser({ ...editUser, email: e.target.value }) }
                                                        } placeholder={lang["p.email"]} />
                                                        {errorMessagesedit.email && <span class="error-message">{errorMessagesedit.email}</span>}
                                                    </div>
                                                    <div class="form-group col-lg-6">
                                                        <label class="font-weight-bold text-small" for="phone">{lang["phone"]}<span class="red_star ml-1">*</span></label>
                                                        <input type="phone" class="form-control" value={editUser.phone} onChange={
                                                            (e) => { setEditUser({ ...editUser, phone: e.target.value }) }
                                                        } placeholder={lang["p.phone"]} />
                                                        {errorMessagesedit.phone && <span class="error-message">{errorMessagesedit.phone}</span>}
                                                    </div>
                                                    <div class="form-group col-lg-6">
                                                        <label class="font-weight-bold text-small" htmlFor="sel1">{lang["permission"]} <span className='red_star'>*</span></label>
                                                        <select className="form-control" name="role" value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>

                                                            {users.role === "ad" ? (
                                                                roles.slice(0, 4).map(role => (
                                                                    <option key={role.id} value={role.value}>{role.label}</option>
                                                                ))
                                                            ) : (
                                                                roles.map(role => (
                                                                    <option key={role.id} value={role.value}>{role.label}</option>
                                                                ))
                                                            )}
                                                        </select>
                                                        {errorMessagesedit.role && <span class="error-message">{errorMessagesedit.role}</span>}
                                                    </div>

                                                    <div class="form-group col-lg-12">
                                                        <label class="font-weight-bold text-small" for="projectdetail">{lang["address"]}<span class="red_star ml-1">*</span></label>
                                                        <textarea maxlength="500" rows="5" type="text" class="form-control" value={editUser.address} onChange={
                                                            (e) => { setEditUser({ ...editUser, address: e.target.value }) }
                                                        } placeholder={lang["p.address"]} />
                                                        {errorMessagesedit.address && <span class="error-message">{errorMessagesedit.address}</span>}
                                                    </div>
                                                    <div class="form-group col-lg-12">
                                                        <label class="font-weight-bold text-small" for="projectdetail">{lang["note"]}</label>
                                                        <textarea maxlength="500" rows="5" type="text" class="form-control" value={editUser.note} onChange={
                                                            (e) => { setEditUser({ ...editUser, note: e.target.value }) }
                                                        } placeholder={lang["p.note"]} />

                                                    </div>

                                                </div>
                                            </form>
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" onClick={submitUpdate} class="btn btn-success">{lang["btn.update"]}</button>
                                            <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* List user */}
                            <div class="full price_table padding_infor_info">
                                <div class="col-md-12">
                                    <div class="table-responsive mb-2">
                                        {
                                            currentUser && currentUser.length > 0 ? (
                                                <>
                                                    <table class="table table ">
                                                        <thead>
                                                            <tr class="color-tr">
                                                                <th class="font-weight-bold" style={{ width: "30px" }} scope="col">{lang["log.no"]}</th>
                                                                <th class="font-weight-bold" scope="col">{lang["username"]}</th>
                                                                <th class="font-weight-bold" style={{ width: "300px" }} scope="col">{lang["fullname"]}</th>
                                                                <th class="font-weight-bold align-center" style={{ width: "130px" }} scope="col">{lang["avatar"]}</th>
                                                                {
                                                                    ["pm", "ad", "uad"].indexOf(auth.role) != -1 &&
                                                                    <th class="font-weight-bold align-center" style={{ width: "150px" }}>{lang["log.action"]}</th>
                                                                }
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentUser.map((profile, index) => (
                                                                <tr key={index}>
                                                                    <td>{indexOfFirstUser + index + 1}</td>
                                                                    <td>{profile.username}</td>
                                                                    <td>{profile.fullname}</td>
                                                                    <td class="align-center">{
                                                                        <div class="profile_contacts_list_user ">
                                                                            <img class="img-responsive circle-image_list_user" src={proxy() + profile.avatar} alt="#" />
                                                                        </div>}</td>
                                                                    <td class="align-center">
                                                                        {/* <i class="fa fa-edit icon-edit pointer size-24" onClick={() => handleUpdateUser(profile)} data-toggle="modal" data-target="#myEditmodal"></i>
                                                                        <i class="fa fa-trash-o icon-delete pointer  size-24 ml-2" onClick={() => handleDeleteUser(profile)}></i> */}
                                                                        <button class="btn btn-primary" onClick={() => redirectTo(profile)}> Nhấn </button>
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
                                            {lang["show"]} {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, profiles.length)} {lang["of"]} {profiles.length} {lang["results"]}
                                        </p>
                                        <nav aria-label="Page navigation example">
                                            <ul className="pagination mb-0">
                                                {/* Nút đến trang đầu */}
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