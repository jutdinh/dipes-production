const initialState = {
    stateAprove: false
};

export default (state = initialState, action) => {
    switch (action.type) {

        case "hellowordl":
            break;
        case "checkState":
            return checkState(state, action);
            break;
        case "Privilege":
            return Privilege(state, action);
            break;
        default:
            return state;
    }
}


const checkState = (state, action) => {

    const { success } = action.payload;
    return {
        ...state,
        stateAprove: success
    };
}


const Privilege = (state, action) => {
console.log(33, state, action)
    const { dataCheck } = action.payload;
    return {
        ...state,
        dataCheck: dataCheck
    };
}
