import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import Navbar_Render from "../render-cpn/render-nav";
import { Auth_API } from "../../APIs/Auth.api";

const SideBar = () => {
  const { proxy, lang, pages, functions, sidebar } = useSelector(
    (state) => state
  );
  const { openTab } = functions;
  const stringifiedUser = localStorage.getItem("user");
  const user = JSON.parse(stringifiedUser) || {};
  const [activeLink, setActiveLink] = useState("/");
  const [uis, setUis] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const sideBar = sidebar ? sidebar.sidebar : null;
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLogged, setIsLogged] = useState(false);
  const _token = localStorage.getItem("_token");

  useEffect(() => {
    Auth_API.isTokenExpired(proxy(), _token).then((res) => setIsLogged(!res));
    const savedState = localStorage.getItem("menuExpanded");
    if (savedState !== null) {
      setIsExpanded(savedState === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("menuExpanded", isExpanded ? "true" : "false");
  }, [isExpanded]);

  const toggleMenu = (event) => {
    event.preventDefault();
    setIsExpanded((prevState) => !prevState);
  };

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
    <nav id="sidebar" class="">
      <div class="sidebar_blog_1">
        <div class="sidebar-header">
          <div class="logo_section">
            <a href="#">
              <img
                class="logo_icon img-responsive"
                src="/images/logo/logo_icon.png"
                alt="#"
              />
            </a>
          </div>
        </div>
        <div class="sidebar_user_info_custom">
          <div class="icon_setting"></div>
          <div class="user_profle_side">
            <div class="logo_section">
              <a href="#">
                <img
                  class="img-responsive"
                  src="/images/logo/logo.png"
                  alt="#"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="block-nav">
        <div class="sidebar_blog_2">
          <ul class="list-unstyled components">
            {/* <li className="navbar-item">
                  <NavLink to="/" activeClassName="nav-active">
                     <i class="fa fa-home icon-home"></i>
                     <span>{lang["home"]}</span>
                  </NavLink>
               </li> */}
            {user.role === "uad" ? (
              <li className="navbar-item">
                <NavLink to="/" activeClassName="nav-active">
                  <i class="fa fa-upload size-24 icon-import-nav"></i>
                  <span>Import</span>
                </NavLink>
              </li>
            ) : null}
            {user.role === "uad" ? (
              <li className="navbar-item">
                <NavLink to="/active" activeClassName="nav-active">
                  <i class="fa fa-key purple_color3"></i>
                  <span>{lang["activation"]}</span>
                </NavLink>
              </li>
            ) : null}

            {user.role === "ad" || user.role === "uad" ? (
              <li className="navbar-item">
                <NavLink to="/users" activeClassName="nav-active">
                  <i class="fa fa-users icon-user"></i>
                  <span>{lang["accounts manager"]}</span>
                </NavLink>
              </li>
            ) : null}

            {user.role === "ad" || user.role === "uad" ? (
              <li className="navbar-item">
                <NavLink to="/privileges" activeClassName="nav-active">
                  <i class="fa fa-lock icon-privileges"></i>

                  <span>{lang["privileges manager"]}</span>
                </NavLink>
              </li>
            ) : null}

            {user.role === "ad" || user.role === "uad" ? (
              <li className="navbar-item">
                <NavLink to="/privileges/groups" activeClassName="nav-active">
                  <i class="fa fa-users icon-privileges"></i>

                  <span>{lang["privileges groups"]}</span>
                </NavLink>
              </li>
            ) : null}

            {user.role === "ad" || user.role === "uad" ? (
              <li>
                <a
                  href="#dashboard"
                  onClick={toggleMenu}
                  aria-expanded="false"
                  class="dropdown-toggle"
                >
                  <i class="fa fa-dashboard yellow_color"></i>
                  <span>{lang["data management"]}</span>
                  <i class="fa "></i>
                </a>
                <ul
                  className={`collapse list-unstyled ${
                    isExpanded ? "show" : ""
                  } scrollable`}
                  id="dashboard"
                >
                  {pages &&
                    pages.map((ui, index) =>
                      ui.status ? (
                        <li key={index} className="navbar-item">
                          <NavLink
                            to={`/page${ui.url}`}
                            activeClassName="nav-active"
                          >
                            <i class="fa fa-newspaper-o"></i>
                            <span>{ui.title}</span>
                          </NavLink>
                        </li>
                      ) : null
                    )}
                </ul>
              </li>
            ) : null}

            <Navbar_Render data={pages} isLogged={isLogged} />

            {user.role === "uad" ? (
              <>
                <li className="navbar-item">
                  <NavLink to="/diagram_db" activeClassName="nav-active">
                    <i class="fa fa-database pointer icon-database"></i>
                    <span>{lang["diagram"]}</span>
                  </NavLink>
                </li>
                <li className="navbar-item">
                  <NavLink
                    to="/sitemap"
                    onClick={() => {
                      openTab("/sitemap");
                    }}
                    activeClassName="nav-active"
                  >
                    <i class="fa fa-sitemap"></i>
                    <span>{lang["site map"]}</span>
                  </NavLink>
                </li>
                <li className="navbar-item">
                  <NavLink to="/version" activeClassName="nav-active">
                    <i class="fa fa-code-fork"></i>
                    <span>{lang["version"]}</span>
                  </NavLink>
                </li>
                {isLogged ? (
                  <li className="navbar-item">
                    <NavLink to="/logs" activeClassName="nav-active">
                      <i class=" fa fa-shield"></i>
                      <span>{lang["log.login"]}</span>
                    </NavLink>
                  </li>
                ) : null}
              </>
            ) : null}
            {isLogged && user.role !== "uad" ? (
              <>
                <li className="navbar-item">
                  <NavLink to="/logs" activeClassName="nav-active">
                    <i class=" fa fa-shield"></i>
                    <span>{lang["log.login"]}</span>
                  </NavLink>
                </li>
              </>
            ) : null}
            {/* {user.role === "uad" ? (
                  <li className="navbar-item">
                     <NavLink to="/logs" activeClassName="nav-active">
                        <i class="fa fa-shield"></i>
                        <span>{lang["log.title"]}</span>
                     </NavLink>
                  </li>
               ) : null} */}
          </ul>
        </div>
      </div>

      <div class="footer-custom">
        <p>&copy; 2023 - Designed by Mylan Group </p>
      </div>
    </nav>
  );
};
export default SideBar;
