
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
    console.log("a", combinedArray)


    console.log("admin", selectedUsers)
    console.log("imple", selectedImple)
    console.log("monitor", selectedMonitor)

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
                        setManager(data.manager.username)
                    }
                } else {
                    window.location = "/404-not-found"
                }
            })
    }, [])
    console.log(users)
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

    const submitUpdate = (e) => {
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
            body: JSON.stringify({ project }),
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
    console.log("all user", users)
    console.log("project user", projectmember)
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
                            <h4>{lang["task"]}</h4>
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
                                            <div class="row column4 graph">
                                                {/* Proejct */}
                                                {/* Detail */}
                                                <div class="col-md-12">
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
                                                                    <div class="col-md-6">
                                                                        <div class="full">
                                                                            <div class="padding_infor_info">
                                                                                <p class="font-weight-bold">{lang["projectcode"]}: {projectdetail.project_code}</p>
                                                                                <span className="status-label" style={{
                                                                                    backgroundColor: (status.find((s) => s.value === projectdetail.project_status) || {}).color
                                                                                }}>
                                                                                    {(status.find((s) => s.value === projectdetail.project_status) || {}).label || 'Trạng thái không xác định'}
                                                                                </span>
                                                                                <p class="font-weight-bold">{lang["projectmanager"]}: {projectdetail.manager?.fullname}</p>

                                                                                <p>
                                                                                    {lang["time"]}: {
                                                                                        lang["time"] === "Time" && projectdetail.create_at ?
                                                                                            projectdetail.create_at.replace("lúc", "at") :
                                                                                            projectdetail.create_at
                                                                                    }
                                                                                    {lang["by"]}
                                                                                    {projectdetail.create_by?.fullname} </p>
                                                                                <p>{lang["description"]}: {projectdetail.project_description}</p>
                                                                            </div>
                                                                        </div>


                                                                    </div>
                                                                    <div class="col-md-6">
                                                                        <div class="full">
                                                                            <div class="padding_infor_info">
                                                                                <div class="row column1">
                                                                                    <div class="col-md-6">
                                                                                        <div class="full counter_section margin_bottom_30">
                                                                                            <div class="couter_icon">
                                                                                                <div>
                                                                                                    <i class="fa fa-briefcase purple_color2"></i>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="counter_no">
                                                                                                <div>
                                                                                                    <p class="total_no">1</p>
                                                                                                    <p class="head_couter">{lang["projects"]}</p>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-md-6">
                                                                                        <div class="full counter_section margin_bottom_30">
                                                                                            <div class="couter_icon">
                                                                                                <div>
                                                                                                    <i class="fa fa-briefcase purple_color2"></i>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="counter_no">
                                                                                                <div>
                                                                                                    <p class="total_no">1</p>
                                                                                                    <p class="head_couter">{lang["projects"]}</p>
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
                                                            <div class="read_more">
                                                                {/* <div class="center"><a class="main_bt read_bt" href="#">Read More</a></div> */}
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
                </div>
            </div >
        </div >
    )
}

