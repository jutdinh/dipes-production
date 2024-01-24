export default (state, action) => {

    switch (action.type) {

        case "hellowordl":
            break;
        case "Privilege":
            return Privilege(state, action);
            break;
        default:
            return state;
    }
}


const Privilege = (state, action) => {
console.log(33, action)
    const { dataCheck } = action.payload;
    return {
        ...state,
        dataCheck: dataCheck
    };
}
