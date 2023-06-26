import { useEffect } from "react"
export default () => {
    useEffect(() => {     
        localStorage.removeItem( '_token' )
        console.log( localStorage.getItem("_token") )
        window.location = "/login"
    }, [])
    return null
}