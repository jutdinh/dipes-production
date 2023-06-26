
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
    const [selectedMemberTask, setSelectedMemberTask] = useState([]);
    console.log(selectedMemberTask)
    // Page 

    const sortOptions = [
        { id: 0, label: "Mới nhất", value: "latest" },
        { id: 1, label: "Cũ nhất", value: "oldest" },
    ]
    // page

    const status = [
        { id: 0, label: lang["initialization"], value: 1, color: "#1ed085" },
        { id: 1, label: lang["implement"], value: 2, color: "#8884d8" },
        { id: 2, label: lang["deploy"], value: 3, color: "#ffc658" },
        { id: 3, label: lang["complete"], value: 4, color: "#ff8042" },
        { id: 4, label: lang["pause"], value: 5, color: "#FF0000" }
    ]
    const statusTask = [
        { id: 0, label: "Chờ duyệt", value: 1, color: "#1ed085" },
        { id: 1, label: "Thực hiện", value: 2, color: "#8884d8" },
        { id: 2, label: "Hoàn thành", value: 3, color: "#ffc658" },

    ]
    const statusPriority = [
        { id: 0, label: "Cao", value: 1, color: "#1ed085" },
        { id: 1, label: "Trung bình", value: 2, color: "#8884d8" },
        { id: 2, label: "Thấp", value: 3, color: "#ffc658" },

    ]

    // const handleOpenAdminPopup = () => {
    //     setShowAdminPopup(true);
    //     setShowImplementationPopup(false);
    //     setShowMonitorPopup(false);
    //     setTempSelectedUsers([...selectedUsers]);
    // };
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
                        console.log(data)
                    }
                } else {
                    window.location = "/404-not-found"
                }
            })
    }, [])
    const [tasks, setTasks] = useState([]);
    const [task, setTask] = useState({ task_status: 1 });
    const [taskDetail, setTaskDetail] = useState([]);
    useEffect(() => {
        fetch(`${proxy}/projects/project/${project_id}/tasks`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;

                if (success) {
                    if (data) {
                        setTasks(data);
                    }
                } else {
                    // window.location = "/404-not-found"
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


    const submitAddTask = (e) => {
        e.preventDefault();
        task.members = selectedMemberTask.map(user => user.username);


        fetch(`${proxy}/projects/project/${project_id}/task`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify({ task }),
        })
            .then(res => res && res.json())
            .then((resp) => {
                if (resp) {
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
                }
            })
    };
    useEffect(() => {
        let pm = projectmember.filter(member => member.permission === 'supervisor');
        let pd = projectmember.filter(member => member.permission === 'deployer');

        setSelectedUsers(pm);
        setSelectedImple(pd);

    }, [projectmember]);

    // Sort 
    let projectManagerMembers = projectdetail.members ? projectdetail.members.filter(member => member.permission === 'supervisor') : [];
    let projectImpli = projectdetail.members ? projectdetail.members.filter(member => member.permission === 'deployer') : [];

    let sortedMembers = [...projectManagerMembers, ...projectImpli];
    const [isLoading, setIsLoading] = useState(false);

    const detailTask = async (taskid) => {

        setIsLoading(true);


        const taskDetail = tasks.find(task => task.task_id === taskid.task_id);
        if (taskDetail) {
            // Nếu tìm thấy task, cập nhật state taskDetail
            setTaskDetail(taskDetail);
            setIsLoading(false);
        } else {
            // Nếu không tìm thấy task, bạn có thể hiển thị thông báo lỗi hoặc xử lý theo cách khác
            console.error(`Cannot find task with id ${taskid}`);
        }

    };
    const handleDeleteUser = (member) => {
        const requestBody = {

            project_id: project.project_id,
            username: member.username

        };

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


    //task

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 3;

    const indexOfLastMember = currentPage * rowsPerPage;
    const indexOfFirstMember = indexOfLastMember - rowsPerPage;
    const currentMembers = sortedMembers.slice(indexOfFirstMember, indexOfLastMember);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(sortedMembers.length / rowsPerPage);

    // Page member task
    const [currentPageTask, setCurrentPageTask] = useState(1);
    const rowsPerPageTask = 4;

    const indexOfLastMemberTask = currentPageTask * rowsPerPageTask;
    const indexOfFirstMemberTask = indexOfLastMemberTask - rowsPerPageTask;
    const currentMembersTask = tasks.slice(indexOfFirstMemberTask, indexOfLastMemberTask);

    const paginateTask = (pageNumber) => setCurrentPageTask(pageNumber);
    const totalPagesTask = Math.ceil(tasks.length / rowsPerPageTask);
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
                <div class="row column1">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full price_table padding_infor_info">
                                <div class="row">
                                    <div class="col-lg-12">
                                        <div class="row column4 graph">
                                            {/* Proejct */}
                                            {/* Detail */}
                                            <div class="col-md-5">
                                                <div class="dash_blog">
                                                    <div class="dash_blog_inner">
                                                        <div class="dash_head">
                                                            <h3>
                                                                <h5>Thông tin dự án</h5>
                                                                <span class="plus_green_bt">
                                                                    <p><i class="fa fa-edit size pointer" data-toggle="modal" data-target="#editProject"></i></p>
                                                                </span>
                                                            </h3>
                                                        </div>
                                                        <div class="member-cus">
                                                            <div class="msg_list_main">
                                                                <div class="row">
                                                                    <div class="col-md-12">
                                                                        <div class="full">
                                                                            <div class="padding_infor_info">
                                                                                <p class="font-weight-bold">{lang["projectname"]}:</p>
                                                                                <p class="mb-2">{projectdetail.project_name}</p>


                                                                                <div class="d-flex justify-content-between">
                                                                                    <div>
                                                                                        <p class="font-weight-bold">{lang["projectcode"]}:</p>
                                                                                        <p class="mb-2">{projectdetail.project_code}</p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p class="font-weight-bold">{lang["versionname"]}:</p>
                                                                                        {versions.map(version => (
                                                                                            <p class="mb-2">{version.version_name}</p>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>

                                                                                <p class="font-weight-bold">{lang["description"]}: </p>
                                                                                <p class="mb-2">{projectdetail.project_description}</p>
                                                                                <p class="font-weight-bold">{lang["projectmanager"]}: </p>
                                                                                <div class="profile_contacts">
                                                                                    <img class="img-responsive circle-image" src={proxy + projectdetail.manager?.avatar} alt="#" />
                                                                                    {projectdetail.manager?.fullname}
                                                                                </div>
                                                                                <div class="d-flex align-items-center">
                                                                                    <p class="font-weight-bold">{lang["projectmember"]}: </p>
                                                                                    <button type="button" class="btn btn-primary custom-buttonadd ml-auto mb-1" data-toggle="modal" data-target="#editMember">
                                                                                        <i class="fa fa-edit"></i>
                                                                                    </button>
                                                                                </div>

                                                                                <div class="table-responsive">
                                                                                    {
                                                                                        sortedMembers && sortedMembers.length > 0 ? (
                                                                                            <>
                                                                                                <table class="table table-striped ">
                                                                                                    <thead>
                                                                                                        <tr>
                                                                                                            <th scope="col">STT</th>
                                                                                                            <th scope="col">Avatar</th>
                                                                                                            <th scope="col">Họ và tên</th>
                                                                                                            <th scope="col">Chức vụ</th>
                                                                                                            <th scope="col">Hành động</th>
                                                                                                        </tr>
                                                                                                    </thead>
                                                                                                    <tbody>
                                                                                                        {currentMembers.map((member, index) => (
                                                                                                            <tr key={member.username}>
                                                                                                                <td scope="row">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                                                                                                <td><img src={proxy + member.avatar} class="img-responsive circle-image" alt="#" /></td>
                                                                                                                <td>{member.fullname}</td>
                                                                                                                <td>
                                                                                                                    {
                                                                                                                        member.permission === "supervisor" ? lang["supervisor"] :
                                                                                                                            member.permission === "deployer" ? lang["deployers"] :
                                                                                                                                "Khác"
                                                                                                                    }
                                                                                                                </td>
                                                                                                                <td>
                                                                                                                    <img class="abc" width={20} src="/images/icon/cross-color.png" onClick={() => handleDeleteUser(member)}></img>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        ))}
                                                                                                    </tbody>
                                                                                                </table>

                                                                                                <div className="d-flex justify-content-between align-items-center">
                                                                                                    <p>Hiển thị {indexOfFirstMember + 1}-{Math.min(indexOfLastMember, sortedMembers.length)} của {sortedMembers.length} kết quả</p>
                                                                                                    <nav aria-label="Page navigation example">
                                                                                                        <ul className="pagination mb-0">
                                                                                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                                                                <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                                                                                                                    &laquo;
                                                                                                                </button>
                                                                                                            </li>
                                                                                                            {Array(totalPages).fill().map((_, index) => (
                                                                                                                <li className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                                                                                    <button className="page-link" onClick={() => paginate(index + 1)}>
                                                                                                                        {index + 1}
                                                                                                                    </button>
                                                                                                                </li>
                                                                                                            ))}
                                                                                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                                                                                <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                                                                                                                    &raquo;
                                                                                                                </button>
                                                                                                            </li>
                                                                                                        </ul>
                                                                                                    </nav>
                                                                                                </div>
                                                                                            </>
                                                                                        ) : (
                                                                                            <div class="list_cont ">
                                                                                                <p>Chưa có thành viên</p>
                                                                                            </div>
                                                                                        )
                                                                                    }
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
                                                                                <h5>{lang["supervisor"]}</h5>
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
                                                                                <h5>{lang["deployers"]}</h5>
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

                                                                    {showImplementationPopup && (
                                                                        <div class="user-popup2">
                                                                            <div class="user-popup-content">
                                                                                {users && users.map(user => {
                                                                                    if (!selectedUsers.some(u => u.username === user.username) && !selectedMonitor.some(u => u.username === user.username)) {
                                                                                        return (
                                                                                            <div key={user.username} class="user-item">
                                                                                                <input
                                                                                                    class="user-checkbox"
                                                                                                    type="checkbox"
                                                                                                    checked={tempSelectedImple.some(u => u.username === user.username)}
                                                                                                    onChange={() => handleImpleCheck(user, 'supervisor')}
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
                                                                                <button class="btn btn-success" onClick={handleSaveImple}>Lưu</button>
                                                                                <button class="btn btn-danger" onClick={handleClosePopup}>Đóng</button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {showMonitorPopup && (
                                                                        <div class="user-popup3">
                                                                            <div class="user-popup-content">
                                                                                {users && users.map(user => {
                                                                                    if (!selectedUsers.some(u => u.username === user.username) && !selectedImple.some(u => u.username === user.username)) {
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
                                            {/* Progress */}
                                            <div class="col-md-7">
                                                <div class="dash_blog">
                                                    <div class="dash_blog_inner">
                                                        <div class="dash_head">
                                                            <h3>
                                                                <h5>{lang["projectprocess"]}</h5>
                                                                {/* <span class="plus_green_bt">
                                                                    <p><i class="fa fa-edit size pointer" data-toggle="modal" data-target="#editManager"></i></p>
                                                                </span> */}
                                                            </h3>
                                                        </div>
                                                        <div class="member-cus">
                                                            <div class="msg_list_main">
                                                                <div class="row">
                                                                    <div class="col-md-12">
                                                                        <div class="full">
                                                                            <div class="padding_infor_info">
                                                                                <div class="progress-cus">
                                                                                    <span className="status-label" style={{
                                                                                        backgroundColor: (status.find((s) => s.value === projectdetail.project_status) || {}).color
                                                                                    }}>
                                                                                        {(status.find((s) => s.value === projectdetail.project_status) || {}).label || 'Trạng thái không xác định'}
                                                                                    </span>
                                                                                    <span class="skill" style={{ width: '250px' }}><span class="info_valume">85%</span></span>
                                                                                    <div class="progress skill-bar ">
                                                                                        <div class="progress-bar progress-bar-animated progress-bar-striped" role="progressbar" aria-valuenow="85" aria-valuemin="0" aria-valuemax="100" style={{ width: 225 }}>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="d-flex align-items-center">
                                                                                    <p class="font-weight-bold">{lang["tasklist"]}: </p>
                                                                                    <button type="button" class="btn btn-primary custom-buttonadd ml-auto mb-1" data-toggle="modal" data-target="#addTask">
                                                                                        <i class="fa fa-plus"></i>
                                                                                    </button>
                                                                                </div>
                                                                                <div class="table-responsive">
                                                                                    {
                                                                                        sortedMembers && sortedMembers.length > 0 ? (
                                                                                            <>
                                                                                                <table class="table table-striped">
                                                                                                    <thead>
                                                                                                        <tr>
                                                                                                            <th scope="col">SST</th>
                                                                                                            <th scope="col">Công việc</th>
                                                                                                            <th scope="col">Người thực hiện</th>
                                                                                                            <th scope="col" style={{ textAlign: "center" }}>Trạng thái</th>
                                                                                                            <th scope="col" style={{ textAlign: "center" }}>Thao tác</th>
                                                                                                        </tr>
                                                                                                    </thead>
                                                                                                    <tbody>
                                                                                                        {currentMembersTask.map((task, index) => (
                                                                                                            <tr key={task.id}>
                                                                                                                <td scope="row">{index + 1}</td>
                                                                                                                <td>{task.task_name}</td>
                                                                                                                <td >
                                                                                                                    {
                                                                                                                        task.members && task.members.length > 0 ?
                                                                                                                            task.members.slice(0, 3).map(member => (
                                                                                                                                <img
                                                                                                                                    class="img-responsive circle-image-cus"
                                                                                                                                    src={proxy + member.avatar}
                                                                                                                                    alt={member.username}
                                                                                                                                />

                                                                                                                            )) :
                                                                                                                            <p>{lang["projectempty"]} </p>
                                                                                                                    }
                                                                                                                    {
                                                                                                                        task.members.length > 3 &&
                                                                                                                        <div className="extra-images-cus">
                                                                                                                            +{task.members.length - 3}
                                                                                                                        </div>
                                                                                                                    }
                                                                                                                </td>
                                                                                                                <td style={{ textAlign: "center" }}><span className="status-label" style={{
                                                                                                                    backgroundColor: (statusTask.find((s) => s.value === task.task_status) || {}).color
                                                                                                                }}>
                                                                                                                    {(statusTask.find((s) => s.value === task.task_status) || {}).label || 'Trạng thái không xác định'}
                                                                                                                </span></td>
                                                                                                                <td style={{ textAlign: "center" }}>

                                                                                                                    <i class="fa fa-eye size pointer icon-margin icon-view" onClick={() => detailTask(task)} data-toggle="modal" data-target="#viewTask"></i>
                                                                                                                    <i class="fa fa-trash-o"></i>
                                                                                                                </td>

                                                                                                            </tr>
                                                                                                        ))}
                                                                                                    </tbody>
                                                                                                </table>
                                                                                                <div className="d-flex justify-content-between align-items-center">
                                                                                                    <p>Hiển thị {indexOfFirstMemberTask + 1}-{Math.min(indexOfLastMemberTask, tasks.length)} của {tasks.length} kết quả</p>
                                                                                                    <nav aria-label="Page navigation example">
                                                                                                        <ul className="pagination mb-0">
                                                                                                            <li className={`page-item ${currentPageTask === 1 ? 'disabled' : ''}`}>
                                                                                                                <button className="page-link" onClick={() => paginateTask(currentPageTask - 1)}>
                                                                                                                    &laquo;
                                                                                                                </button>
                                                                                                            </li>
                                                                                                            {Array(totalPagesTask).fill().map((_, index) => (
                                                                                                                <li className={`page-item ${currentPageTask === index + 1 ? 'active' : ''}`}>
                                                                                                                    <button className="page-link" onClick={() => paginateTask(index + 1)}>
                                                                                                                        {index + 1}
                                                                                                                    </button>
                                                                                                                </li>
                                                                                                            ))}
                                                                                                            <li className={`page-item ${currentPageTask === totalPagesTask ? 'disabled' : ''}`}>
                                                                                                                <button className="page-link" onClick={() => paginateTask(currentPageTask + 1)}>
                                                                                                                    &raquo;
                                                                                                                </button>
                                                                                                            </li>
                                                                                                        </ul>
                                                                                                    </nav>
                                                                                                </div>
                                                                                            </>
                                                                                        ) : (
                                                                                            <div class="list_cont ">
                                                                                                <p>Chưa có thành viên</p>
                                                                                            </div>
                                                                                        )
                                                                                    }
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
                                            {/* Add Progress */}
                                            <div class={`modal ${showModal ? 'show' : ''}`} id="addTask">
                                                <div class="modal-dialog modal-dialog-center">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h4 class="modal-title">{lang["addtask"]}</h4>
                                                            <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                                                        </div>
                                                        <div class="modal-body">
                                                            <form>
                                                                <div class="row">
                                                                    <div class="form-group col-lg-12">
                                                                        <label>{lang["taskname"]} <span className='red_star'>*</span></label>
                                                                        <input type="text" class="form-control" value={task.task_name} onChange={
                                                                            (e) => { setTask({ ...task, task_name: e.target.value }) }
                                                                        } placeholder={lang["p.taskname"]} />
                                                                    </div>

                                                                    <div class="form-group col-lg-6 ">
                                                                        <label>{lang["task_priority"]} <span className='red_star'>*</span></label>
                                                                        <select className="form-control" value={task.task_priority} onChange={(e) => { setTask({ ...task, task_priority: e.target.value }) }}>
                                                                            <option value="">{lang["p.projectstatus"]}</option>
                                                                            {statusPriority.map((status, index) => {
                                                                                return (
                                                                                    <option key={index} value={status.value}>{status.label}</option>
                                                                                );
                                                                            })}
                                                                        </select>
                                                                        <input type="hidden" class="form-control" value={task.task_status} onChange={
                                                                            (e) => { setTask({ ...task, task_status: e.target.value }) }
                                                                        } placeholder={lang["p.taskname"]} />
                                                                    </div>

                                                                    <div class="form-group col-lg-12">
                                                                        <label>{lang["projectdescripton"]}</label>
                                                                        <textarea rows="4" type="text" class="form-control" value={task.task_description} onChange={
                                                                            (e) => { setTask({ ...task, task_description: e.target.value }) }
                                                                        } placeholder={lang["p.description"]} />
                                                                    </div>
                                                                    <div class="form-group col-lg-12">
                                                                        <label>Quản lý</label>
                                                                        <div class="user-checkbox-container">
                                                                            {projectdetail.members?.map((user, index) => (
                                                                                <div key={index} class="user-checkbox-item">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        value={JSON.stringify(user)}
                                                                                        onChange={(e) => {
                                                                                            let selectedUser = JSON.parse(e.target.value);
                                                                                            let alreadySelected = selectedMemberTask.find(u => u.username === selectedUser.username);
                                                                                            if (alreadySelected) {
                                                                                                setSelectedMemberTask(selectedMemberTask.filter(u => u.username !== selectedUser.username));
                                                                                            } else {
                                                                                                setSelectedMemberTask([...selectedMemberTask, selectedUser]);
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <label>{user.fullname}</label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        </div>
                                                        <div class="modal-footer">
                                                            <button type="button" onClick={submitAddTask} class="btn btn-success ">{lang["btn.create"]}</button>
                                                            <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* View Task */}
                                            <div class={`modal ${showModal ? 'show' : ''}`} id="viewTask">
                                                <div class="modal-dialog modal-dialog-center">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h4 class="modal-title">{lang["detailtask"]}</h4>
                                                            <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                                                        </div>
                                                        <div class="modal-body">
                                                            <form>
                                                                <div class="row">

                                                                    <div class="form-group col-lg-12">
                                                                        <label>{lang["taskname"]} <span className='red_star'>*</span></label>
                                                                        <input type="text" class="form-control" value={taskDetail.task_name} readOnly />
                                                                        <label>{lang["taskstatus"]} <span className='red_star'>*</span></label>
                                                                        <input type="text" class="form-control" value={taskDetail.task_status} readOnly />
                                                                        <label>{lang["description"]} <span className='red_star'>*</span></label>
                                                                        <textarea rows={6} class="form-control" value={taskDetail.task_description} readOnly />

                                                                    </div>

                                                                </div>
                                                            </form>
                                                        </div>
                                                        <div class="modal-footer">

                                                            <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row column4 graph">
                                            {/* Proejct */}
                                            {/* Website */}
                                            <div class="col-md-12">
                                                <div class="dash_blog">
                                                    <div class="dash_blog_inner">
                                                        <div class="dash_head">
                                                            <h3>
                                                                <h5>Thông tin website triển khai</h5>
                                                                <span class="plus_green_bt">
                                                                    <p><i class="fa fa-edit size pointer" data-toggle="modal" data-target="#"></i></p>
                                                                </span>
                                                            </h3>
                                                        </div>
                                                        <div class="member-cus">
                                                            <div class="msg_list_main">
                                                                <div class="row column1">
                                                                    <div class="col-md-4 col-lg-4">
                                                                        <div class="full counter_section margin_bottom_30">
                                                                            <div class="couter_icon">
                                                                                <div>
                                                                                    <i class="fa fa-briefcase purple_color2"></i>
                                                                                </div>
                                                                            </div>
                                                                            <div class="counter_no">
                                                                                <div>
                                                                                    <p class="total_no">1</p>
                                                                                    <p class="head_couter">Bảng</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-md-4 col-lg-4">
                                                                        <div class="full counter_section margin_bottom_30">
                                                                            <div class="couter_icon">
                                                                                <div>
                                                                                    <i class="fa fa-users blue1_color"></i>
                                                                                </div>
                                                                            </div>
                                                                            <div class="counter_no">
                                                                                <div>
                                                                                    <p class="total_no">1</p>
                                                                                    <p class="head_couter">API</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-md-4 col-lg-4">
                                                                        <div class="full counter_section margin_bottom_30">
                                                                            <div class="couter_icon">
                                                                                <div>
                                                                                    <i class="fa fa-cloud-download green_color"></i>
                                                                                </div>
                                                                            </div>
                                                                            <div class="counter_no">
                                                                                <div>
                                                                                    <p class="total_no">5</p>
                                                                                    <p class="head_couter">UI</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                                <div class="row column1">
                                                                    <div class="col-md-4 col-lg-4">
                                                                        <div class="d-flex align-items-center mb-1">
                                                                            <p class="font-weight-bold">Danh sách bảng </p>
                                                                            <button type="button" class="btn btn-primary custom-buttonadd ml-auto" data-toggle="modal" data-target="#addTask">
                                                                                <i class="fa fa-plus"></i>
                                                                            </button>
                                                                        </div>
                                                                        <table class="table table-hover">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>STT</th>
                                                                                    <th>Tên bảng</th>
                                                                                    <th>Ngày tạo</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>1</td>
                                                                                    <td>Bảng 1</td>
                                                                                    <td>06/06/2023 11:12</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>2</td>
                                                                                    <td>Bảng 2</td>
                                                                                    <td>06/06/2023 11:14</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>3</td>
                                                                                    <td>Bảng 3</td>
                                                                                    <td>06/06/2023 11:16</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                    <div class="col-md-4 col-lg-4">
                                                                        <div class="d-flex align-items-center mb-1">
                                                                            <p class="font-weight-bold">Danh sách API </p>
                                                                            <button type="button" class="btn btn-primary custom-buttonadd ml-auto" data-toggle="modal" data-target="#addTask">
                                                                                <i class="fa fa-plus"></i>
                                                                            </button>
                                                                        </div>
                                                                        <table class="table table-hover">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>STT</th>
                                                                                    <th>Tên API</th>
                                                                                    <th>Ngày tạo</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>1</td>
                                                                                    <td>API 1</td>
                                                                                    <td>06/06/2023 11:16</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>2</td>
                                                                                    <td>API 2</td>
                                                                                    <td>06/06/2023 11:17</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>3</td>
                                                                                    <td>API 3</td>
                                                                                    <td>j06/06/2023 11:18</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                    <div class="col-md-4 col-lg-4">
                                                                        <div class="d-flex align-items-center mb-1">
                                                                            <p class="font-weight-bold">Danh sách UI </p>
                                                                            <button type="button" class="btn btn-primary custom-buttonadd ml-auto" data-toggle="modal" data-target="#addTask">
                                                                                <i class="fa fa-plus"></i>
                                                                            </button>
                                                                        </div>
                                                                        <table class="table table-hover">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>STT</th>
                                                                                    <th>Tên trang</th>
                                                                                    <th>Ngày tạo</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>1</td>
                                                                                    <td>Page 1</td>
                                                                                    <td>06/06/2023 11:18</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>2</td>
                                                                                    <td>Page 2</td>
                                                                                    <td>06/06/2023 11:16</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>3</td>
                                                                                    <td>Page 3</td>
                                                                                    <td>06/06/2023 11:16</td>
                                                                                </tr>
                                                                            </tbody>
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >


    )
}

