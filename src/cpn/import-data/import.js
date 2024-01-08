
import { useParams } from "react-router-dom";
import Header from "../common/header"
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StatusEnum, StatusTask } from '../enum/status';

import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { Tables } from ".";
import { camelCase } from "jquery";
export default () => {
    const { lang, proxy, auth, functions, socket } = useSelector(state => state);
    const [statusActive, setStatusActive] = useState(false);
    const _token = localStorage.getItem("_token");
    const { project_id, version_id } = useParams();
    let navigate = useNavigate();
    const [loadingImport, setLoadingImport] = useState(false);

    const [file, setFile] = useState({});

    const dispatch = useDispatch();

    const [uploadedJson, setUploadedJson] = useState(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    setFile(file)
                    setUploadedJson(json);
                } catch (error) {
                    Swal.fire({
                        title: lang["faild"],
                        text: lang["format"],
                        icon: "error",
                        showConfirmButton: true,
                        customClass: {
                            confirmButton: 'swal2-confirm my-confirm-button-class'
                        }
                    })
                }
            };
            reader.readAsText(file);
        }
    };

    useEffect(() => {
        const stringifiedUser = localStorage.getItem("user");
        if (stringifiedUser) {
            const user = JSON.parse(stringifiedUser);
            const { role } = user;
            const validPrivileges = ["uad", "ad"];
    
            if (validPrivileges.indexOf(role) === -1) {
                window.location = "/page/thong-ke-thang-nam";
            }
        } else {

            window.location = "/login";
        }
    }, []);
    
    const importData = async () => {
        if (!uploadedJson) {
            return;
        }
    
        setLoadingImport(true);
    
        const minimumLoadingTime = 500;
        let isLoaded = false;
        
        const loadingTimeout = setTimeout(() => {
            if (!isLoaded) {
                setLoadingImport(true)
            }
        }, minimumLoadingTime);
        
        try {
            const response = await fetch(`${proxy()}/versions/import/database`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(uploadedJson),
            });
    
            clearTimeout(loadingTimeout);
            isLoaded = true;
            setLoadingImport(false);
    
            if (response.ok) {
                Swal.fire({
                    title: lang["success"],
                    text: lang["success.content"],
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });
    
                setTimeout(() => {
                    window.location.reload();
                }, 1600);
            } else {
                throw new Error('Response is not ok');
            }
        } catch (error) {
            Swal.close();
            Swal.fire({
                title: lang["faild"],
                text: lang["faild.content"],
                icon: "error",
                showConfirmButton: true,
                customClass: {
                    confirmButton: 'swal2-confirm my-confirm-button-class'
                }
            });
        }
    };

    const importAPI = async () => {
        // console.log("aa")
        if (!uploadedJson) {
            // al.failure("Thất bại", "Vui lòng tải lên một file JSON trước khi import");
            return;
        }
        let isLoaded = false;
        const minimumLoadingTime = 500;
        
        const loadingTimeout = setTimeout(() => {
            if (!isLoaded) {
               setLoadingImport(true)
                
            }
        }, minimumLoadingTime);
        try {
            const response = await fetch(`${proxy()}/versions/import/api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(uploadedJson),
            });
            clearTimeout(loadingTimeout);
            isLoaded = true;
            setLoadingImport(false);
            if (response.ok) {
              
                Swal.fire({
                    title: lang["success"],
                    text: lang["success.content"],
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,

                })

                setTimeout(() => {
                    window.location.reload();
                }, 1600);

            } else {
                Swal.fire({
                    title: lang["faild"],
                    text: lang["faild.content"],
                    icon: "error",
                    showConfirmButton: true,
                    customClass: {
                        confirmButton: 'swal2-confirm my-confirm-button-class'
                    }

                })
            }
        } catch (error) {
            clearTimeout(loadingTimeout);
            Swal.fire({
                title: lang["faild"],
                text: lang["faild.content"],
                icon: "error",
                showConfirmButton: true,
                customClass: {
                    confirmButton: 'swal2-confirm my-confirm-button-class'
                }

            })
        }
    };

    useEffect(() => {
        let timeout;
        if (loadingImport) {
            Swal.fire({
                title: lang["importing"],
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        } else {
            timeout = setTimeout(() => {
                Swal.close();
            }, 1700);
        }
        return () => {
            clearTimeout(timeout);
        };
    }, [loadingImport]);



    const importUI = async () => {
        // console.log("IMPORT UI")
        if (!uploadedJson) {
            // al.failure("Thất bại", "Vui lòng tải lên một file JSON trước khi import");
            return;
        }
        try {
            const response = await fetch(`${proxy()}/apis/import/ui`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ui: uploadedJson }),
            });

            if (response.ok) {
                socket.emit("/dipe-production-import-ui")
                Swal.fire({
                    title: lang["success"],
                    text: lang["success.content"],
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,

                })
                setTimeout(() => {
                    localStorage.setItem("ui", JSON.stringify(uploadedJson.data))
                    window.location.reload();
                }, 1600);

                dispatch({
                    type: "setUIPages",
                    payload: { pages: uploadedJson.data }
                })
            } else {
                Swal.fire({
                    title: lang["faild"],
                    text: lang["faild.content"],
                    icon: "error",
                    showConfirmButton: true,
                    customClass: {
                        confirmButton: 'swal2-confirm my-confirm-button-class'
                    }

                })
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: lang["faild"],
                text: lang["faild.content"],
                icon: "error",
                showConfirmButton: true,
                customClass: {
                    confirmButton: 'swal2-confirm my-confirm-button-class'
                }

            })
        }
    }

    const getFileType = () => {
        const { data } = uploadedJson
        const keys = Object.keys(data);

        const isApi = keys.filter(key => key == "apis")[0];
        if (isApi) {
            return lang["api"]
        } else {
            const isDatabase = keys.filter(key => key == "database")[0];
            if (isDatabase) {
                return lang["database"]
            } else {

                if (Array.isArray(data)) {
                    return "UI" // lang update if in need
                } else {
                    return lang["faild.format"]
                }
            }
        }
    }

    const CustomFileInput = ({ onChange, ...props }) => {
        const fileInputRef = useRef(null);
        const handleButtonClick = () => {
            fileInputRef.current.click();
        };
        const handleFileChange = (event) => {
            if (onChange) {
                onChange(event);
            }
        };
        return (
            <div>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    {...props}
                />
                <button onClick={handleButtonClick} className="btn btn-primary ml-2 mr-2">{lang["select file"]}</button>
            </div>
        );
    };

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

                }
                else {
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
                }


            })

    }, [])
    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h4 class="ml-1">Import data</h4>
                        </div>
                    </div>
                </div>
                
                {statusActive ? (
                    <>
                        <div class="row margin_top_30">
                            <div class="col-md-2"></div>
                            <div class="col-md-8">
                                <div class="white_shd full ">
                                    <div class="full graph_head">
                                        <div class="heading1 margin_0">
                                            <h5> Import</h5>
                                        </div>
                                    </div>
                                    {/* <div class="full price_table padding_infor_info" style={{ display: 'flex', flexDirection: 'column', minHeight: '40vh' }}>
                                <div class="row" style={{ marginBottom: 'auto' }}>
                                    <div class="col-md-12 mt-4">
                                        <label>Tên Tệp: {file.name} </label>
                                    </div>
                                    <div class="col-md-12 mt-4">
                                        <label>Dạng Tệp: 
                                            {uploadedJson ? (
                                                getFileType() === "Không đúng định dạng, vui lòng chọn lại !" ? (
                                                    <span className="text-red"> { getFileType()}</span>
                                                ) : (
                                                    getFileType()
                                                )
                                            ) : null}
                                        </label>
                                    </div>
                                    <div class="col-md-12 " style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <CustomFileInput onChange={handleFileUpload} />
                                        {uploadedJson && (
                                            getFileType() == "Api" ? (
                                                <button
                                                    onClick={importAPI}
                                                    className="btn btn-primary ml-1"
                                                >
                                                    Import API
                                                </button>
                                            ) : getFileType() == "Database" ? (
                                                <button
                                                    onClick={importData}
                                                    className="btn btn-primary"
                                                >
                                                    Import Database
                                                </button>
                                            ) : (
                                                <p className="text-red-500">
                                                </p>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div> */}
                                    <div class="full price_table padding_infor_info" style={{ display: 'flex', flexDirection: 'column', minHeight: '40vh' }}>
                                        <div class="form-group col-md-12" style={{ marginBottom: 'auto' }}>
                                            <div class="col-md-12 mt-4">
                                                <label><b class="font-weight-bold">{lang["file name"]}:</b> {file.name} </label>
                                            </div>
                                            <div class="col-md-12 mt-4">
                                                <label><b class="font-weight-bold">{lang["type file"]}:</b>
                                                    {uploadedJson ? (
                                                        getFileType() === " Không đúng định dạng, vui lòng chọn lại !" ? (
                                                            <span className="text-red"> {getFileType()}</span>
                                                        ) : (
                                                            getFileType()
                                                        )
                                                    ) : null}
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-md-12" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                                            <CustomFileInput onChange={handleFileUpload} />
                                            {uploadedJson && (
                                                getFileType() === lang["api"] ? (
                                                    <button
                                                        onClick={importAPI}
                                                        className="btn btn-primary ml-1"
                                                    >
                                                        Import API
                                                    </button>
                                                ) : getFileType() === lang["database"] ? (
                                                    <button
                                                        onClick={importData}
                                                        className="btn btn-primary"
                                                    >
                                                        Import Database
                                                    </button>
                                                ) : getFileType() == "UI" ? (
                                                    <button
                                                        onClick={importUI}
                                                        className="btn btn-primary"
                                                    >
                                                        Import UI
                                                    </button>
                                                ) : (
                                                    <p className="text-red-500">
                                                    </p>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}

            </div>
        </div>
    )
}

