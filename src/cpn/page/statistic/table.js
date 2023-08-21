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
    const [ currentPage, setCurrentPage ] = useState(0)
    const [ totalPages, setTotal ] = useState( Math.floor(headers.length / RECORD_PER_PAGE) - 1)

    useEffect(() => {        
        setDisplay( headers.slice(currentPage * RECORD_PER_PAGE,  (currentPage + 1)* RECORD_PER_PAGE ) )
    }, [currentPage])


    const paginate = ( nextPage ) => {
        setCurrentPage(nextPage)
    }

    return (
        <div class="col-md-6 col-sm-4">
            <p class="mt-4">{display_name}</p>
            <div class="table-outer">
                <table class="table-head">
                    <thead>
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
                                <tr key={headerIndex}>
                                    <td>{header}</td>
                                    <td>{formatNumber(values[headers.indexOf(header) ].toFixed())}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
                <p>{lang["show"]} { formatNumber( currentPage * RECORD_PER_PAGE )} - {formatNumber((currentPage + 1) * RECORD_PER_PAGE)} {lang["of"]} {formatNumber( headers.length )} {lang["results"]}</p>
                { totalPages > 1 ?
                <nav aria-label="Page navigation example">
                    <ul className="pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => paginate(1)}>
                                &#8810;
                            </button>
                        </li>
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                                &laquo;
                            </button>
                        </li>
                        {currentPage > 1 && <li className="page-item"><span className="page-link">...</span></li>}
                        {Array(totalPages).fill().map((_, index) => {
                            if (
                                index + 1 === currentPage ||
                                (index + 1 >= currentPage - 1 && index + 1 <= currentPage + 1)
                            ) {
                                return (
                                    <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => paginate(index + 1)}>
                                            {index + 1}
                                        </button>
                                    </li>
                                )
                            }
                        })}
                        {currentPage < totalPages - 1 && <li className="page-item"><span className="page-link">...</span></li>}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                                &raquo;
                            </button>
                        </li>
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => paginate(totalPages)}>
                                &#8811;
                            </button>
                        </li>
                    </ul>
                </nav>
                : null }
            </div>
        </div>
    )
}