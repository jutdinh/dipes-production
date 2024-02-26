import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Swal from "sweetalert2";

import { Home } from "./dashboard";
import { Import } from "./import-data";
import { Navigation, PageNotFound } from "./navigations";
import { Login, SignUp, SignOut, ChangePassword } from "./auth";
import { Settings } from "./settings";
import { ListUser, Profile, Permission, PermissionDetail } from "./users";
import { Logs } from "./logs";
import { Version } from "./version";
import { Tables, Field, UpdateField } from "./tables";
import { Diagram } from "./diagram";
import Active_Key from "./active_key/active";
import {
  Fetch,
  InputPost,
  InputPut,
  ImportData,
  Detail,
  Fecth_Table_Param,
} from "./page";
import { Active_Helpdesk, Table_Key, Chart_HelpDesk } from "./page/step";
import "../css/index.scss";
import { SiteMap } from "./site-map";
import Layout_Detail from "./page/layout/layout_detail";
import FeedBack from "./page/layout_feedback/feedback";

function App() {
  const dispatch = useDispatch();
  const __token = localStorage.getItem("_token");
  const [_token, setToken] = useState(__token);

  const { lang, proxy, auth, pages, socket, functions } = useSelector(
    (state) => state
  );

  const defaultValue = {
    username: "",
    fullname: "",
    role: "",
    email: "",
    phone: "",
    avatar: "",
  };
  // console.log(_token)
  async function updateToken() {
    try {
      // console.log(46, _token)
      const newToken = await functions.refreshToken(proxy(), _token);
      if (newToken) {
        // Lưu trữ token mới
        // localStorage.removeItem('_token')
        setToken(newToken);
        localStorage.setItem("_token", newToken);

        // console.log(50, newToken);
        // Cập nhật state hoặc context nếu cần
        // updateTokenState(newToken);

        // Optional: Kiểm tra ngày hết hạn của token mới
        const expirationDate = functions.getTokenExpirationDate(newToken);
        console.log("Ngày hết hạn của token mới:", expirationDate);
      } else {
        // console.error("Không nhận được token mới");
      }
    } catch (error) {
      // console.error("Error refreshing token:", error);
    }
  }

  useEffect(() => {
    // Kiểm tra và làm mới token mỗi 30 phút
    const intervalId = setInterval(updateToken, 1800000); // 1800000 ms = 30 phút
    // return () => clearInterval(intervalId);
  }, [_token]);

  // useEffect(() => {
  //   const token = localStorage.getItem("_token") ? localStorage.getItem("_token") : ""
  //   console.log("TOKEN CHANGE: ", token.slice(token.length - 20, token.length))
  // }, [_token])

  const expirationDate = functions.getTokenExpirationDate(_token);
  // console.log('Ngày hết hạn của token (hiện tại):', expirationDate);

  useEffect(() => {
    const specialURLs = ["/login", "/signup", "/signout"];
    const url = window.location.pathname;
    const _token = localStorage.getItem("_token");
    const stringifiedUser = localStorage.getItem("user");
    const user = stringifiedUser ? JSON.parse(stringifiedUser) : defaultValue;

    // console.log(user)
    if (specialURLs.indexOf(url) === -1) {
      if (!_token) {
        window.location = "/login";
      }
      if (user) {
        dispatch({
          branch: "default",
          type: "setAuthInfor",
          payload: {
            user,
          },
        });
      }
    }

    const fetchData = async () => {
      // try {
      const response = await axios.get(proxy() + "/apis/get/ui");
      if (pages && pages.length == 0) {
        const { success, ui } = response.data;
        if (success) {
          console.log("DISPATCH HERE", response);
          dispatch({
            type: "setUIPages",
            payload: { pages: ui.data },
          });
        }
      }
      // } catch (error) {
      //   console.error('Error fetching data:', error);
      // }
    };

    dispatch({
      type: "changeSocketURL",
      payload: proxy(),
    });

    fetchData();
    let socketNotificationReceived = false;

    socket.on("/dipe-production-user-login", ({ username }) => {
      if (user?.username == username) {
        Swal.fire({
          title: lang["notification"],
          text: lang["signout account"],
          icon: "warning",
          showConfirmButton: true,
          confirmButtonText: lang["confirm"],
          customClass: {
            confirmButton: "swal2-confirm my-confirm-button-class",
          },
          allowOutsideClick: false,
        }).then(function (result) {
          if (result.isConfirmed) {
            window.location = "/signout";
          }
        });
        socketNotificationReceived = true;
      }
    });

    window.addEventListener("beforeunload", function (event) {
      if (socketNotificationReceived) {
        localStorage.removeItem("_token");
        localStorage.removeItem("password_hash");
        localStorage.removeItem("user");
        localStorage.setItem("user", JSON.stringify({}));
      }
    });

    socket.on("/dipe-production-import-ui", () => {
      fetchData();
      socket.emit("/dipe-production-reconnect-ui");
    });
  }, []);

  useEffect(() => {
    if (window.location.pathname === "/login") {
      return;
    }

    let isTokenValid = true;
    const checkTokenExpiration = () => {
      const _token = localStorage.getItem("_token");
      // console.log(185, _token);

      // if (!_token || !isTokenValid) {
      //   window.location = '/login';
      //   return;
      // }
      const now = Math.floor(Date.now() / 1000);
      const expirationDate = functions.getTokenExpirationDate(_token);

      console.log(expirationDate - now);
      if (expirationDate - now > 0) {
        fetch(`${proxy()}/auth/token/check`, {
          headers: {
            Authorization: _token,
          },
        })
          .then((res) => res.json())
          .then((resp) => {
            const { success } = resp;
            if (!success) {
              isTokenValid = false;
              localStorage.removeItem("_token");

              //  Swal.fire({
              //     title: lang["Notification"],
              //     text: lang["expired"],
              //     icon: "warning",
              //     showConfirmButton: true,
              //     confirmButtonText: lang["confirm"],
              //     allowOutsideClick: false,
              // }).then((result) => {
              //     if (result.isConfirmed) {
              //         window.location = '/signout';
              //     }
              // });
            }
          });
      } else {
        window.location = `/signout?ex=${"1"}`;
      }
    };

    const tokenCheckInterval = setInterval(checkTokenExpiration, 3600000);

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, []);

  // useEffect(() => {

  //   const _token = localStorage.getItem("_token");

  //   const now = Math.floor(Date.now() / 1000);
  //   const expirationDate = functions.getTokenExpirationDate(_token);

  //   console.log(expirationDate - now)
  //   if (expirationDate - now > 0) {
  //     fetch(`${proxy()}/auth/token/check`, {
  //       headers: {
  //         Authorization: _token
  //       }
  //     })
  //       .then(res => res.json())
  //       .then(resp => {
  //         const { success } = resp;
  //         if (!success) {

  //           localStorage.removeItem("_token");
  //         }
  //       });
  //   } else {
  //     // window.location = `/signout?ex=${"1"}`;
  //   }

  // }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signout" element={<SignOut />} />
        <Route
          path="/changepassword"
          element={<Navigation Child={ChangePassword} />}
        />
        <Route path="/" element={<Navigation Child={Import} />} />
        <Route path="/diagram_db" element={<Navigation Child={Tables} />} />
        {/* <Route path="/logs" element={<Navigation Child={Logs} />} /> */}
        <Route path="/users" element={<Navigation Child={ListUser} />} />
        <Route path="/users/profile" element={<Navigation Child={Profile} />} />
        <Route path="/privileges" element={<Navigation Child={Permission} />} />
        <Route
          path="/privileges/detail"
          element={<Navigation Child={PermissionDetail} />}
        />
        <Route path="/settings" element={<Navigation Child={Settings} />} />

        <Route path="/active" element={<Navigation Child={Active_Key} />} />
        <Route path="/step" element={<Navigation Child={Active_Helpdesk} />} />
        <Route path="/table_key" element={<Navigation Child={Table_Key} />} />
        <Route
          path="/page/:url/detail-key/:id_str/*"
          element={<Navigation Child={Layout_Detail} />}
        />
        <Route path="/chart" element={<Navigation Child={Chart_HelpDesk} />} />

        <Route path="/sitemap" element={<Navigation Child={SiteMap} />} />
        <Route path="/logs" element={<Navigation Child={Logs} />} />
        <Route path="/version" element={<Navigation Child={Version} />} />
        <Route
          path="/page/:url/apis/api/:id_str/input_info"
          element={<Navigation Child={InputPost} />}
        />
        <Route
          path="/page/:url/put/api/:id_str/*"
          element={<Navigation Child={InputPut} />}
        />
        <Route
          path="/page/:url/detail/:id_str/*"
          element={<Navigation Child={Detail} />}
        />
        <Route path="/page/:url/*" element={<Navigation Child={Fetch} />} />
        {/* <Route path="/page/:url/:param/*" element={< Navigation Child={Fecth_Table_Param} />} /> */}
        <Route
          exac
          path="/page/:url/import/:id"
          element={<Navigation Child={ImportData} />}
        />

        <Route
          exac
          path="/technical"
          element={<Navigation Child={FeedBack} />}
        />

        {/* <Route exac path="/diagram" element={ < Navigation Child={Diagram} /> } /> */}
        <Route path="*" element={<PageNotFound />} />
        {/* <Route path="/:url" element={ < Navigation Child={Fetch} /> } />        
        <Route exac path="/page/not/found" element={<PageNotFound />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
