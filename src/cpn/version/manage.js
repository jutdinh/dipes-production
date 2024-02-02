
import { useParams } from "react-router-dom";
import Header from "../common/header"
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { Table } from "react-bootstrap";
import $ from "jquery"

import DOMPurify from 'dompurify';


import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState, Modifier } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import draftToHtml from 'draftjs-to-html'
import { convertFromHTML } from 'draft-js';
import { convertFromRaw } from 'draft-js';


import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import CSS cho React-Quill


import ImageResize from 'quill-image-resize-module-react';


Quill.register('modules/imageResize', ImageResize);
  

export default () => {

    const { lang, proxy, auth } = useSelector(state => state);
    const _token = localStorage.getItem("_token");
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser)
    const [versions, setVersions] = useState([]);
    const [view, setView] = useState([])
    const [filter, setFilter] = useState({ type: 'info' });
    const [showModal, setShowModal] = useState(false);
    let langItem = localStorage.getItem("lang") ? localStorage.getItem("lang") : "Vi";
    const languages = langItem.toLowerCase();
    const [errorMessagesadd, setErrorMessagesadd] = useState({});
    const [version, setVersion] = useState({});
    const [updateVersion, setUpdateVersion] = useState({});
    const handleCloseModal = () => {
        setShowModal(false);
        setErrorMessagesadd({})
        setVersion({})
        setUpdateVersion({})
    };
    //console.log(view)

    useEffect(() => {
        const stringifiedUser = localStorage.getItem("user");
        const user = JSON.parse(stringifiedUser)
        const { role } = user;
        const validPrivileges = ["uad"]

        if (validPrivileges.indexOf(role) == -1) {
            // window.location = "/404-notfound"
        }
    }, [])
    //console.log(_user.username)
    useEffect(() => {
        callApi()

    }, [])

    const callApi = () => {
        fetch(`${proxy()}/versions`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;
                // //console.log(resp)
                if (success) {
                    if (data != undefined && data.length > 0) {
                        setVersions(data)
                        setView(data);
                    }
                } else {
                    window.location = "/login"
                }
            })
    }
    const [verDetail, setVerDetail] = useState([]);

    const detailLogs = async (logid) => {
        // //console.log(logid)
        setVerDetail(logid)
    };

    const submit = () => {
        const { version_name, version_description } = version;
        const errors = {};
        if (!version_name) {
            errors.version_name = lang["error.input"];
        }
        console.log(errors)
        if (Object.keys(errors).length > 0) {
            setErrorMessagesadd(errors);
            return;
        }
        version.version_description = value
        fetch(`${proxy()}/versions/version`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(version),
        })
            .then(res => res && res.json())
            .then((resp) => {
                if (resp) {
                    const { success, content, data, status } = resp;
                    console.log(resp)
                    if (success) {
                        setShowModal(false);
                        setVersion({})

                        callApi()
                        $('#closeModalAddVersion').click()
                    } else {
                        Swal.fire({
                            title: "Thất bại!",
                            text: content,
                            icon: "error",
                            showConfirmButton: false,
                            timer: 2000,
                        });
                    }
                }
            })
    };
    const handleUpdateVersion = (row) => {
        console.log(row)
        setUpdateVersion(row)


    }


    const handleDeleteVersion = (ver) => {
        const requestBody = {
            version_id: ver.version_id
        };
        Swal.fire({
            title: lang["confirm delete"],
            text: lang["title delete version"],
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: lang["btn.delete"],
            cancelButtonText: lang["btn.cancel"],
            confirmButtonColor: 'rgb(209, 72, 81)',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${proxy()}/versions/version`, {
                    method: 'DELETE',
                    headers: {
                        "content-type": "application/json",
                        Authorization: `${_token}`,
                    },
                    body: JSON.stringify(requestBody)
                })
                    .then(res => res.json())
                    .then((resp) => {
                        const { success, content, data, status } = resp;
                        if (success) {
                            callApi()
                            Swal.fire({
                                title: lang["success"],
                                text: content,
                                icon: "success",
                                showConfirmButton: false,
                                timer: 1500,
                            });
                        }
                    });
            }
        });
        // //console.log(requestBody)

    }

    const updateVer = () => {
        const { version_name, version_description } = updateVersion;
        const errors = {};
        if (!version_name) {
            errors.version_name = lang["error.input"];
        }
        if (!version_name) {
            errors.version_description = lang["error.input"];
        }

        if (Object.keys(errors).length > 0) {
            setErrorMessagesadd(errors);
            return;
        }

        fetch(`${proxy()}/versions/version`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(updateVersion),
        })
            .then(res => res && res.json())
            .then((resp) => {
                if (resp) {
                    const { success, content, data, status } = resp;
                    console.log(resp)
                    if (success) {
                        setShowModal(false);
                        callApi()
                        $('#closeModalUpdateVersion').click()
                    } else {
                        Swal.fire({
                            title: "Thất bại!",
                            text: content,
                            icon: "error",
                            showConfirmButton: false,
                            timer: 2000,
                        });
                    }
                }
            })
    };

    const [currentPageVer, setCurrentPageVer] = useState(1);
    const rowsPerPageVers = 10;
    const indexOfLastVer = currentPageVer * rowsPerPageVers;
    const indexOfFirstVer = indexOfLastVer - rowsPerPageVers;
    const currentVersion = view.slice(indexOfFirstVer, indexOfLastVer);
    const paginateVers = (pageNumber) => setCurrentPageVer(pageNumber);
    const totalPagesVers = Math.ceil(view.length / rowsPerPageVers);

    function openModalWithContent(jsonContent) {
        // Định dạng JSON để hiển thị đẹp hơn
        const formattedJson = JSON.stringify(jsonContent, null, 4);


    }
    const textareaRef = useRef(null);

    useLayoutEffect(() => {
        if (textareaRef.current) {
            const element = textareaRef.current;
            element.style.minHeight = 'auto';
            element.style.overflowY = 'auto';

            const scrollHeight = element.scrollHeight;
            element.style.minHeight = scrollHeight + 'px';
        }
    }, [currentVersion]);

    const [tableMaxHeight, setTableMaxHeight] = useState('50vh');

    useEffect(() => {
        function updateTableHeight() {

            const newHeight = window.innerHeight - 220;
            setTableMaxHeight(`${newHeight}px`);
        }
        window.addEventListener('resize', updateTableHeight);
        updateTableHeight();
        return () => {
            window.removeEventListener('resize', updateTableHeight);
        };
    }, []);

    const headerRefs = useRef([]);

    useLayoutEffect(() => {
        headerRefs.current.forEach((ref) => {
            if (ref) {
                const maxWidth = parseInt(getComputedStyle(ref).maxWidth, 10);
                const minWidth = Math.min(ref.scrollWidth, maxWidth);
                ref.style.minWidth = `${minWidth}px`;
            }
        });
    }, []);


    const [value, setValue] = useState('');
 
    const modules = {
        toolbar: [
          [{ 'header': [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
          ['link', 'image'],
          ['clean'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'font': [] }],
          [{ 'align': [] }],
         
        ],
       
      };

    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h4>{lang["manage version"]}</h4>
                            <button style={{ marginTop: 0 }} type="button" class="btn btn-primary custom-buttonadd ml-auto mr-4" data-toggle="modal" data-target="#addVersion">
                                <i class="fa fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <div class="white_shd full ">
                            {/* <div class="full graph_head">
                                <div class="heading1 margin_0">
                                    <h5>{lang["log.listlog"]}</h5>
                                </div>
                            </div> */}
                            <div class="table_section padding_infor_info_ver">
                                <div class="table-responsive table-custom">
                                    <div style={{
                                        maxHeight: tableMaxHeight,
                                        overflowY: "auto"
                                    }}>
                                        {
                                            view && view.length > 0 ? (
                                                <>
                                                    <Table bordered >
                                                        <thead class="sticky-header-log">
                                                            <tr>
                                                                <td >{lang["log.no"]}</td>
                                                                <td >{lang["version name"]}</td>
                                                                <td >{lang["description"]}</td>
                                                                <td >{lang["time update"]}</td>
                                                                <td class="align-center">{lang["log.action"]}</td>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentVersion.map((ver, index) => {
                                                                return (
                                                                    <tr key={ver.id}>
                                                                        <td style={{ width: "50px" }}>{indexOfFirstVer + index + 1}</td>
                                                                        <td >{ver.version_name}</td>
                                                                        <td class="cell-ver">
                                                                            {/* {<span dangerouslySetInnerHTML={{ __html: ver.version_description }} /> } */}
                                                                            {/* <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ver.version_description) }} /> */}

                                                                            <div
                                                                                contentEditable={true}
                                                                                dangerouslySetInnerHTML={{ __html: ver.version_description }}
                                                                                onInput={(e) => {
                                                                                    setUpdateVersion({ ...updateVersion, version_description: e.currentTarget.innerHTML });
                                                                                }}
                                                                                style={{ paddingRight: '20px', paddingLeft: '20px'  }}
                                                                            />

                                                                        </td>
                                                                        <td class="align-center" style={{ width: "160px" }}>{ver.modified_at}</td>
                                                                        <td style={{ width: "80px" }}>
                                                                            <div class="icon-table" >
                                                                                <div className="icon-table-line">
                                                                                    <i class="fa fa-edit icon-edit pointer size-24" onClick={() => handleUpdateVersion(ver)} data-toggle="modal" data-target="#updateVersion"></i>
                                                                                </div>
                                                                                <div className="icon-table-line">
                                                                                    <i class="fa fa-trash-o icon-delete pointer size-24" onClick={() => handleDeleteVersion(ver)} ></i>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </Table>


                                                </>
                                            ) : (
                                                <div class="list_cont ">
                                                    <p>Chưa có versions</p>
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-2">

                                        <p>{lang["show"]} {indexOfFirstVer + 1}-{Math.min(indexOfLastVer, versions.length)} {lang["of"]} {versions.length} {lang["results"]}</p>

                                        <nav aria-label="Page navigation example">
                                            <ul className="pagination mb-0">
                                                <li className={`page-item ${currentPageVer === 1 ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => paginateVers(1)}>
                                                        &#8810;
                                                    </button>
                                                </li>
                                                <li className={`page-item ${currentPageVer === 1 ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => paginateVers(currentPageVer - 1)}>
                                                        &laquo;
                                                    </button>
                                                </li>
                                                {currentPageVer > 3 && <li className="page-item"><span className="page-link">...</span></li>}
                                                {Array(totalPagesVers).fill().map((_, index) => {
                                                    if (
                                                        index + 1 === currentPageVer ||
                                                        (index + 1 >= currentPageVer - 5 && index + 1 <= currentPageVer + 5)
                                                    ) {
                                                        return (
                                                            <li key={index} className={`page-item ${currentPageVer === index + 1 ? 'active' : ''}`}>
                                                                <button className="page-link" onClick={() => paginateVers(index + 1)}>
                                                                    {index + 1}
                                                                </button>
                                                            </li>
                                                        )
                                                    }
                                                })}
                                                {currentPageVer < totalPagesVers - 2 && <li className="page-item"><span className="page-link">...</span></li>}
                                                <li className={`page-item ${currentPageVer === totalPagesVers ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => paginateVers(currentPageVer + 1)}>
                                                        &raquo;
                                                    </button>
                                                </li>
                                                <li className={`page-item ${currentPageVer === totalPagesVers ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => paginateVers(totalPagesVers)}>
                                                        &#8811;
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* add version */}
                <div class="modal no-select-modal fade" id="addVersion" tabindex="-1" role="dialog" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-center" role="document">
                        <div class="modal-content p-md-3">
                            <div class="modal-header">
                                <h4 class="modal-title">{lang["add version"]} </h4>
                                <button class="close" type="button" onClick={handleCloseModal} data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="row">
                                        <div class="form-group col-lg-12">
                                            <label class="font-weight-bold text-small" for="firstname">{lang["version name"]}<span className='red_star ml-1'>*</span></label>
                                            {errorMessagesadd.version_name && <span class="error-message ml-1">{errorMessagesadd.version_name}</span>}
                                            <input type="text" class="form-control" value={version.version_name} onChange={
                                                (e) => { setVersion({ ...version, version_name: e.target.value }) }
                                            } placeholder={lang["p.version"]} />
                                        </div>
                                        <div class="form-group col-lg-12">
                                            <label class="font-weight-bold text-small" for="projectdetail">{lang["description"]}<span className='red_star ml-1'>*</span></label>
                                            {errorMessagesadd.version_description && <span class="error-message ml-1">{errorMessagesadd.version_description}</span>}
                                            <ReactQuill
                                                value={value}
                                                onChange={setValue}
                                                modules={modules}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" style={{ minWidth: "105px" }} onClick={submit} class="btn btn-success">{lang["btn.create"]}</button>
                                <button type="button" style={{ minWidth: "105px" }} id="closeModalAddVersion" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* update version */}
                <div class="modal no-select-modal fade" id="updateVersion" tabindex="-1" role="dialog" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-center" role="document">
                        <div class="modal-content p-md-3">
                            <div class="modal-header">
                                <h4 class="modal-title">{lang["update version"]} </h4>
                                <button class="close" type="button" onClick={handleCloseModal} data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="row">
                                        <div class="form-group col-lg-12">
                                            <label class="font-weight-bold text-small" for="firstname">{lang["version name"]}<span className='red_star ml-1'>*</span></label>
                                            {errorMessagesadd.version_name && <span class="error-message ml-1">{errorMessagesadd.version_name}</span>}
                                            <input type="text" class="form-control" value={updateVersion.version_name} onChange={
                                                (e) => { setUpdateVersion({ ...updateVersion, version_name: e.target.value }) }
                                            } placeholder={lang["p.version"]} />

                                        </div>

                                        {/* <div class="form-group col-lg-12">
                                            <label class="font-weight-bold text-small" for="projectdetail">{lang["description"]}</label>
                                            <textarea maxlength="500" rows="5" type="text" class="form-control" value={updateVersion.version_description} onChange={
                                                (e) => { setUpdateVersion({ ...updateVersion, version_description: e.target.value }) }
                                            } />
                                        </div> */}
                                        <div class="form-group col-lg-12">
                                            <label class="font-weight-bold text-small" for="projectdetail">{lang["description"]}<span className='red_star ml-1'>*</span></label>
                                            {errorMessagesadd.version_description && <span class="error-message ml-1">{errorMessagesadd.version_description}</span>}


                                            <ReactQuill
                                                value={updateVersion.version_description}
                                                onChange={(content) => {
                                                    setUpdateVersion(prevVersion => ({
                                                        ...prevVersion,
                                                        version_description: content
                                                    }));
                                                }}
                                                modules={modules}
                                            />

                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" style={{ minWidth: "105px" }} onClick={updateVer} class="btn btn-success">{lang["btn.update"]}</button>
                                <button type="button" style={{ minWidth: "105px" }} id="closeModalUpdateVersion" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}

