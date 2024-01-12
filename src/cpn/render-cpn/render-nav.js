





import { NavLink } from "react-router-dom";
import React, { useState } from 'react';
import icons from './icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faIcons, faLemon, faLocation, faMagnifyingGlass, faPaperPlane, faPlane, faRocket, faSeedling, faStar, faUser } from "@fortawesome/free-solid-svg-icons"


const NavbarItem = ({ item, level }) => {
    console.log(item)

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