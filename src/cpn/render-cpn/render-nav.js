import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import icons from './icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const NavbarItem = ({ item, isChild = false, level, expandedItems, setExpandedItems }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.page_id);

    const toggleMenu = () => {
        if (!isChild) { // Chỉ áp dụng cho cấp 1 (top-level)
            setExpandedItems(prevExpandedItems => {
                if (prevExpandedItems.includes(item.page_id)) {
                    return prevExpandedItems.filter(id => id !== item.page_id); // Đóng nếu đã mở
                } else {
                    // Đóng tất cả cấp 1 trước khi mở cấp 1 hiện tại
                    return [item.page_id];
                }
            });
        } else {
            // Cấp 2 và các cấp sau không bị ảnh hưởng, chỉ cần mở hoặc đóng cấp 1
            setExpandedItems(prevExpandedItems => {
                if (prevExpandedItems.includes(item.page_id)) {
                    return prevExpandedItems.filter(id => id !== item.page_id); // Đóng nếu đã mở
                } else {
                    return [...prevExpandedItems, item.page_id]; // Mở nếu đóng
                }
            });
        }
    };

    useEffect(() => {
        // Lưu trạng thái vào localStorage khi expandedItems thay đổi
        localStorage.setItem('expandedItems', JSON.stringify(expandedItems));
    }, [expandedItems]);

    if (item.is_hidden) {
        return null;
    }
    const marginLeft = `${level > 2 && level * 5}px`;
    const paddingLeft = `${level > 2 && level * 15}px`;
    //console.log(marginLeft)
    //console.log(level)
    return (
        <li className={`navbar-item ${isChild ? 'child-item' : ''}`} >
            {hasChildren ? (
                <>
                    <a
                        href={`#page_${item.page_id}`}
                        onClick={toggleMenu}
                        aria-expanded={isExpanded}
                        className={`dropdown-toggle  ${isChild ? 'child-link' : ''}`}style={{ paddingLeft }}
                    >
                        {/* <i className={`fa size-18 ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} ${isChild ? 'child-icon' : ''}`}></i>
                        {!hasChildren && item.icon && ( // Kiểm tra nếu không có con thì hiển thị icon
                            <FontAwesomeIcon icon={icons[item.icon].icon} className="mr-2" />
                        )} */}
                         <FontAwesomeIcon icon={icons[item.icon].icon} className="mr-4" />
                        <span>{item.page_title}</span>
                        
                    </a>
                    <ul className={`collapse list-unstyled ${isExpanded ? 'show ' : ''} ${isChild ? 'child-list' : ''}`} id={`page_${item.page_id}`}>
                        {item.children.map(child => (
                            <NavbarItem
                                key={child.page_id}
                                item={child}
                                isChild={true}
                                expandedItems={expandedItems}
                                setExpandedItems={setExpandedItems}
                                level={level + 1}
                            />
                        ))}
                    </ul>
                    
                </>
            ) : (

                <NavLink
                    to={hasChildren ? '#' : `/page/${item.page_id}`}
                    onClick={(e) => {
                        if (hasChildren) {
                            e.preventDefault(); // Ngăn chuyển hướng nếu có con
                            toggleMenu(); // Mở hoặc đóng cấp 1
                        }
                    }}
                    activeClassName="nav-active"
                    className={isChild ? 'child-link' : ''}
                    style={{ paddingLeft }}
                >
                    {item.icon && (

                        <FontAwesomeIcon icon={icons[item.icon].icon} className="mr-4" />
                    )}
                    {item.page_title}
                </NavLink>
            )}
        </li>
    );
};

const Navbar = ({ data }) => {
    const [expandedItems, setExpandedItems] = useState([]);
    useEffect(() => {
        // Lấy trạng thái từ localStorage khi component khởi chạy
        const storedExpandedItems = localStorage.getItem('expandedItems');
        if (storedExpandedItems) {
            setExpandedItems(JSON.parse(storedExpandedItems));
        }
    }, []);
    return (
        <>
            {data?.map(item => (
                <NavbarItem key={item.page_id} item={item} level={1} expandedItems={expandedItems} setExpandedItems={setExpandedItems} />
            ))}
        </>
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



