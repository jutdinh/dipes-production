
import { useParams } from "react-router-dom";
import Header from "../common/header"
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StatusEnum, StatusTask } from '../enum/status';

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
    const [showFull, setShowFull] = useState(false);

    const [showViewMore, setShowViewMore] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);



    // console.log(selectedMemberTask)
    // Page 

    const sortOptions = [
        { id: 0, label: "Mới nhất", value: "latest" },
        { id: 1, label: "Cũ nhất", value: "oldest" },
    ]
    // page

    const statusProject = [
        StatusEnum.INITIALIZATION,
        StatusEnum.IMPLEMENT,
        StatusEnum.DEPLOY,
        StatusEnum.COMPLETE,
        StatusEnum.PAUSE

    ]
    const statusTaskView = [
        StatusTask.INITIALIZATION,
        StatusTask.IMPLEMENT,
        StatusTask.COMPLETE,
        StatusTask.PAUSE

    ]
    // const status = [
    //     { id: 0, label: lang["initialization"], value: 1, color: "#1ed085" },
    //     { id: 1, label: lang["implement"], value: 2, color: "#8884d8" },
    //     { id: 2, label: lang["complete"], value: 3, color: "#ff8042" },
    //     { id: 3, label: lang["pause"], value: 4, color: "#FF0000" }
    // ]
    const statusTask = [
        { id: 0, label: "Chờ duyệt", value: 0, color: "#1ed085" },
        { id: 1, label: "Đã duyệt", value: 1, color: "#181dd4" },


    ]
    const statusPriority = [
        { id: 0, label: "Cao", value: 1, color: "#1ed085" },
        { id: 1, label: "Trung bình", value: 2, color: "#8884d8" },
        { id: 2, label: "Thấp", value: 3, color: "#ffc658" },

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

    const [process, setProcess] = useState({});
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
                        setProcess(data)
                        setManager(data.manager.username)
                    }
                } else {
                    window.location = "/404-not-found"
                }
            })
    }, [])


    const [tables, setTables] = useState({});

    useEffect(() => {

        fetch(`${proxy}/db/tables/v/${versions[0]?.version_id}`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;

                if (success) {
                    if (data) {
                        setTables(data);
                        console.log(data)
                    }
                } else {
                    console.log("data")
                    // window.location = "/404-not-found"
                }
            })

    }, [versions]);

    const [apis, setApis] = useState([]);

    useEffect(() => {

        fetch(`${proxy}/apis/v/${versions[0]?.version_id}`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;

                if (success) {
                    if (data) {
                        setApis(data.apis);
                        //    console.log(data)
                    }
                } else {

                    // window.location = "/404-not-found"
                }
            })

    }, [versions]);


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
                        console.log("data task", data)
                    }
                } else {
                    // window.location = "/404-not-found"
                }
            })
    }, [])


    //
    const [uis, setUis] = useState([]);
    useEffect(() => {
        fetch(`${proxy}/uis/v/${versions[0]?.version_id}`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;

                if (success) {
                    if (data) {
                        setUis(data.uis);

                    }
                } else {
                    // window.location = "/404-not-found"
                }
            })
    }, [])
    console.log(uis)
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
                    }).then(function () {
                        window.location.reload();

                    });
                }
            })


    };
    const submitUpdateProject = async (e) => {
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
        const response = await fetch(`${proxy}/projects/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify({ project: { ...project, project_status: parseInt(project.project_status) } }),
        });

        const resp = await response.json();
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
            }).then(function () { });
        }

        // call addMember after submitUpdateProject has completed
        addMember(e);
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

    const [updateTaskinfo, setUpdateTask] = useState({});

    const getIdTask = (taskid) => {
        setUpdateTask(taskid);
    }

    useEffect(() => {
        console.log(updateTaskinfo);
    }, [updateTaskinfo]);



    const updateTask = (e) => {
        e.preventDefault();
        const requestBody = {
            project_id: project.project_id,
            task_id: updateTaskinfo.task_id,
            task_name: updateTaskinfo.task_name,
            task_description: updateTaskinfo.task_description,
            task_priority: updateTaskinfo.task_priority,
        };
        console.log(requestBody)
        fetch(`${proxy}/tasks/task/info`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(requestBody),
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
    const [deleteTask, setDelelteTask] = useState(false);

    const handleConfirmTask = (taskid) => {
        const newTaskApproveStatus = !taskid.task_approve;
        const requestBody = {
            project_id: project.project_id,
            task_id: taskid.task_id,
            task_approve: newTaskApproveStatus
        };
        console.log(requestBody)
        fetch(`${proxy}/tasks/task/approve`, {
            method: 'PUT',
            headers: {
                "content-type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(requestBody)
        })
            .then(res => res.json())
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
                        // Không cần reload trang
                    });
                }
            });


    }
    const handleDeleteTask = (taskid) => {
        const requestBody = {

            project_id: project.project_id,
            task_id: taskid.task_id

        };
        console.log(requestBody)

        Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc chắn muốn xóa yều cầu này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            confirmButtonColor: 'rgb(209, 72, 81)',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${proxy}/tasks/task`, {
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

    const getStatusLabel = (statusId) => {
        const status = statusTask.find(st => st.id === statusId);
        return status ? status.label : 'N/A';
    };

    const getStatusColor = (statusId) => {
        const status = statusTask.find(st => st.id === statusId);
        return status ? status.color : 'N/A';
    };
    //task

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 4;

    const indexOfLastMember = currentPage * rowsPerPage;
    const indexOfFirstMember = indexOfLastMember - rowsPerPage;
    const currentMembers = sortedMembers.slice(indexOfFirstMember, indexOfLastMember);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(sortedMembers.length / rowsPerPage);

    // Page member task
    const [currentPageTask, setCurrentPageTask] = useState(1);
    const rowsPerPageTask = 7;

    const indexOfLastMemberTask = currentPageTask * rowsPerPageTask;
    const indexOfFirstMemberTask = indexOfLastMemberTask - rowsPerPageTask;
    const currentMembersTask = tasks.slice(indexOfFirstMemberTask, indexOfLastMemberTask);

    const paginateTask = (pageNumber) => setCurrentPageTask(pageNumber);
    const totalPagesTask = Math.ceil(tasks.length / rowsPerPageTask);

    // Page detail task
    const [currentViewDetailTask, setCurrentViewDetailTask] = useState(1);
    const rowsPerViewDetailTask = 5;

    const indexOfLastMemberViewDetailTask = currentViewDetailTask * rowsPerViewDetailTask;
    const indexOfFirstMemberViewDetailTask = indexOfLastMemberViewDetailTask - rowsPerViewDetailTask;
    const currentMembersViewDetailTask = taskDetail.history?.slice(indexOfFirstMemberViewDetailTask, indexOfLastMemberViewDetailTask);

    const paginateViewDetailTask = (pageNumber) => setCurrentViewDetailTask(pageNumber);
    const totalViewDetailTask = Math.ceil(taskDetail.history?.length / rowsPerViewDetailTask);


    useEffect(() => {
        if (projectdetail.project_description?.length > 100) {
            setShowViewMore(true);
        } else {
            setShowViewMore(false);
        }
    }, [projectdetail.project_description]);

    const tablesManager = (project) => {

        window.location.href = `/projects/${versions[0]?.version_id}/tables`;

        // window.location.href = `tables`;
    };
    const apisManager = (project) => {

        window.location.href = `/projects/${versions[0]?.version_id}/apis`;

        // window.location.href = `tables`;
    };
    const uisManager = (project) => {

        window.location.href = `/projects/${versions[0]?.version_id}/uis`;

        // window.location.href = `tables`;
    };
   
    const handleSelectChange = async (e) => {
        const newTaskStatus = parseInt(e.target.value, 10);
        const taskId = e.target.options[e.target.selectedIndex].dataset.taskid;
        console.log(taskId);
        updateStatusTask({ task_id: taskId, newTaskStatus: newTaskStatus });
    }

    const updateStatusTask = (taskInfo) => {

        const requestBody = {
            project_id: project.project_id,
            task_id: taskInfo.task_id,
            task_status: taskInfo.newTaskStatus
        };
        console.log(requestBody)
        fetch(`${proxy}/tasks/task/status`, {
            method: 'PUT',
            headers: {
                "content-type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(requestBody)
        })
            .then(res => res.json())
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
    const [currentPageTable, setCurrentPageTable] = useState(1);
    const rowsPerPageTable = 3;

    const indexOfLastTable = currentPageTable * rowsPerPageTable;
    const indexOfFirstTable = indexOfLastTable - rowsPerPageTable;
    const currentTable = tables.tables?.slice(indexOfFirstTable, indexOfLastTable);

    const paginateTable = (pageNumber) => setCurrentPageTable(pageNumber);
    const totalPagesTable = Math.ceil(tables.tables?.length / rowsPerPageTable);

    const [currentPageApi, setCurrentPageApi] = useState(1);
    const rowsPerPageApi = 3;

    const indexOfLastApi = currentPageApi * rowsPerPageApi;
    const indexOfFirstApi = indexOfLastApi - rowsPerPageApi;
    const currentApi = apis.slice(indexOfFirstApi, indexOfLastApi);

    const paginateApi = (pageNumber) => setCurrentPageApi(pageNumber);
    const totalPagesApi = Math.ceil(apis.length / rowsPerPageApi);
    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h4>{lang["project_detail.title"]}</h4>
                        </div>
                    </div>
                </div>
                <div class="row">
                    {/* Detail */}
                    <div class="col-md-5">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head d-flex justify-content-between align-items-center">
                                <div class="heading1 margin_0">
                                    <h5>{lang["project.info"]}</h5>
                                </div>
                                <div>
                                    <button type="button" class="btn btn-primary btn-header" data-toggle="modal" data-target="#editProject">
                                        <i class="fa fa-edit size pointer" ></i>
                                    </button>
                                </div>
                            </div>
                            <div class="table_section padding_infor_info">
                                {/* <p class="font-weight-bold">{lang["projectname"]}:</p>
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
                                <p class="mb-2">{projectdetail.project_description}</p> */}
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
                                {/* <p class="font-weight-bold">{lang["description"]}: </p>
                                <div style={{
                                    width: showFull ? "auto" : "100%",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: showFull ? "normal" : "nowrap"
                                }}>
                                    {projectdetail.project_description}
                                </div>
                                <a href="#" onClick={() => setShowFull(!showFull)}>{showFull ? '...Thu gọn' : '...Xem thêm'}</a> */}
                                <div>
                                    <p className="font-weight-bold">{lang["description"]}: </p>
                                    <div className="description-container">

                                        <div style={{
                                            width: "100%",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}>
                                            {projectdetail.project_description}
                                        </div>
                                        {showViewMore && (
                                            <div className="view-more-link">
                                                <a href="#" data-toggle="modal" data-target="#viewDescription">
                                                    <b>Xem thêm</b>
                                                </a>
                                            </div>
                                        )}

                                    </div>
                                </div>
                                <p class="font-weight-bold mt-2">{lang["projectmanager"]}: </p>
                                <div class="profile_contacts">
                                    <img class="img-responsive circle-image" src={proxy + projectdetail.manager?.avatar} alt="#" />
                                    {projectdetail.manager?.fullname}
                                </div>
                                <div class="d-flex align-items-center mb-1">
                                    <p class="font-weight-bold">{lang["projectmember"]}: </p>
                                    {/* <button type="button" class="btn btn-primary custom-buttonadd ml-auto mb-1" data-toggle="modal" data-target="#editMember">
                                        <i class="fa fa-edit"></i>
                                    </button> */}
                                </div>
                                <div class="table-responsive">
                                    {
                                        sortedMembers && sortedMembers.length > 0 ? (
                                            <>
                                                <table class="table table-striped ">
                                                    <thead>
                                                        <tr>
                                                            <th class="font-weight-bold" scope="col">{lang["log.no"]}</th>
                                                            <th class="font-weight-bold" scope="col">{lang["members"]}</th>
                                                            <th class="font-weight-bold" scope="col">{lang["fullname"]}</th>
                                                            <th class="font-weight-bold" scope="col">{lang["duty"]}</th>
                                                            {/* <th scope="col">Hành động</th> */}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentMembers.map((member, index) => (
                                                            <tr key={member.username}>
                                                                <td scope="row">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                                                <td style={{ minWidth: "100px" }}><img src={proxy + member.avatar} class="img-responsive circle-image-cus" alt="#" /></td>
                                                                <td>{member.fullname}</td>
                                                                <td style={{ minWidth: "80px" }}>
                                                                    {
                                                                        member.permission === "supervisor" ? lang["supervisor"] :
                                                                            member.permission === "deployer" ? lang["deployers"] :
                                                                                "Khác"
                                                                    }
                                                                </td>
                                                                {
                                                                    ["pm"].indexOf(auth.role) != -1 &&
                                                                    <td class="align-center">
                                                                        <i class="fa fa-trash-o size pointer icon-margin icon-delete" onClick={() => handleDeleteUser(member)} title={lang["delete"]}></i>
                                                                    </td>
                                                                }
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>

                                                <div className="d-flex justify-content-between align-items-center">
                                                    <p>{lang["show"]} {indexOfFirstMember + 1}-{Math.min(indexOfLastMember, sortedMembers.length)} {lang["of"]} {sortedMembers.length} {lang["results"]}</p>
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
                                                    {statusProject.map((status, index) => {
                                                        return (
                                                            <option key={index} value={status.value}>{lang[`${status.label}`]}</option>
                                                        );
                                                    })}
                                                </select>
                                                {errorMessagesedit.project_status && <span class="error-message">{errorMessagesedit.project_status}</span>}
                                            </div>
                                            <div class="form-group col-lg-12 ">
                                                <label>{lang["projectdescripton"]} </label>
                                                <textarea rows="10" type="text" class="form-control" value={project.project_description} onChange={
                                                    (e) => { setProject({ ...project, project_description: e.target.value }) }
                                                } placeholder={lang["p.projectdescripton"]} />
                                            </div>
                                            <div className="form-group col-lg-12">
                                                <label>Thành viên dự án</label>
                                                <div class="options-container">
                                                    <div class="option" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                        <h5>Giám sát</h5>
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
                                                        <button type="button" class="btn btn-primary custom-buttonadd" onClick={handleOpenAdminPopup} >
                                                            <i class="fa fa-plus"></i>
                                                        </button>
                                                    </div>
                                                    <div class="option" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                        <h5>Triển Khai</h5>
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
                                                <div class="user-popup4">
                                                    <div class="user-popup-content">
                                                        {users && users.map(user => {
                                                            if (user.username !== manager && !selectedImple.some(u => u.username === user.username)) {
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
                                                        <button class="btn btn-success" onClick={handleSaveUsers}>Lưu</button>
                                                        <button class="btn btn-danger" onClick={handleClosePopup}>Đóng</button>
                                                    </div>
                                                </div>
                                            )}
                                            {showImplementationPopup && (
                                                <div class="user-popup2">
                                                    <div class="user-popup-content">
                                                        {users && users.map(user => {
                                                            if (user.username !== manager && !selectedUsers.some(u => u.username === user.username)) {
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
                                                        <button class="btn btn-success" onClick={handleSaveImple}>Lưu</button>
                                                        <button class="btn btn-danger" onClick={handleClosePopup}>Đóng</button>
                                                    </div>
                                                </div>
                                            )}

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
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head">
                                <div class="heading1 margin_0">
                                    <h5>{lang["projectprocess"]}</h5>
                                </div>
                            </div>
                            <div class="table_section padding_infor_info">
                                <div className="d-flex">
                                    <div>
                                        <span className="status-label d-block" style={{
                                            backgroundColor: (statusProject.find((s) => s.value === projectdetail.project_status) || {}).color,
                                            whiteSpace: "nowrap"
                                        }}>
                                            {lang[`${(statusProject.find((s) => s.value === projectdetail.project_status) || {}).label || 'Trạng thái không xác định'}`]}
                                        </span>
                                    </div>
                                    <span class="skill d-block" style={{ width: `100%` }}><span class="info_valume">{process.progress}%</span></span>
                                </div>
                                <div class="progress skill-bar ">
                                    <div class="progress-bar progress-bar-animated progress-bar-striped" role="progressbar" aria-valuenow={process.progress} aria-valuemin="0" aria-valuemax="100" style={{ width: `${process.progress}%` }}>
                                    </div>
                                </div>
                                <div class="d-flex align-items-center">
                                    <p class="font-weight-bold">{lang["tasklist"]}: </p>
                                    <button type="button" class="btn btn-primary custom-buttonadd ml-auto" data-toggle="modal" data-target="#addTask">
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
                                                            <th class="font-weight-bold" scope="col">{lang["log.no"]}</th>
                                                            <th class="font-weight-bold" scope="col">{lang["task"]}</th>
                                                            <th class="font-weight-bold" scope="col">{lang["log.create_user"]}</th>
                                                            <th class="font-weight-bold align-center" scope="col">{lang["taskstatus"]}</th>
                                                            <th class="font-weight-bold align-center" scope="col" >{lang["confirm"]}</th>
                                                            <th class="font-weight-bold align-center" scope="col" >{lang["log.action"]}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentMembersTask.map((task, index) => (
                                                            <tr key={task.id}>
                                                                <td scope="row">{index + 1}</td>
                                                                <td style={{ maxWidth: "100px" }}>
                                                                    <div style={{
                                                                        width: "100%",
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis",
                                                                        whiteSpace: "nowrap"
                                                                    }}>
                                                                        {task.task_name}
                                                                    </div>
                                                                </td>
                                                                <td style={{ width: "170px" }} >
                                                                    {
                                                                        task.members && task.members.length > 0 ?
                                                                            task.members.slice(0, 2).map(member => (
                                                                                <img
                                                                                    class="img-responsive circle-image-cus"
                                                                                    src={proxy + member.avatar}
                                                                                    alt={member.username}
                                                                                />
                                                                            )) :
                                                                            <p>{lang["projectempty"]} </p>
                                                                    }
                                                                    {
                                                                        task.members.length > 2 &&
                                                                        <div className="extra-images-cus" style={{ backgroundImage: `url(${proxy + task.members[2].avatar})` }}>
                                                                            <span>+{task.members.length - 3}</span>
                                                                        </div>
                                                                    }
                                                                </td>
                                                                <td class="align-center" style={{ width: "230px" }} >

                                                                    {/* {lang[`${(statusTaskView.find((s) => s.value === task.task_status) || {}).label || 'Trạng thái không xác định'}`]} */}

                                                                    {/* <select className="form-control" value={task.task_status} onChange={(e) => { setUpdateTask({ ...updateTaskinfo, task_priority: e.target.value }) }}>
                                                                        <option value="">Chọn</option>
                                                                        {statusTaskView.map((status, index) => {
                                                                            return (
                                                                                <option key={index} value={status.value}>  {lang[`${(statusTaskView.find((s) => s.value === task.task_status) || {}).label || 'Trạng thái không xác định'}`]}</option>
                                                                            );
                                                                        })}
                                                                    </select> */}
                                                                    <select
                                                                        className="form-control"
                                                                        value={task.task_status}
                                                                        onChange={handleSelectChange}
                                                                        disabled={task.task_approve}
                                                                    >

                                                                        {statusTaskView.map((status, index) => {
                                                                            return (
                                                                                <option key={index} value={status.value} data-taskid={task.task_id}>
                                                                                    {lang[status.label]}
                                                                                </option>
                                                                            );
                                                                        })}
                                                                    </select>

                                                                </td>
                                                                <td class="font-weight-bold" style={{ color: getStatusColor(task.task_approve ? 1 : 0), textAlign: "center" }}>
                                                                    {getStatusLabel(task.task_approve ? 1 : 0)}
                                                                </td>
                                                                <td class="align-center" style={{ minWidth: "130px" }}>
                                                                    <i class="fa fa-eye size pointer icon-margin icon-view" onClick={() => detailTask(task)} data-toggle="modal" data-target="#viewTask" title={lang["viewdetail"]}></i>

                                                                    {
                                                                        ["pm"].indexOf(auth.role) != -1 &&
                                                                        <>
                                                                            <i class="fa fa-edit size pointer icon-margin icon-edit" onClick={() => getIdTask(task)} data-toggle="modal" data-target="#editTask" title={lang["edit"]}></i>
                                                                            {task.task_approve
                                                                                ? (task.task_status !== StatusTask.NOT_APPROVED
                                                                                    ? <i class="fa fa-times-circle-o size pointer icon-margin icon-check" onClick={() => handleConfirmTask(task)} title={lang["updatestatus"]}></i>
                                                                                    : <i class="fa fa-times-circle-o size pointer icon-margin icon-check" style={{ pointerEvents: "none", opacity: 0.4 }} title={lang["updatestatus"]}></i>)
                                                                                : (task.task_status === StatusTask.COMPLETE.value
                                                                                    ? <i class="fa fa-check-circle-o size pointer icon-margin icon-close" onClick={() => handleConfirmTask(task)} title={lang["updatestatus"]}></i>
                                                                                    : <i class="fa fa-check-circle-o size pointer icon-margin icon-close" style={{ pointerEvents: "none", opacity: 0.4 }} title={lang["updatestatus"]}></i>)
                                                                            }
                                                                            <i class="fa fa-trash-o size pointer icon-margin icon-delete" onClick={() => handleDeleteTask(task)} title={lang["delete"]}></i>
                                                                        </>
                                                                    }
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <p>{lang["show"]} {indexOfFirstMemberTask + 1}-{Math.min(indexOfLastMemberTask, tasks.length)} {lang["of"]} {tasks.length} {lang["results"]}</p>
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
                                                    <option value="">Chọn</option>
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
                                                <label>{lang["projectmember"]}</label>
                                                <div class="user-checkbox-container">
                                                    {projectdetail.members?.map((user, index) => (
                                                        <div key={index} class="user-checkbox-item">
                                                            <label>
                                                                <input
                                                                    type="checkbox" class="mr-1"
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
                                                                {user.fullname}
                                                            </label>


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
                    {/* Update Progress */}

                    <div class={`modal ${showModal ? 'show' : ''}`} id="editTask">
                        <div class="modal-dialog modal-dialog-center">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h4 class="modal-title">{lang["edittask"]}</h4>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <div class="row">
                                            <div class="form-group col-lg-12">
                                                <label>{lang["taskname"]} <span className='red_star'>*</span></label>
                                                <input type="text" class="form-control" value={updateTaskinfo.task_name} onChange={
                                                    (e) => { setUpdateTask({ ...updateTaskinfo, task_name: e.target.value }) }
                                                } placeholder={lang["p.taskname"]} />
                                            </div>

                                            {/* <div class="form-group col-lg-6 ">
                                                <label>{lang["task_priority"]} <span className='red_star'>*</span></label>
                                                <select className="form-control" value={updateTaskinfo.task_priority} onChange={(e) => { setUpdateTask({ ...updateTaskinfo, task_priority: e.target.value }) }}>
                                                    <option value="">Chọn</option>
                                                    {statusPriority.map((status, index) => {
                                                        return (
                                                            <option key={index} value={status.value}>{status.label}</option>
                                                        );
                                                    })}
                                                </select>

                                            </div> */}
                                            {/* <div class="form-group col-lg-6 ">
                                                <label>{lang["taskstatus"]} <span className='red_star'>*</span></label>
                                                <select className="form-control" value={updateTaskinfo.task_status} onChange={(e) => { setUpdateTask({ ...updateTaskinfo, task_status: e.target.value }) }}>
                                                    <option value="">Chọn</option>
                                                    {statusTaskView.map((status, index) => {
                                                        return (
                                                            <option key={index} value={status.value}>{lang[`${status.label}`]}</option>
                                                        );
                                                    })}
                                                </select>

                                            </div> */}

                                            <div class="form-group col-lg-12">
                                                <label>{lang["projectdescripton"]}</label>
                                                <textarea rows="4" type="text" class="form-control" value={updateTaskinfo.task_description} onChange={
                                                    (e) => { setUpdateTask({ ...updateTaskinfo, task_description: e.target.value }) }
                                                } placeholder={lang["p.description"]} />
                                            </div>
                                            <div class="form-group col-lg-12">
                                                <label><b>Thành viên</b></label>
                                                <span className="d-block"> {
                                                    updateTaskinfo.members && updateTaskinfo.members.length > 0 ?
                                                        updateTaskinfo.members.slice(0, 3).map(member => (
                                                            <img
                                                                class="img-responsive circle-image-cus"
                                                                src={proxy + member.avatar}
                                                                alt={member.username}
                                                            />
                                                        )) :
                                                        <p>{lang["projectempty"]} </p>
                                                }
                                                    {
                                                        updateTaskinfo.members?.length > 3 &&
                                                        <div className="extra-images-cus" style={{ backgroundImage: `url(${proxy + updateTaskinfo.members[3].avatar})` }}>
                                                            <span>+{updateTaskinfo.members.length - 3}</span>
                                                        </div>
                                                    }</span>
                                            </div>
                                            {/* <div class="form-group col-lg-12">
                                                <label>Quản lý</label>
                                                <div class="user-checkbox-container">
                                                    {updateTaskinfo.members?.map((user, index) => (
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
                                            </div> */}
                                        </div>
                                    </form>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" onClick={updateTask} class="btn btn-success ">{lang["btn.update"]}</button>
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
                                                <label><b>{lang["taskname"]}</b></label>
                                                <span className="d-block"> {taskDetail.task_name} </span>
                                            </div>
                                            <div class="form-group col-lg-4">
                                                <label><b>{lang["taskstatus"]}</b></label>

                                                <div>
                                                    <span className="status-label" style={{
                                                        backgroundColor: (statusTaskView.find((s) => s.value === taskDetail.task_status) || {}).color,
                                                        whiteSpace: "nowrap"
                                                    }}>
                                                        {lang[`${(statusTaskView.find((s) => s.value === taskDetail.task_status) || {}).label || 'Trạng thái không xác định'}`]}
                                                    </span>
                                                </div>
                                            </div>
                                            <div class="form-group col-lg-4">
                                                <label><b>Ngày tạo</b></label>
                                                <span className="d-block"> {taskDetail.create_at} </span>
                                            </div>
                                            <div class="form-group col-lg-4">
                                                <label><b>Người tạo</b></label>
                                                <span className="d-block"> {taskDetail.create_by?.fullname} </span>
                                            </div>
                                            <div class="form-group col-lg-4">
                                                <label><b>Mức độ ưu tiên</b></label>
                                                <span className="d-block"> {taskDetail.task_priority} </span>
                                            </div>
                                            <div class="form-group col-lg-4">
                                                <label><b>Xác nhận</b></label>
                                                <td class="font-weight-bold" style={{ color: getStatusColor(taskDetail.task_approve ? 1 : 0), textAlign: "center" }}>
                                                    {getStatusLabel(taskDetail.task_approve ? 1 : 0)}
                                                </td>

                                            </div>
                                            <div class="form-group col-lg-4">
                                                <label><b>Thành viên</b></label>
                                                <span className="d-block"> {
                                                    taskDetail.members && taskDetail.members.length > 0 ?
                                                        taskDetail.members.slice(0, 3).map(member => (
                                                            <img
                                                                class="img-responsive circle-image-cus"
                                                                src={proxy + member.avatar}
                                                                alt={member.username}
                                                            />
                                                        )) :
                                                        <p>{lang["projectempty"]} </p>
                                                }
                                                    {
                                                        taskDetail.members?.length > 3 &&
                                                        <div className="extra-images-cus" style={{ backgroundImage: `url(${proxy + taskDetail.members[3].avatar})` }}>
                                                            <span>+{taskDetail.members.length - 3}</span>
                                                        </div>
                                                    }</span>
                                            </div>
                                            <div class="form-group col-lg-12">
                                                <label><b>{lang["description"]}</b></label>
                                                <span className="d-block"> {taskDetail.task_description} </span>
                                            </div>
                                            <div class="form-group col-lg-12">
                                                <label><b>Lịch sử</b></label>
                                                <div class="table-responsive">
                                                    {/* {
                                                        currentMembersViewDetailTask && currentMembersViewDetailTask.length > 0 ? (
                                                            <>
                                                                <table class="table table-striped">
                                                                    <thead>
                                                                        <tr>
                                                                            <th class="font-weight-bold" scope="col">{lang["log.no"]}</th>
                                                                            <th class="font-weight-bold" scope="col">{lang["task"]}</th>
                                                                            <th class="font-weight-bold" scope="col">Giá trị cũ</th>
                                                                            <th class="font-weight-bold" scope="col">Giá trị mới</th>
                                                                            <th class="font-weight-bold" scope="col">Thời gian thay đổi</th>
                                                                            <th class="font-weight-bold" scope="col">Người thay đổi</th>

                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {currentMembersViewDetailTask.map((task, index) => (
                                                                            <tr key={task.id}>
                                                                                <td scope="row">{index + 1}</td>
                                                                                <td scope="row">
                                                                                    {task.modified_what === "approve" ? lang["confirm"] :
                                                                                        task.modified_what === "info" ? lang["log.information"] :
                                                                                            task.modified_what === "status" ? lang["taskstatus"] :
                                                                                                task.modified_what}
                                                                                </td>
                                                                                <td scope="row">
                                                                                    {task.old_value === "true" ? "Đã duyệt" :
                                                                                        task.old_value === "false" ? "Chờ duyệt" :
                                                                                            task.old_value}
                                                                                </td>
                                                                                <td scope="row">
                                                                                    {task.old_value === "true" ? "Chờ duyệt" :
                                                                                        task.old_value === "false" ? "Đã duyệt" :
                                                                                            task.old_value}</td>
                                                                                <td scope="row">{task.modified_at}</td>
                                                                                <td scope="row">
                                                                                    <img class="img-responsive circle-image-cus" src={proxy + task.modified_by?.avatar} />
                                                                                    {task.modified_by?.fullname}</td>

                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <p>{lang["show"]} {indexOfFirstMemberViewDetailTask + 1}-{Math.min(indexOfLastMemberViewDetailTask, taskDetail.history?.length)} {lang["of"]} {taskDetail.history?.length} {lang["results"]}</p>
                                                                    <nav aria-label="Page navigation example">
                                                                        <ul className="pagination mb-0">
                                                                            <li className={`page-item ${currentViewDetailTask === 1 ? 'disabled' : ''}`}>
                                                                                <button className="page-link" onClick={(e) => { e.stopPropagation(); paginateViewDetailTask(currentViewDetailTask - 1); }}>&laquo;</button>
                                                                            </li>
                                                                            {Array(totalPagesTask).fill().map((_, index) => (
                                                                                <li className={`page-item ${currentViewDetailTask === index + 1 ? 'active' : ''}`}>
                                                                                    <button className="page-link" onClick={(e) => { e.stopPropagation(); paginateViewDetailTask(index + 1); }}>{index + 1}</button>
                                                                                </li>
                                                                            ))}
                                                                            <li className={`page-item ${currentViewDetailTask === totalViewDetailTask ? 'disabled' : ''}`}>
                                                                                <button className="page-link" onClick={(e) => { e.stopPropagation(); paginateViewDetailTask(currentViewDetailTask + 1); }}>&raquo;</button>
                                                                            </li>
                                                                        </ul>
                                                                    </nav>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div class="list_cont ">
                                                                <p>Chưa có lịch sử</p>
                                                            </div>
                                                        )
                                                    } */}
                                                    {
                                                        taskDetail.history && taskDetail.history.length > 0 ? (
                                                            <>
                                                                <table class="table table-striped table-rounded table-scrollable ">
                                                                    <thead>
                                                                        <tr>
                                                                            <th class="font-weight-bold" scope="col">{lang["log.no"]}</th>
                                                                            <th class="font-weight-bold" scope="col">{lang["task"]}</th>
                                                                            <th class="font-weight-bold" scope="col">Giá trị cũ</th>
                                                                            <th class="font-weight-bold" scope="col">Giá trị mới</th>
                                                                            <th class="font-weight-bold" scope="col">Thời gian thay đổi</th>
                                                                            <th class="font-weight-bold" scope="col">Người thay đổi</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {taskDetail.history.reverse().map((task, index) => (
                                                                            <tr key={task.id}>
                                                                                <td scope="row">{index + 1}</td>
                                                                                <td scope="row">
                                                                                    {task.modified_what === "approve" ? lang["confirm"] :
                                                                                        task.modified_what === "info" ? lang["log.information"] :
                                                                                            task.modified_what === "status" ? lang["taskstatus"] :
                                                                                                task.modified_what}
                                                                                </td>
                                                                                <td scope="row">
                                                                                    {task.old_value === "true" ? "Đã duyệt" :
                                                                                        task.old_value === "false" ? "Chờ duyệt" :
                                                                                            task.old_value}
                                                                                </td>
                                                                                <td scope="row">
                                                                                    {task.old_value === "true" ? "Chờ duyệt" :
                                                                                        task.old_value === "false" ? "Đã duyệt" :
                                                                                            task.old_value}
                                                                                </td>
                                                                                <td scope="row">{task.modified_at}</td>
                                                                                <td scope="row">
                                                                                    <img class="img-responsive circle-image-cus" src={proxy + task.modified_by?.avatar} />
                                                                                    {task.modified_by?.fullname}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </>
                                                        ) : (
                                                            <div class="list_cont ">
                                                                <p>Chưa có lịch sử</p>
                                                            </div>
                                                        )
                                                    }
                                                </div>

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
                    {/* View Description Project */}
                    <div class={`modal ${showModal ? 'show' : ''}`} id="viewDescription">
                        <div class="modal-dialog modal-dialog-center">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h4 class="modal-title">{lang["description"]}</h4>
                                    <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form>
                                        <div class="row">
                                            <div class="form-group col-lg-12">

                                                <span className="d-block" style={{ textAlign: "justify" }}>
                                                    {projectdetail.project_description}
                                                </span>

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
                {/* Website info */}
                <div class="row">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head">
                                <div class="heading1 margin_0 ">
                                    <h5>{lang["project.deploy"]}</h5>
                                </div>
                            </div>
                            <div class="table_section padding_infor_info">
                                <div class="row column1">
                                    <div class="col-md-6 col-lg-4">
                                        <div class="full counter_section margin_bottom_30 box-table">
                                            <div class="couter_icon">
                                                <div>
                                                    <i class="fa fa-table yellow_color"></i>
                                                </div>
                                            </div>
                                            <div class="counter_no">
                                                <div>
                                                    <p class="total_no">{tables.tables?.length || 0}</p>
                                                    <p class="head_couter">Tables</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6 col-lg-4">
                                        <div class="full counter_section margin_bottom_30 box-api">
                                            <div class="couter_icon">
                                                <div>
                                                    <i class="fa fa-cog blue1_color"></i>
                                                </div>
                                            </div>
                                            <div class="counter_no">
                                                <div>
                                                    <p class="total_no">{apis.length || 0}</p>
                                                    <p class="head_couter">API</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6 col-lg-4">
                                        <div class="full counter_section margin_bottom_30 box-ui " >
                                            <div class="couter_icon">
                                                <div>
                                                    <i class="fa fa-newspaper-o green_color"></i>
                                                </div>
                                            </div>
                                            <div class="counter_no">
                                                <div>
                                                    <p class="total_no">1</p>
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
                                            <button type="button" class="btn btn-primary custom-buttonadd ml-auto" onClick={() => tablesManager()}>
                                                <i class="fa fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="table-responsive">
                                            {
                                                currentTable && currentTable.length > 0 ? (
                                                    <>
                                                        <table class="table table-striped">
                                                            <thead>
                                                                <tr>
                                                                    <th class="font-weight-bold" scope="col">{lang["log.no"]}</th>
                                                                    <th class="font-weight-bold" scope="col">Tên bảng</th>
                                                                    <th class="font-weight-bold align-center" scope="col">Ngày tạo</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {currentTable.map((table, index) => (
                                                                    <tr key={table.id}>
                                                                        <td scope="row">{index + 1}</td>
                                                                        <td style={{ maxWidth: "100px" }}>
                                                                            <div style={{
                                                                                width: "100%",
                                                                                overflow: "hidden",
                                                                                textOverflow: "ellipsis",
                                                                                whiteSpace: "nowrap"
                                                                            }}>
                                                                                {table.table_name}
                                                                            </div>
                                                                        </td>

                                                                        <td>{table.create_at}</td>

                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>

                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <p>{lang["show"]} {indexOfFirstTable + 1}-{Math.min(indexOfLastTable, tables.tables.length)} {lang["of"]} {tables.tables.length} {lang["results"]}</p>
                                                            <nav aria-label="Page navigation example">
                                                                <ul className="pagination mb-0">
                                                                    <li className={`page-item ${currentPageTable === 1 ? 'disabled' : ''}`}>
                                                                        <button className="page-link" onClick={() => paginateTable(currentPageTable - 1)}>
                                                                            &laquo;
                                                                        </button>
                                                                    </li>
                                                                    {Array(totalPagesTable).fill().map((_, index) => (
                                                                        <li className={`page-item ${currentPageTable === index + 1 ? 'active' : ''}`}>
                                                                            <button className="page-link" onClick={() => paginateTable(index + 1)}>
                                                                                {index + 1}
                                                                            </button>
                                                                        </li>
                                                                    ))}
                                                                    <li className={`page-item ${currentPageTable === totalPagesTable ? 'disabled' : ''}`}>
                                                                        <button className="page-link" onClick={() => paginateTable(currentPageTable + 1)}>
                                                                            &raquo;
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </nav>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div class="list_cont ">
                                                        <p>Chưa có bảng</p>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>
                                    <div class="col-md-4 col-lg-4">
                                        <div class="d-flex align-items-center mb-1">
                                            <p class="font-weight-bold">Danh sách API </p>
                                            <button type="button" class="btn btn-primary custom-buttonadd ml-auto" onClick={() => apisManager()}>

                                                <i class="fa fa-plus"></i>
                                            </button>
                                        </div>
                                        <div class="table-responsive">
                                            {
                                                currentApi && currentApi.length > 0 ? (
                                                    <>
                                                        <table class="table table-striped">
                                                            <thead>
                                                                <tr>
                                                                    <th class="font-weight-bold" scope="col">{lang["log.no"]}</th>
                                                                    <th class="font-weight-bold" scope="col">Tên api</th>
                                                                    <th class="font-weight-bold align-center" scope="col">Ngày tạo</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {currentApi.map((api, index) => (
                                                                    <tr key={api.id}>
                                                                        <td scope="row">{index + 1}</td>
                                                                        <td style={{ maxWidth: "100px" }}>
                                                                            <div style={{
                                                                                width: "100%",
                                                                                overflow: "hidden",
                                                                                textOverflow: "ellipsis",
                                                                                whiteSpace: "nowrap"
                                                                            }}>
                                                                                {api.api_name}
                                                                            </div>
                                                                        </td>

                                                                        <td>{api.create_at}</td>

                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <p>{lang["show"]} {indexOfFirstApi + 1}-{Math.min(indexOfLastApi, apis.length)} {lang["of"]} {apis.length} {lang["results"]}</p>
                                                            <nav aria-label="Page navigation example">
                                                                <ul className="pagination mb-0">
                                                                    <li className={`page-item ${currentPageApi === 1 ? 'disabled' : ''}`}>
                                                                        <button className="page-link" onClick={() => paginateApi(currentPageApi - 1)}>
                                                                            &laquo;
                                                                        </button>
                                                                    </li>
                                                                    {Array(totalPagesApi).fill().map((_, index) => (
                                                                        <li className={`page-item ${currentPageApi === index + 1 ? 'active' : ''}`}>
                                                                            <button className="page-link" onClick={() => paginateApi(index + 1)}>
                                                                                {index + 1}
                                                                            </button>
                                                                        </li>
                                                                    ))}
                                                                    <li className={`page-item ${currentPageApi === totalPagesApi ? 'disabled' : ''}`}>
                                                                        <button className="page-link" onClick={() => paginateApi(currentPageApi + 1)}>
                                                                            &raquo;
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </nav>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div class="list_cont ">
                                                        <p>Chưa có bảng</p>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>
                                    
                                    <div class="col-md-4 col-lg-4">
                                        <div class="d-flex align-items-center mb-1">
                                            <p class="font-weight-bold">Danh sách UI </p>
                                            <button type="button" class="btn btn-primary custom-buttonadd ml-auto"  onClick={() => uisManager()} data-toggle="modal" data-target="#">
                                                <i class="fa fa-plus"></i>
                                            </button>
                                        </div>
                                        <table class="table table-striped">
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
            </div >
        </div >
    )
}

