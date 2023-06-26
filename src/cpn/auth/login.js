import { useState, useEffect } from 'react';
import { useSelector } from "react-redux"
import Swal from 'sweetalert2';

export default () => {
    const [auth, setAuth] = useState({})
    const { lang, proxy } = useSelector(state => state);
    const [rememberMe, setRememberMe] = useState(false);
    const [authError, setAuthError] = useState(null);
    const enterTriggered = (e) => {
        if (e.keyCode === 13) {
            submit(e)
        }
    }

    useEffect(() => {
        const storedAccountString = localStorage.getItem("username");
        const storedPwdString = localStorage.getItem("password");
        const storedRememberMe = localStorage.getItem("remember_me") === "true";

        if (storedRememberMe && storedAccountString && storedPwdString) {
            setAuth({
                username: storedAccountString,
                password: storedPwdString,
            });
            setRememberMe(storedRememberMe);
        }

    }, []);

    const submit = (e) => {
        e.preventDefault()
        fetch(`${proxy}/auth/login`, {
            method: "post",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({ account: auth })
        }).then(res => res.json()).then((resp) => {
            const { success, content, data } = resp;
            console.log(resp)

            if (success) {
                if (rememberMe) {
                    localStorage.setItem("username", auth.username);
                    localStorage.setItem("password", auth.password);
                    localStorage.setItem("remember_me", rememberMe);
                } else {
                    localStorage.removeItem("username");
                    localStorage.removeItem("password");
                    localStorage.removeItem("remember_me");
                }
                // localStorage.setItem('role', data.data.role)
                // localStorage.setItem('username', data.data.username)
                localStorage.setItem('_token', data.token)

                // localStorage.setItem('fullname', data.data.fullname)
                const stringifiedUser = JSON.stringify(data.data)
                localStorage.setItem('user', stringifiedUser);
                // Swal.fire({
                //     title: "Đăng nhập thành công!",
                //     text: content,
                //     icon: "success",
                //     showConfirmButton: false,
                //     timer: 1500,
                // }).then(function () {

                //      window.location = "/projects";
                // });
                window.location = "/";

            } else {
                setAuthError(content);
               
            }
        })
    }
    return (
        <div classNameName="inner_page login">
            <div className="full_container">
                <div className="container">
                    <div className="center verticle_center full_height">
                        <div className="login_section">
                            <div className="logo_login">
                                <div className="center">
                                    <img width="210" src="images/logo/logo.png" alt="#" />
                                </div>
                            </div>
                            <div className="login_form">
                                <form>
                                    <fieldset>
                                        <div className="field">

                                            <div class="row">
                                                <div class="col-md-4">
                                                   
                                                </div>
                                               
                                                <div class="col-md-8">
                                                {authError && <span class="error-message error-login">{authError}</span>}
                                                    
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-4">
                                                    <label className="label_field">{lang["account"]}</label>
                                                </div>
                                               
                                                <div class="col-md-8">
                                               
                                                    <input type="text" onKeyUp={enterTriggered}
                                                        onChange={
                                                            (e) => {
                                                                setAuthError(null);
                                                                setAuth({ ...auth, username: e.target.value });
                                                            }
                                                        } value={auth.username || ""} placeholder={lang["account"]} />
                                                 
                                                   
                                                </div>
                                            </div>



                                        </div>
                                        
                                        <div className="field">
                                            <label className="label_field">{lang["password"]}</label>
                                            <input type="password" onKeyUp={enterTriggered} onChange={(e) => { setAuth({ ...auth, password: e.target.value }) }} value={auth.password || ""} placeholder={lang["password"]} />
                                        </div>
                                        <div className="field">
                                            <label className="label_field hidden">hidden label</label>
                                            <label className="form-check-label">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe} // Liên kết trạng thái rememberMe với thuộc tính checked
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="form-check-input"
                                                />
                                                {lang["remember me"]}</label>
                                            <a className="forgot" href="">{lang["forgot password"]}</a>
                                        </div>
                                        <div className="field margin_0">
                                            <label className="label_field hidden">hidden label</label>
                                            <button onClick={submit} className="main_bt">{lang["signin"]}</button>
                                        </div>
                                    </fieldset>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}