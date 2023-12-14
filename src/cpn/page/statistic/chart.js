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
    // console.log(props)
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

        // const COLORS = ["#4D90FE", "#96C291", "#E19898"];
        const COLORS = ["#4988ef", "#72c05d", "#ff7170"];
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
        // const LABELS = ["Controller", "Print head", "Printer"];

        const uniqueLabels = new Set();
        data.headers.forEach(header => {
            const parts = header.split(' ');
            if (parts.length > 2) {
                uniqueLabels.add(parts.slice(2).join(' '));
            }
        });



        const LABELS = [...uniqueLabels];
        // console.log(LABELS[2])

        const years = [...new Set(data.headers.map(header => header.split(' ')[1]))];
        const currentYear = new Date().getFullYear();
        const [selectedYear, setSelectedYear] = useState(currentYear.toString());
        const [currentMonth, setSurrentMonth] = useState(new Date().getMonth() + 1);
        const [barData, setBarData] = useState([]);
        // console.log(barData)
        const [totalControllerForYear, setTotalControllerForYear] = useState(0);
        const [totalPrintheadForYear, setTotalPrintheadForYear] = useState(0);
        const [totalControllerForCurrentMonth, setTotalControllerForCurrentMonth] = useState(0);
        const [totalPrintheadForCurrentMonth, setTotalPrintheadForCurrentMonth] = useState(0);

        const [totalPrinterForYear, setTotalPrinterForYear] = useState(0);
        const [totalPrinterForCurrentMonth, setTotalPrinterForCurrentMonth] = useState(0);
        // console.log("controller trong năm", totalControllerForYear)
        // console.log("printhead trong năm", totalPrintheadForYear)
        // console.log("printhead trong năm", totalPrinterForYear)
        // console.log("controller trong tháng", totalControllerForCurrentMonth)
        // console.log("printhead trong tháng", totalPrintheadForCurrentMonth)
        // console.log("printer trong tháng", totalPrinterForCurrentMonth)
        useEffect(() => {
            let yearControllerTotal = 0;
            let yearPrintheadTotal = 0;
            let yearPrinterTotal = 0;
            let monthControllerTotal = 0;
            let monthPrintheadTotal = 0;
            let monthPrinterTotal = 0;

            barData.forEach(item => {
                // Đảm bảo rằng các giá trị là hợp lệ, nếu không sẽ được đặt thành 0
                const controllerValue = Number.isFinite(item.controller) ? item.controller : 0;
                const printheadValue = Number.isFinite(item.printhead) ? item.printhead : 0;
                const printerValue = Number.isFinite(item.printer) ? item.printer : 0;

                yearControllerTotal += controllerValue;
                yearPrintheadTotal += printheadValue;
                yearPrinterTotal += printerValue;

                const monthAndYear = item.name.split(' ');
                const itemMonth = monthAndYear[0];
                const itemYear = monthAndYear[1];

                const monthAbbreviation = months[itemMonth - 1];

                if (monthAbbreviation === months[currentMonth - 1] && itemYear === selectedYear) {
                    monthControllerTotal = controllerValue;
                    monthPrintheadTotal = printheadValue;
                    monthPrinterTotal = printerValue;
                }
            });

            setTotalControllerForYear(yearControllerTotal);
            setTotalPrintheadForYear(yearPrintheadTotal);
            setTotalPrinterForYear(yearPrinterTotal);
            setTotalControllerForCurrentMonth(monthControllerTotal);
            setTotalPrintheadForCurrentMonth(monthPrintheadTotal);
            setTotalPrinterForCurrentMonth(monthPrinterTotal);

        }, [barData, selectedYear]);


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

        const option = {
            grid: {
                left: '2%',
                right: '0%',
                top: '9%',
                bottom: '7%'
            },
            xAxis: {
                type: 'category',
                data: months,
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#333',
                        fontFamily: 'UTM avo',
                        fontSize: 13,
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
                    fontSize: 15,
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
        const validLabelsCount = LABELS.filter(label => label !== undefined).length;
        const columnWidth = 12 / validLabelsCount;

        return (
            <>
                <div class="row column1 mb-2">
                    <div class="col-lg-9 ">
                        <div class="white_shd full">
                            <div class="tab_style2 layout2">
                                <div class="tabbar">

                                    <div class="full graph_head d-flex">
                                        <div class="heading1 margin_0 ">
                                            <h5>{lang["license create"]} {selectedYear}</h5>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div class="table_section padding_infor_info_layout_chart ">
                                <div className="bar-container">
                                    <div className="select-container">
                                        {years.length > 1 && (
                                            <select
                                                className="form-control pointer"
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
                                        <ReactECharts option={option} style={{ height: 460, width: '100%' }} />
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 ">
                        <div class="white_shd full">
                            <div class="tab_style2 layout2">
                                <div class="tabbar">

                                    <div class="full graph_head d-flex text-center">
                                        <div class="heading1 margin_0 ">
                                            <h5> {lang["total quantity"]} {selectedYear}</h5>
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

                {/* <div class="row column1">
                    {LABELS[0] !== undefined &&
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
                                                    <div class="heading1 margin_0 color_month">
                                                        {lang["month"]} {currentMonth}
                                                    </div>
                                                </div>
                                                <div class="map_section padding_infor_info_statis_chart">
                                                    <div class="row">
                                                        <div class="col-md-12">
                                                            <div class="ml-4 mt-3 mr-4 mb-3 my-box-half">
                                                                <span>
                                                                   
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
                                                    <div class="heading1 margin_0 color_month">
                                                        {lang["year"]} {selectedYear}
                                                    </div>
                                                </div>
                                                <div class="map_section padding_infor_info_statis">
                                                    <div class="row">
                                                        <div class="col-md-12">
                                                            <div class="ml-4 mt-3 mr-4 mb-3 my-box-half">
                                                                <span>
                                                                  
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
                    {LABELS[1] !== undefined &&
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
                                                    <div class="heading1 margin_0 color_month">
                                                        {lang["month"]} {currentMonth}
                                                    </div>
                                                </div>
                                                <div class="map_section padding_infor_info_statis_chart">
                                                    <div class="row">
                                                        <div class="col-md-12">
                                                            <div class="ml-4 mt-3 mr-4 mb-3 my-box-half">
                                                                <span>
                                                                   
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
                                                    <div class="heading1 margin_0 color_month">
                                                        {lang["year"]} {selectedYear}
                                                    </div>
                                                </div>
                                                <div class="map_section padding_infor_info_statis">
                                                    <div class="row">
                                                        <div class="col-md-12">
                                                            <div class="ml-4 mt-3 mr-4 mb-3 my-box-half">
                                                                <span>
                                                                   
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
                                                    <div class="heading1 margin_0 color_month">
                                                        {lang["month"]} {currentMonth}
                                                    </div>
                                                </div>
                                                <div class="map_section padding_infor_info_statis_chart">
                                                    <div class="row">
                                                        <div class="col-md-12">
                                                            <div class="ml-4 mt-3 mr-4 mb-3 my-box-half">
                                                                <span>
                                                                  
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
                                                    <div class="heading1 margin_0 color_month">
                                                        {lang["year"]} {selectedYear}
                                                    </div>
                                                </div>
                                                <div class="map_section padding_infor_info_statis">
                                                    <div class="row">
                                                        <div class="col-md-12">
                                                            <div class="ml-4 mt-3 mr-4 mb-3 my-box-half">
                                                                <span>
                                                                  
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
                </div> */}

                <div class="row column1 social_media_section">
                    <div class="col-md-4 col-lg-4 ">
                        <div class="full socile_icons controller margin_bottom_30">
                            <div class="social_icon color-whiteh5">

                                {LABELS[0]}
                            </div>
                            <div class="social_cont total-box">
                                <ul>
                                    <li>
                                        <span><strong class="f-24"> {totalControllerForCurrentMonth || 0}</strong></span>
                                        <span class="mt-2">{months[currentMonth-1]}</span>
                                    </li>
                                    <li>
                                        <span><strong class="f-24">  {totalControllerForYear || 0}</strong></span>
                                        <span class="mt-2"> {lang["year"]} {selectedYear}
                                    
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4 col-lg-4">
                        <div class="full socile_icons printhead margin_bottom_30">
                            <div class="social_icon color-whiteh5">

                                {LABELS[1]}
                            </div>
                            <div class="social_cont total-box">
                                <ul>
                                    <li>
                                        <span><strong class="f-24"> {totalPrintheadForCurrentMonth || 0}</strong></span>
                                        <span class="mt-2">  {months[currentMonth-1]}</span>
                                    </li>
                                    <li>
                                        <span><strong class="f-24">  {totalPrintheadForYear || 0}</strong></span>
                                        <span class="mt-2"> {lang["year"]} {selectedYear}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 col-lg-4">
                        <div class="full socile_icons printer margin_bottom_30">
                            <div class="social_icon color-whiteh5">

                                {LABELS[2]}
                            </div>
                            <div class="social_cont total-box">
                                <ul>
                                    <li>
                                        <span><strong class="f-24"> {totalPrinterForCurrentMonth || 0}</strong></span>
                                        <span class="mt-2">  {months[currentMonth-1]}</span>
                                    </li>
                                    <li>
                                        <span><strong class="f-24">  {totalPrinterForYear || 0}</strong></span>
                                        <span class="mt-2"> {lang["year"]} {selectedYear}</span>
                                    </li>
                                </ul>
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