import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";



import { Home } from './dashboard';
import { Import } from './import-data';
import { Navigation, PageNotFound } from './navigations';
import { Login, SignUp, SignOut } from './auth';
import { Settings } from './settings';
import { Projects, ProjectsCard, ProjectDetail } from './projects';
import { ListUser, Profile } from './users';
import { Tasks } from './tasks';
import { Logs } from './logs';
import { Tables, Field, UpdateField } from './tables';
import { Apis, CreateApi, UpdateAi,StatisticalField} from './api';
import { UI, CreateUi} from './ui'
import updateApi from './api/update-api';


import { Fetch, InputPost, InputPut  } from './page';

import "../css/index.scss";

function App() {

  const dispatch = useDispatch()


  useEffect(() => {
    const specialURLs = ["/login", "/signup", "/signout"]
    const url = window.location.pathname;
    const _token = localStorage.getItem("_token");
    const stringifiedUser = localStorage.getItem("user");
    const user = JSON.parse(stringifiedUser)

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
      try {
        const response = await axios.get('/dipe-configs/ui.json');
        dispatch({
            type: "setUIPages",
            payload: { pages: response.data.data}
        })     
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }    
        
    };

    fetchData();

  }, [])  

  return (

    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signout" element={<SignOut />} />
        <Route path="/" element={<Navigation Child={Home} />} />
        <Route path="/import" element={<Navigation Child={Import} />} />
        <Route path="/projects" element={<Navigation Child={Projects} />} />
        <Route path="/projects/:project_id" element={<Navigation Child={ProjectsCard} />} />
        <Route path="/projects/detail/:project_id" element={<Navigation Child={ProjectDetail} />} />
        <Route path="/projects/task/:project_id" element={<Navigation Child={Tasks} />} />
        <Route path="/projects/:version_id/tables" element={<Navigation Child={Tables} />} />
        <Route path="/projects/:version_id/tables/field" element={<Navigation Child={Field} />} />
        <Route path="/projects/:version_id/table/:table_id" element={<Navigation Child={UpdateField} />} />
        <Route path="/projects/:version_id/apis" element={<Navigation Child={Apis} />} />
        <Route path="/projects/:version_id/apis/create" element={<Navigation Child={CreateApi} />} />
        <Route path="/projects/:version_id/apis/update/:api_id" element={<Navigation Child={updateApi} />} />

        <Route path="/projects/:version_id/uis" element={<Navigation Child={UI} />} />
        <Route path="/projects/:version_id/uis/create" element={<Navigation Child={CreateUi} />} />
        <Route path="/logs" element={<Navigation Child={Logs} />} />
        <Route path="/users" element={<Navigation Child={ListUser} />} />
        <Route path="/users/profile" element={<Navigation Child={Profile} />} />
        <Route path="/settings" element={<Navigation Child={Settings} />} />
        <Route path="*" element={<PageNotFound />} />


        <Route exac path="/:url" element={ < Navigation Child={Fetch} /> } />
        <Route exac path="apis/api/:id_str/input_info" element={ < Navigation Child={InputPost} /> } />
        <Route exac path="apis/api/:id_str/input_info" element={ < Navigation Child={InputPut} /> } />

      </Routes>
    </Router>

  );
}

export default App;