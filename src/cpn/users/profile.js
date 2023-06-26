import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import React, { useRef } from "react";
import Swal from 'sweetalert2';
import { Profile } from '.';
export default (props) => {
    const { lang, proxy } = useSelector(state => state);

    const _token = localStorage.getItem("_token");
    const stringifiedUser = localStorage.getItem("user");
    const user = JSON.parse(stringifiedUser)
    const [profile, setProfile] = useState({});
    const [editUser, setEditUser] = useState({});
    const [errorMessagesedit, setErrorMessagesedit] = useState({});
    const roles = [
        { id: 0, label: "Quản trị viên ( Administrator )", value: "ad" },
        { id: 1, label: "Quản lý dự án ( Project manager )", value: "pm" },
        { id: 2, label: "Người triển khai ( Implementation Staff )", value: "pd" },
        { id: 3, label: "Người theo dõi dự án ( Monitor Staff )", value: "ps" },
    ]
    useEffect(() => {
        fetch(`${proxy}/auth/u/${user.username}`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { data } = resp;
                console.log(resp)
                if (data != undefined) {
                    setProfile(data);
                    setEditUser(data)
                    console.log(data)
                }
            })
    }, [])
    useEffect(() => {
        console.log(profile)
    }, [profile])
    const fileInputRef = useRef(null);
    const handleClick = () => {
        fileInputRef.current.click();
    };
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        // Xử lý tệp tin tại đây
        if (file) {
            if (file != undefined) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (e) => {
                    setProfile({ ...profile, avatar: e.target.result })
                    fetch(`${proxy}/auth/self/avatar`, {
                        method: "PUT",
                        headers: {
                            "content-type": "application/json",
                            Authorization: _token
                        },
                        body: JSON.stringify({ image: e.target.result })
                    }).then(res => res.json()).then(data => {
                        const { success, content } = data;
                      
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
                    })
                }
            }
        }
    };
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
        console.log(requestBody)
        fetch(`${proxy}/auth/self/info`, {
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
                console.log(resp)
                if (success) {
                    const stringifiedUser = JSON.stringify( requestBody.account )
                    localStorage.setItem("user", stringifiedUser)
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
    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h4>{lang["profile"]}</h4>
                        </div>
                    </div>
                </div>
                <div class="row column1">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head">

                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div className="heading1 margin_0">
                                        <h5>{lang["profile user"]}</h5>
                                    </div>
                                    <i className="fa fa-edit size pointer" data-toggle="modal" data-target="#editMember"></i>
                                </div>
                                <div class="modal fade" tabindex="-1" role="dialog" id="editMember" aria-labelledby="edit" aria-hidden="true">
                                <div class="modal-dialog modal-lg modal-dialog-center" role="document">
                                    <div class="modal-content p-md-3">
                                        <div class="modal-header">
                                            <h4 class="modal-title">{lang["profile.title"]} </h4>

                                            {/* <button class="close" type="button" onClick={handleCloseModal} data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button> */}
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
                                            <button type="button"  data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>

                                        </div>
                                    </div>
                                </div>
                            </div>




                            </div>
                            <div class="full price_table padding_infor_info">
                                <div class="row">
                                    <div class="col-lg-8">
                                        <div class="full dis_flex center_text">
                                            <div className="profile_img" onClick={handleClick}>
                                                <img
                                                    width="180"
                                                    className="rounded-circle"
                                                    src={profile.avatar && profile.avatar.length < 255 ? (proxy + profile.avatar) : profile.avatar}
                                                    alt="#"
                                                />
                                                <input type="file"
                                                    accept='image/*'
                                                    ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />
                                            </div>
                                            <div class="profile_contant">
                                                <div class="contact_inner">
                                                    <h3>{profile.fullname || "Administrator"}</h3>
                                                    <ul class="list-unstyled">
                                                        <li>{lang["username"]}: {profile.username}</li>
                                                        <li>{lang["permission"]}: {profile.role === "ad" ? "Quản trị viên" :
                                                            profile.role === "pm" ? "Quản lý dự án" :
                                                                profile.role === "pd" ? "Người triển khai" :
                                                                    profile.role === "ps" ? "Người theo dõi dự án" :
                                                                        profile.role}</li>
                                                        <li><i class="fa fa-envelope-o"></i> : {profile.email || "nhan.to@mylangroup.com"}</li>
                                                        <li> <i class="fa fa-phone"></i> : {profile.phone || "0359695554"}</li>
                                                        <li>{lang["address"]}: {profile.address || "Phong Thạnh, Cầu Kè, Trà Vinh"}</li>
                                                        <li>{lang["note"]}: {profile.note || lang["note"]}</li>
                                                    </ul>
                                                </div>
                                                <div class="user_progress_bar">
                                                    <div class="progress_bar">
                                                        <span class="skill" style={{ width: 500 }}>Web Applications <span class="info_valume">85%</span></span>
                                                        <div class="progress skill-bar ">
                                                            <div class="progress-bar progress-bar-animated progress-bar-striped" role="progressbar" aria-valuenow="85" aria-valuemin="0" aria-valuemax="100" style={{ width: 500 }}>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="full inner_elements margin_top_30">
                                            <div class="tab_style2">
                                                <div class="tabbar">
                                                    <nav>
                                                        <div class="nav nav-tabs" id="nav-tab" role="tablist">
                                                            <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#recent_activity" role="tab" aria-selected="true">{lang["tasks"]}</a>
                                                            <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#project_worked" role="tab" aria-selected="false">{lang["projects worked"]}</a>
                                                        </div>
                                                    </nav>
                                                    <div class="tab-content" id="nav-tabContent">
                                                        <div class="tab-pane fade show active" id="recent_activity" role="tabpanel" aria-labelledby="nav-home-tab">
                                                            <div class="msg_list_main">
                                                                <ul class="msg_list">
                                                                    <li>
                                                                        {/* <span><img src="images/layout_img/msg2.png" class="img-responsive" alt="#" /></span> */}
                                                                        <span>
                                                                            <span class="name_user">Yêu cầu 1</span>
                                                                            <span class="msg_user">Mô tả</span>< br />
                                                                            <span class="msg_user">Dự án: Tên dự án</span>
                                                                            <span class="time_ago">12 {lang["min ago"]}</span>
                                                                        </span>
                                                                    </li>
                                                                    <li>
                                                                        {/* <span><img src="images/layout_img/msg2.png" class="img-responsive" alt="#" /></span> */}
                                                                        <span>
                                                                            <span class="name_user">Yêu cầu 2</span>
                                                                            <span class="msg_user">Mô tả</span>< br />
                                                                            <span class="msg_user">Dự án: Tên dự án</span>
                                                                            <span class="time_ago">12 {lang["min ago"]}</span>
                                                                        </span>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        <div class="tab-pane fade" id="project_worked" role="tabpanel" aria-labelledby="nav-profile-tab">
                                                            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et
                                                                quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
                                                                qui ratione voluptatem sequi nesciunt.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    <div class="col-lg-4">

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