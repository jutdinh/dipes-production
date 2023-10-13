import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faDownload, faSquarePlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import StatisTable from '../statistic/table_chart'
import Swal from 'sweetalert2';
import ReactECharts from 'echarts-for-react';
import $ from 'jquery'
import XLSX from 'xlsx-js-style';
import { PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, AreaChart, Area, ComposedChart, ScatterChart, Scatter } from 'recharts';

const RECORD_PER_PAGE = 10

export default (props) => {
    const { lang, proxy, auth, pages, functions, socket } = useSelector(state => state);
    const { openTab, renderDateTimeByFormat } = functions
    const { project_id, version_id, url } = useParams();
    const _token = localStorage.getItem("_token");
    const { formatNumber } = functions
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser) || {}
    const page = props.page
    const [isActivated, setIsActivated] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [dataFile, setDataFile] = useState({})
    console.log(props)
    const [reason, setReason] = useState("")

    const handleNextStep = (e) => {
        e.preventDefault();
        setCurrentStep(2);
        const data = {
            ...dataFile,
            reason: reason
        }
        console.log(data)
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setCurrentStep(3);
    };


    function formatPrinterKey(key) {
        return key.match(/.{1,4}/g).join('-');
    }

    const rawKey = "PRTA123B45PRTA123B45";
    const formattedKey = formatPrinterKey(rawKey);



    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Kiểm tra phần mở rộng của tệp
            if (file.name.split('.').pop() !== 'txt') {
                alert('Vui lòng chọn một tệp .txt!');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target.result;
                let parsedContent;
                try {
                    parsedContent = JSON.parse(fileContent);
                } catch (error) {
                    console.error("Failed to parse file content:", error);
                    alert('Nội dung tệp không đúng định dạng!');
                    return;
                }

                if (!parsedContent.controller || !Array.isArray(parsedContent.printhead)) {
                    alert('Nội dung tệp không đúng định dạng mong muốn!');
                    return;
                }

                const transformedData = {
                    data: parsedContent
                };

                setDataFile(transformedData);

            };
            reader.readAsText(file);
        }
    };

    useEffect(() => {
        if (page && page.components) {
            // const id_str = page.components?.[0]?.api_post.split('/')[2];
            const id_str = page.components?.[0]?.api_get.split('/')[2];
            // console.log(id_str)
            fetch(`${proxy()}/apis/api/${id_str}/input_info`, {
                headers: {
                    Authorization: _token
                }
            })
                .then(res => res.json())
                .then(res => {
                    const { data, success, content } = res;
                    console.log(res)
                    if (success) {

                        // setDataTables(data.tables)
                        // setDataTableID(data.tables[0].id)
                        // setDataFields(data.body)
                        // setLoaded(true)
                    }
                })
        }
    }, [page])
    const submit = () => {

        fetch(`${proxy()}${page?.components?.[0]?.api_get}`, {
            method: "POST",
            headers: {
                Authorization: _token,
                "content-type": "application/json"
            },
            body: JSON.stringify({ ...dataFile })
        })
            .then(res => res.json())
            .then(res => {
               
                const { data, success, content } = res;
                console.log(res)
                if (success) {
                    setCurrentStep(2);
                }

                // socket.emit("/dipe-production-new-data-added", dataSubmit);
            })
            .catch(error => {

                // Xử lý lỗi nếu cần
            });

    };


    console.log(dataFile)

    return (
        <>
            <div class="col-md-12">
                <div class="white_shd full">
                    <div class="tab_style2 layout2">
                        <div class="tabbar">
                            <nav>
                                <div className="nav nav-tabs" style={{ borderBottomStyle: "0px" }} >
                                    <div class="full graph_head_cus d-flex">
                                        <div class="heading1_cus margin_0 nav-item nav-link ">
                                            <h5>Active</h5>
                                        </div>

                                    </div>
                                </div>
                            </nav>
                        </div>
                    </div>
                    <div class="table_section padding_infor_info_layout2 ">
                        <div class="col-md-12">
                            <div class="tab-content">
                                <div className="container justify-content-center mt-3">

                                    <div className="step-indicator mlr-5">
                                        <ul className="step-list">
                                            <li className={`step-item ${currentStep === 1 ? "step-active" : ""} step-arrow-right`}>
                                                <a className="step-link">Step 1: Thông Tin Máy In</a>
                                            </li>
                                            <li className={`step-item ${currentStep === 2 ? "step-active" : ""} step-arrow-both`}>
                                                <a className="step-link">Step 2: [Tên bước mới]</a>
                                            </li>
                                            <li className={`step-item ${currentStep === 3 ? "step-active" : ""} step-arrow-left-flat-right`}>
                                                <a className="step-link">Step 3: Kết Quả Kích Hoạt</a>
                                            </li>

                                        </ul>
                                    </div>
                                    {currentStep === 1 && (
                                        <div class="row justify-content-center mt-5">

                                            <div class="col-md-12 p-20">
                                                <div id="step1">
                                                    {/* <h2 class="align-center mb-4">Thông Tin Kích Hoạt License Máy In</h2> */}
                                                    <form onSubmit={handleSubmit}>


                                                        <div className="form-group">
                                                            <label htmlFor="fileInput">Chọn tệp</label>
                                                            <input
                                                                type="file"
                                                                className="form-control"
                                                                id="fileInput"
                                                                onChange={handleFileChange}
                                                            />
                                                        </div>



                                                        <div class="form-group">
                                                            <label for="serialNumber">Reason</label>
                                                            <input
                                                                type="text"
                                                                class="form-control"
                                                                id="serialNumber"
                                                                placeholder="Nhập số LOT"
                                                                value={reason}
                                                                onChange={(e) => setReason(e.target.value)}
                                                            />
                                                        </div>

                                                        <div class="button-group">
                                                            <button type="submit" onClick={submit} className="btn btn-primary">Kích hoạt</button>
                                                        </div>

                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div>
                                            <div class="row mt-5">
                                                <div class="col-md-6">
                                                    <div class="form-group col-lg-12">
                                                        <label class="mr-2">Dòng máy:</label>
                                                        <span class="font-weight-bold ">R10</span>
                                                    </div>
                                                    <div class="form-group col-lg-12">
                                                        <label class="mr-2">UUID:</label>
                                                        <span class="font-weight-bold">f4d4b1f8-8d44-11eb-8dcd-0242ac130003</span>
                                                    </div>
                                                    <div class="form-group col-lg-12">
                                                        <label class="mr-2">Số LOT:</label>
                                                        <span class="font-weight-bold">LOT2023-927A45B7</span>
                                                    </div>
                                                    <div class="form-group col-lg-12">
                                                        <label class="mr-2">Người kích hoạt:</label>
                                                        <span class="font-weight-bold">user@gmail.com</span>
                                                    </div>
                                                </div>
                                                <div class="col-md-6 center-image">
                                                    {/* <img src="/images/helpdesk/r10.png" width={448}></img> */}
                                                    <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
                                                        <ol class="carousel-indicators">
                                                            <li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
                                                            <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
                                                            <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>
                                                        </ol>
                                                        <div class="carousel-inner">
                                                            <div class="carousel-item active">
                                                                <img class="d-block w-100" src="/images/helpdesk/r10.png" alt="First slide" />
                                                            </div>
                                                            <div class="carousel-item">
                                                                <img class="d-block w-100" src="/images/helpdesk/r10.png" alt="Second slide" />
                                                            </div>
                                                            <div class="carousel-item">
                                                                <img class="d-block w-100" src="/images/helpdesk/r10.png" alt="Third slide" />
                                                            </div>
                                                        </div>
                                                        <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
                                                            <i class="fa fa-chevron-left fa-2x color-black"></i>
                                                        </a>
                                                        <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
                                                            <i class="fa fa-chevron-right fa-2x color-black"></i>
                                                        </a>

                                                    </div>
                                                </div>

                                            </div>
                                            <div class="row">
                                                <div class="col-md-12 pl-10">
                                                    <div class="form-group col-lg-12">
                                                        <label htmlFor="activationKey" class="no-select">Mã kích hoạt (Key):</label>
                                                        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={formattedKey}
                                                                readOnly
                                                                style={{ flex: 1 }}
                                                            />
                                                            {/* <i
                            className="fa fa-clipboard ml-3 pointer"
                            onClick={handleCopy}
                            style={{ fontSize: '24px' }}
                            title='Copy'
                          ></i> */}


                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="button-group">
                                                <button style={{ width: "100px" }} className="btn btn-primary mr-2" >Sao chép</button>
                                                <button type="submit" onClick={handleSubmit} className="btn btn-primary">Kích hoạt</button>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <></>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}