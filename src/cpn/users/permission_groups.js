import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import $ from 'jquery';
import Swal from 'sweetalert2';
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faDownload, faSquarePlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
export default (props) => {
    const { lang, proxy, auth, functions } = useSelector(state => state);
    let navigate = useNavigate();
    const goToHomePage = () => {
        navigate(`/privileges`);
    };

    const [groups, setGroups] = useState([])
    const [group, setGroup] = useState({})

    const _token = localStorage.getItem("_token");


    useEffect(() => {

        const FetchDataAsync = async () => {
            const response = await fetch(`${proxy()}/privileges/groups`, {
                headers: {
                    "Authorization": _token
                }
            })
            const serializedData = await response.json()
            const { groups } = serializedData;

            setGroups(groups)
        }

        FetchDataAsync()

    }, [])

    const handleCloseModal = () => {
        setGroup({
            name: ""
        })

        $("#add-group-modal-close").click()
    }

    const submit = async () => {
        
        const request = await fetch(`${ proxy() }/privileges/create/group`, {
            method: "POST",
            headers: {
                "Authorization": _token,
                "Content-type": "Application/json"
            },
            body: JSON.stringify({ group })
        })

        const response = await request.json()
        const { success, data } = response;
        if( success ){
            setGroups([...groups, data])
            handleCloseModal()
        }else{
            const { content } = response
            alert(content)
        }
    }


    const deleteTrigger = async ( group ) => {
        const { privilegegroup_id } = group;
        
        const request = await fetch(`${ proxy() }/privileges/group`, {
            method: "DELETE",
            headers: {
                "content-type": "application/json",
                "Authorization": _token
            },
            body: JSON.stringify({ group: { privilegegroup_id } })
        })

        const response = await request.json()        

        const { success, content } = response
        if( success ){
            const groupLeftBehind = groups.filter( g => g.privilegegroup_id != privilegegroup_id )
            setGroups( groupLeftBehind )
        }else{
            /**
             * 
             * Re-create sweet alert 
             * 
             */
            alert(content)
        }
    }


    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title d-flex align-items-center">
                            <h4 class="ml-1">{lang["privileges groups"]}</h4>
                        </div>
                    </div>
                </div>




                <div class="row column1">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">


                            <div class="full graph_head">
                                <div class="heading1 margin_0">
                                    <div className="row justify-content-end">
                                        <div className="col-auto d-flex align-items-center" style={{ padding: 0 }}>
                                            <h5>{lang["privileges groups"]}</h5>

                                            <button style={{ marginTop: 0 }} type="button" class="btn btn-primary custom-buttonadd ml-auto mr-4" data-toggle="modal" data-target="#quoteForm">
                                                <i class="fa fa-plus"></i>
                                            </button>
                                        </div>


                                        {
                                            /**
                                             * 
                                             * Sì tai gớm ghiết cần đc đặt lại
                                             * 
                                             * 
                                             */
                                        }

                                    </div>
                                </div>
                            </div>


                            <div class="full price_table padding_infor_info_user">
                                <div class="col-md-12">
                                    {groups && groups.length > 0 ?
                                        <>
                                            <div class="table-responsive mb-2">
                                                {
                                                    <>
                                                        <table class="table table ">
                                                            <thead>
                                                                <tr class="color-tr">
                                                                    <th class="font-weight-bold" style={{ width: "30px" }} scope="col">{lang["log.no"]}</th>
                                                                    <th class="font-weight-bold" scope="col">{lang["group name"]}</th>
                                                                    {
                                                                        ["pm", "ad", "uad"].indexOf(auth.role) != -1 &&
                                                                        <th class="font-weight-bold align-center" style={{ width: "150px" }}>{lang["log.action"]}</th>
                                                                    }
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {groups.map((group, index) => (
                                                                    <tr key={index}>
                                                                        <td>{index}</td>
                                                                        <td>{group.group_name}</td>


                                                                        {
                                                                            ["pm", "ad", "uad"].indexOf(auth.role) != -1 &&
                                                                            <td>
                                                                                <div className="row text-center">
                                                                                    <div class="icon-table">
                                                                                        <div className="icon-table-line">
                                                                                            <Link to={`/privileges/group/${ group.privilegegroup_id }`}><i class="fa fa-edit icon-edit pointer size-24"/></Link>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="icon-table">
                                                                                        <div className="icon-table-line" onClick={() => { deleteTrigger( group ) }}>
                                                                                            <i class="fa fa-trash icon-delete pointer size-24"/>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        }

                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </>

                                                }
                                            </div>
                                        </>
                                        :

                                        <div>
                                            {lang["not found user"]}
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                </div>





                {/* Modal add */}
                <div class="modal no-select-modal fade" id="quoteForm" tabindex="-1" role="dialog" aria-labelledby="quoteForm" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-center" role="document">
                        <div class="modal-content p-md-3">
                            <div class="modal-header">
                                <h4 class="modal-title">{lang["adduser.title"]} </h4>
                                <button class="close" id="add-group-modal-close" type="button" onClick={handleCloseModal} data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="row">

                                        <div class="form-group col-lg-6">
                                            <label class="font-weight-bold text-small" for="firstname">{lang["privileges groups group_name"]}<span className='red_star ml-1'>*</span></label>
                                            <input type="text" class="form-control" value={group.name} onChange={
                                                (e) => { setGroup({ ...group, name: e.target.value }) }
                                            } placeholder={lang["privileges groups group_name"]} />

                                        </div>

                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" style={{ minWidth: "105px" }} onClick={submit} class="btn btn-success">{lang["btn.create"]}</button>
                                <button type="button" style={{ minWidth: "105px" }} onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    )
}
