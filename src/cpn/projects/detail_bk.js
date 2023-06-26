
import { useParams } from "react-router-dom";
import Header from "../common/header"
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Swal from 'sweetalert2';
export default () => {
    const { lang, proxy, auth } = useSelector(state => state);
    const _token = localStorage.getItem("_token");
    const [errorMessagesedit, setErrorMessagesedit] = useState({});
    const [showAdminPopup, setShowAdminPopup] = useState(false);
    const [showImplementationPopup, setShowImplementationPopup] = useState(false);
    const [showMonitorPopup, setShowMonitorPopup] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [manager, setManager] = useState("")
    const sortOptions = [
        { id: 0, label: "Mới nhất", value: "latest" },
        { id: 1, label: "Cũ nhất", value: "oldest" },
    ]
    const status = [
        { id: 0, label: lang["initialization"], value: 1, color: "#1ed085" },
        { id: 1, label: lang["implement"], value: 2, color: "#8884d8" },
        { id: 2, label: lang["deploy"], value: 3, color: "#ffc658" },
        { id: 3, label: lang["complete"], value: 4, color: "#ff8042" },
        { id: 4, label: lang["pause"], value: 5, color: "#FF0000" }
    ]

    const handleOpenAdminPopup = () => {
        setShowAdminPopup(true);
        setShowImplementationPopup(false);
        setShowMonitorPopup(false);
        setTempSelectedUsers([...selectedUsers]);
    };
    const handleOpenImplementationPopup = () => {
        setShowAdminPopup(false);
        setShowImplementationPopup(true);
        setShowMonitorPopup(false);
        setTempSelectedImple([...selectedImple]);

    };
    const handleOpenMonitorPopup = () => {
        setShowAdminPopup(false);
        setShowImplementationPopup(false);
        setShowMonitorPopup(true);
        setTempSelectedMonitor([...selectedMonitor]);
    };
    const handleClosePopup = () => {
        setShowAdminPopup(false);
        setShowImplementationPopup(false);
        setShowMonitorPopup(false);

    };

    const [selectedUsers, setSelectedUsers] = useState([]); // admin
    const [selectedImple, setSelectedImple] = useState([]);
    const [selectedMonitor, setSelectedMonitor] = useState([]);
    const [tempSelectedUsers, setTempSelectedUsers] = useState([]);
    const [tempSelectedImple, setTempSelectedImple] = useState([]);
    const [tempSelectedMonitor, setTempSelectedMonitor] = useState([]);

    const handleAdminCheck = (user, role) => {
        const userWithRole = { username: user.username, role };
        setTempSelectedUsers(prevTempSelectedUsers => {
            if (prevTempSelectedUsers.some(u => u.username === user.username)) {
                return prevTempSelectedUsers.filter(u => u.username !== user.username);
            } else {
                return [...prevTempSelectedUsers, userWithRole];
            }
        });
    };

    const handleImpleCheck = (user, role) => {
        const userWithRole = { username: user.username, role };
        setTempSelectedImple(prevTempSelectedUsers => {
            if (prevTempSelectedUsers.some(u => u.username === user.username)) {
                return prevTempSelectedUsers.filter(u => u.username !== user.username);
            } else {
                return [...prevTempSelectedUsers, userWithRole];
            }
        });
    };

    const handleMonitorCheck = (user, role) => {
        const userWithRole = { username: user.username, role };
        setTempSelectedMonitor(prevTempSelectedUsers => {
            if (prevTempSelectedUsers.some(u => u.username === user.username)) {
                return prevTempSelectedUsers.filter(u => u.username !== user.username);
            } else {
                return [...prevTempSelectedUsers, userWithRole];
            }
        });
    };
    const combinedArray = selectedUsers.concat(selectedUsers, selectedImple, selectedMonitor);
    const uniqueArray = Array.from(new Set(combinedArray.map(user => user.username)))
        .map(username => {
            return combinedArray.find(user => user.username === username);
        });
    // console.log("a", combinedArray)
    // console.log("admin", selectedUsers)
    // console.log("imple", selectedImple)
    // console.log("monitor", selectedMonitor)

    const handleSaveUsers = () => {
        setSelectedUsers(tempSelectedUsers);
        setTempSelectedUsers([]);
        setShowAdminPopup(false);
    };

    const handleSaveImple = () => {
        setSelectedImple(tempSelectedImple);
        setTempSelectedImple([]);
        setShowImplementationPopup(false);
    };

    const handleSaveMonitor = () => {
        setSelectedMonitor(tempSelectedMonitor);
        setTempSelectedMonitor([]);
        setShowMonitorPopup(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const { project_id } = useParams()
    const [projectdetail, setProjectDetail] = useState([]); //// Detail project
    const [project, setProject] = useState({}); //// Update project
    const [projectmember, setProjectMember] = useState([]);
    const [versions, setProjectVersion] = useState([]);
    const [users, setUsers] = useState([]);
    const [projectmanager, setProjectManager] = useState({});
    useEffect(() => {

        fetch(`${proxy}/projects/project/${project_id}`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;

                if (success) {
                    if (data) {
                        setProjectDetail(data);
                        setProject(data);
                        setProjectVersion(data.versions)
                        setProjectMember(data.members)
                        setProjectManager(data.manager)
                        setManager(data.manager.username)
                    }
                } else {
                    window.location = "/404-not-found"
                }
            })
    }, [])

    useEffect(() => {
        fetch(`${proxy}/auth/all/accounts`, {
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
                        setUsers(data);
                    }
                } else {
                    window.location = "/404-not-found"
                }
            })
    }, [])
    const addMember = (e) => {
        e.preventDefault();
        fetch(`${proxy}/projects/members`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify({
                project_id: project_id,
                usernames: uniqueArray,
            }),
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
                        // window.location.reload();
                        setShowModal(false);
                    });
                } else {
                    Swal.fire({
                        title: "Thất bại!",
                        text: content,
                        icon: "error",
                        showConfirmButton: false,
                        timer: 2000,
                    });
                }
            })


    };

    const submitUpdateProject = (e) => {
        e.preventDefault();
        const { project_name, project_status } = project;
        const errors = {};
        if (!project_name) {
            errors.project_name = lang["error.project_name"];
        }
        if (!project_status) {
            errors.project_status = lang["error.project_status"];
        }
        if (Object.keys(errors).length > 0) {
            setErrorMessagesedit(errors);
            return;
        }
        fetch(`${proxy}/projects/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify({ project: { ...project, project_status: parseInt(project.project_status) } }),
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
    };
    const submitUpdateManager = async (e) => {
        e.preventDefault();
        const requestBody = {
            project_id: project.project_id,
            username: projectmanager.username,
        };

        const checkUser = projectdetail.members.find(member => member.username === requestBody.username);

        if (checkUser) {
            const result = await Swal.fire({
                title: 'Xác nhận thay đổi',
                text: 'Bạn có muốn chuyển người dùng này từ thành viên sang quản lý dự án?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Thay đổi',
                cancelButtonText: 'Hủy',
                confirmButtonColor: 'rgb(209, 72, 81)',
            });

            if (!result.isConfirmed) {
                return;
            }
        }

        const response = await fetch(`${proxy}/projects/project/manager`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(requestBody),
        });

        const { success, content, data, status } = await response.json();


        if (success) {
            await Swal.fire({
                title: "Thành công!",
                text: content,
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
            });
            window.location.reload();
        } else {
            await Swal.fire({
                title: "Thất bại!",
                text: content,
                icon: "error",
                showConfirmButton: false,
                timer: 2000,
            });
        }
    };
    useEffect(() => {
        let pm = projectmember.filter(member => member.permission === 'pm');
        let pd = projectmember.filter(member => member.permission === 'pd');
        let ps = projectmember.filter(member => member.permission === 'ps');
        setSelectedUsers(pm);
        setSelectedImple(pd);
        setSelectedMonitor(ps);
    }, [projectmember]);

    // Sort 
    let projectManagerMembers = projectdetail.members ? projectdetail.members.filter(member => member.permission === 'pm') : [];
    let projectImpli = projectdetail.members ? projectdetail.members.filter(member => member.permission === 'pd') : [];
    let projectMonitorMembers = projectdetail.members ? projectdetail.members.filter(member => member.permission === 'ps') : [];
    let sortedMembers = [...projectManagerMembers, ...projectImpli, ...projectMonitorMembers];
    console.log(sortedMembers)
    const handleDeleteUser = (member) => {
        const requestBody = {

            project_id: project.project_id,
            username: member.username

        };
        console.log(requestBody)
        Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc chắn muốn xóa thành viên này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            confirmButtonColor: 'rgb(209, 72, 81)',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${proxy}/projects/remove/project/member`, {
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
                        console.log(resp)
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
    }
    const [uniqueUsers, setUniqueUsers] = useState([]);
    useEffect(() => {
        let combined = [...users, ...projectmember];
        const duplicateUsers = users.filter(user =>
            projectmember.some(projectUser => projectUser.username === user.username)
        );
        setUniqueUsers(duplicateUsers);
    }, [users, projectmember]);
    // Page 

    return (
        <div className="container-fluid">
            <div class="midde_cont">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title d-flex align-items-center">
                            <h4>{lang["project_detail.title"]}</h4>
                        </div>
                    </div>
                </div>
                {/* <div class="row column1">
                    <div class="white_shd full margin_bottom_30">
                        <div class="full graph_head">
                            <div class="heading1 margin_0">
                                <h2>Tab Bar Style 2</h2>
                            </div>
                        </div>
                        <div class="full inner_elements">
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="tab_style2">
                                        <div class="tabbar padding_infor_info">
                                            <nav>
                                                <div class="nav nav-tabs" id="nav-tab1" role="tablist">
                                                    <a class="nav-item nav-link active" id="nav-home-tab2" data-toggle="tab" href="#nav-home_s2" role="tab" aria-controls="nav-home_s2" aria-selected="true">Home</a>
                                                    <a class="nav-item nav-link" id="nav-profile-tab2" data-toggle="tab" href="#nav-profile_s2" role="tab" aria-controls="nav-profile_s2" aria-selected="false">Profile</a>
                                                    <a class="nav-item nav-link" id="nav-contact-tab2" data-toggle="tab" href="#nav-contact_s2" role="tab" aria-controls="nav-contacts_s2" aria-selected="false">Contact</a>
                                                </div>
                                            </nav>
                                            <div class="tab-content" id="nav-tabContent_2">
                                                <div class="tab-pane fade show active" id="nav-home_s2" role="tabpanel" aria-labelledby="nav-home-tab">
                                                    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et
                                                        quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
                                                        qui ratione voluptatem sequi nesciunt.
                                                    </p>
                                                </div>
                                                <div class="tab-pane fade" id="nav-profile_s2" role="tabpanel" aria-labelledby="nav-profile-tab">
                                                    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et
                                                        quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
                                                        qui ratione voluptatem sequi nesciunt.
                                                    </p>
                                                </div>
                                                <div class="tab-pane fade" id="nav-contact_s2" role="tabpanel" aria-labelledby="nav-contact-tab">
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
                        </div>
                    </div>
                </div> */}
                <div class="row column1">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full price_table padding_infor_info">
                                <div class="row">
                                    <div class="col-lg-12">
                                        <div class="row column4 graph">
                                            {/* Proejct */}
                                            {/* Detail */}
                                            <div class="col-md-6">
                                                <div class="dash_blog">
                                                    <div class="dash_blog_inner">
                                                        <div class="dash_head">
                                                            <h3>
                                                                <h5>{projectdetail.project_name}</h5>
                                                                <span class="plus_green_bt">
                                                                    <p><i class="fa fa-edit size pointer" data-toggle="modal" data-target="#editProject"></i></p>
                                                                </span>
                                                            </h3>
                                                        </div>
                                                        <div class="msg_list_main">
                                                            <div class="row">
                                                                <div class="col-md-12">
                                                                    <div class="full">
                                                                        <div class="padding_infor_info">
                                                                            <p class="font-weight-bold">{lang["projectcode"]}: {projectdetail.project_code}</p>
                                                                            <span className="status-label" style={{
                                                                                backgroundColor: (status.find((s) => s.value === projectdetail.project_status) || {}).color
                                                                            }}>
                                                                                {(status.find((s) => s.value === projectdetail.project_status) || {}).label || 'Trạng thái không xác định'}
                                                                            </span>
                                                                            <p class="font-weight-bold">{lang["projectmanager"]}: {projectdetail.manager?.fullname}</p>
                                                                            <p>{lang["createby"]}: {projectdetail.create_by?.fullname} </p>
                                                                            <p>
                                                                                {lang["time"]}: {
                                                                                    lang["time"] === "Time" && projectdetail.create_at ?
                                                                                        projectdetail.create_at.replace("lúc", "at") :
                                                                                        projectdetail.create_at
                                                                                }
                                                                            </p>
                                                                            <p>{lang["description"]}: {projectdetail.project_description}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Update Project */}
                                            <div class={`modal show`} id="editProject">
                                                <div class="modal-dialog modal-dialog-center">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h4 class="modal-title">{lang["updateproject"]}</h4>
                                                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                                                        </div>
                                                        <div class="modal-body">
                                                            <form>
                                                                <div class="row">
                                                                    <div class="form-group col-lg-12">
                                                                        <label>{lang["projectname"]} <span className='red_star'>*</span></label>
                                                                        <input type="text" class="form-control" value={project.project_name} onChange={
                                                                            (e) => { setProject({ ...project, project_name: e.target.value }) }
                                                                        } placeholder={lang["p.projectname"]} />
                                                                        {errorMessagesedit.project_name && <span class="error-message">{errorMessagesedit.project_name}</span>}
                                                                    </div>
                                                                    <div class="form-group col-lg-6">
                                                                        <label>{lang["projectcode"]} </label>
                                                                        <input type="text" class="form-control" value={project.project_code} onChange={
                                                                            (e) => { setProject({ ...project, project_code: e.target.value }) }
                                                                        } placeholder={lang["p.projectcode"]} />
                                                                    </div>
                                                                    <div class="form-group col-lg-6 ">
                                                                        <label>{lang["projectstatus"]} <span className='red_star'>*</span></label>
                                                                        <select className="form-control" value={project.project_status} onChange={(e) => { setProject({ ...project, project_status: e.target.value }) }}>
                                                                            {status.map((status, index) => {
                                                                                return (
                                                                                    <option key={index} value={status.value}>{status.label}</option>
                                                                                );
                                                                            })}
                                                                        </select>
                                                                        {errorMessagesedit.project_status && <span class="error-message">{errorMessagesedit.project_status}</span>}
                                                                    </div>
                                                                    <div class="form-group col-lg-12 ">
                                                                        <label>{lang["projectdescripton"]} </label>
                                                                        <textarea rows="5" type="text" class="form-control" value={project.project_description} onChange={
                                                                            (e) => { setProject({ ...project, project_description: e.target.value }) }
                                                                        } placeholder={lang["p.projectdescripton"]} />
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        </div>
                                                        <div class="modal-footer">
                                                            <button type="button" onClick={submitUpdateProject} class="btn btn-success ">{lang["btn.update"]}</button>
                                                            <button type="button" data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Manager */}
                                            <div class="col-md-6">
                                                <div class="dash_blog">
                                                    <div class="dash_blog_inner">
                                                        <div class="dash_head">
                                                            <h3>
                                                                <h5>{lang["projectmanager"]}</h5>
                                                                <span class="plus_green_bt">
                                                                    <p><i class="fa fa-edit size pointer" data-toggle="modal" data-target="#editManager"></i></p>
                                                                </span>
                                                            </h3>
                                                        </div>
                                                        <div class="msg_list_main">
                                                            <div class="row">
                                                                <div class="col-md-12">
                                                                    <div class="full">
                                                                        <div class="padding_infor_info">
                                                                            <div class="contact_inner">
                                                                                <div class="left-cus">
                                                                                    <p class="font-weight-bold"> {projectdetail.manager?.fullname}</p>
                                                                                    <p><i class="fa fa-envelope-o"></i> {projectdetail.manager?.email}</p>
                                                                                    <p><i class="fa fa-phone"></i> {projectdetail.manager?.phone}</p>
                                                                                    <p>{lang["address"]}:{projectdetail.manager?.address}</p>
                                                                                    <p>{lang["description"]}: {projectdetail.manager?.note}</p>
                                                                                </div>
                                                                                <div class="right">
                                                                                    <div class="profile_contacts">
                                                                                        <img class="img-responsive" width={100} src={proxy + projectmanager.avatar} alt="#" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Update Manager */}
                                            <div class={`modal show`} id="editManager">
                                                <div class="modal-dialog modal-dialog-center">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h4 class="modal-title">{lang["editmanager"]}</h4>
                                                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                                                        </div>
                                                        <div class="modal-body">
                                                            <form>
                                                                <div class="row">
                                                                    <div class="form-group col-lg-12">
                                                                        <label htmlFor="sel1">{lang["projectrole"]} <span className="red_star">*</span></label>
                                                                        <select className="form-control" value={projectmanager.username} onChange={(e) => { setProjectManager({ ...projectmanager, username: e.target.value }) }}>
                                                                            {users && users.map((user, index) => {
                                                                                if (user.role === "pm") {
                                                                                    return (
                                                                                        <option key={index} value={user.username}>{user.fullname}</option>
                                                                                    );
                                                                                } else {
                                                                                    return null;
                                                                                }
                                                                            })}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        </div>
                                                        <div class="modal-footer">
                                                            <button type="button" onClick={submitUpdateManager} class="btn btn-success ">{lang["btn.update"]}</button>
                                                            <button type="button" data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Version */}
                                            <div class="col-md-6">
                                                <div class="dash_blog">
                                                    <div class="dash_blog_inner">
                                                        <div class="dash_head">
                                                            <h3>
                                                                <h5>{lang["version"]}</h5>
                                                                <span class="plus_green_bt">
                                                                    <p><i class="fa fa-edit size pointer" data-toggle="modal" data-target="#editVersion"></i></p>
                                                                </span>
                                                            </h3>
                                                        </div>
                                                        <div class="msg_list_main">
                                                            <div class="row">
                                                                <div class="col-md-12">
                                                                    <div class="full">
                                                                        <div class="table_section padding_infor_info">
                                                                            <div class="table-responsive-sm">
                                                                                <table class="table table-hover">
                                                                                    <thead>
                                                                                        {versions.map(version => (
                                                                                            <tr>
                                                                                                <th>{version.version_name}</th>
                                                                                                <th>{version.version_description}</th>
                                                                                                <th class="text-right"><i class="fa fa-gears"></i></th>
                                                                                            </tr>
                                                                                        ))}

                                                                                    </thead>

                                                                                </table>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>


                                            {/* Update Version */}
                                            {/* <div class={`modal show`} id="editVersion">
                                                <div class="modal-dialog modal-dialog-center">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h4 class="modal-title">{lang["versionupdate"]}</h4>
                                                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                                                        </div>
                                                        <div class="modal-body">
                                                            <form>
                                                                <div class="row">
                                                                    <div class="form-group col-lg-12">
                                                                        <label>{lang["versionname"]} <span className='red_star'>*</span></label>
                                                                        <input type="text" class="form-control" value={versions[0]?.version_name} onChange={
                                                                            (e) => { setProjectVersion({ ...versions[0], version_name: e.target.value }) }
                                                                        } placeholder={lang["p.versionname"]} />
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        </div>
                                                        <div class="modal-footer">
                                                            <button type="button" onClick={submitUpdateManager} class="btn btn-success ">{lang["btn.update"]}</button>
                                                            <button type="button" data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div> */}
                                            {/* Member */}
                                            <div class="col-md-6">
                                                <div class="dash_blog">
                                                    <div class="dash_blog_inner">
                                                        <div class="dash_head">
                                                            <h3>
                                                                <h5>{lang["members"]}</h5>
                                                                <span class="plus_green_bt">
                                                                    <p><i class="fa fa-edit size pointer" data-toggle="modal" data-target="#editMember"></i></p>
                                                                </span>
                                                            </h3>
                                                        </div>
                                                        {/* <div class="list_cont">
                                                                <div class="row">
                                                                    <div class="col-md-10">
                                                                        1
                                                                    </div>
                                                                    <div class="col-md-2">
                                                                        1
                                                                    </div>
                                                                </div>
                                                            </div> */}
                                                        <div class="msg_list_main">
                                                            <ul class="msg_list">
                                                                {
                                                                    sortedMembers && sortedMembers.length > 0 ? (
                                                                        sortedMembers.map(member => (
                                                                            <div key={member.username}>
                                                                                <li>
                                                                                    <span><img src={proxy + member.avatar} class="img-responsive img_custom" alt="#" /></span>
                                                                                    <span>
                                                                                        <span class="name_user">{member.fullname}</span>
                                                                                        <span class="msg-user">
                                                                                            {
                                                                                                member.permission === "pm" ? lang["projectmanager"] :
                                                                                                    member.permission === "pd" ? lang["implementation"] :
                                                                                                        member.permission === "ps" ? lang["monitor"] :
                                                                                                            "Khác"
                                                                                            }
                                                                                        </span>
                                                                                        
                                                                                    </span>
                                                                                    <span class="close-button">
                                                                                            
                                                                                            <img class="abc" width={20} src="/images/icon/cross-color.png" onClick={() => handleDeleteUser(member)} ></img>
                                                                                        </span>
                                                                                </li>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div class="list_cont ">
                                                                            <p>Chưa có thành viên</p>
                                                                        </div>
                                                                    )
                                                                }
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Update member */}
                                            <div class={`modal show`} id="editMember">
                                                <div class="modal-dialog modal-dialog-center">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h4 class="modal-title">Cập nhật thành viên dự án</h4>
                                                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                                                        </div>
                                                        <div class="modal-body">
                                                            <form>
                                                                <div class="row">
                                                                    <div className="form-group col-lg-12">
                                                                        <label>Thành viên dự án</label>
                                                                        <div class="options-container">
                                                                            <div class="option">
                                                                                <h5>Phụ trách</h5>
                                                                                {

                                                                                    selectedUsers.map(user => {
                                                                                        if (user.username === manager) {
                                                                                            return null;
                                                                                        }
                                                                                        const userData = users.find(u => u.username === user.username);
                                                                                        return (
                                                                                            <div key={user.username}>
                                                                                                <p>{userData ? userData.fullname : 'User not found'}</p>
                                                                                            </div>
                                                                                        )
                                                                                    })
                                                                                }
                                                                                <button type="button" class="btn btn-primary custom-buttonadd" onClick={handleOpenAdminPopup} >
                                                                                    <i class="fa fa-plus"></i>
                                                                                </button>
                                                                            </div>
                                                                            <div class="option">
                                                                                <h5>Triển Khai</h5>
                                                                                {
                                                                                    selectedImple.map(user => {
                                                                                        const userData = users.find(u => u.username === user.username);
                                                                                        return (
                                                                                            <div key={user.username}>
                                                                                                <p>{userData ? userData.fullname : 'User not found'}</p>
                                                                                            </div>
                                                                                        )
                                                                                    })
                                                                                }
                                                                                <button type="button" class="btn btn-primary custom-buttonadd" onClick={handleOpenImplementationPopup} >
                                                                                    <i class="fa fa-plus"></i>
                                                                                </button>
                                                                            </div>
                                                                            <div class="option">
                                                                                <h5>Theo Dõi</h5>
                                                                                {
                                                                                    selectedMonitor.map(user => {
                                                                                        const userData = users.find(u => u.username === user.username);
                                                                                        return (
                                                                                            <div key={user.username}>
                                                                                                <p>{userData ? userData.fullname : 'User not found'}</p>
                                                                                            </div>
                                                                                        )
                                                                                    })
                                                                                }
                                                                                <button type="button" class="btn btn-primary custom-buttonadd" onClick={handleOpenMonitorPopup} >
                                                                                    <i class="fa fa-plus"></i>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {showAdminPopup && (
                                                                        <div class="user-popup4">
                                                                            <div class="user-popup-content">
                                                                                {users && users.map(user => {
                                                                                    if (user.username !== manager && !selectedImple.some(u => u.username === user.username) && !selectedMonitor.some(u => u.username === user.username)) {
                                                                                        return (
                                                                                            <div key={user.username} class="user-item">
                                                                                                <input
                                                                                                    class="user-checkbox"
                                                                                                    type="checkbox"
                                                                                                    checked={tempSelectedUsers.some(u => u.username === user.username)}
                                                                                                    onChange={() => handleAdminCheck(user, 'pm')}
                                                                                                />
                                                                                                <span class="user-name" onClick={() => handleAdminCheck(user, 'pm')}>
                                                                                                    <img width={20} class="img-responsive circle-image-list" src={proxy + user.avatar} alt="#" />  {user.username}-{user.fullname}
                                                                                                </span>
                                                                                            </div>
                                                                                        )
                                                                                    }
                                                                                    return null;
                                                                                })}
                                                                            </div>
                                                                            <div className="user-popup-actions">
                                                                                <button class="btn btn-success" onClick={handleSaveUsers}>Lưu</button>
                                                                                <button class="btn btn-danger" onClick={handleClosePopup}>Đóng</button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {showImplementationPopup && (
                                                                        <div class="user-popup2">
                                                                            <div class="user-popup-content">
                                                                                {users && users.map(user => {
                                                                                    if (user.username !== manager && !selectedUsers.some(u => u.username === user.username) && !selectedMonitor.some(u => u.username === user.username)) {
                                                                                        return (
                                                                                            <div key={user.username} class="user-item">
                                                                                                <input
                                                                                                    class="user-checkbox"
                                                                                                    type="checkbox"
                                                                                                    checked={tempSelectedImple.some(u => u.username === user.username)}
                                                                                                    onChange={() => handleImpleCheck(user, 'pd')}
                                                                                                />
                                                                                                <span class="user-name" onClick={() => handleAdminCheck(user, 'pd')}>
                                                                                                    <img width={20} class="img-responsive circle-image-list" src={proxy + user.avatar} alt="#" />  {user.username}-{user.fullname}
                                                                                                </span>
                                                                                            </div>
                                                                                        )
                                                                                    }
                                                                                    return null;
                                                                                })}
                                                                            </div>
                                                                            <div className="user-popup-actions">
                                                                                <button class="btn btn-success" onClick={handleSaveImple}>Lưu</button>
                                                                                <button class="btn btn-danger" onClick={handleClosePopup}>Đóng</button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {showMonitorPopup && (
                                                                        <div class="user-popup3">
                                                                            <div class="user-popup-content">
                                                                                {users && users.map(user => {
                                                                                    if (user.username !== manager && !selectedUsers.some(u => u.username === user.username) && !selectedImple.some(u => u.username === user.username)) {
                                                                                        return (
                                                                                            <div key={user.username} class="user-item">
                                                                                                <input
                                                                                                    class="user-checkbox"
                                                                                                    type="checkbox"
                                                                                                    checked={tempSelectedMonitor.some(u => u.username === user.username)}
                                                                                                    onChange={() => handleMonitorCheck(user, 'ps')}
                                                                                                />
                                                                                                <span class="user-name" onClick={() => handleAdminCheck(user, 'ps')}>
                                                                                                    <img width={20} class="img-responsive circle-image-list" src={proxy + user.avatar} alt="#" />  {user.username}-{user.fullname}
                                                                                                </span>
                                                                                            </div>
                                                                                        )
                                                                                    }
                                                                                    return null;
                                                                                })}
                                                                            </div>
                                                                            <div className="user-popup-actions">
                                                                                <button class="btn btn-success" onClick={handleSaveMonitor}>Lưu</button>
                                                                                <button class="btn btn-danger" onClick={handleClosePopup}>Đóng</button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </form>
                                                        </div>
                                                        <div class="modal-footer">
                                                            <button type="button" onClick={addMember} class="btn btn-success ">Lưu lại</button>
                                                            <button type="button" data-dismiss="modal" class="btn btn-danger">Đóng</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >


    )
}

