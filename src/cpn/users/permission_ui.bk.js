import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import $ from 'jquery';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faDownload, faSquarePlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
export default (props) => {
    const { lang, proxy, auth, functions } = useSelector(state => state);
    
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
            const response = await fetch(`${proxy() }/privileges/ui/tree`, {
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
  
    useEffect(() => {

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
                            
                            { pages.map( page => <Page page={page}/> ) }

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


const Page = ( props ) => {
    const { page } = props
    return(
        <h1>{ page.page_title }</h1>
    )
}