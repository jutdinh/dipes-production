import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import React from 'react';
import ReactECharts from 'echarts-for-react';
import $ from 'jquery'
import { PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, AreaChart, Area, ComposedChart, ScatterChart, Scatter } from 'recharts';
const RECORD_PER_PAGE = 10

export default (props) => {
    const { functions, lang } = useSelector(state => state)
    const { formatNumber } = functions

    const { data, statis } = props
    console.log(props)
    const { display_name, type } = statis;
    const { headers, values } = data;
    const [display, setDisplay] = useState(headers.slice(0, RECORD_PER_PAGE))
    const [currentPage, setCurrentPage] = useState(0)
    const totalPages = Math.ceil(headers.length / RECORD_PER_PAGE);


    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF5733','#C70039','#900C3F','#581845','#2E4053','#9A7D0A'];

    const MyPieChart = () => {
        let pieData = [];

        if (props.data.values.length < 10) {
            pieData = props.data.values.map((value, index) => ({
                name: props.data.headers[index],
                value: value,
            }));
        }
        console.log(pieData);

        return (
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={140}
                        fill="#8884d8"
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Legend
                        verticalAlign="bottom"
                        height={60}
                        wrapperStyle={{ paddingBottom: '5px' }}
                        iconType="circle"
                        align="center"
                    />
                    <Tooltip
                        content={({ payload }) => {
                            if (payload && payload.length > 0) {
                                return (
                                    <div className="custom-tooltip">
                                        <p>{`${payload[0].name} : ${formatNumber(payload[0].value.toFixed())}`}</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        );
    };


    const COLORS1 = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const MyLineChart = () => {
        let lineData = [];

        if (10 < props.data.values.length < 100) {
            lineData = props.data.values.map((value, index) => ({
                name: props.data.headers[index],
                value: value,
            }));
        }
        console.log(lineData);

        return (
            <ResponsiveContainer width="80%" height={400}>
                <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip
                        content={({ payload }) => {
                            if (payload && payload.length > 0) {
                                return (
                                    <div className="custom-tooltip">
                                        <p>{`${payload[0].name} : ${formatNumber(payload[0].value.toFixed())}`}</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke={COLORS1[0]} />
                </LineChart>
            </ResponsiveContainer>
        );
    };

    const MyAreaChart = () => {
        const areaData = props.data.values.map((value, index) => ({
            name: props.data.headers[index],
            value: value,
        }));

        return (
            <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={areaData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="value" stroke={COLORS[0]} fillOpacity={0.3} fill={COLORS[0]} />
                </AreaChart>
            </ResponsiveContainer>
        );
    };
    const MyComposedChart = () => {
        const composedData = props.data.values.map((value, index) => ({
            name: props.data.headers[index],
            value: value,
        }));

        return (
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={composedData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" barSize={20} fill={COLORS[1]} />
                    <Line type="monotone" dataKey="value" stroke={COLORS[0]} />
                    <Area type="monotone" dataKey="value" fill={COLORS[2]} fillOpacity={0.3} />
                </ComposedChart>
            </ResponsiveContainer>
        );
    };
    const MyBarChart = () => {
        const barData = props.data.values.map((value, index) => ({
            name: props.data.headers[index],
            value: value,
        }));

        return (
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill={COLORS[0]} />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const MyBarChart1 = () => {
        const barData = props.data.values.map((value, index) => ({
            name: props.data.headers[index],
            value: value,
        }));
        const xAxisData = barData.map(item => item.name);
        const showLabels = props.data.values.length <= 10;
        const option = {
            //Điều chỉnh vị trí
            grid: {
                left: '10%',
                right: '5%',
                top: '5%',
                bottom: '10%'
            },
            xAxis: {
                type: 'category',
                data: xAxisData,
                axisLabel: {
                    show: showLabels
                }
            },
            yAxis: {
                type: 'value'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    const data = params[0];
                    return `${data.name}: ${formatNumber(data.value.toFixed())}`;
                }
            },
            legend: {
                data: ['value'],
                bottom: 10,
                orient: 'horizontal'
            },

            series: [{
                name: 'value',
                type: 'bar',
                data: barData.map(item => item.value),
                itemStyle: {
                    color: COLORS[0]
                }
            }]
        };

        return (
            <ReactECharts option={option} style={{ height: 450 }} />
        );
    };



    useEffect(() => {

        setDisplay(headers.slice(currentPage * RECORD_PER_PAGE, (currentPage + 1) * RECORD_PER_PAGE))
    }, [currentPage])


    const paginate = (nextPage) => {
        setCurrentPage(nextPage)
    }



    console.log(props.data.values.length)
    return (
        <>
            <div class="col-md-6 col-sm-6">

                {props.data.values && props.data.values.length < 3 ?
                    (
                        <>
                            <MyPieChart />
                            {/* <MyBarChart1 /> */}
                            {/* <MyBarChart /> */}
                            {/* <MyAreaChart />
                            <MyComposedChart /> */}
                        </>
                    ) :
                    // <MyLineChart />
                    <>
                        {/* <MyPieChart />
                        <MyAreaChart />
                        <MyComposedChart /> */}
                        {/* <MyBarChart /> */}
                        {/* <MyScatterPlot /> */}
                        <MyBarChart1 />
                        {/* <MyPieChart /> */}
                    </>
                }



            </div>
            <div class="col-md-6 col-sm-6">
                <p class="mb-1 mt-1">{display_name}</p>
                <div class="table-outer mb-4">
                    <table class="table-head">
                        <thead>
                            <th class="scrollbar-measure"></th>
                            <th class="font-weight-bold " style={{ width: "100px" }} scope="col">{lang["log.no"]}</th>
                            <th class="scrollbar-measure"></th>
                            <th class="font-weight-bold p-l-5" style={{ width: "100px" }} scope="col">Tiêu chí</th>
                            <th class="scrollbar-measure"></th>
                            <th class="font-weight-bold p-l-5" style={{ width: "100px" }} scope="col">Kết quả</th>
                            <th class="scrollbar-measure"></th>
                        </thead>
                    </table>
                    <div class="table-body" style={{ height: 350 }}>
                        <table class="table table-striped" >
                            <tbody>
                                {display.map((header, headerIndex) =>
                                    <tr key={currentPage * RECORD_PER_PAGE + headerIndex}>
                                        <td style={{ width: "100px" }}>{currentPage * RECORD_PER_PAGE + headerIndex + 1}</td>
                                        <td>{header}</td>
                                        <td>
                                            {
                                                values[headers.indexOf(header)] !== undefined
                                                    ? formatNumber(values[headers.indexOf(header)]?.toFixed())
                                                    : formatNumber("0")
                                            }
                                        </td>

                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                    {totalPages > 1 ?
                        <>
                            <p>{lang["show"]} {formatNumber(currentPage * RECORD_PER_PAGE + 1)} - {formatNumber(Math.min((currentPage + 1) * RECORD_PER_PAGE, headers.length))} {lang["of"]} {formatNumber(headers.length)} {lang["results"]}</p>
                            <nav aria-label="Page navigation example">
                                <ul className="pagination mb-0">
                                    <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => paginate(0)}>
                                            &#8810;
                                        </button>
                                    </li>
                                    <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => paginate(Math.max(0, currentPage - 1))}>
                                            &laquo;
                                        </button>
                                    </li>
                                    {Array.from({ length: totalPages }).map((_, index) => {
                                        if (index === currentPage || index === currentPage - 1 || index === currentPage + 1) {
                                            return (
                                                <li key={index} className={`page-item ${currentPage === index ? 'active' : ''}`}>
                                                    <button className="page-link" onClick={() => paginate(index)}>
                                                        {index + 1}
                                                    </button>
                                                </li>
                                            );
                                        } else if (index === currentPage - 2 && currentPage > 1) {
                                            return <li className="page-item" key="dots1"><span className="page-link">...</span></li>;
                                        } else if (index === currentPage + 2 && currentPage < totalPages - 2) {
                                            return <li className="page-item" key="dots2"><span className="page-link">...</span></li>;
                                        }
                                        return null;
                                    })}

                                    <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => paginate(Math.min(totalPages - 1, currentPage + 1))}>
                                            &raquo;
                                        </button>
                                    </li>
                                    <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => paginate(totalPages - 1)}>
                                            &#8811;
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </>
                        : null}
                </div>
            </div>
        </>
    )
}