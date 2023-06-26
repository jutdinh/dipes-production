

export const StatusEnum = Object.freeze({
    
    INITIALIZATION: { id: 0, label: "initialization", value: 1, color: "#1ed085" },
    IMPLEMENT: { id: 1, label: "implement", value: 2, color: "#8884d8" },
    DEPLOY: { id: 2, label: "deploy", value: 3, color: "#ffc658" },
    COMPLETE: { id: 3, label: "complete", value: 4, color: "#ff8042" },
    PAUSE: { id: 4, label: "pause", value: 5, color: "#FF0000" }
});
export const StatusTask = Object.freeze({
    
    INITIALIZATION: { id: 0, label: "initialization", value: 1, color: "#1ed085" },
    IMPLEMENT: { id: 1, label: "implement", value: 2, color: "#8884d8" },
    COMPLETE: { id: 2, label: "complete", value: 3, color: "#ff8028" },
    PAUSE: { id: 3, label: "pause", value: 4, color: "#FF0000" }
});

export const StatusAprove = Object.freeze({
    APROVE: { id: 0, label: "Chờ duyệt", value: 0, color: "#1ed085" },
    NOTAPROVE: { id: 1, label: "Đã duyệt", value: 1, color: "#181dd4" },
});

