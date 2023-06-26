<div className="container-fluid">
<div class="midde_cont">
    <div class="row column_title">
        <div class="col-md-12">
            <div class="page_title d-flex align-items-center">
                <h4>{lang["log.title"]}</h4>
            </div>
        </div>
    </div>
    <div class="row column1">
        <div class="col-md-12">
            <div class="white_shd full margin_bottom_30">
                <div class="full price_table padding_infor_info">
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="row column4 graph">
                                {/* Log */}
                                {/* Filter */}
                                <div class="col-md-12">
                                    <div class="dash_blog">
                                        <div class="dash_blog_inner">
                                            <div class="dash_head">
                                                <h3>
                                                    <h5>{lang["log.statis"]}</h5>
                                                    <span class="plus_green_bt">
                                                        <p><i class="fa fa-edit size pointer" data-toggle="modal" data-target="#editProject"></i></p>
                                                    </span>
                                                </h3>
                                            </div>
                                            <div class="member-cus">
                                                <div class="msg_list_main">
                                                    <div className="row column1 mb-3 mt-3">
                                                        <div className="col-lg-3">
                                                            <label>{lang["log.type"]}:</label>
                                                            <select className="form-control" value={filter.type} onChange={(e) => { setFilter({ ...filter, type: e.target.value }) }}>
                                                                <option value="">{lang["log.selecttype"]}</option>
                                                                <option value="info">{lang["log.information"]}</option>
                                                                <option value="warn">{lang["log.warning"]}</option>
                                                                <option value="error">{lang["log.error"]}</option>

                                                            </select>
                                                        </div>
                                                        <div className="col-lg-3">
                                                            <label>{lang["log.daystart"]}:</label>
                                                            <input type="datetime-local" className="form-control" value={filter.start} onChange={
                                                                (e) => { setFilter({ ...filter, start: e.target.value }) }
                                                            } />
                                                        </div>
                                                        <div className="col-lg-3">
                                                            <label>{lang["log.dayend"]}:</label>
                                                            <input type="datetime-local" className="form-control" value={filter.end} onChange={
                                                                (e) => { setFilter({ ...filter, end: e.target.value }) }
                                                            } />
                                                        </div>
                                                        <div className="col-lg-3 d-flex align-items-end justify-content-end">
                                                            <button className="btn btn-primary mr-2 mt-2 btn-log" onClick={submitFilter}>{lang["btn.ok"]}</button>
                                                            <button className="btn btn-secondary btn-log" onClick={() => {
                                                               setView(logs)
                                                            }}>{lang["btn.clear"]}</button>


                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* List logs */}
                                <div class="col-md-12">
                                    <div class="dash_blog">
                                        <div class="dash_blog_inner">
                                            <div class="dash_head">
                                                <h3>
                                                    <h5>{lang["log.listlog"]}</h5>
                                                    {/* <span class="plus_green_bt">
                                                        <p><i class="fa fa-plus size pointer" data-toggle="modal" data-target="#editProject"></i></p>
                                                    </span> */}
                                                </h3>
                                            </div>
                                            <div class="member-cus">
                                                <div class="msg_list_main">
                                                    <div className="row column1">
                                                        <div class="table-responsive">
                                                            {
                                                                view && view.length > 0 ? (
                                                                    <>
                                                                        <table class="table table-striped">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th scope="col">{lang["log.no"]}</th>
                                                                                    <th scope="col">{lang["log.id"]}</th>
                                                                                    <th scope="col" style={{ textAlign: "center" }}>{lang["log.type"]}</th>
                                                                                    <th scope="col">{lang["log.listtitle"]}</th>
                                                                                    <th scope="col">{lang["description"]}</th>
                                                                                    <th scope="col">{lang["log.dayupdate"]}</th>
                                                                                    <th scope="col" style={{ textAlign: "center" }}>{lang["log.action"]}</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {currentMembersLogs.map((log, index) => {
                                                                                    // Tìm kiểu sự kiện tương ứng trong mảng eventType
                                                                                    const event = eventType.find(item => item.label === log.event_type);

                                                                                    return (
                                                                                        <tr key={log.id}>
                                                                                            <td scope="row">{index + 1}</td>
                                                                                            <td>{log.event_id}</td>
                                                                                            <td style={{ textAlign: "center" }}>
                                                                                                {/* Kiểm tra xem có tìm thấy sự kiện không, nếu có thì hiển thị nhãn và icon */}
                                                                                                {event && <>

                                                                                                    <i class={`${event.icon}`} style={{ color: event.color }} title={event.label}></i>
                                                                                                </>}
                                                                                            </td>
                                                                                            <td>{log.event_title}</td>
                                                                                            <td>{log.event_description}</td>
                                                                                            <td>{log.create_at}</td>
                                                                                            <td style={{ textAlign: "center" }}>
                                                                                                <i class="fa fa-eye size pointer icon-margin" onClick={() => detailLogs(log)} data-toggle="modal" data-target="#viewLog" title={lang["btn.viewdetail"]}></i>

                                                                                            </td>
                                                                                        </tr>
                                                                                    );
                                                                                })}
                                                                            </tbody>

                                                                        </table>
                                                                        <div className="d-flex justify-content-between align-items-center">

                                                                            <p>{lang["show"]} {indexOfFirstMemberLogs + 1}-{Math.min(indexOfLastMemberLogs, logs.length)} {lang["of"]} {logs.length} {lang["results"]}</p>

                                                                            <nav aria-label="Page navigation example">
                                                                                <ul className="pagination mb-0">
                                                                                    <li className={`page-item ${currentPageLogs === 1 ? 'disabled' : ''}`}>
                                                                                        <button className="page-link" onClick={() => paginateLogs(currentPageLogs - 1)}>
                                                                                            &laquo;
                                                                                        </button>
                                                                                    </li>
                                                                                    {Array(totalPagesLogs).fill().map((_, index) => (
                                                                                        <li className={`page-item ${currentPageLogs === index + 1 ? 'active' : ''}`}>
                                                                                            <button className="page-link" onClick={() => paginateLogs(index + 1)}>
                                                                                                {index + 1}
                                                                                            </button>
                                                                                        </li>
                                                                                    ))}
                                                                                    <li className={`page-item ${currentPageLogs === totalPagesLogs ? 'disabled' : ''}`}>
                                                                                        <button className="page-link" onClick={() => paginateLogs(currentPageLogs + 1)}>
                                                                                            &raquo;
                                                                                        </button>
                                                                                    </li>
                                                                                </ul>
                                                                            </nav>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div class="list_cont ">
                                                                        <p>Chưa có logs</p>
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                    </div>



                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* View log */}
                                <div class={`modal ${showModal ? 'show' : ''}`} id="viewLog">
                                    <div class="modal-dialog modal-dialog-center">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h4 class="modal-title">{lang["detaillog"]}</h4>
                                                <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                                            </div>
                                            <div class="modal-body">
                                                <form>
                                                    <div class="row">

                                                        <div class="form-group col-lg-6">
                                                            <label>{lang["log.id"]}</label>
                                                            <input type="text" class="form-control" value={logDetail.event_id} readOnly />
                                                        </div>
                                                        <div class="form-group col-lg-6">
                                                            <label>{lang["log.type"]} </label>
                                                            {
                                                                (() => {
                                                                    const event = eventType.find(item => item.label === logDetail.event_type);
                                                                    return <div>
                                                                        {event && <i className={` ${event.icon}`} style={{ color: event.color }} title={event.label}></i>}
                                                                    </div>
                                                                })()
                                                            }
                                                        </div>


                                                        <div class="form-group col-lg-12">
                                                            <label>{lang["log.listtitle"]} </label>
                                                            <input type="text" class="form-control" value={logDetail.event_title} readOnly />
                                                            <label>{lang["description"]} </label>
                                                            <textarea rows={6} class="form-control"  value={logDetail.event_description} readOnly />
                                                           
                                                            <label>{lang["log.listtitle"]} </label>
                                                            <input type="text" class="form-control" value={logDetail.event_title} readOnly />
                                                            <label>{lang["log.create_user"]} </label>
                                                            <input type="text" class="form-control" value={logDetail.create_user} readOnly />
                                                            <label>{lang["log.create_at"]} </label>
                                                            <input type="text" class="form-control" value={logDetail.create_at} readOnly />
                                                            <label>IP: </label>

                                                            {
                                                                (() => {
                                                                    if (logDetail.ip) {
                                                                        let ipString = logDetail.ip;
                                                                        let ipParts = ipString.split("::ffff:");
                                                                        let ipAddress = ipParts.length > 1 ? ipParts[1] : ipParts[0];

                                                                        return (
                                                                            <div>
                                                                                <input type="text" className="form-control" value={ipAddress} readOnly />
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null; // Hoặc bạn có thể trả về một giá trị mặc định hoặc một thành phần khác tại đây
                                                                })()
                                                            }
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
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
</div >
</div >