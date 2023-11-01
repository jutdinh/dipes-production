import { useState, useEffect } from 'react';
import { useSelector } from "react-redux"
import Swal from 'sweetalert2';

export default () => {
    const { lang, proxy, socket, pages } = useSelector(state => state);

    const [auth, setAuth] = useState({})
    const [rememberMe, setRememberMe] = useState(false);
    const [authError, setAuthError] = useState(null);
    const md5 = require('md5');
    // const password = '123@#123';
    // const hashedPassword = md5(password);
    // console.log(`Password MD5: ${hashedPassword}`);


    const hashedPassword = md5(auth.password|| '');
    
    
    const enterTriggered = (e) => {
        if (e.keyCode === 13) {
            submit(e)
        }
    }
    const check = pages[0]?.url

    const [statusActive, setStatusActive] = useState(false);

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
       
        const requestBody = {
            account: {
                username: auth.username,
                password: auth.password
            }

        }
        // console.log(requestBody)
        fetch(`${proxy()}/auth/login`, {
            method: "post",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(requestBody)
        }).then(res => res.json()).then((resp) => {
            const { success, content, data } = resp;
            const credential = data
            // console.log(resp)
            if (success) {
                if (rememberMe) {
                    localStorage.setItem("username", auth.username);
                    localStorage.setItem("password_hash", hashedPassword);
                    localStorage.setItem("password", auth.password);
                    localStorage.setItem("remember_me", rememberMe);
                } else {
                    localStorage.removeItem("username");
                    localStorage.removeItem("password_hash");
                    localStorage.removeItem("password");
                    localStorage.removeItem("remember_me");
                }
                // localStorage.setItem('role', data.data.role)
                // localStorage.setItem('username', data.data.username)
                localStorage.setItem('_token', data.token)

                // localStorage.setItem('fullname', data.data.fullname)
                const stringifiedUser = JSON.stringify(data.data)
                localStorage.setItem('user', stringifiedUser);

                fetch(`${proxy()}/auth/activation/check`, {
                    headers: {
                        Authorization: data.token
                    }
                })
                    .then(res => res.json())
                    .then(resp => {
                        const { success, data, activated, status, content } = resp;
                        // console.log(resp)
                        if (activated) {
                            setStatusActive(true)
                        } else {
                            setStatusActive(false)
                            window.location.href = `/active`;
                        }
                        if (activated) {
                            socket.emit("/dipe-production-user-login", { username: auth.username })

                            if (credential.data.role === "ad" || credential.data.role === "uad") {
                                if (credential.imported) {
                                    window.location = "/users";
                                }
                                else {
                                    window.location = "/";
                                }

                            } else if (credential.data.role === "pd") {
                                if (check !== "") {
                                    window.location = `/page${check}`;
                                } else {
                                    window.location = `/page-not-found-404`;
                                }

                            }
                        } else {
                            if (credential.data.role === "pd" || credential.data.role === "ad" || credential.data.role === "uad") {
                                window.location = "/active";
                            }
                            else {
                                window.location = "/diagram_db";
                            }

                        }
                    })
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

                                        </div>
                                        <div className="field">

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
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="form-check-input"
                                                />
                                                {lang["remember me"]}</label>
                                            {/* <a className="forgot" href="">{lang["forgot password"]}</a> */}
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