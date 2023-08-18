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
    const stringifiedUI = JSON.stringify( pages )
    localStorage.setItem( "ui", stringifiedUI )
    return { ...state, pages }
} 