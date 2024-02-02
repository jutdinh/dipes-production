import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRef } from "react";
import Swal from 'sweetalert2';
import { Profile } from '.';

import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState, Modifier } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import draftToHtml from 'draftjs-to-html'
import { convertFromHTML } from 'draft-js';
import { convertFromRaw } from 'draft-js';
export default (props) => {
    const { lang, proxy, functions } = useSelector(state => state);

    const _token = localStorage.getItem("_token");
    const stringifiedUser = localStorage.getItem("user");
    const user = JSON.parse(stringifiedUser)
    const [profile, setProfile] = useState({});
    const [editUser, setEditUser] = useState({});
    const [errorMessagesedit, setErrorMessagesedit] = useState({});
    const [statusActive, setStatusActive] = useState(false);
    const roles = [
        { id: 0, label: "Quản trị viên ( Administrator )", value: "ad" },
        { id: 1, label: "Quản lý dự án ( Project manager )", value: "pm" },
        { id: 2, label: "Người triển khai ( Implementation Staff )", value: "pd" },
        { id: 3, label: "Người theo dõi dự án ( Monitor Staff )", value: "ps" },
    ]
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const isValidPhone = (phone) => {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    };

    console.log(editUser)


    const [editorState, setEditorState] = useState(
        EditorState.createEmpty()
    );

    const onEditorStateChange = (newEditorState) => {
        setEditorState(newEditorState);
    };

    const handleBeforeInput = (chars, editorState) => {
        if (chars === ' ') {
            const currentContent = editorState.getCurrentContent();
            const selection = editorState.getSelection();
            const contentWithSpace = Modifier.insertText(currentContent, selection, '\u00A0');
            const newEditorState = EditorState.push(editorState, contentWithSpace, 'insert-characters');
            onEditorStateChange(newEditorState);
            return 'handled';
        }
        return 'not-handled';
    };

    const handleKeyCommand = (command, editorState) => {
        if (command === 'backspace') {
            const currentContent = editorState.getCurrentContent();
            const selection = editorState.getSelection();
            if (selection.isCollapsed() && selection.getStartOffset() === 1) {
                // Không cho xóa khoảng trắng đầu tiên
                return 'handled';
            }
        }
        return 'not-handled';
    };

    const hanldDataUpdate = () => {
        const contentState = convertFromHTMLToContentState(editUser.note);
        const newEditorState = EditorState.createWithContent(contentState);
        setEditorState(newEditorState);
    }

    const convertFromHTMLToContentState = (htmlString) => {
        const blocksFromHTML = convertFromHTML(htmlString);
        const contentState = ContentState.createFromBlockArray(
            blocksFromHTML.contentBlocks,
            blocksFromHTML.entityMap
        );
        return contentState;
    };

    const uploadImageCallBack = (file) => {
        return new Promise(
            (resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = e.target.result;
                    resolve({ data: { link: data } });
                };
                reader.onerror = (e) => {
                    reject(e);
                };
                reader.readAsDataURL(file);
            }
        );
    };



    // useEffect(() => {

    //     fetch(`${proxy()}/auth/activation/check`, {
    //         headers: {
    //             Authorization: _token
    //         }
    //     })
    //         .then(res => res.json())
    //         .then(resp => {
    //             const { success, data, activated, status, content } = resp;
    //             // console.log(resp)
    //             if (activated) {

    //                 setStatusActive(true)
    //             }
    //             else {
    //                 Swal.fire({
    //                     title: lang["faild"],
    //                     text: lang["fail.active"],
    //                     icon: "error",
    //                     showConfirmButton: true,

    //                 }).then(function () {
    //                     // window.location.reload();
    //                 });
    //                 setStatusActive(false)
    //             }

    //         })

    // }, [])
    useEffect(() => {
        fetch(`${proxy()}/auth/u/${user.username}`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { data } = resp;
                // console.log(resp)
                if (data != undefined) {
                    setProfile(data);
                    setEditUser(data)

                }
            })
    }, [])
    useEffect(() => {
        // console.log(profile)
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
                    fetch(`${proxy()}/auth/self/avatar`, {
                        method: "PUT",
                        headers: {
                            "content-type": "application/json",
                            Authorization: _token
                        },
                        body: JSON.stringify({ image: e.target.result })
                    }).then(res => res.json()).then(data => {
                        const { success, content } = data;
                        // console.log(data)
                        // if (success) {
                        //     Swal.fire({
                        //         title: lang["success"],
                        //         text: lang["success.update"],
                        //         icon: "success",
                        //         showConfirmButton: false,
                        //         timer: 1500,
                        //     }).then(function () {
                        //         window.location.reload();
                        //     });
                        // } else {
                        //     Swal.fire({
                        //         title: lang["faild"],
                        //         text: lang["fail.update"],
                        //         icon: "error",
                        //         showConfirmButton: false,
                        //         timer: 2000,
                        //     }).then(function () {
                        //         // Không cần reload trang
                        //     });
                        // }
                    })
                }
            }
        }
    };
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
        editUser.note = draftToHtml(convertToRaw(editorState.getCurrentContent()))
        const requestBody = {

            account: {
                ...editUser
            }
        };
        // console.log(requestBody)
        fetch(`${proxy()}/auth/self/info`, {
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
                // console.log(resp)
                if (success) {
                    const stringifiedUser = JSON.stringify(requestBody.account)
                    localStorage.setItem("user", stringifiedUser)
                    functions.showApiResponseMessage(status);
                } else {
                    functions.showApiResponseMessage(status);
                }
            });
    }
    console.log(draftToHtml(convertToRaw(editorState.getCurrentContent())))
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
                {!statusActive ? (
                    <div class="row column1">
                        <div class="col-md-12">
                            <div class="white_shd full margin_bottom_30">
                                <div class="full graph_head">

                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div className="heading1 margin_0">
                                            <h5>{lang["profile user"]}</h5>
                                        </div>
                                        {user.role !== "uad" ? (
                                            <i className="fa fa-edit size-24 icon-edit pointer" onClick={() => hanldDataUpdate()} data-toggle="modal" data-target="#editMember"></i>
                                        ) : null}
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


                                                            <div class="form-group col-lg-12">
                                                                <label class="font-weight-bold text-small" for="projectdetail">{lang["address"]}<span class="red_star ml-1">*</span></label>
                                                                <textarea maxlength="500" rows="5" type="text" class="form-control" value={editUser.address} onChange={
                                                                    (e) => { setEditUser({ ...editUser, address: e.target.value }) }
                                                                } placeholder={lang["p.address"]} />
                                                                {errorMessagesedit.address && <span class="error-message">{errorMessagesedit.address}</span>}
                                                            </div>
                                                            <div class="form-group col-lg-12">
                                                                <label class="font-weight-bold text-small" for="projectdetail">{lang["note"]}</label>

                                                                <div class="col-lg-12"
                                                                    style={{ border: "1px solid black", minHeight: "6em", cursor: "text" }} >
                                                                        
                                                                    <Editor
                                                                        editorState={editorState}
                                                                        toolbarClassName="toolbarClassName"
                                                                        wrapperClassName="wrapperClassName"
                                                                        editorClassName="editorClassName"
                                                                        onEditorStateChange={onEditorStateChange}
                                                                        handleBeforeInput={handleBeforeInput}
                                                                        handleKeyCommand={handleKeyCommand}
                                                                        toolbar={{
                                                                            options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'image', 'remove', 'history'],
                                                                            inline: {
                                                                                options: ['bold', 'italic', 'underline'],
                                                                            },
                                                                            list: {
                                                                                options: ['unordered', 'ordered'],
                                                                            },
                                                                            textAlign: {
                                                                                options: ['left', 'center', 'right', 'justify'],
                                                                            },
                                                                            link: {
                                                                                options: ['link', 'unlink'],
                                                                            },
                                                                            image: {
                                                                                uploadCallback: uploadImageCallBack,
                                                                                alt: { present: true, mandatory: false },
                                                                                previewImage: true,
                                                                            },
                                                                            history: {
                                                                                options: ['undo', 'redo'],
                                                                            },
                                                                            fontFamily: {
                                                                                options: ['Arial', 'Georgia', 'UTM Avo', 'Tahoma', 'Times New Roman', 'Verdana'],

                                                                            },
                                                                        }}

                                                                    />
                                                                </div>
                                                                <div class="col-md-12">
                                                                    <textarea maxlength="500" rows="5" type="text" class="form-control" value={editUser.note} onChange={
                                                                        (e) => { setEditUser({ ...editUser, note: e.target.value }) }
                                                                    } placeholder={lang["p.note"]} />
                                                                </div>

                                                                {/* <textarea
                                                                    disabled
                                                                    value={draftToHtml(convertToRaw(editorState.getCurrentContent()))}
                                                                ></textarea> */}
                                                                {/* <textarea maxlength="500" rows="5" type="text" class="form-control" value={draftToHtml(convertToRaw(editorState.getCurrentContent()))} onChange={
                                                                    (e) => { setEditUser({ ...editUser, note: draftToHtml(convertToRaw(editorState.getCurrentContent())) }) }
                                                                } placeholder={lang["p.note"]} /> */}

                                                            </div>

                                                        </div>
                                                    </form>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" onClick={submitUpdate} class="btn btn-success">{lang["btn.update"]}</button>
                                                    <button type="button" data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>

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
                                                        width="80"
                                                        className="rounded-circle pointer"
                                                        src={profile.avatar && profile.avatar.length < 255 ? (proxy() + profile.avatar) : profile.avatar}
                                                        alt="#"
                                                        title={lang["select file"]}
                                                    />
                                                    <input type="file"
                                                        accept='image/*'
                                                        ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />
                                                </div>
                                                <div class="profile_contant">
                                                    <div class="contact_inner">
                                                        <h3>{profile.fullname || "Administrator"}</h3>
                                                        <ul class="list-unstyled">
                                                            <li class="mt-2">{lang["username"]}: {profile.username}</li>
                                                            <li class="mt-2">{lang["permission"]}: {profile.role === "ad" ? lang["administrator"] :
                                                                profile.role === "pm" ? lang["uprojectmanager"] :
                                                                    profile.role === "pd" ? lang["normal"] :
                                                                        profile.role}</li>
                                                            <li class="mt-2"><i class="fa fa-envelope-o"></i> : {profile.email || "nhan.to@mylangroup.com"}</li>
                                                            <li class="mt-2"> <i class="fa fa-phone"></i> : {profile.phone || "0359695554"}</li>
                                                            <li class="mt-2">{lang["address"]}: {profile.address || "Phong Thạnh, Cầu Kè, Trà Vinh"}</li>
                                                            <li class="mt-2">{lang["note"]}:
                                                                {<span dangerouslySetInnerHTML={{ __html: profile.note }} /> || lang["note"]}</li>

                                                        </ul>
                                                    </div>
                                                    {/* <div class="user_progress_bar">
                                                    <div class="progress_bar">
                                                        <span class="skill" style={{ width: 500 }}>Web Applications <span class="info_valume">85%</span></span>
                                                        <div class="progress skill-bar ">
                                                            <div class="progress-bar progress-bar-animated progress-bar-striped" role="progressbar" aria-valuenow="85" aria-valuemin="0" aria-valuemax="100" style={{ width: 500 }}>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div> */}
                                                </div>
                                            </div>

                                        </div>







                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    // <div class="row column1">
                    //     <div className="container justify-content-center">
                    //         <div class="col-md-12 col-lg-12">
                    //             <div class="full_profile white_shd">
                    //                 <div class="info_people">


                    //                     <div class="profile_contant">
                    //                         <div class="contact_inner">
                    //                             <h3>{user.role === "pd" ? "Normal" : "Administrator"}</h3>
                    //                             <ul class="list-unstyled">
                    //                                 <li class="mt-2 inline">{lang["fullname"]}:  {user.fullname}</li>
                    //                                 <li class="mt-2 inline">{lang["username"]}:  {user.username}</li>
                    //                                 <li class="mt-2"><i class="fa fa-envelope-o"></i> : {user.email || lang["no info"]}</li>
                    //                                 <li class="mt-2"> <i class="fa fa-phone"></i> : {user.phone || lang["no info"]}</li>



                    //                             </ul>
                    //                         </div>

                    //                     </div>
                    //                 </div>
                    //             </div>
                    //         </div>
                    //     </div>
                    // </div>
                ) : null}
            </div>
        </div>





    )
}