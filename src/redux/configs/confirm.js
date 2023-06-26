const BRANCH = "alert";

class Confirm{
    constructor( dispatch ){
        this.dispatch = dispatch
    }

    askYesNo = ( label, message, func ) => {
        this.dispatch({
            branch: BRANCH,
            type: "confirmFire",
            payload: {
                type: "ask_yes_no",
                label,
                message,
                func
            }
        })
    }

    askForString = ( label, message, func, defaultValue="" ) => {
        this.dispatch({
            branch: BRANCH,
            type: "confirmFire",
            payload: {
                type: "ask_for_string",
                label,
                message,
                func,
                defaultValue
            }
        })
    }

    askForSelection = ( label, message, func, collection ) => {
        this.dispatch({
            branch: BRANCH,
            type: "confirmFire",
            payload: {
                type: "ask_for_selection",
                label,
                message,
                func,
                collection
            }
        })
    }

    askForLongSelection = ( label, message, func, collection ) => {
        this.dispatch({
            branch: BRANCH,
            type: "confirmFire",
            payload: {
                type: "ask_for_long_selection",
                label,
                message,
                func,
                collection
            }
        })
    }


    closeConfirm = () => {
        this.dispatch({
            branch: BRANCH,
            type: "alertOut",
        })
    }

}

export default Confirm
