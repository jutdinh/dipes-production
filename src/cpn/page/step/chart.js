import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

function Chart_HelpDesk() {
    const data = [
        { name: 'R10', 'Đã Kích Hoạt': 10, 'Chưa Kích Hoạt': 5, 'Kích Hoạt Thất Bại': 3 },
        { name: 'R20', 'Đã Kích Hoạt': 20, 'Chưa Kích Hoạt': 10, 'Kích Hoạt Thất Bại': 0 },
        { name: 'B1040', 'Đã Kích Hoạt': 50, 'Chưa Kích Hoạt': 10, 'Kích Hoạt Thất Bại': 15 },
    ];

    const stackColors = ['#1ed085', '#8884d8', '#ff3333'];

    const renderStackedBarLabel = (props) => {
        const { x, y, width, height, value, index, dataKey } = props;
        const labelValue = value === 0 ? '' : value;
    
        let accumulatedHeight = 0;
        if (dataKey === 'Chưa Kích Hoạt') {
            accumulatedHeight = data[index]['Đã Kích Hoạt'];
        } else if (dataKey === 'Kích Hoạt Thất Bại') {
            accumulatedHeight = data[index]['Đã Kích Hoạt'] + data[index]['Chưa Kích Hoạt'];
        }
    
        const yPos = y - accumulatedHeight + height / 2; 
    
        return (
            <text x={x + width / 2} y={yPos} fill="#ffffff" fontSize={14} textAnchor="middle" dominantBaseline="middle">
                {labelValue}
            </text>
        );
    };
    

    const renderTotalLabel = (props) => {
        const { x, y, width, index } = props;
        const total = data[index]['Đã Kích Hoạt'] + data[index]['Chưa Kích Hoạt'] + data[index]['Kích Hoạt Thất Bại'];

        return (
            <text x={x + width / 2} y={y - 10} fill="#666" fontSize={14} textAnchor="middle">
                {total}
            </text>
        );
    };



    return (
        <div className="midde_cont">
            <div className="container-fluid">
                <div className="row column_title">
                    <div className="col-md-12">
                        <div className="page_title d-flex align-items-center">
                            <h4 className="ml-1">Thống kê thông tin kích hoạt</h4>
                        </div>
                    </div>
                </div>
                <div className="row column1">
                    <div className="col-md-12">
                        <div className="white_shd full margin_bottom_30">
                            <div className="full price_table padding_infor_info">
                                <div className="col-lg-12">
                                    <BarChart
                                        width={1200}
                                        height={600}
                                        data={data}
                                        margin={{
                                            top: 20, right: 30, left: 20, bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar barSize={100} dataKey="Đã Kích Hoạt" stackId="a" fill={stackColors[0]} label={renderStackedBarLabel} />
                                        <Bar barSize={100} dataKey="Chưa Kích Hoạt" stackId="a" fill={stackColors[1]} label={renderStackedBarLabel} />
                                        <Bar barSize={100}  dataKey="Kích Hoạt Thất Bại" stackId="a" fill={stackColors[2]} label={(barProps) => {
                                            return (
                                                <>
                                                    {renderStackedBarLabel(barProps)}
                                                    {renderTotalLabel(barProps)}
                                                </>
                                            );
                                        }} />

                                    </BarChart>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chart_HelpDesk;
