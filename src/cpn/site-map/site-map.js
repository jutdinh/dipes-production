import { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import Swal from 'sweetalert2';
export default () => {
    const rootRef = useRef()
    let id = 0;
    const { lang, proxy, pages, auth } = useSelector(state => state)
    const _token = localStorage.getItem("_token");
    const [isLoaded, setLoaded] = useState(false)
    const [statusActive, setStatusActive] = useState(false);
    // console.log(auth)
    useEffect(() => {

        fetch(`${proxy()}/auth/activation/check`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, activated, status, content } = resp;
                // console.log(resp)
                if (activated) {
                    setStatusActive(true)

                } else {
                    Swal.fire({
                        title: lang["faild"],
                        text: lang["fail.active"],
                        icon: "error",
                        showConfirmButton: true,
                        customClass: {
                            confirmButton: 'swal2-confirm my-confirm-button-class'
                        }

                    }).then(function () {
                        // window.location.reload();
                    });
                    setStatusActive(false)
                    // setTree({})
                }
            })



    }, [statusActive])
    const [tree, setTree] = useState({
        leaf: "DIPES PRODUCTON",
        background: "#ff6655",
        foreground: "#ffffff",
        vine: "red",
        children: [
            { leaf: "Import", link: "/", },
            { leaf: lang["activation"], link: "/active", },
            {
                leaf: lang["accounts manager"],
                link: "/users",
                vine: "blue",
                // children: [
                //     { leaf: lang["create account"], link: "/users?action=create" }
                // ]
            },
            { leaf: lang["diagram"], link: "/diagram_db", },
            { leaf: "Site map", link: "/sitemap", }
            // { leaf: "Report", link: "/report", },
            // { leaf: "About Us", link: "/about", }
        ]
    })
    useEffect(() => {
        // assuming auth is defined somewhere in this component
        if (auth.role === 'pd') {
            setTree(prevTree => ({
                ...prevTree,
                children: prevTree.children.filter(item => 
                    item.leaf !== "Import" && 
                    item.leaf !== lang["activation"] && 
                    item.leaf !== lang["accounts manager"]&&
                    item.leaf !== lang["diagram"]
                )
            }));
        }
    }, [auth.role]);

    const RenderVines = ( branch, depth, id, vine="cyan" ) => {
        if( depth != 0 ){
            const branchLeft    = branch.offsetLeft // ? ( branch.offsetLeft * depth ) : 0;
            const branchTop     = branch.offsetTop;
            const brachBottom   = document.getElementById("branch" + id)!=null? document.getElementById("branch" + id).offsetHeight: 35;//Linh.Tran_230711: 35 default one node
            //const brachName     = document.getElementById("branch" + id)!=null? document.getElementById("branch" + id).offsetHeight:"";
    
            return ( 
                /*       
                <svg className="vines" style={{ top: `-${ branchTop }px`, left: -25 }}>
                    <path d={` M ${ branchLeft } ${ branchTop + 20 } L ${ 0 } ${ branchTop + 20 } M ${ 0 } ${ branchTop + 20 } L ${ 0 } ${ 0 }`} stroke={vine} strokeWidth="2" fill="none" />        
                </svg>
                */
                <svg className="vines" style={{ top: `-${ branchTop + 45 }px`, left: -30 }}>
                    <path d={`  M ${ 0 + 5 } ${ 0 + 30 } 
                                L ${ 0 + 5 } ${ branchTop + 10 + 45}
                                c ${0} ${ 0 + 10 } ${0 + 10} ${ 0 + 10 } 10 10
                                L ${ branchLeft  + 5 } ${ branchTop + 10 + 45 + 10}
                                M ${ 0 + 5 } ${ 0 } 
                                L ${ 0  + 5 } ${ brachBottom + 15 }
                            `} stroke={vine} strokeWidth="2" fill="none" />
                            
                    <b>{brachBottom}</b>
                </svg>
                
            );
        }else{
            return null
        }
    }

    const ref = useRef()
    const RenderBranch = (root, branch, depth, parentVine) => {
        id += 1;
        const { children, leaf, background, foreground, vine, link } = branch;


        if (!children) {
            return (
                <div ref={ref} className="branch" key={id} >
                    <a className="leaf" href={link} style={{ background, color: foreground }}>{leaf}</a>
                    {ref.current ? RenderVines(ref.current, depth, parentVine) : null}
                </div>
            )
        } else {
            return (
                <div ref={ref} className="branch" key={id}>
                    <a className="leaf" href={link} style={{ background, color: foreground }}>{leaf}</a>
                    {ref.current ? RenderVines(ref.current, depth, parentVine) : null}
                    {children.map(child => RenderBranch(ref, child, depth + 1, vine))}
                </div>
            )
        }
    }
    // console.log(pages)
    useEffect(() => {

        if (statusActive) {
            if (pages) {
                const branch = {
                    leaf: lang["manage data"],
                    background: "purple",
                    foreground: "#ffffff",
                    vine: "blue",
                    children: []
                }
                pages.map(ui => {
                    const child = {
                        leaf: ui.title,
                        link: `/page${ui.url}`,
                        // children: [
                        //     { leaf: lang["create"], link: `/page/apis${ui.components[0]?.api_post}/input_info` },
                        //     // { leaf: "Sửa", link: `/projects/${ project.versions[0]?.version_id }/apis` },
                        //     // { leaf: "UI", link: `/projects/${ project.versions[0]?.version_id }/uis` },
                        // ]
                    }
                    branch.children.push(child)
                })
                const newTree = tree;
                newTree.children.push(branch)
                // newTree.children.push({ leaf: "Site map", link: "/sitemap", })
    
                setTree({ ...newTree })
            }
        }
    }, [statusActive])
    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title d-flex align-items-center">
                            <h4 class="ml-1">{lang["site map"]}</h4>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">

                            {statusActive ? (
                                <div className="pot">
                                    <div className="root" ref={rootRef}>
                                        {RenderBranch(rootRef, tree, 0)}
                                    </div>
                                </div>
                            ) : null}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}