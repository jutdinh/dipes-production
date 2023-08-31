import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import $ from 'jquery'

const RECORD_PER_PAGE = 10

export default (props) => {
    const { functions, lang } = useSelector(state => state)
    const { formatNumber } = functions

    const { data, statis } = props
    const { display_name, type } = statis;
    const { headers, values } = data;
    const [display, setDisplay] = useState(headers.slice(0, RECORD_PER_PAGE))
    const [currentPage, setCurrentPage] = useState(0)
    const totalPages = Math.ceil(headers.length / RECORD_PER_PAGE);


    useEffect(() => {

        setDisplay(headers.slice(currentPage * RECORD_PER_PAGE, (currentPage + 1) * RECORD_PER_PAGE))
    }, [currentPage])


    const paginate = (nextPage) => {
        setCurrentPage(nextPage)
    }
    // console.log("Current Page:", currentPage);
    // console.log("Total Pages:", totalPages);

    return (
        <div class="col-md-6 col-sm-4">
            <p class="mt-4">{display_name}</p>
            <div class="table-outer">
                <table class="table-head">
                    <thead>
                        
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
                                    <td>{formatNumber(values[headers.indexOf(header)].toFixed())}</td>
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

                                {/* Logic to display the 3 pages around the current page */}
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
    )
}