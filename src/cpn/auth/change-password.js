import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRef } from "react";
import Swal from 'sweetalert2';
import { Profile } from '.';
export default (props) => {
    const { lang, proxy, functions, auth } = useSelector(state => state);

    const _token = localStorage.getItem("_token");
    const stringifiedUser = localStorage.getItem("user");
    const user = JSON.parse(stringifiedUser)
    const [profile, setProfile] = useState({});
    const [editUser, setEditUser] = useState({});
    const [errorMessagesedit, setErrorMessagesedit] = useState({});
    const [statusActive, setStatusActive] = useState(false);

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const isValidPhone = (phone) => {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    };
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

                    setStatusActive(true)
                }
                else {
                    Swal.fire({
                        title: lang["faild"],
                        text: lang["fail.active"],
                        icon: "error",
                        showConfirmButton: true,

                    }).then(function () {
                        // window.location.reload();
                    });
                    setStatusActive(false)
                }

            })

    }, [])

    const submitUpdate = (e) => {
        e.preventDefault();
        const errors = {};
        if (!editUser.oldPassword) {
            errors.oldPassword = lang["error.input"]
        }
        if (!editUser.newPassword) {
            errors.newPassword = lang["error.input"]
        }
        if (!editUser.rePassword) {
            errors.rePassword = lang["error.input"]
        }
        if (editUser.oldPassword !== "" && editUser.newPassword !== "" && editUser.oldPassword === editUser.newPassword) {
            errors.duPassword =lang["duPassword"];
        }
        
        if (editUser.newPassword && editUser.rePassword && editUser.newPassword !== editUser.rePassword) {
            errors.validPassword = lang["validPassword"]
        }

        if (Object.keys(errors).length > 0) {
            setErrorMessagesedit(errors);
            return;
        }

        const requestBody = {
            account: {
                username: auth.username,
                oldPassword: editUser.oldPassword,
                newPassword: editUser.newPassword
            }
        };

        console.log(requestBody)
        fetch(`${proxy()}/auth/changePwd`, {
            method: 'POST',
            headers: {
                "content-type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(requestBody)

        })
            .then(res => res.json())
            .then((resp) => {
                const { success, content, status } = resp;
                console.log(resp)
                setErrorMessagesedit({})
                if (success) {
                    Swal.fire({
                        title: lang["success"],
                        text: lang["success.password"],
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                    })
                    .then(function () {
                        window.location.reload();
                    });
                } else {
                    Swal.fire({
                        title: lang["error"],
                        text: lang["faild.password"],
                        icon: "error",
                        showConfirmButton: false,
                        timer: 1500,
                    })
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
                {statusActive ? (
                    <div class="row column1">
                        <div class="col-md-12">
                            <div class="white_shd full margin_bottom_30">
                                <div class="full graph_head">

                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div className="heading1 margin_0">
                                            <h5>{lang["change password"]}</h5>
                                        </div>

                                    </div>

                                </div>
                                <div class="full price_table padding_infor_info">
                                    <div className="container justify-content-center mt-3">
                                        <div class="row">
                                            <div class="form-group col-lg-4"></div>
                                            <div class="form-group col-lg-4">
                                                <label class="font-weight-bold text-small">{lang["username"]}</label>
                                                <input type="text" class="form-control" value={auth.username} readOnly />
                                                <div class="fixed-height">
                                                </div>
                                            </div>
                                            <div class="form-group col-lg-4"></div>
                                            <div class="form-group col-lg-4"></div>
                                            <div class="form-group col-lg-4">
                                                <label class="font-weight-bold text-small" >{lang["old password"]}<span className='red_star ml-1'>*</span></label>
                                                <input type="password" class="form-control" value={editUser.oldPassword} onChange={
                                                    (e) => { setEditUser({ ...editUser, oldPassword: e.target.value }) }
                                                } placeholder={lang["p.old password"]} />
                                                <div class="fixed-height">
                                                    {errorMessagesedit.oldPassword && <span class="error-message">{errorMessagesedit.oldPassword}</span>}
                                                </div>

                                            </div>
                                            <div class="form-group col-lg-4"></div>
                                            <div class="form-group col-lg-4"></div>
                                            <div class="form-group col-lg-4">
                                                <label class="font-weight-bold text-small">{lang["new password"]}<span className='red_star ml-1'>*</span></label>
                                                <input type="password" class="form-control" value={editUser.newPassword} onChange={
                                                    (e) => { setEditUser({ ...editUser, newPassword: e.target.value }) }
                                                } placeholder={lang["p.new password"]} />
                                                <div class="fixed-height">
                                                    {errorMessagesedit.newPassword ? (errorMessagesedit.newPassword && <span class="error-message">{errorMessagesedit.newPassword}</span>)
                                                        : (errorMessagesedit.duPassword && <span class="error-message ">{errorMessagesedit.duPassword}</span>)}
                                                </div>

                                            </div>
                                            <div class="form-group col-lg-4"></div>
                                            <div class="form-group col-lg-4"></div>
                                            <div class="form-group col-lg-4">
                                                <label class="font-weight-bold text-small">{lang["re password"]}<span className='red_star ml-1'>*</span></label>
                                                <input type="password" class="form-control" value={editUser.rePassword} onChange={
                                                    (e) => { setEditUser({ ...editUser, rePassword: e.target.value }) }
                                                } placeholder={lang["p.re password"]} />
                                               
                                                <div class="fixed-height">
                                                    {errorMessagesedit.rePassword ? (errorMessagesedit.rePassword && <span class="error-message">{errorMessagesedit.rePassword}</span>)
                                                        : (errorMessagesedit.validPassword && <span class="error-message ">{errorMessagesedit.validPassword}</span>)}
                                                </div>
                                            </div>
                                            <div class="form-group col-lg-4"></div>
                                            <div class="form-group col-lg-4"></div>
                                            <div class="form-group col-lg-4 d-flex">
                                                <button class="btn btn-primary ml-auto" onClick={submitUpdate}>{lang["change"]}</button>
                                            </div>
                                            <div class="form-group col-lg-4"></div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>





    )
}