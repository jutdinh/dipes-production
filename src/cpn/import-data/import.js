
import { useParams } from "react-router-dom";
import Header from "../common/header"
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StatusEnum, StatusTask } from '../enum/status';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { Tables } from ".";
export default () => {
    const { lang, proxy, auth, functions } = useSelector(state => state);
    const [statusActive, setStatusActive] = useState(false);
    const _token = localStorage.getItem("_token");
    const { project_id, version_id } = useParams();
    let navigate = useNavigate();


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

                    })

                }
            };

            reader.readAsText(file);
        }
    };

    const importData = async () => {

        if (!uploadedJson) {
            // al.failure("Thất bại", "Vui lòng tải lên một file JSON trước khi import");
            return;
        }
        try {
            const response = await fetch(`${proxy()}/versions/import/database`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(uploadedJson),
            });

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
                })
            }
        } catch (error) {
            // console.error(error);
            Swal.fire({
                title: lang["faild"],
                text: lang["faild.content"],
                icon: "error",
                showConfirmButton: true,
            })
        }
    };
    const importAPI = async () => {
        // console.log("aa")
        if (!uploadedJson) {
            // al.failure("Thất bại", "Vui lòng tải lên một file JSON trước khi import");
            return;
        }
        try {
            const response = await fetch(`${proxy()}/versions/import/api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(uploadedJson),
            });

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

                })
            }
        } catch (error) {
            // console.error(error);
            Swal.fire({
                title: lang["faild"],
                text: lang["faild.content"],
                icon: "error",
                showConfirmButton: true,

            })
        }
    };

    const getFileType = () => {
        const { data } = uploadedJson
        const keys = Object.keys(data);

        const isApi = keys.filter(key => key == "apis")[0];
        if (isApi) {
            return "Api"
        } else {
            const isDatabase = keys.filter(key => key == "database")[0];
            if (isDatabase) {
                return "Database"
            } else {
                return lang["faild.format"]
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
                            <h4>Import data</h4>
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
                                            <h5> <a onClick={() => navigate(-1)}><i class="fa fa-chevron-circle-left mr-3 mb-2"></i></a>Import</h5>
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
                                        <div class="row" style={{ marginBottom: 'auto' }}>
                                            <div class="col-md-12 mt-4">
                                                <label>{lang["file name"]}: {file.name} </label>
                                            </div>
                                            <div class="col-md-12 mt-4">
                                                <label>{lang["type file"]}:
                                                    {uploadedJson ? (
                                                        getFileType() === "Không đúng định dạng, vui lòng chọn lại !" ? (
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
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}

            </div>
        </div>
    )
}

