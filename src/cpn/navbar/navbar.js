import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import $ from 'jquery'

export default () => {
   const { proxy, lang, pages } = useSelector(state => state)
   const stringifiedUser = localStorage.getItem("user");
   const user = JSON.parse(stringifiedUser) || {}
   const [activeLink, setActiveLink] = useState("/");
   const [uis, setUis] = useState([]);
   const [isOpen, setIsOpen] = useState(false);
   // console.log(pages)

   const OpenTab = (url) => {
      window.location.href = `/fetch/${url}`;
      // window.location.href = `tables`;
   };

   // useEffect(() => {
   //    if (window.innerWidth < 1200) {
   //       $('#sidebar').toggleClass('active');
   //    }
   // }, [window.location.href])

   return (
      <nav id="sidebar" class>
         <div class="sidebar_blog_1">
            <div class="sidebar-header">
               <div class="logo_section">
                  <a href="/"><img class="logo_icon img-responsive" src="/images/logo/logo_icon.png" alt="#" /></a>
               </div>
            </div>
            <div class="sidebar_user_info_custom">
               <div class="icon_setting"></div>
               <div class="user_profle_side">
                  <div class="logo_section">
                     <a href="/"><img class="img-responsive" src="/images/logo/logo.png" alt="#" /></a>
                  </div>
               </div>
            </div>
         </div>
         <div class="sidebar_blog_2">
            <h4>{lang["general"]}</h4>
            <ul class="list-unstyled components">
               <li className="navbar-item">
                  <NavLink to="/" activeClassName="nav-active">
                     <i class="fa fa-home icon-home"></i>
                     <span>{lang["home"]}</span>
                  </NavLink>
               </li>
               <li className="navbar-item">
                  <NavLink to="/import" activeClassName="nav-active">
                     <i class="fa fa-upload icon-import"></i>
                     <span>Import</span>
                  </NavLink>
               </li>
               {user.role === "ad" || user.role === "uad" ? (
                  <li className="navbar-item">
                     <NavLink to="/users" activeClassName="nav-active">
                        <i class="fa fa-users icon-user"></i>
                        <span>{lang["accounts manager"]}</span>
                     </NavLink>
                  </li>
               ) : null}

               
               {user.role === "uad" ? (
                  <li className="navbar-item">
                     <NavLink to="/diagram" activeClassName="nav-active">
                        <i class="fa fa-database pointer icon-database"></i>
                        <span>{lang["diagram"]}</span>
                     </NavLink>
                  </li>
               ) : null}

               <li class="active">
                  <a href="#dashboard" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">
                     <i class="fa fa-dashboard yellow_color"></i>
                     <span>Dashboard</span>
                  </a>
                  <ul class="collapse list-unstyled show nav-custom " id="dashboard">
                     {pages && pages.map(ui => (
                        ui.status ? (
                           <li className="navbar-item">
                              <NavLink to={ui.url} activeClassName="nav-active">
                                 <i class="fa fa-newspaper-o"></i>
                                 <span>{ui.title}</span>
                              </NavLink>
                           </li>
                        ) : null
                     ))}
                  </ul>
               </li>
               {user.role === "uad" ? (
                  <li className="navbar-item">
                     <NavLink to="/logs" activeClassName="nav-active">
                        <i class="fa fa-shield"></i>
                        <span>{lang["log.title"]}</span>
                     </NavLink>
                  </li>
               ) : null}
            </ul>
         </div>
         <div class="footer-custom">
            <p>&copy; 2023 - Designed by Mylan Group </p>
         </div>
      </nav>
   )
}