import { useEffect, useState } from "react";
import { batch, useSelector } from "react-redux";
import React from 'react';
import ReactECharts from 'echarts-for-react';
import $ from 'jquery'
import IncrementalNumber from './number';
import { PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, AreaChart, Area, ComposedChart, ScatterChart, Scatter } from 'recharts';
import label from "../../inputs/label";
const RECORD_PER_PAGE = 10

export default (props) => {
    const { functions, lang } = useSelector(state => state)
    const { formatNumber } = functions

    const { data, statis } = props
    console.log(props)
    const { display_name, type } = statis;
    const { headers, values } = data;
    const page = props.page

    const [display, setDisplay] = useState(headers.slice(0, RECORD_PER_PAGE))
    const [currentPage, setCurrentPage] = useState(0)
    const [labeType, setLabelType] = useState([])
    const totalPages = Math.ceil(headers.length / RECORD_PER_PAGE);

    // function generateUniqueColors(num) {
    //     const step = Math.cbrt((256 * 256 * 256) / num);
    //     const colors = [];

    //     for (let r = 0; r < 256; r += step) {
    //         for (let g = 0; g < 256; g += step) {
    //             for (let b = 0; b < 256; b += step) {
    //                 if (colors.length >= num) {
    //                     return colors;
    //                 }
    //                 if (r === 0 && g === 0 && b === 0) {
    //                     // Bỏ qua màu đen
    //                     continue;
    //                 }
    //                 const color = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    //                 colors.push(color);
    //             }
    //         }
    //     }
    //     return colors;
    // }

    // const COLORS = generateUniqueColors(props.data.values.length);

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


        const COLORS = ["#4D90FE", "#96C291", "#E19898"];
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

        const uniqueLabels = new Set();
        data.headers.forEach(header => {
            const parts = header.split(' ');
            if (parts.length > 2) {
                uniqueLabels.add(parts.slice(2).join(' '));
            }
        });



        const LABELS = [...uniqueLabels];
        console.log(LABELS[2])

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

        useEffect(() => {
            const yearControllerTotal = barData.reduce((total, item) => {
                return total + Object.values(item.controller).reduce((acc, value) => acc + parseInt(value), 0);
            }, 0);

            const yearPrintheadTotal = barData.reduce((total, item) => {
                return total + Object.values(item.printhead).reduce((acc, value) => acc + parseInt(value), 0);
            }, 0);

            const yearPrinterTotal = barData.reduce((total, item) => {
                return total + Object.values(item.printer).reduce((acc, value) => acc + parseInt(value), 0);
            }, 0);

            // Tính tổng cho tháng hiện tại
            const currentMonthData = barData.find(item => item.name.startsWith(currentMonth + ' ' + selectedYear));
            const monthControllerTotal = currentMonthData
                ? Object.values(currentMonthData.controller).reduce((acc, value) => acc + parseInt(value), 0)
                : 0;

            const monthPrintheadTotal = currentMonthData
                ? Object.values(currentMonthData.printhead).reduce((acc, value) => acc + parseInt(value), 0)
                : 0;

            const monthPrinterTotal = currentMonthData
                ? Object.values(currentMonthData.printer).reduce((acc, value) => acc + parseInt(value), 0)
                : 0;

            // Lưu các giá trị tổng vào trạng thái
            setTotalControllerForYear(yearControllerTotal);
            setTotalPrintheadForYear(yearPrintheadTotal);
            setTotalPrinterForYear(yearPrinterTotal);
            setTotalControllerForCurrentMonth(monthControllerTotal);
            setTotalPrintheadForCurrentMonth(monthPrintheadTotal);
            setTotalPrinterForCurrentMonth(monthPrinterTotal);
        }, [barData, selectedYear, currentMonth]);



        useEffect(() => {
            const filteredData = [];
            const labelCount = LABELS.length;
            for (let i = 0; i < data.headers.length; i += labelCount) {
                const monthYear = data.headers[i].split(' ')[0] + ' ' + data.headers[i].split(' ')[1];
                if (data.headers[i].split(' ')[1] === selectedYear) {
                    let entry = {
                        name: monthYear
                    };

                    if (LABELS.includes("Controller")) {
                        entry.controller = data.values[i];
                    }
                    if (LABELS.includes("Print head")) {
                        entry.printhead = data.values[i + 1];
                    }
                    if (LABELS.includes("Printer")) {
                        entry.printer = data.values[i + 2];
                    }

                    filteredData.push(entry);
                }
            }
            setBarData(filteredData);
        }, [selectedYear, data]);

        console.log(barData)

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
                axisPointer: {
                    type: 'shadow'
                },
                data: barData.map(item => {
                    // Lấy ra tất cả các giá trị trong đối tượng controller và chuyển thành số nguyên
                    const controllerValues = Object.values(item.controller).map(val => parseInt(val));

                    // Tính tổng các giá trị
                    const controllerTotal = controllerValues.reduce((total, value) => total + value, 0);

                    return {
                        value: controllerTotal,
                        // Lưu trữ dữ liệu chi tiết thay vì chỉ lưu giá trị tổng
                        details: item.controller
                    };
                })
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


            series: [
                {
                    name: LABELS[0], // Controller
                    type: 'bar',
                    data: barData.map(item => {
                        // Lấy ra tất cả các giá trị trong đối tượng controller và chuyển thành số nguyên
                        const controllerValues = Object.values(item.controller).map(val => parseInt(val));

                        // Tính tổng các giá trị
                        const controllerTotal = controllerValues.reduce((total, value) => total + value, 0);

                        return {
                            value: controllerTotal,
                            // Lưu trữ dữ liệu chi tiết thay vì chỉ lưu giá trị tổng
                            details: item.controller
                        };
                    })
                },
                {
                    name: LABELS[1], // Printhead
                    type: 'bar',
                    data: barData.map(item => {
                        // Lấy ra tất cả các giá trị trong đối tượng controller và chuyển thành số nguyên
                        const PrintheadValues = Object.values(item.printhead).map(val => parseInt(val));

                        // Tính tổng các giá trị
                        const printheadTotal = PrintheadValues.reduce((total, value) => total + value, 0);

                        return {
                            value: printheadTotal,
                            details: `${LABELS[1]}: ${printheadTotal}`
                        };
                    }),
                    itemStyle: {
                        color: COLORS[1]
                    }
                },
                {
                    name: LABELS[2], // Printer
                    type: 'bar',
                    data: barData.map(item => {
                        // Lấy ra tất cả các giá trị trong đối tượng controller và chuyển thành số nguyên
                        const printerValues = Object.values(item.printer).map(val => parseInt(val));

                        // Tính tổng các giá trị
                        const printerTotal = printerValues.reduce((total, value) => total + value, 0);

                        return {
                            value: printerTotal,
                            details: `${LABELS[2]}: ${printerTotal}`
                        };
                    }), // Lấy giá trị từ printer
                    itemStyle: {
                        color: COLORS[2]
                    }
                }
            ]
        };

        // const categories = ['controller', 'printhead', 'printer'];
        // let seriesData = [];
        // let legendData = [];




        ///Test hiển thị chi tiết
        // barData.forEach(monthData => {
        //     categories.forEach(category => {
        //         for (let key in monthData[category]) {
        //             // Tạo một chuỗi để làm tên cho chuỗi dữ liệu (ví dụ: "B1040 Controller")
        //             let seriesName = `${key} ${category.charAt(0).toUpperCase() + category.slice(1)}`;

        //             // Tìm seriesData hoặc tạo mới nếu chưa tồn tại
        //             let series = seriesData.find(s => s.name === seriesName);
        //             if (!series) {
        //                 series = {
        //                     name: seriesName,
        //                     type: 'bar',
        //                     stack: category,
        //                     data: []
        //                 };
        //                 seriesData.push(series);
        //                 legendData.push(seriesName);
        //             }

        //             // Thêm dữ liệu vào chuỗi
        //             series.data.push(parseInt(monthData[category][key]));
        //         }
        //     });
        // });

        // const option = {
        //     grid: {
        //         left: '5%',
        //         right: '3%',
        //         top: '9%',
        //         bottom: '8%'
        //     },
        //     tooltip: {
        //         trigger: 'axis',
        //         axisPointer: {
        //             type: 'shadow'
        //         }
        //     },
        //     legend: {
        //         show: true,
        //         data: legendData,
        //         align: 'left',
        //         padding: 5,
        //         itemGap: 15,
        //         textStyle: {
        //             fontSize: 14,
        //             fontFamily: 'UTM Avo'
        //         }
        //     },



        //     xAxis: {
        //         type: 'category',
        //         data: months,
        //         axisLabel: {
        //             show: true,
        //             textStyle: {
        //                 color: '#333',
        //                 fontFamily: 'UTM avo',
        //                 fontSize: 14,
        //                 // fontWeight: 'bold'   
        //             }
        //         }
        //     },

        //     yAxis: {
        //         type: 'value'
        //     },
        //     series: seriesData
        // };
        // let categories = barData.map(item => item.name);
        // let legendData = [];
        // let seriesDataController = [];
        // let seriesDataPrinthead = [];
        // let seriesDataPrinter = [];

        // if (barData[0] && barData[0].controller) {
        //     Object.keys(barData[0].controller).forEach(key => {
        //         let seriesName = key;
        //         let seriesValues = barData.map(monthData => parseInt(monthData.controller[key]));

        //         seriesDataController.push({
        //             name: seriesName,
        //             type: 'bar',
        //             data: seriesValues
        //         });

        //         if (legendData.indexOf(seriesName) === -1) {
        //             legendData.push(seriesName);
        //         }
        //     });
        // }
        // // Process data for "controller"

        // // Process data for "printhead"
        // if (barData[0] && barData[0].printhead) {
        //     Object.keys(barData[0].printhead).forEach(key => {
        //         let seriesName = key;
        //         let seriesValues = barData.map(monthData => parseInt(monthData.printhead[key]));

        //         seriesDataPrinthead.push({
        //             name: seriesName,
        //             type: 'bar',
        //             data: seriesValues
        //         });
        //         if (legendData.indexOf(seriesName) === -1) {
        //             legendData.push(seriesName);
        //         }
        //     });
        // }

        // if (barData[0] && barData[0].printer) {
        //     Object.keys(barData[0].printer).forEach(key => {
        //         let seriesName = key;
        //         let seriesValues = barData.map(monthData => parseInt(monthData.printer[key]));

        //         seriesDataPrinter.push({
        //             name: seriesName,
        //             type: 'bar',
        //             data: seriesValues
        //         });

        //         if (legendData.indexOf(seriesName) === -1) {
        //             legendData.push(seriesName);
        //         }
        //     });
        // }
        // // Options for the charts
        // const option = {
        //     title: {
        //         text: 'Controller Data'
        //     },
        //     tooltip: {
        //         trigger: 'axis'
        //     },
        //     legend: {
        //         data: legendData
        //     },
        //     xAxis: {
        //         type: 'category',
        //         data: categories
        //     },
        //     yAxis: {
        //         type: 'value'
        //     },
        //     series: seriesDataController
        // };

        // const optionPrinthead = {
        //     title: {
        //         text: 'Printhead Data'
        //     },
        //     tooltip: {
        //         trigger: 'axis'
        //     },
        //     legend: {
        //         data: legendData
        //     },
        //     xAxis: {
        //         type: 'category',
        //         data: categories
        //     },
        //     yAxis: {
        //         type: 'value'
        //     },
        //     series: seriesDataPrinthead
        // };

        // const optionPrinter = {
        //     title: {
        //         text: 'Printer Data'
        //     },
        //     tooltip: {
        //         trigger: 'axis'
        //     },
        //     legend: {
        //         data: legendData
        //     },
        //     xAxis: {
        //         type: 'category',
        //         data: categories
        //     },
        //     yAxis: {
        //         type: 'value'
        //     },
        //     series: seriesDataPrinter
        // };

        const validLabelsCount = LABELS.filter(label => label !== undefined).length;
        const columnWidth = 12 / validLabelsCount;

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
                    {LABELS[0] !== undefined &&
                        // <div className={`col-lg-${columnWidth}`}>
                        //     <div class="white_shd full">
                        //         <div class="tab_style2 layout2">
                        //             <div class="tabbar">
                        //                 <div class="full graph_head d-flex text-center">
                        //                     <div class="heading1 margin_0 ">
                        //                         <h5>{LABELS[0]}</h5>
                        //                     </div>
                        //                 </div>
                        //             </div>
                        //         </div>
                        //         <div class="table_section padding_infor_info_layout_chart_half ">
                        //             <div class="row">
                        //                 <div class="col-md-6">
                        //                     <div class="white_shd_cus full mt-2 ">
                        //                         <div class="full graph_head text-center">
                        //                             <div class="heading1 margin_0">
                        //                                 {lang["month"]} {currentMonth}
                        //                             </div>
                        //                         </div>
                        //                         <div class="map_section padding_infor_info_statis_chart">
                        //                             <div class="row">
                        //                                 <div class="col-md-12">
                        //                                     <div class="ml-4 mt-3 mr-4 mb-3 my-box-half">
                        //                                         <span>
                        //                                             {/* <IncrementalNumber value={totalControllerForCurrentMonth || 0} /> */}
                        //                                             {totalControllerForCurrentMonth || 0}
                        //                                         </span>
                        //                                     </div>
                        //                                 </div>
                        //                             </div>
                        //                         </div>
                        //                     </div>
                        //                 </div>
                        //                 <div class="col-md-6">
                        //                     <div class="white_shd_cus full mt-2 ">
                        //                         <div class="full graph_head text-center">
                        //                             <div class="heading1 margin_0">
                        //                                 {lang["year"]} {selectedYear}
                        //                             </div>
                        //                         </div>
                        //                         <div class="map_section padding_infor_info_statis">
                        //                             <div class="row">
                        //                                 <div class="col-md-12">
                        //                                     <div class="ml-4 mt-3 mr-4 mb-3 my-box-half">
                        //                                         <span>
                        //                                             {/* <IncrementalNumber value={totalControllerForYear || 0} /> */}
                        //                                             {totalControllerForYear || 0}
                        //                                         </span>
                        //                                     </div>
                        //                                 </div>
                        //                             </div>
                        //                         </div>
                        //                     </div>
                        //                 </div>
                        //             </div>
                        //         </div>
                        //     </div>
                        // </div>
                        <div className={`col-lg-${columnWidth}`}>
                            <div class="full socile_icons controller margin_bottom_30">
                                <div class="social_icon color-whiteh5">
                                    {LABELS[0]}
                                </div>
                                <div class="social_cont">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="white_shd_cus full ">
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
                                            <div class="white_shd_cus full">
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
                    }
                    {
                    LABELS[1] !== undefined &&
                        <div className={`col-lg-${columnWidth}`}>
                            <div class="full socile_icons printhead margin_bottom_30">
                                <div class="social_icon color-whiteh5">
                                    {LABELS[1]}
                                </div>
                                <div class="social_cont">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="white_shd_cus full ">
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
                                                                    {totalPrintheadForCurrentMonth || 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="white_shd_cus full">
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
                    }
                    {LABELS[2] !== undefined &&
                         <div className={`col-lg-${columnWidth}`}>
                         <div class="full socile_icons printer margin_bottom_30">
                             <div class="social_icon color-whiteh5">
                                 {LABELS[2]}
                             </div>
                             <div class="social_cont">
                                 <div class="row">
                                     <div class="col-md-6">
                                         <div class="white_shd_cus full ">
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
                                                                 {totalPrinterForCurrentMonth || 0}
                                                             </span>
                                                         </div>
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                     <div class="col-md-6">
                                         <div class="white_shd_cus full">
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
                      
                    }
                </div>
                {/* <div class="row column1 social_media_section">
                    <div class="col-md-6 col-lg-3">
                        <div class="full socile_icons fb margin_bottom_30">
                            <div class="social_icon">
                                <i class="fa fa-facebook"></i>
                            </div>
                            <div class="social_cont">
                                <ul>
                                    <li>
                                        <span><strong>35k</strong></span>
                                        <span>Friends</span>
                                    </li>
                                    <li>
                                        <span><strong>128</strong></span>
                                        <span>Feeds</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-3">
                        <div class="full socile_icons tw margin_bottom_30">
                            <div class="social_icon">
                                <i class="fa fa-twitter"></i>
                            </div>
                            <div class="social_cont">
                                <ul>
                                    <li>
                                        <span><strong>584k</strong></span>
                                        <span>Followers</span>
                                    </li>
                                    <li>
                                        <span><strong>978</strong></span>
                                        <span>Tweets</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-3">
                        <div class="full socile_icons linked margin_bottom_30">
                            <div class="social_icon">
                                <i class="fa fa-linkedin"></i>
                            </div>
                            <div class="social_cont">
                                <ul>
                                    <li>
                                        <span><strong>758+</strong></span>
                                        <span>Contacts</span>
                                    </li>
                                    <li>
                                        <span><strong>365</strong></span>
                                        <span>Feeds</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-3">
                        <div class="full socile_icons google_p margin_bottom_30">
                            <div class="social_icon">
                                <i class="fa fa-google-plus"></i>
                            </div>
                            <div class="social_cont">
                                <ul>
                                    <li>
                                        <span><strong>450</strong></span>
                                        <span>Followers</span>
                                    </li>
                                    <li>
                                        <span><strong>57</strong></span>
                                        <span>Circles</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div> */}
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