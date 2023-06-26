import { useSelector } from "react-redux"
import { useParams } from "react-router-dom";
import { Header, SearchBar, Dropdown } from "../common"

export default () => {
    const { lang } = useSelector(state => state);

    const sortOptions = [
        { id: 0, label: "Mới nhất", value: "latest" },
        { id: 1, label: "Cũ nhất", value: "oldest" },
    ]
    const { project_id } = useParams()

    const projects = [

    ]

    const sortProjects = () => {

    }

    // const history = useHistory();

    // const handleRowClick = (pageUrl) => {
    //     history.push(pageUrl);
    // };
    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h2>General Elements { project_id }</h2>
                        </div>
                    </div>
                </div>

                <div class="row column graph">

                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            {/* <div class="full graph_head">
                                <div class="heading1 margin_0">
                                    <h2>Tab Bar Style 1</h2>
                                </div>
                            </div> */}
                            <div class="full inner_elements">
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="tab_style1">
                                            <div class="tabbar padding_infor_info">
                                                <nav>
                                                    <div class="nav nav-tabs" id="nav-tab" role="tablist">
                                                        <a class="nav-item nav-link active" id="nav-task-tab" data-toggle="tab" href="#nav-task" role="tab" aria-controls="nav-task" aria-selected="true">Task</a>
                                                        <a class="nav-item nav-link" id="nav-database-tab" data-toggle="tab" href="#nav-database" role="tab" aria-controls="nav-database" aria-selected="false">Cơ sở dữ liệu</a>
                                                        <a class="nav-item nav-link" id="nav-api-tab" data-toggle="tab" href="#nav-api" role="tab" aria-controls="nav-api" aria-selected="false">API</a>
                                                        <a class="nav-item nav-link" id="nav-ui-tab" data-toggle="tab" href="#nav-ui" role="tab" aria-controls="nav-ui" aria-selected="false">UI</a>
                                                 
                                                    </div>
                                                </nav>
                                                <div class="tab-content" id="nav-tabContent">
                                                    <div class="tab-pane fade show active" id="nav-task" role="tabpanel" aria-labelledby="nav-home-tab">
                                                        <p>task
                                                      
                                                        </p>
                                                    </div>
                                                    <div class="tab-pane fade" id="nav-database" role="tabpanel" aria-labelledby="nav-database-tab">
                                                        <p>databse
                                                        </p>
                                                    </div>
                                                    <div class="tab-pane fade" id="nav-api" role="tabpanel" aria-labelledby="nav-api-tab">
                                                        <p>api
                                                        </p>
                                                    </div>
                                                    <div class="tab-pane fade" id="nav-ui" role="tabpanel" aria-labelledby="nav-ui-tab">
                                                        <p>UI
                                                        </p>
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
        </div>


    )
}

