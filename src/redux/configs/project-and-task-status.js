const projectStatuses = [
    { id: 0, color: "#ff00ff", value:'INITIALIZING' },
    { id: 2, color: "#0000ff", value:'PROGRESS' },
    { id: 3, color: "#3b1260", value:'RELEASE' },
    { id: 5, color: "#00ff00", value:'COMPLETED' },   
    { id: 7, color: "#d11200", value:'SUSPEND' },
]

const taskStatuses = [
    { id: 0, color: "#ff00ff", status_name: 'Khởi tạo'},
    { id: 2, color: "#0000ff", status_name: 'Tiến hành'},
    { id: 5, color: "#00ff00", status_name: 'Hoàn thành'},
    { id: 7, color: "#d11200", status_name: 'Tạm dừng'},
]

export{
    projectStatuses,
    taskStatuses
}