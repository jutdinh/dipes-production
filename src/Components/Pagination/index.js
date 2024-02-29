import { Link, useSearchParams } from "react-router-dom";

export const Pagination = ({ TOTAL_ITEM, MAX_ITEM_DISPLAY, MAX_PAGE }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  let CURRENT_PAGE = searchParams.get("page") || 1;
  CURRENT_PAGE = CURRENT_PAGE > MAX_PAGE ? MAX_PAGE : CURRENT_PAGE;

  const DISABLED_PREV_BTN = Number(CURRENT_PAGE) - 1 > 0;
  const DISABLED_NEXT_BTN = Number(CURRENT_PAGE) + 1 > MAX_PAGE;

  return (
    <section class="d-flex justify-content-between align-items-center">
      <p>{`Showing ${(CURRENT_PAGE - 1) * MAX_ITEM_DISPLAY || 1} - ${
        MAX_ITEM_DISPLAY * CURRENT_PAGE
      } of ${TOTAL_ITEM} results`}</p>
      <nav aria-label="Page navigation">
        <ul class="pagination justify-content-end">
          <li class={`page-item ${DISABLED_PREV_BTN ? "" : "disabled"}`}>
            <Link
              class="page-link"
              aria-label="Previous"
              to={`?page=${DISABLED_PREV_BTN ? CURRENT_PAGE - 1 : 1}`}
            >
              <span aria-hidden="true">&laquo;</span>
              <span class="sr-only">Previous</span>
            </Link>
          </li>
          {(() => {
            const list = [];

            for (let i = 0; i < MAX_PAGE; i++) {
              const page = i + Number(CURRENT_PAGE);
              list.push(
                <li
                  class={`page-item ${
                    page === Number(CURRENT_PAGE) ? "active" : ""
                  }`}
                >
                  <Link class="page-link" to={`?page=${page}`}>
                    {page}
                  </Link>
                </li>
              );
            }
            return list;
          })()}
          <li class={`page-item ${DISABLED_NEXT_BTN ? "disabled" : ""}`}>
            <Link
              class="page-link"
              aria-label="Next"
              to={`?page=${
                DISABLED_NEXT_BTN ? CURRENT_PAGE : Number(CURRENT_PAGE + 1)
              }`}
            >
              <span aria-hidden="true">&raquo;</span>
              <span class="sr-only">Next</span>
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
};
