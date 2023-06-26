import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import $ from 'jquery';
import Swal from 'sweetalert2';
export default (props) => {
    const { lang, proxy, auth } = useSelector(state => state);

    const [showModal, setShowModal] = useState(false);
    const _token = localStorage.getItem("_token");
    const stringifiedUser = localStorage.getItem("user");
    const users = JSON.parse(stringifiedUser)
    const [errorMessagesadd, setErrorMessagesadd] = useState({});
    const [errorMessagesedit, setErrorMessagesedit] = useState({});
    const [isDataAdded, setIsDataAdded] = useState(false);
    const roles = [
        { id: 0, label: "Administrator", value: "ad" },
        { id: 1, label: "Operator", value: "pm" },
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
        fetch(`${proxy}/auth/all/accounts`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;
                 console.log(resp)
                if (success) {
                    if (data != undefined && data.length > 0) {
                        setProfile(data);
                        // console.log(data)
                    }
                } else {
                    window.location = "/404-not-found"
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
            fetch(`${proxy}/auth/signup`, {
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
                    if (success) {
                        Swal.fire({
                            title: "Thành công!",
                            text: content,
                            icon: "success",
                            showConfirmButton: false,
                            timer: 1500,
                        }).then(function () {
                            window.location.reload();
                        });
                        setUser({});
                        setShowModal(false);
                        setIsDataAdded(true);
                    } else {
                        Swal.fire({
                            title: "Thất bại!",
                            text: content,
                            icon: "error",
                            showConfirmButton: false,
                            timer: 2000,
                        }).then(function () {

                        });
                    }
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
                fetch(`${proxy}/auth/user`, {
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
                        if (status === "0x52404") {
                            Swal.fire({
                                title: "Cảnh báo!",
                                text: content,
                                icon: "warning",
                                showConfirmButton: false,
                                timer: 1500,
                            }).then(function () {
                                window.location.reload();
                            });
                            return;
                        }
                        if (success) {
                            Swal.fire({
                                title: "Thành công!",
                                text: content,
                                icon: "success",
                                showConfirmButton: false,
                                timer: 1500,
                            }).then(function () {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire({
                                title: "Thất bại!",
                                text: content,
                                icon: "error",
                                showConfirmButton: false,
                                timer: 2000,
                            }).then(function () {
                                // Không cần reload trang
                            });
                        }
                    });
            }
        });
        // console.log(requestBody)

    }
    // Update user
    const submitUpdate = (e) => {
        e.preventDefault();
        if (!editUser.fullname || !editUser.role || !editUser.email || !editUser.phone || !editUser.address) {
            Swal.fire({
                title: "Lỗi!",
                text: "Vui lòng điền đầy đủ thông tin",
                icon: "error",
                showConfirmButton: false,
                timer: 2000,
            });
            return;
        }
        const requestBody = {
            account: {
                ...editUser
            }
        };
        fetch(`${proxy}/auth/user`, {
            method: 'PUT',
            headers: {
                "content-type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(requestBody)
        })
            .then(res => res.json())
            .then((resp) => {
                const { success, content } = resp;

                const newProfiles = profiles.map( user => {
                    if( user.username == editUser.username ){
                        return editUser
                    }else{
                        return user;
                    }
                })
                setProfile( newProfiles )
                // close modal
                // console.log(resp)
                if (success) {
                    Swal.fire({
                        title: "Thành công!",
                        text: content,
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                    }).then(function () {
                        // window.location.reload();
                    });
                } else {
                    Swal.fire({
                        title: "Error!",
                        text: "Image is not selected",
                        icon: "error",
                        confirmButtonText: "OK",
                        showCloseButton:true,
                      }).then(function () {
                        // Không cần reload trang
                    });
                }
            });
    }
    const handleUpdateUser = (editUser) => {
        console.log("Thông tin người dùng:", editUser.role);
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


    const admins = profiles.filter(profile => profile.role === 'ad');
    const projectManagers = profiles.filter(profile => profile.role === 'pm');
    const implementers = profiles.filter(profile => profile.role === 'pd');
    const projectFollowers = profiles.filter(profile => profile.role === 'ps');

    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title d-flex align-items-center">
                            <h4>{lang["accounts manager"]}</h4>
                            <button type="button" class="btn btn-primary custom-buttonadd ml-auto" data-toggle="modal" data-target="#quoteForm">
                                <i class="fa fa-plus"></i>
                            </button>
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
                                            <h4>{lang["accounts list"]}</h4>
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
                                                        {errorMessagesadd.username && <span class="error-message">{errorMessagesadd.fullname}</span>}
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
                                                                roles.slice(1, 4).map(role => (
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
                                                        {errorMessagesedit.username && <span class="error-message">{errorMessagesedit.fullname}</span>}
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
                                                        <label htmlFor="sel1">{lang["permission"]} <span className='red_star'>*</span></label>
                                                        <select className="form-control" name="role" value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                                                            
                                                            {users.role === "ad" ? (
                                                                roles.slice(1, 4).map(role => (
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
                                <div class="container-fluid">
                                    {admins.length > 0 && (
                                        <div class="row group">
                                            <h5 class="col-lg-12 mb-1">{lang["administrator"]}</h5>
                                            {admins.map((item) => (
                                                <div class="col-lg-4 col-md-6 col-sm-6 col-xs-12 profile_details margin_bottom_30">
                                                    <div class="contact_blog">
                                                        <div class="contact_inner">
                                                            <div class="left-cus">
                                                            <p><strong>{item.fullname}</strong></p>
                                                                <p>{lang["username"]}: {item.username} </p>
                                                                <p>{lang["permission"]}:
                                                                     { item.role === "ad" ? lang["administrator"] :
                                                                        item.role === "pm" ? lang["uprojectmanager"] :
                                                                            item.role === "pd" ? lang["normal"] :
                                                                              
                                                                                    item.role}</p>
                                                                <ul class="list-unstyled">
                                                                    <li><i class="fa fa-envelope-o"></i> {item.email}</li>
                                                                    <li><i class="fa fa-phone"></i> {item.phone}</li>
                                                                    <li>{lang["createby"]}: {item.create_by}</li>
                                                                    <li>
                                                                        {lang["time"]}: {
                                                                            lang["time"] === "Time" ?
                                                                                item.create_at.replace("lúc", "at") :
                                                                                item.create_at
                                                                        }
                                                                    </li>

                                                                </ul>
                                                            </div>
                                                            <div class="right">
                                                                <div class="profile_contacts">
                                                                    <img class="img-responsive" width={100} src={proxy + item.avatar} alt="#" />
                                                                </div>
                                                            </div>
                                                            {/* {item.username !== auth.username && item.role !== auth.role && ( */}
                                                                <div class="bottom_list">
                                                                    <div class="right_button">
                                                                        <button type="button" class="btn btn-primary" onClick={() => handleUpdateUser(item)} data-toggle="modal" data-target="#myEditmodal">
                                                                            <i class="fa fa-edit"></i>
                                                                        </button>
                                                                        <button type="button" class="btn btn-danger" onClick={() => handleDeleteUser(item)}>
                                                                            <i class="fa fa-trash-o"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            {/* )} */}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {projectManagers.length > 0 && (
                                        <div class="row group">
                                            <h5 class="col-lg-12 mb-1">{lang["uprojectmanager"]}</h5>
                                            {projectManagers.map((item) => (
                                                <div class="col-lg-4 col-md-6 col-sm-6 col-xs-12 profile_details margin_bottom_30">
                                                    <div class="contact_blog">
                                                        <div class="contact_inner">
                                                            <div class="left-cus">
                                                            <p><strong>{item.fullname}</strong></p>
                                                                <p>{lang["username"]}:{item.username} </p>
                                                                <p>{lang["permission"]}:
                                                                     { item.role === "ad" ? lang["administrator"] :
                                                                        item.role === "pm" ? lang["uprojectmanager"] :
                                                                            item.role === "pd" ? lang["normal"] :
                                                                              
                                                                                    item.role}</p>
                                                                <ul class="list-unstyled">
                                                                    <li><i class="fa fa-envelope-o"></i> {item.email}</li>
                                                                    <li><i class="fa fa-phone"></i> {item.phone}</li>
                                                                    <li>{lang["address"]}: {item.address}</li>
                                                                    <li>{lang["createby"]}: {item.create_by}</li>
                                                                    <li>
                                                                        {lang["time"]}: {
                                                                            lang["time"] === "Time" ?
                                                                                item.create_at.replace("lúc", "at") :
                                                                                item.create_at
                                                                        }
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                            <div class="right">
                                                                <div class="profile_contacts">
                                                                    <img class="img-responsive" width={100} src={proxy + item.avatar} alt="#" />
                                                                </div>
                                                            </div>
                                                            <div class="bottom_list">
                                                                <div class="right_button">
                                                                    <button type="button" class="btn btn-primary" onClick={() => handleUpdateUser(item)} data-toggle="modal" data-target="#myEditmodal">
                                                                        <i class="fa fa-edit"></i>
                                                                    </button>
                                                                    <button type="button" class="btn btn-danger" onClick={() => handleDeleteUser(item)}>
                                                                        <i class="fa fa-trash-o"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {implementers.length > 0 && (
                                        <div class="row group">
                                            <h5 class="col-lg-12 mb-1">{lang["normal"]}</h5>
                                            {implementers.map((item) => (
                                                <div class="col-lg-4 col-md-6 col-sm-6 col-xs-12 profile_details margin_bottom_30">
                                                    <div class="contact_blog">
                                                        <div class="contact_inner">
                                                            <div class="left-cus">
                                                            <p><strong>{item.fullname}</strong></p>
                                                                <p>{lang["username"]}: {item.username} </p>
                                                                <p>{lang["permission"]}:
                                                                     { item.role === "ad" ? lang["administrator"] :
                                                                        item.role === "pm" ? lang["uprojectmanager"] :
                                                                            item.role === "pd" ? lang["normal"] :
                                                                              
                                                                                    item.role}</p>
                                                                <ul class="list-unstyled">
                                                                    <li><i class="fa fa-envelope-o"></i> {item.email}</li>
                                                                    <li><i class="fa fa-phone"></i> {item.phone}</li>
                                                                    <li>{lang["address"]}: {item.address}</li>
                                                                    <li>{lang["createby"]}: {item.create_by}</li>
                                                                    <li>
                                                                        {lang["time"]}: {
                                                                            lang["time"] === "Time" ?
                                                                                item.create_at.replace("lúc", "at") :
                                                                                item.create_at
                                                                        }
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                            <div class="right">
                                                                <div class="profile_contacts">
                                                                    <img class="img-responsive" width={100} src={proxy + item.avatar} alt="#" />
                                                                </div>
                                                            </div>
                                                            <div class="bottom_list">
                                                                {item.username !== auth.username && item.role !== auth.role && (
                                                                    <div class="right_button">
                                                                        <button type="button" class="btn btn-primary" onClick={() => handleUpdateUser(item)} data-toggle="modal" data-target="#myEditmodal">
                                                                            <i class="fa fa-edit"></i>
                                                                        </button>
                                                                        <button type="button" class="btn btn-danger" onClick={() => handleDeleteUser(item)}>
                                                                            <i class="fa fa-trash-o"></i>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* {projectFollowers.length > 0 && (
                                        <div class="row group">
                                            <h4 class="col-lg-12">{lang["monitor"]}</h4>
                                            {projectFollowers.map((item) => (
                                                <div class="col-lg-4 col-md-6 col-sm-6 col-xs-12 profile_details margin_bottom_30">
                                                    <div class="contact_blog">
                                                        <div class="contact_inner">
                                                            <div class="left-cus">
                                                                <h4>{item.fullname}</h4>
                                                                <p><strong>Tài khoản: {item.username} </strong></p>
                                                                <p><strong>Quyền: </strong>
                                                                {item.role === "ad" ? "Adminstrator" :
                                                                        item.role === "pm" ? "Operator" :
                                                                            item.role === "pd" ? "Normal" :
                                                                             
                                                                                    item.role}</p>
                                                                <ul class="list-unstyled">
                                                                    <li><i class="fa fa-envelope-o"></i> {item.email}</li>
                                                                    <li><i class="fa fa-phone"></i> {item.phone}</li>
                                                                    <li>{lang["address"]}: {item.address}</li>
                                                                    <li>Tạo bởi: {item.create_by}</li>
                                                                    <li>Thời gian: {item.create_at}</li>
                                                                </ul>
                                                            </div>
                                                            <div class="right">
                                                                <div class="profile_contacts">
                                                                    <img class="img-responsive" width={100} src={proxy + item.avatar} alt="#" />
                                                                </div>
                                                            </div>
                                                            <div class="bottom_list">
                                                                {item.username !== auth.username && item.role !== auth.role && (
                                                                    <div class="right_button">
                                                                        <button type="button" class="btn btn-primary" onClick={() => handleUpdateUser(item)} data-toggle="modal" data-target="#myEditmodal">
                                                                            <i class="fa fa-edit"></i>
                                                                        </button>
                                                                        <button type="button" class="btn btn-danger" onClick={() => handleDeleteUser(item)}>
                                                                            <i class="fa fa-trash-o"></i>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )} */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}