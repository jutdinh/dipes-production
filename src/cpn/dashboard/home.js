import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from "react-router-dom";

import { Header } from '../common';
import {  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, LineChart, Line, PieChart, Pie, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
export default () => {
    const { proxy, lang } = useSelector(state => state)
    const _token = localStorage.getItem("_token");
    const stringifiedUser = localStorage.getItem("user");
    const user = JSON.parse(stringifiedUser) || {}
    const [activeLink, setActiveLink] = useState("/");

    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetch(`${proxy}/projects/all/projects`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;
                console.log(resp)
                if (success) {
                    if (data != undefined && data.length > 0) {
                        setProjects(data);

                    }
                } else {
                    // window.location = "/404-not-found"
                }
            })
    }, [])

    useEffect(() => {
        fetch(`${proxy}/auth/all/accounts`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;
                // console.log(resp)
                if (success) {
                    if (data != undefined && data.length > 0) {
                        setUsers(data);
                        // console.log(data)
                    }
                } else {
                    // window.location = "/404-not-found"
                }
            })
    }, [])

    const data = [
        { name: 'Page A', uv: 400, pv: 2400, amt: 2400 },
        { name: 'Page B', uv: 300, pv: 2210, amt: 2290 },
        { name: 'Page C', uv: 200, pv: 2290, amt: 2000 },
        { name: 'Page D', uv: 278, pv: 2000, amt: 2181 },
        { name: 'Page E', uv: 189, pv: 2181, amt: 2500 },
        { name: 'Page F', uv: 239, pv: 2500, amt: 2100 },
    ];
    const data1 = [
        { name: 'Group A', value: 400 },
        { name: 'Group B', value: 300 },
        { name: 'Group C', value: 200 },
        // additional data entries...
    ];
    const data2 = [
        { subject: 'Math', A: 120, B: 110, fullMark: 150 },
        { subject: 'Chinese', A: 98, B: 130, fullMark: 150 },
        { subject: 'English', A: 86, B: 130, fullMark: 150 },
        // additional data entries...
    ];
    return (

        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h4>{lang["home"]}</h4>

                        </div>
                    </div>
                </div>
                <div class="row column1">
                    <div class="col-md-6 col-lg-6">
                        <div class="full counter_section margin_bottom_30">
                            <div class="couter_icon">
                                <div>
                                    <i class="fa fa-briefcase purple_color2"></i>
                                </div>
                            </div>
                            <div class="counter_no">
                                <div>
                                    <p class="total_no">{projects.length}</p>
                                    <p class="head_couter">{lang["projects"]}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-6">
                        <div class="full counter_section margin_bottom_30">
                            <div class="couter_icon">
                                <div>
                                    <i class="fa fa-users blue1_color"></i>
                                </div>
                            </div>
                            <div class="counter_no">
                                <div>
                                    <p class="total_no">{users.length}</p>
                                    <p class="head_couter">Member</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* <div class="col-md-6 col-lg-3">
                        <div class="full counter_section margin_bottom_30">
                            <div class="couter_icon">
                                <div>
                                    <i class="fa fa-cloud-download green_color"></i>
                                </div>
                            </div>
                            <div class="counter_no">
                                <div>
                                    <p class="total_no">1,805</p>
                                    <p class="head_couter">Collections</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-3">
                        <div class="full counter_section margin_bottom_30">
                            <div class="couter_icon">
                                <div>
                                    <i class="fa fa-comments-o red_color"></i>
                                </div>
                            </div>
                            <div class="counter_no">
                                <div>
                                    <p class="total_no">54</p>
                                    <p class="head_couter">Comments</p>
                                </div>
                            </div>
                        </div>
                    </div> */}
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

                <div class="row column1">
                    <div class="col-lg-6 col-lg-3">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head">
                                <div class="heading1 margin_0">
                                    <h2>Line Chart</h2>
                                </div>
                            </div>
                            <div class="map_section padding_infor_info">
                                <LineChart width={500} height={300} data={data}>
                                    <Line type="monotone" dataKey="uv" stroke="#8884d8" />
                                    <CartesianGrid stroke="#ccc" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                </LineChart>
                                
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6 col-lg-3">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head">
                                <div class="heading1 margin_0">
                                    <h2>Line Chart</h2>
                                </div>
                            </div>
                            <div class="map_section padding_infor_info">
                                <BarChart width={500} height={300} data={data}>
                                    <Bar dataKey="pv" fill="#8884d8" />
                                    <Bar dataKey="uv" fill="#82ca9d" />
                                    <CartesianGrid stroke="#ccc" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                </BarChart>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6 col-lg-3">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head">
                                <div class="heading1 margin_0">
                                    <h2>Radar Chart</h2>
                                </div>
                            </div>
                            <div class="map_section padding_infor_info">
                                <RadarChart cx={300} cy={250} outerRadius={150} width={600} height={400} data={data2}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} />
                                    <Radar name="Mike" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                    <Radar name="John" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                    <Tooltip />
                                </RadarChart>

                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6 col-lg-3">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head">
                                <div class="heading1 margin_0">
                                    <h2>Pie Chart</h2>
                                </div>
                            </div>
                            <div class="map_section padding_infor_info">
                                <PieChart width={400} height={400}>
                                    <Pie dataKey="value" isAnimationActive={false} data={data1} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label />
                                    <Tooltip />
                                </PieChart>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}