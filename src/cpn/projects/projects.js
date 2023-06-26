import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import responseMessages from "../enum/response-code";
import Swal from 'sweetalert2';
import { Header } from '../common';
export default () => {
    const { lang, proxy, auth } = useSelector(state => state);
    const dispatch = useDispatch()
    const [showAdminPopup, setShowAdminPopup] = useState(false);
    const [showImplementationPopup, setShowImplementationPopup] = useState(false);
    const [showMonitorPopup, setShowMonitorPopup] = useState(false);
    const [manager, setManager] = useState("")
    const [selectedProject, setSelectedProject] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);
    const showApiResponseMessage = (status) => {
        const message = responseMessages[status];

        const title = message?.type || "Unknown error";
        const description = message?.description || "Unknown error";
        const icon = message?.type === "Informations" ? "success" : "error";
        Swal.fire({
            title,
            text: description,
            icon,
            showConfirmButton: false,
            timer: 1500,
        }).then(() => {
            if (icon === "success") {
                window.location.reload();
                setShowModal(false);
            }
        });
    };

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
    console.log("a", combinedArray)
    console.log("b", uniqueArray)


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


    const [showModal, setShowModal] = useState(false);
    const _token = localStorage.getItem("_token");
    // const stringifiedUser = localStorage.getItem("user");
    // const users = JSON.parse(stringifiedUser)
    const [project, setProject] = useState({});
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetch(`${proxy}/projects/all/projects`, {
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
                        setProjects(data);
                        dispatch({
                            branch: "default",
                            type: "setProjects",
                            payload: {
                                projects: data
                            }
                        })
                    }
                } else {
                    window.location = "/404-not-found"
                }

            })

    }, [])

    const [users, setUsers] = useState([]);

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
                        // console.log(data)
                    }
                } else {
                    window.location = "/login"
                }
            })
    }, [])

    const submit = (e) => {
        e.preventDefault();

        const body = {
            project,
            manager: { username: manager },
        };

        const status = body.project.project_status;
        body.project.project_status = parseInt(status)

        fetch(`${proxy}/projects/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(body),
        })
            .then((res) => res.json())
            .then((resp) => {
                const { success, content, data, status } = resp;
                if (success) {


                    const projectId = data.project_id;
                    return fetch(`${proxy}/projects/members`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `${_token}`,
                        },
                        body: JSON.stringify({
                            project_id: projectId,
                            usernames: uniqueArray,
                        }),
                    });

                } else {
                    Swal.fire({
                        title: "Thất bại!",
                        text: "error.message",
                        icon: "error",
                        showConfirmButton: false,
                        timer: 2000,
                    });
                    throw new Error(content);
                }
            })
            .then(res => res && res.json())
            .then((resp) => {
                if (resp) {
                    const { success, content, data, status } = resp;
                    if (success) {
                        showApiResponseMessage(status);
                    } else {
                        showApiResponseMessage(status);
                    }
                }
            })
            .catch((error) => {
                Swal.fire({
                    title: "Thất bại!",
                    text: error.message,
                    icon: "error",
                    showConfirmButton: false,
                    timer: 2000,
                });
            });
    };
    const handleDeleteUser = (project) => {

        const requestBody = {
            project: {
                project_id: project.project_id
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
                fetch(`${proxy}/projects/delete`, {
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
    const detailProject = (project) => {
        setSelectedProject(project);
        console.log(project)
        window.location.href = `projects/detail/${project.project_id}`;
    };
    return (
        <div className="container-fluid">
            <div class="midde_cont">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title d-flex align-items-center">
                            <h4>{lang["projects.title"]}</h4>
                            {
                                ["ad"].indexOf(auth.role) != -1 ?
                                    <button type="button" class="btn btn-primary custom-buttonadd ml-auto" data-toggle="modal" data-target="#addProject">
                                        <i class="fa fa-plus"></i>
                                    </button> : null
                            }
                        </div>
                    </div>
                </div>
                {/* Modal add project */}
                <div class={`modal ${showModal ? 'show' : ''}`} id="addProject">
                    <div class="modal-dialog modal-dialog-center">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h4 class="modal-title">{lang["addproject"]}</h4>
                                <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="row">
                                        <div class="form-group col-lg-6">
                                            <label>{lang["projectname"]} <span className='red_star'>*</span></label>
                                            <input type="text" class="form-control" value={project.project_name} onChange={
                                                (e) => { setProject({ ...project, project_name: e.target.value }) }
                                            } placeholder={lang["p.projectname"]} />
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
                                                <option value="">{lang["p.projectstatus"]}</option>
                                                {status.map((status, index) => {
                                                    return (
                                                        <option key={index} value={status.value}>{status.label}</option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                        <div className="form-group col-lg-6">
                                            <label htmlFor="sel1">{lang["projectrole"]} <span className="red_star">*</span></label>
                                            <select className="form-control" value={users.username} onChange={(e) => { setManager(e.target.value) }}>
                                                <option value="">{lang["p.projectrole"]}</option>
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
                                        <div class="form-group col-lg-12">
                                            <label>{lang["projectdescripton"]}</label>
                                            <textarea maxlength="500" rows="5" type="text" class="form-control" value={project.project_description} onChange={
                                                (e) => { setProject({ ...project, project_description: e.target.value }) }
                                            } placeholder={lang["p.projectdescripton"]} />
                                        </div>
                                        <div className="form-group col-lg-12">
                                            <label>{lang["projectmember"]}</label>
                                            <div class="options-container">
                                                <div class="option">
                                                    <h5>{lang["supervisor"]}</h5>
                                                    {
                                                        selectedUsers.map(user => {
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

                                                {/* <div class="option" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <h5>{lang["supervisor"]}</h5>
                                                    <div class="div-to-scroll" style={{ overflowY: 'auto', maxHeight: '105px', minWidth: "50px", paddingRight: '15px' }}>
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
                                                    </div>
                                                    <button type="button" class="btn btn-primary custom-buttonadd" onClick={handleOpenImplementationPopup} >
                                                        <i class="fa fa-plus"></i>
                                                    </button>
                                                </div> */}

                                                <div class="option" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                    <h5>{lang["deployers"]}</h5>
                                                    <div class="div-to-scroll" style={{ overflowY: 'auto', maxHeight: '105px', minWidth: "50px", paddingRight: '15px' }}>
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
                                                    </div>
                                                    <button type="button" class="btn btn-primary custom-buttonadd" onClick={handleOpenImplementationPopup} >
                                                        <i class="fa fa-plus"></i>
                                                    </button>
                                                </div>

                                            </div>
                                        </div>
                                        {showAdminPopup && (
                                            <div class="user-popup">
                                                <div class="user-popup-content">
                                                    {users && users.map(user => {
                                                        if (user.username !== manager && !selectedImple.some(u => u.username === user.username) && !selectedMonitor.some(u => u.username === user.username)) {
                                                            return (
                                                                <div key={user.username} class="user-item">
                                                                    <input
                                                                        class="user-checkbox"
                                                                        type="checkbox"
                                                                        checked={tempSelectedUsers.some(u => u.username === user.username)}
                                                                        onChange={() => handleAdminCheck(user, 'supervisor')}
                                                                    />
                                                                    <span class="user-name" onClick={() => handleAdminCheck(user, 'supervisor')}>
                                                                        <img width={20} class="img-responsive circle-image-list" src={proxy + user.avatar} alt="#" />  {user.username}-{user.fullname}
                                                                    </span>
                                                                </div>
                                                            )
                                                        }
                                                        return null;
                                                    })}
                                                </div>
                                                <div className="user-popup-actions">
                                                    <button class="btn btn-success" onClick={handleSaveUsers}>{lang["btn.update"]}</button>
                                                    <button class="btn btn-danger" onClick={handleClosePopup}>{lang["btn.close"]}</button>
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
                                                                        onChange={() => handleImpleCheck(user, 'deployer')}
                                                                    />
                                                                    <span class="user-name" onClick={() => handleAdminCheck(user, 'deployer')}>
                                                                        <img width={20} class="img-responsive circle-image-list" src={proxy + user.avatar} alt="#" />  {user.username}-{user.fullname}
                                                                    </span>
                                                                </div>
                                                            )
                                                        }
                                                        return null;
                                                    })}
                                                </div>
                                                <div className="user-popup-actions">
                                                    <button class="btn btn-success" onClick={handleSaveImple}>{lang["btn.update"]}</button>
                                                    <button class="btn btn-danger" onClick={handleClosePopup}>{lang["btn.close"]}</button>
                                                </div>
                                            </div>
                                        )}
                                        {/* {showMonitorPopup && (
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
                                                                        onChange={() => handleMonitorCheck(user, 'deployer')}
                                                                    />
                                                                    <span class="user-name" onClick={() => handleAdminCheck(user, 'deployer')}>
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
                                        )} */}
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" onClick={submit} class="btn btn-success ">{lang["btn.create"]}</button>
                                <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row column1">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            {/* <div class="full graph_head">
                                <div class="heading1 margin_0">
                                    <h4>{lang["project list"]}</h4>
                                </div>
                            </div> */}
                            <div class="full price_table padding_infor_info">
                                <div class="row">
                                    <div class="col-lg-12">
                                        <div class="row">
                                            {projects.map((item) => (
                                                <div class="col-lg-3 col-md-6 col-sm-6 mb-4">
                                                    <div class="card project-block">
                                                        <div class="card-body">
                                                            <div class="row">
                                                                <div class="col">
                                                                    <h5 class="project-name d-flex align-items-center">{item.project_name}</h5>
                                                                </div>

                                                                <div class="col-auto cross-hide pointer scaled-hover">
                                                                    <img width={20} className="scaled-hover-target" src="/images/icon/cross-color.png" onClick={() => handleDeleteUser(item)}></img>

                                                                </div>
                                                            </div>
                                                            <p class="card-title font-weight-bold">{lang["projectcode"]}: {item.project_code}</p>
                                                            <p class="card-text">{lang["createby"]}: {item.create_by.fullname}</p>

                                                            <p>{lang["time"]}: {
                                                                lang["time"] === "Time" ?
                                                                    item.create_at.replace("lúc", "at") :
                                                                    item.create_at
                                                            }</p>
                                                            {/* <p class="card-text">{lang["description"]}: {item.project_description}</p> */}
                                                            <p class="font-weight-bold">{lang["projectmanager"]}</p>
                                                            <div class="profile_contacts">
                                                                {
                                                                    item.manager && item.manager.length > 0 ?
                                                                        <img class="img-responsive circle-image" src={proxy + item.manager.avatar} alt="#" />
                                                                        : <div class="profile_contacts">
                                                                            <p>{lang["projectempty"]} </p>
                                                                        </div>
                                                                }
                                                            </div>
                                                            <p class="font-weight-bold">{lang["projectmember"]}</p>

                                                            <div class="profile_contacts">
                                                                {
                                                                    item.members && item.members.length > 0 ?
                                                                        item.members.slice(0, 2).map(member => (
                                                                            <img
                                                                                class="img-responsive circle-image"
                                                                                src={proxy + member.avatar}
                                                                                alt={member.username}
                                                                            />
                                                                        )) : <div class="profile_contacts">
                                                                            <p>{lang["projectempty"]} </p>
                                                                        </div>
                                                                }
                                                                {/* {
                                                                    item.members.length > 2 &&
                                                                    <div className="img-responsive circle-image extra-images">
                                                                        +{item.members.length - 2}
                                                                    </div>
                                                                } */
                                                                }
                                                                {
                                                                    item.members.length > 2 &&
                                                                    <div class="border-custom">
                                                                        <div className="img-responsive circle-image-project" style={{ backgroundImage: `url(${proxy + item.members[2].avatar})` }}>
                                                                            <span> +{item.members.length - 2}</span>
                                                                        </div>
                                                                    </div>
                                                                }

                                                            </div>
                                                            <div className="d-flex position-relative">
                                                                <div>
                                                                    <span className="d-block status-label" style={{
                                                                        backgroundColor: (status.find((s) => s.value === item.project_status) || {}).color
                                                                    }}>
                                                                        {(status.find((s) => s.value === item.project_status) || {}).label || 'Trạng thái không xác định'}
                                                                    </span>

                                                                </div>
                                                                <span class="skill position-absolute" style={{ right: "0", top: "0" }}>{item.progress}%</span>
                                                            </div>
                                                            <div class="progress skill-bar mt-3">
                                                                <div class="progress-bar progress-bar-animated progress-bar-striped" role="progressbar" aria-valuenow={item.progress} aria-valuemin="0" aria-valuemax="100" style={{ width: `${item.progress}%` }}>
                                                                </div>
                                                            </div>

                                                            {/* <span class="skill" style={{ width: `${item.progress}%` }}><span class="info_valume">{item.progress}%</span></span> */}
                                                            <div class="bottom_list">
                                                                <div class="right_button">
                                                                    <button type="button" class="btn btn-primary" onClick={() => detailProject(item)}>
                                                                        <i class="fa fa-edit"></i> {lang["buttondetail"]}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
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