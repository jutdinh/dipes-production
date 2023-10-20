import { useEffect, useState } from "react";
import { batch, useSelector } from "react-redux";
import React from 'react';
import ReactECharts from 'echarts-for-react';
import $ from 'jquery'
import IncrementalNumber from './number';
import { PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, AreaChart, Area, ComposedChart, ScatterChart, Scatter } from 'recharts';
const RECORD_PER_PAGE = 10

export default (props) => {
    const { functions, lang } = useSelector(state => state)
    const { formatNumber } = functions

    const { data, statis } = props
    // console.log(props)
    const { display_name, type } = statis;
    const { headers, values } = data;
    const page = props.page
    console.log(props)
    const [display, setDisplay] = useState(headers.slice(0, RECORD_PER_PAGE))
    const [currentPage, setCurrentPage] = useState(0)
    const totalPages = Math.ceil(headers.length / RECORD_PER_PAGE);

    function generateUniqueColors(num) {
        const step = Math.cbrt((256 * 256 * 256) / num);
        const colors = [];

        for (let r = 0; r < 256; r += step) {
            for (let g = 0; g < 256; g += step) {
                for (let b = 0; b < 256; b += step) {
                    if (colors.length >= num) {
                        return colors;
                    }
                    if (r === 0 && g === 0 && b === 0) {
                        // Bỏ qua màu đen
                        continue;
                    }
                    const color = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
                    colors.push(color);
                }
            }
        }
        return colors;
    }

    const COLORS = generateUniqueColors(props.data.values.length);

    // const MyBarChart1 = () => {
    //     const COLORS = ["#4D90FE", "#50E3C2"]; // Example colors
    //     const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    //     const LABELS = ["controller", "printhead"];
    //     // Extract years and months
    //     const years = [...new Set(data.headers.map(header => header.split(' ')[1]))];

    //     const currentYear = new Date().getFullYear();
    //     const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    //     const [barData, setBarData] = useState([]);

    //     // Update bar data based on selected year
    //     useEffect(() => {
    //         const filteredData = data.values.map((value, index) => {
    //             const parts = data.headers[index].split(' ');
    //             const monthYear = `${parts[0]} ${parts[1]}`;
    //             return {
    //                 name: monthYear,
    //                 value: parts[1] === selectedYear ? value : 0,
    //             };
    //         });

    //         const nonZeroData = filteredData.filter(item => item.value !== 0);
    //         setBarData(nonZeroData);

    //     }, [selectedYear, data]);

    //     const showLabels = data.values.length < 50;
    //     const itemColors = barData.map((_, index) => COLORS[index % COLORS.length]);


    //     const option = {
    //         grid: {
    //             left: '5%',
    //             right: '2%',
    //             top: '9%',
    //             bottom: '5%'
    //         },
    //         xAxis: {
    //             type: 'category',
    //             data: barData.map(item => item.name),
    //             axisLabel: {
    //                 show: true
    //             }
    //         },
    //         yAxis: {
    //             type: 'value'
    //         },
    //         tooltip: {
    //             trigger: 'axis',
    //             formatter: function (params) {
    //                 const data = params[0];
    //                 return `${data.name}: ${formatNumber(data.value.toFixed())}`;
    //             }
    //         },
    //         legend: {
    //             show: true,
    //             data: LABELS, // Use the new labels
    //         },
    //         series: [{
    //             name: LABELS[0],
    //             type: 'bar',
    //             data: barData.map(item => item.value),
    //             itemStyle: {
    //                 color: params => itemColors[params.dataIndex]
    //             }
    //         }]

    //     };

    //     return (
    //         <div className="bar-container">
    //             <div className="select-container">
    //                 {years.length > 1 && (
    //                     <select
    //                         class="form-control"
    //                         value={selectedYear}
    //                         onChange={e => setSelectedYear(e.target.value)}
    //                     >
    //                         {years.map(year => (
    //                             <option key={year} value={year}>{year}</option>
    //                         ))}
    //                     </select>
    //                 )}
    //             </div>

    //             <ResponsiveContainer className="bar-chart-container">
    //                 <ReactECharts option={option} style={{ height: 430, width: '100%' }} />

    //             </ResponsiveContainer>
    //             {/* <div className="bar-legend-container">
    //                 <div className="legend-item">
    //                     <div className="color-box" style={{ backgroundColor: COLORS }}></div>
    //                     <p>{lang["value"]}</p>
    //                 </div>
    //             </div> */}
    //         </div>
    //     );
    // };
    const MyBarChart1 = () => {


        const COLORS = ["#4D90FE", "#50E3C2", "#FFC658"];
        const months = [
            lang["january"],
            lang["february"],
            lang["march"],
            lang["april"],
            lang["may"],
            lang["june"],
            lang["july"],
            lang["august"],
            lang["september"],
            lang["october"],
            lang["november"],
            lang["december"],
        ];
        const LABELS = ["Controller", "Print head", "Printer"];

        const years = [...new Set(data.headers.map(header => header.split(' ')[1]))];
        const currentYear = new Date().getFullYear();
        const [selectedYear, setSelectedYear] = useState(currentYear.toString());
        const [currentMonth, setSurrentMonth] = useState(new Date().getMonth() + 1);
        const [barData, setBarData] = useState([]);
        console.log(barData)
        const [totalControllerForYear, setTotalControllerForYear] = useState(0);
        const [totalPrintheadForYear, setTotalPrintheadForYear] = useState(0);
        const [totalControllerForCurrentMonth, setTotalControllerForCurrentMonth] = useState(0);
        const [totalPrintheadForCurrentMonth, setTotalPrintheadForCurrentMonth] = useState(0);

        const [totalPrinterForYear, setTotalPrinterForYear] = useState(0);
        const [totalPrinterForCurrentMonth, setTotalPrinterForCurrentMonth] = useState(0);
        // console.log("controller trong năm", totalControllerForYear)
        // console.log("printhead trong năm", totalPrintheadForYear)
        // console.log("controller trong tháng", totalControllerForCurrentMonth)
        // console.log("printhead trong tháng", totalPrintheadForCurrentMonth)
        useEffect(() => {
            let yearControllerTotal = 0;
            let yearPrintheadTotal = 0;
            let yearPrinterTotal = 0;
            let monthControllerTotal = 0;
            let monthPrintheadTotal = 0;
            let monthPrinterTotal = 0;

            // Trả về tháng hiện tại từ 1 (January) đến 12 (December)


            barData.forEach(item => {
                yearControllerTotal += item.controller;
                yearPrintheadTotal += item.printhead;
                yearPrinterTotal += item.printer;

                const monthAndYear = item.name.split(' ');
                const itemMonth = monthAndYear[0]; // Tháng là phần tử đầu tiên trong mảng
                const itemYear = monthAndYear[1]; // Năm là phần tử thứ hai trong mảng
                const monthAbbreviation = months[itemMonth - 1]; // Chuyển đổi thành viết tắt

                if (monthAbbreviation === months[currentMonth - 1] && itemYear === selectedYear) {
                    monthControllerTotal = item.controller;
                    monthPrintheadTotal = item.printhead;
                    monthPrinterTotal = item.printer;
                }
            });

            setTotalControllerForYear(yearControllerTotal);
            setTotalPrintheadForYear(yearPrintheadTotal);
            setTotalPrinterForYear(yearPrinterTotal); // Cập nhật cho printer
            setTotalControllerForCurrentMonth(monthControllerTotal);
            setTotalPrintheadForCurrentMonth(monthPrintheadTotal);
            setTotalPrinterForCurrentMonth(monthPrinterTotal);

        }, [barData, selectedYear]);

        useEffect(() => {
            const filteredData = [];
            for (let i = 0; i < data.headers.length; i += 3) { // Cập nhật vòng lặp để xử lý 3 giá trị
                const monthYear = data.headers[i].split(' ')[0] + ' ' + data.headers[i].split(' ')[1];
                if (data.headers[i].split(' ')[1] === selectedYear) {
                    filteredData.push({
                        name: monthYear,
                        controller: data.values[i],
                        printhead: data.values[i + 1],
                        printer: data.values[i + 2], // Thêm dữ liệu printer
                    });
                }
            }
            setBarData(filteredData);
        }, [selectedYear, data]);

        const option = {
            grid: {
                left: '5%',
                right: '3%',
                top: '9%',
                bottom: '8%'
            },
            xAxis: {
                type: 'category',
                data: months,
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#333',
                        fontFamily: 'UTM avo',
                        fontSize: 14,
                        // fontWeight: 'bold'   
                    }
                }
            },
            yAxis: {
                type: 'value'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    let result = '';

                    // Kiểm tra xem params có phải là một mảng và có dữ liệu
                    if (Array.isArray(params) && params.length > 0) {
                        // Kiểm tra dữ liệu cho Controller
                        const controllerData = params.find(p => p.seriesName === LABELS[0]);
                        if (controllerData) {
                            result += `<strong>${controllerData.name}</strong><br/>${LABELS[0]}: ${controllerData.value.toFixed()}`;
                        }

                        // Kiểm tra dữ liệu cho Print head
                        const printheadData = params.find(p => p.seriesName === LABELS[1]);
                        if (printheadData) {
                            if (result) result += '<br/>'; // Thêm dòng mới nếu có dữ liệu cho Controller
                            result += `${LABELS[1]}: ${printheadData.value.toFixed()}`;
                        }
                         // Kiểm tra dữ liệu cho Printer
                         const printerData = params.find(p => p.seriesName === LABELS[2]);
                         if (printerData) {
                             if (result) result += '<br/>'; // Thêm dòng mới nếu có dữ liệu cho Controller
                             result += `${LABELS[2]}: ${printerData.value.toFixed()}`;
                         }
                    }

                    return result;
                }
            },
            legend: {
                show: true,
                data: LABELS,
                align: 'left',
                padding: 5,
                itemGap: 15,
                textStyle: {
                    fontSize: 14,
                    fontFamily: 'UTM Avo'
                }
            },

            series: [{
                name: LABELS[0], // Controller
                type: 'bar',
                data: barData.map(item => item.controller),
                itemStyle: {
                    color: COLORS[0]
                }
            },
            {
                name: LABELS[1], // Printhead
                type: 'bar',
                data: barData.map(item => item.printhead),
                itemStyle: {
                    color: COLORS[1]
                }
            },
            {
                name: LABELS[2], // Printer
                type: 'bar',
                data: barData.map(item => item.printer),
                itemStyle: {
                    color: COLORS[2]
                }
            }]
        };

        return (
            <>
                <div class="row column1 mb-4">
                    <div class="col-lg-9">
                        <div class="white_shd full">
                            <div class="tab_style2 layout2">
                                <div class="tabbar">

                                    <div class="full graph_head d-flex">
                                        <div class="heading1 margin_0 ">
                                            <h5>License created in {selectedYear}</h5>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div class="table_section padding_infor_info_layout_chart ">
                                <div className="bar-container">
                                    <div className="select-container">
                                        {years.length > 1 && (
                                            <select
                                                className="form-control"
                                                value={selectedYear}
                                                onChange={e => setSelectedYear(e.target.value)}
                                            >
                                                {years.map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <ResponsiveContainer className="bar-chart-container">
                                        <ReactECharts option={option} style={{ height: 350, width: '100%' }} />
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3">
                        <div class="white_shd full">
                            <div class="tab_style2 layout2">
                                <div class="tabbar">

                                    <div class="full graph_head d-flex text-center">
                                        <div class="heading1 margin_0 ">
                                            <h5> Total quantity in {selectedYear}</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="table_section padding_infor_info_layout_chart ">
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="ml-4 mt-3 mr-4 mb-3 my-box">
                                            <span>
                                                {/* <IncrementalNumber value={totalControllerForYear + totalPrintheadForYear || 0} /> */}
                                                {totalControllerForYear + totalPrintheadForYear + totalPrinterForYear || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row column1">
                    <div class="col-lg-4">
                        <div class="white_shd full">
                            <div class="tab_style2 layout2">
                                <div class="tabbar">
                                    <div class="full graph_head d-flex text-center">
                                        <div class="heading1 margin_0 ">
                                            <h5>{LABELS[0]}</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="table_section padding_infor_info_layout_chart_half ">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="white_shd full ">
                                            <div class="full graph_head text-center">
                                                <div class="heading1 margin_0">
                                                    {lang["month"]} {currentMonth}
                                                </div>
                                            </div>
                                            <div class="map_section padding_infor_info_statis_chart">
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <div class="ml-4 mt-3 mr-4 mb-3 my-box-half">
                                                            <span>
                                                                {/* <IncrementalNumber value={totalControllerForCurrentMonth || 0} /> */}
                                                                {totalControllerForCurrentMonth || 0}

                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="white_shd full ">
                                            <div class="full graph_head text-center">
                                                <div class="heading1 margin_0">
                                                    {lang["year"]} {selectedYear}
                                                </div>
                                            </div>
                                            <div class="map_section padding_infor_info_statis">
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <div class="ml-4 mt-3 mr-4 mb-3 my-box-half">
                                                            <span>
                                                                {/* <IncrementalNumber value={totalControllerForYear || 0} /> */}
                                                                {totalControllerForYear || 0}

                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>


                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="white_shd full">
                            <div class="tab_style2 layout2">
                                <div class="tabbar">
                                    <div class="full graph_head d-flex text-center">
                                        <div class="heading1 margin_0 ">
                                            <h5>{LABELS[1]}</h5>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div class="table_section padding_infor_info_layout_chart_half ">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="white_shd full ">
                                            <div class="full graph_head text-center">
                                                <div class="heading1 margin_0">
                                                    {lang["month"]} {currentMonth}
                                                </div>
                                            </div>
                                            <div class="map_section padding_infor_info_statis">
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <div class="ml-4 mt-3 mr-4 mb-3 my-box-half">
                                                            <span>
                                                                {/* <IncrementalNumber value={totalPrintheadForCurrentMonth || 0} /> */}
                                                                {totalPrintheadForCurrentMonth || 0}

                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="white_shd full ">
                                            <div class="full graph_head text-center">
                                                <div class="heading1 margin_0">
                                                    {lang["year"]} {selectedYear}
                                                </div>
                                            </div>
                                            <div class="map_section padding_infor_info_statis">
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <div class="ml-4 mt-3 mr-4 mb-3 my-box-half">
                                                            <span>
                                                                {/* <IncrementalNumber value={totalPrintheadForYear || 0} /> */}

                                                                {totalPrintheadForYear || 0}

                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="white_shd full">
                            <div class="tab_style2 layout2">
                                <div class="tabbar">
                                    <div class="full graph_head d-flex text-center">
                                        <div class="heading1 margin_0 ">
                                            <h5>{LABELS[2]}</h5>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div class="table_section padding_infor_info_layout_chart_half ">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="white_shd full ">
                                            <div class="full graph_head text-center">
                                                <div class="heading1 margin_0">
                                                    {lang["month"]} {currentMonth}
                                                </div>
                                            </div>
                                            <div class="map_section padding_infor_info_statis">
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <div class="ml-4 mt-3 mr-4 mb-3 my-box-half">
                                                            <span>
                                                                {/* <IncrementalNumber value={totalPrintheadForCurrentMonth || 0} /> */}
                                                                {totalPrinterForCurrentMonth || 0}

                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="white_shd full ">
                                            <div class="full graph_head text-center">
                                                <div class="heading1 margin_0">
                                                    {lang["year"]} {selectedYear}
                                                </div>
                                            </div>
                                            <div class="map_section padding_infor_info_statis">
                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <div class="ml-4 mt-3 mr-4 mb-3 my-box-half">
                                                            <span>
                                                                {/* <IncrementalNumber value={totalPrintheadForYear || 0} /> */}

                                                                {totalPrinterForYear || 0}

                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };


    return (
        <>

            <div class="col-md-12">
                <div class="tab-content">
                    <div class="col-md-12">

                        < MyBarChart1 />
                    </div>
                </div>
            </div>
        </>
    )
}