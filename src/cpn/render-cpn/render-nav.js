import { NavLink } from "react-router-dom";
import React, { useState } from 'react';
import icons from './icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faIcons, faLemon, faLocation, faMagnifyingGlass, faPaperPlane, faPlane, faRocket, faSeedling, faStar, faUser } from "@fortawesome/free-solid-svg-icons"

const NavbarItem = ({ item, level }) => {
    // console.log(item)

    if (item.is_hidden) {
        return null;
    }
    console.log(`Level ${level}: ${item.page_title}`);
    const hasChildren = item.children && item.children.length > 0;
    return (
        <li style={{ marginLeft: `${10 * level}px` }} className="navbar-item" >
            <NavLink to={`/page/${item.page_id}`} activeClassName="nav-active">
                {item.icon && (
                    <FontAwesomeIcon icon={icons[item.icon].icon} className=" mr-2" />
                )}
                {item.page_title}
            </NavLink>
            {hasChildren && (
                <ul>
                    {item.children.map(child => (
                        <NavbarItem key={child.page_id} item={child} level={level + 1} />
                    ))}
                </ul>
            )}
            
        </li>
    );
};

const Navbar = ({ data }) => {
    return (
        <nav>
            <ul>
                {data?.map(item => (
                    <NavbarItem key={item.page_id} item={item} level={1} />
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;


// const NavbarItem = ({ item, level }) => {
//     if (item.is_hidden) {
//         return null;
//     }
//     const hasChildren = item.children && item.children.length > 0;

//     // Nếu là level 1 và có children, hiển thị với dropdown
//     if (level === 1 && hasChildren) {
//         return (
//             <li>
//                 <a href="#dashboard" aria-expanded="false" className="dropdown-toggle">
//                     {/* Icon và Tên mục */}
//                     {item.icon && (
//                         <FontAwesomeIcon icon={icons[item.icon].icon} className="mr-2" />
//                     )}
//                     <span>{item.page_title}</span>
//                     <i className="fa"></i>
//                 </a>
//                 {/* Danh sách con */}
//                 <ul className={`collapse list-unstyled scrollable`}>
//                     {item.children.map(child => (
//                         <NavbarItem key={child.page_id} item={child} level={level + 1} />
//                     ))}
//                 </ul>
//             </li>
//         );
//     } else { // Nếu không có children hoặc không phải level 1, hiển thị link thông thường
//         return (
//             <li className="navbar-item" style={{ marginLeft: `${10 * level}px` }}>
//                 <NavLink to={`/page/${item.page_id}`} activeClassName="nav-active">
//                     {item.icon && (
//                         <FontAwesomeIcon icon={icons[item.icon].icon} className="mr-2" />
//                     )}
//                     {item.page_title}
//                 </NavLink>
//             </li>
//         );
//     }
// };

// const Navbar = ({ data }) => {
//     return (
//         <nav>
//             <ul>
//                 {data?.map(item => (
//                     <NavbarItem key={item.page_id} item={item} level={1} />
//                 ))}
//             </ul>
//         </nav>
//     );
// };

// export default Navbar;



