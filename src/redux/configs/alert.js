const BRANCH = "alert";

class Alert{
    constructor( dispatch ){
        this.dispatch = dispatch
    }

    success = ( lb="", msg="" ) => {
        let message = msg;
        let label = lb;
        if( !label ){
            label = "Thành công!"
        }
        this.dispatch({
            branch: BRANCH,
            type: "alertFire",
            payload: {
                type: "success",
                label,
                message
            }
        })
    }

    warning = ( lb="", msg="" ) => {
        let message = msg;
        let label = lb;
        if( !label ){
            label = "Cảnh báo!"
        }
        this.dispatch({
            branch: BRANCH,
            type: "alertFire",
            payload: {
                type: "warning",
                label,
                message
            }
        })
    }

    failure = ( lb="", msg="" ) => {
        let message = msg;
        let label = lb;
        if( !label ){
            label = "Lỗi!"
        }
                
        this.dispatch({
            branch: BRANCH,
            type: "alertFire",
            payload: {
                type: "failure",
                label,
                message
            }
        })
    }

    closeAlert = () => {
        this.dispatch({
            branch: BRANCH,
            type: "alertOut",
        })
    }

}

export default Alert
