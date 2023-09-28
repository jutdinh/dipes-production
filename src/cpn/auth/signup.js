import { color } from 'echarts';
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
        fetch(`${proxy()}/auth/login`, {
            method: "post",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({ account: auth })
        }).then(res => res.json()).then((resp) => {
            const { success, content, data } = resp;
            const credential = data
            // console.log(resp)

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
                            if (credential.data.role === "ad" || credential.data.role === "uad") {
                                if (credential.imported) {
                                    window.location = "/users";
                                }
                                else {
                                    window.location = "/";
                                }

                            } else if (credential.data.role === "pd") {
                                window.location = "/sitemap";
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
                   
                    <div class="center verticle_center full_height">
                        <div class="login_section">
                            <div class="logo_login">
                                <div class="center">
                                <h2 style={{ color: "fffff" }}>Sign Up</h2>
                                </div>
                            </div>
                            <div class="login_form">
                                <form>
                                    <fieldset>
                                    <div class="field">
                                            <label class="label_field">Họ tên</label>
                                            <input type="email" name="email" placeholder="Nhập họ tên" />
                                        </div>
                                        <div class="field">
                                            <label class="label_field">Email</label>
                                            <input type="email" name="email" placeholder="E-mail" />
                                        </div>
                                        <div class="field">
                                            <label class="label_field">Tên đăng nhập</label>
                                            <input type="email" name="email" placeholder="Nhập tên đăng nhập" />
                                        </div>
                                        <div class="field">
                                            <label class="label_field">Mật khẩu</label>
                                            <input type="password" name="password" placeholder="Nhập mật khẩu" />
                                        </div>
                                        <div class="field">
                                            <label class="label_field">Nhập lại mật khẩu</label>
                                            <input type="password" name="password" placeholder="Nhập lại mật khẩu" />
                                        </div>
                                        
                                        <div class="field margin_0">
                                            <label class="label_field hidden">hidden label</label>
                                            <button class="main_bt">Đăng ký</button>
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