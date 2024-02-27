import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import $ from 'jquery';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faDownload, faSquarePlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
export default (props) => {
    const { lang, proxy, auth, functions } = useSelector(state => state);
    
    const { id } = useParams()

    let navigate = useNavigate();
    const goToHomePage = () => {
        navigate(`/privileges`);
    };

    const [ group, setGroup ] = useState({})
    /**
     * 
     * Group_name
     * 
     */
    const [ pages, setPages ] = useState([])
   
    const _token = localStorage.getItem("_token");
    

  
    useEffect(() => {
        
        const FetchDataAsync = async () => {
            const response = await fetch(`${proxy() }/privileges/group/${ id }/ui/tree`, {
                headers: {
                    "Authorization": _token
                }
            })
            const serializedData = await response.json()
            const { pages } = serializedData;
            setPages(pages)
        }

        FetchDataAsync()

    }, [])
  
    

    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title d-flex align-items-center">
                            <h4 class="ml-1">{lang["privileges manager"]}</h4>
                        </div>
                    </div>
                </div>
                <div class="row column1">
                    <div class="col-md-12">
                        <div class="white_shd full">
                            <div class="white_shd full ">
                                <div class="full graph_head">
                                    <div class="heading1 margin_0">
                                        <h5><label class="pointer" style={{margin: 0}}onClick={() => goToHomePage()}>
                                            <a title={lang["back"]}><i class=" fa fa-chevron-circle-left mr-1 nav-item nav-link"></i></a>{lang["privileges"]} 
                                        </label></h5>
                                    </div>

                                </div>
                            </div>                            
                            <div className="privilege-pages">
                                { pages.map( page => <Page page={page}/> ) }
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


const Page = ( props ) => {
    const { proxy } = useSelector( state => state )
    const { page } = props
    const [ tables, setTables ] = useState( page.tables )

    const { id } = useParams()
    const _token = localStorage.getItem("_token");

    const checkTrigger = async ( event, button ) => {
        const grant = event.target.checked
        console.log(button)
        if( grant ){
            const request = await fetch(`${ proxy() }/privileges/create/detail`, {
                method: "POST",
                headers: {
                    "Authorization": _token,
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ 
                    "detail": {
                        "privilegegroup_id": parseInt(id),
                        "button_id": button.button.id
                    } 
                })
            })

            const response = await request.json()
            console.log("GRANT", response)
            event.target.checked = true

        }else{
            const request = await fetch(`${ proxy() }/privileges/detail`, {
                method: "DELETE",
                headers: {
                    "Authorization": _token,
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ 
                    "detail": {
                        "privilegegroup_id": parseInt(id),
                        "button_id": button.button.id
                    } 
                })
            })

            const response = await request.json()
            console.log("REVOKE", response)
            event.target.checked = false
        }
    }

    return(
       <div className="privilege-page">
            <span style={{  fontWeight:"bold" }}>{ page.page_title }</span>
            
            {
                tables.map( table => <div className="privilege-table">
                    <div className="table-title">
                        <span>{ table.name }</span>
                    </div>
                    <div className="buttons">
                        { table.buttons.map( button => <div className="button" style={{ display: "flex" }}>
                            <div className="checkbox">
                                <input type="checkbox" checked={ button.grantted } onChange={(e) => { checkTrigger( e, button ) }}/>
                            </div>
                            <div className="button-name">
                                <span>{ button.title }</span>
                            </div>
                        </div> ) }
                    </div>
                </div> )
            }

            <div className="privileges">

            </div>
       </div>
    )
}