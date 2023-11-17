import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Swal from 'sweetalert2';


import { Home } from './dashboard';
import { Import } from './import-data';
import { Navigation, PageNotFound } from './navigations';
import { Login, SignUp, SignOut, ChangePassword } from './auth';
import { Settings } from './settings';
import { ListUser, Profile, Permission, PermissionDetail } from './users';
import { Logs } from './logs';
import { Tables, Field, UpdateField } from './tables';
import { Diagram } from './diagram';
import Active_Key from "./active_key/active";
import { Fetch, InputPost, InputPut, ImportData, Detail } from './page';
import { Active_Helpdesk, Table_Key, Chart_HelpDesk } from "./page/step"
import "../css/index.scss";
import { SiteMap } from './site-map';
import Layout_Detail from './page/layout/layout_detail'
function App() {

  const dispatch = useDispatch()
  const _token = localStorage.getItem("_token");
  const { lang, proxy, auth, pages, socket } = useSelector(state => state);

  const defaultValue = {
    username: "",
    fullname: "",
    role: "",
    email: "",
    phone: "",
    avatar: ""
  }
  useEffect(() => {
    const specialURLs = ["/login", "/signup", "/signout"]
    const url = window.location.pathname;
    const _token = localStorage.getItem("_token");
    const stringifiedUser = localStorage.getItem("user");
    const user = JSON.parse(stringifiedUser) ? JSON.parse(stringifiedUser) : defaultValue
    // console.log(user)
    if (specialURLs.indexOf(url) === -1) {
      if (!_token) {
        window.location = '/login'
      }
      if (user) {
        dispatch({
          branch: "default",
          type: "setAuthInfor",
          payload: {
            user
          }
        })

      }
    }

    const fetchData = async () => {
      // try {
      const response = await axios.get(proxy() + '/apis/get/ui');
      if (pages && pages.length == 0) {
        const { success, ui } = response.data;
        if (success) {
          dispatch({
            type: "setUIPages",
            payload: { pages: ui.data }
          })
        }
      }

      // } catch (error) {
      //   console.error('Error fetching data:', error);
      // }    

    };

    dispatch({
      type: 'changeSocketURL',
      payload: proxy()
    })

    fetchData();
    let socketNotificationReceived = false;

    socket.on("/dipe-production-user-login", ({ username }) => {
      if (user.username == username) {
        Swal.fire({
          title: lang["notification"],
          text: lang["signout account"],
          icon: "warning",
          showConfirmButton: true,
          confirmButtonText: lang["confirm"],
          customClass: {
            confirmButton: 'swal2-confirm my-confirm-button-class'
          },
          allowOutsideClick: false,
        }).then(function (result) {
          if (result.isConfirmed) {
            window.location = '/signout';
          }
        });
        socketNotificationReceived = true;
      }
    });
    
    window.addEventListener('beforeunload', function (event) {
      if (socketNotificationReceived) {
        localStorage.removeItem('_token')
        localStorage.removeItem("password_hash");
        localStorage.removeItem("user");
        localStorage.setItem("user", JSON.stringify({}));
      }
    });
    

    socket.on("/dipe-production-import-ui", () => {
      fetchData()
      socket.emit("/dipe-production-reconnect-ui")
    })

  }, [])

  useEffect(() => {

    if (_token != undefined) {

      fetch(`${proxy()}/auth/token/check`, {
        headers: {
          Authorization: _token
        }
      })
        .then(res => res.json())
        .then(resp => {
          const { success } = resp;
          // console.log(resp)
          if (success) {

          } else {
            window.location = "/signout"
          }
        })
    } else {
      // console.log("a")
    }
  }, [_token])

  return (

    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signout" element={<SignOut />} />
        <Route path="/changepassword" element={<Navigation Child={ChangePassword} />} />

        {/* <Route path="/" element={<Navigation Child={Home} />} /> */}
        <Route path="/" element={<Navigation Child={Import} />} />

        <Route path="/diagram_db" element={<Navigation Child={Tables} />} />



        {/* <Route path="/logs" element={<Navigation Child={Logs} />} /> */}
        <Route path="/users" element={<Navigation Child={ListUser} />} />
        <Route path="/users/profile" element={<Navigation Child={Profile} />} />
        <Route path="/privileges" element={<Navigation Child={Permission} />} />
        <Route path="/privileges/detail" element={<Navigation Child={PermissionDetail} />} />
        <Route path="/settings" element={<Navigation Child={Settings} />} />
        <Route path="/active" element={<Navigation Child={Active_Key} />} />
        <Route path="/step" element={<Navigation Child={Active_Helpdesk} />} />
        <Route path="/table_key" element={<Navigation Child={Table_Key} />} />
        <Route path="/page/:url/detail-key/:id_str/*" element={<Navigation Child={Layout_Detail} />} />
        <Route path="/chart" element={<Navigation Child={Chart_HelpDesk} />} />


        <Route path="/sitemap" element={<Navigation Child={SiteMap} />} />
        <Route path="/logs" element={<Navigation Child={Logs} />} />

        <Route exac path="/page/:url/apis/api/:id_str/input_info" element={< Navigation Child={InputPost} />} />
        <Route path="/page/:url/put/api/:id_str/*" element={< Navigation Child={InputPut} />} />
        <Route path="/page/:url/detail/:id_str/*" element={< Navigation Child={Detail} />} />
        <Route exac path="/page/:url" element={< Navigation Child={Fetch} />} />
        <Route exac path="/page/:url/import" element={< Navigation Child={ImportData} />} />
        {/* <Route exac path="/diagram" element={ < Navigation Child={Diagram} /> } /> */}
        <Route path="*" element={<PageNotFound />} />

        {/* <Route path="/:url" element={ < Navigation Child={Fetch} /> } />        
        <Route exac path="/page/not/found" element={<PageNotFound />} /> */}

      </Routes>
    </Router>

  );
}

export default App;
