import { useState, useEffect, useRef } from "react" 
import { useSelector } from "react-redux"

export default () => {
    const rootRef = useRef()
    let id = 0;
    const { lang, proxy } = useSelector(state => state)
    const _token = localStorage.getItem("_token");
    const [ isLoaded, setLoaded ] = useState(false)
    const [ tree, setTree ] = useState({ 
        leaf: "DIPES",
        background: "#ff6655",
        foreground: "#ffffff",  
        vine: "red",
        children: [
            { leaf: "Dashboard", link: "/", },
            { 
                leaf: "Account",
                link: "/users",
                vine: "blue",                
                children: [
                    { leaf: "Create Account", link: "/users?action=create" }                    
                ]
            },
            { leaf: "Statistic", link: "/statis", },
            { leaf: "Report", link: "/report", },
            { leaf: "About Us", link: "/about", }
        ]        
    })

    const RenderVines = ( branch, depth, vine="cyan" ) => {
        if( depth != 0 ){
            const branchLeft    = branch.offsetLeft // ? ( branch.offsetLeft * depth ) : 0;
            const branchTop     = branch.offsetTop;
    
            return (        
                <svg className="vines" style={{ top: `-${ branchTop }px`, left: -25 }}>
                    <path d={` M ${ branchLeft } ${ branchTop + 20 } L ${ 0 } ${ branchTop + 20 } M ${ 0 } ${ branchTop + 20 } L ${ 0 } ${ 0 }`} stroke={vine} strokeWidth="2" fill="none" />        
                </svg>
            );
        }else{
            return null
        }
    }

    const ref = useRef()    
    const RenderBranch = ( root, branch, depth, parentVine ) => {       
        id += 1;            
        const { children, leaf, background, foreground, vine, link } = branch;
        
        
        if( !children ){
            return(
                <div ref={ ref } className="branch" key={id} >
                    <a className="leaf" href={ link } style={{ background, color: foreground }}>{ leaf }</a>
                    { ref.current ? RenderVines( ref.current, depth, parentVine )  : null }                    
                </div>
            )
        }else{
            return(
                <div ref={ ref } className="branch" key={id}>
                     <a className="leaf" href={ link } style={{ background, color: foreground }}>{ leaf }</a>
                    { ref.current ? RenderVines( ref.current, depth, parentVine )  : null }                    
                    { children.map( child => RenderBranch( ref, child, depth + 1, vine ) ) }
                </div>
            )
        }
    } 


    useEffect( () => {

        if( rootRef.current != undefined){
            fetch(`${proxy}/projects/all/projects`, {
                headers: {
                  Authorization: _token
                }
            }).then( res => res.json() ).then( res => {
                const { success, data, status, content } = res;
                const projects = data;
                const branch = {
                    leaf: "Projects",
                    background: "purple",
                    foreground: "#ffffff",  
                    vine: "blue",
                    children: [{ leaf: "Create project", link: "/projects?action=create" }]
                }
    
                projects.map( project => {
                    const child = {
                        leaf: project.project_name,
                        link: `/projects/detail/${ project.project_id }`,
                        children: [
                            { leaf: "Database", link: `/projects/${ project.versions[0]?.version_id }/tables` },
                            { leaf: "API", link: `/projects/${ project.versions[0]?.version_id }/apis` },
                            { leaf: "UI", link: `/projects/${ project.versions[0]?.version_id }/uis` },
                        ]
                    }
                    branch.children.push(child)
                })
                const newTree = tree;
                newTree.children.push( branch )                
                setTree({...newTree})            
            })
        }

    }, [ rootRef ])
    return(
        <div class="midde_cont">
        <div class="container-fluid">
            <div class="row column_title">
            <div class="col-md-12">
                <div class="page_title d-flex align-items-center">
                <h4>{lang["site-map"]}</h4>
                </div>
            </div>
            </div>
            <div className="pot">
                <div className="root" ref={ rootRef }>
                    { RenderBranch( rootRef, tree, 0 ) }                
                </div>            
            </div>
        </div>
        </div>        
    )
}