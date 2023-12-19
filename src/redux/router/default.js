export default (state, action) => {
    switch (action.type) {

        case "setAuthInfor":
            return setAuthInfor(state, action);
            break;
        case "setProjects":
            return setProjects(state, action);
        default:
            return state;
        case "setUIPages":
            return setUIPages(state, action);
            break;
        case "changeSocketURL":
            return changeSocketURL(state, action)
            break;
        case "setSidebar":
            return setSidebar(state, action)
            break;
    }
}


const setAuthInfor = (state, action) => {
    const currentAccount = action.payload.user;

    return { ...state, auth: currentAccount }
}

const setProjects = (state, action) => {
    const { projects } = action.payload;
    return { ...state, projects }
}

const setUIPages = (state, action) => {
    const { pages } = action.payload;
    const stringifiedUI = JSON.stringify(pages)
    localStorage.setItem("ui", stringifiedUI)
    return { ...state, pages }
}


const changeSocketURL = (state, action) => {
    const { socket } = state
    socket.io.uri = action.payload
    socket.disconnect().connect();
    state.socket = socket
    return { ...state }
}

const setSidebar = (state, action) => {
 
    const sidebar = action.payload;
    // console.log(sidebar.sidebar)
    return { ...state, sidebar }
}