export default (state, action) => {
    switch (action.type) {

        case "setAuthInfor":
            return setAuthInfor(state, action);
            break;
        case "setProjects":
            return setProjects(state, action);
        default:
            return state;
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