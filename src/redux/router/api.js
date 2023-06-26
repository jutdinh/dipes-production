export default (state, action) => {
    switch (action.type) {

        case "hellowordl":
            break;
        case "addFieldParam":
            return addFieldParam(state, action);
            break;
       
        default:
            return state;
    }
}



const addFieldParam = (state, action) => {

    const { field } = action.payload; 
    return { ...state, tempFieldParam : field }
}
