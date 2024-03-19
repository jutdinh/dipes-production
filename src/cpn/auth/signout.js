import { useEffect } from "react"
import { useSelector } from "react-redux"
export default () => {
    const { socket, auth } = useSelector(state => state)
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('ex');

    

    useEffect(() => {
        socket.emit("/dipe-production-user-logout", { username: auth.username })

        localStorage.removeItem('_token')
        localStorage.removeItem("password_hash");
        localStorage.removeItem("user");
        localStorage.setItem("user", JSON.stringify({}));
        localStorage.removeItem("selectedCaseDetail")
        // console.log( localStorage.getItem("_token") )

        if(myParam!== null)
        {
            window.location = `/login?ex=${myParam}`
        }else{
            window.location = `/login`
        }   
    }, [])
    return null
}