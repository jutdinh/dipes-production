import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { LeftArrow } from "../../Icons/Arrow/leftArrow.icon";
import { RightArrow } from "../../Icons/Arrow/rightArrow.icon";
const COMPONENT = (props) => {
  const { lang, proxy, auth, functions } = useSelector((state) => state);
  const [searchList, setSearchList] = useState({
    list: [],
    currentIndex: 0,
  });
  const [searching, setSearching] = useState({
    feature: "",
    table: "",
  });

  const { id } = useParams();
  const location = useLocation();

  let navigate = useNavigate();
  const goToHomePage = () => {
    navigate(`/privileges`);
  };

  const [group, setGroup] = useState({});
  /**
   *
   * Group_name
   *
   */
  const [pages, setPages] = useState([]);

  const _token = localStorage.getItem("_token");
  useEffect(() => {
    const FetchDataAsync = async () => {
      const response = await fetch(
        `${proxy()}/privileges/group/${id}/ui/tree`,
        {
          headers: {
            Authorization: _token,
          },
        }
      );
      const serializedData = await response.json();
      const { pages } = serializedData;
      setPages(pages);
    };

    FetchDataAsync();
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.split("#")?.[1];
      const element = document.getElementById(id);
      element?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [location]);

  const handleSearching = (key, value) => {
    setSearching((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchList = (list, index) => {
    setSearchList((prev) => ({
      currentIndex: index,
      list,
    }));
  };

  const handleRedirect = (url) => {
    navigate(url);
  };

  const handleRedirectSearching = (list = searchList.list, key) => {
    let index = searchList.currentIndex;

    switch (key) {
      case "next":
        index = searchList.currentIndex + 1;
        index = index > list.length - 1 ? list.length - 1 : index;
        break;
      case "prev":
        index = searchList.currentIndex - 1;
        index = index < 0 ? 0 : index;
        break;
      default:
        index = 0;
        break;
    }

    handleSearchList(list, index);
    handleRedirect(list.length > 0 ? `#${list[index].id}` : "");
  };

  return (
    <div class="midde_cont">
      <div class="container-fluid">
        <div class="row column_title">
          <div class="col-md-12">
            <div class="page_title d-flex align-items-center">
              <h4 class="ml-1">{lang["privileges manager"]}</h4>
            </div>
          </div>
        </div>
        <div class="row column1">
          <div class="col-md-12">
            <div class="white_shd full">
              <div class="white_shd full ">
                <div class="full graph_head">
                  <div class="heading1 margin_0">
                    <h5>
                      <label
                        class="pointer"
                        style={{ margin: 0 }}
                        onClick={() => goToHomePage()}
                      >
                        <a title={lang["back"]}>
                          <i class=" fa fa-chevron-circle-left mr-1 nav-item nav-link"></i>
                        </a>
                        {lang["privileges"]}
                      </label>
                    </h5>
                  </div>
                </div>
              </div>
              <section></section>
              {searchList.list.length > 1 ? (
                <section
                  class="position-fixed d-flex align-items-center text-white"
                  style={{
                    right: "10px",
                    padding: "5px 20px",
                    gap: "20px",
                    borderRadius: "5px",
                    background: "#274452",
                  }}
                >
                  <div
                    class="hover_arrow"
                    onClick={() => {
                      handleRedirectSearching(searchList.list, "prev");
                    }}
                  >
                    <LeftArrow width="15px" height="15px" cursor="pointer" />
                  </div>
                  <p class="m-0 text-white">
                    {searchList.currentIndex + 1} / {searchList.list.length}
                  </p>
                  <div
                    class="hover_arrow"
                    onClick={() => {
                      handleRedirectSearching(searchList.list, "next");
                    }}
                  >
                    <RightArrow width="15px" height="15px" cursor="pointer" />
                  </div>
                </section>
              ) : null}
              <section
                class="d-flex w-100 px-2"
                style={{
                  gap: "20px",
                }}
              >
                <div class="w-100">
                  <label
                    for="formGroupExampleInput"
                    class="h5 ml-2 mt-2 text-dark font-weight-bold"
                  >
                    Tên chức năng:
                  </label>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const list = pages
                        .filter(
                          (page) =>
                            page.page_title?.toLocaleLowerCase() ===
                            searching.feature.trim().toLocaleLowerCase()
                        )
                        .map((prev) => ({
                          ...prev,
                          id: prev.page_id,
                        }));
                      handleRedirectSearching(list);
                    }}
                    class=" d-flex align-item-center"
                    style={{
                      gap: "20px",
                    }}
                  >
                    <div class="w-100">
                      <input
                        type="text"
                        class="form-control "
                        id="formGroupExampleInput"
                        placeholder="Example input"
                        onChange={({ target: { value } }) => {
                          handleSearching("feature", value);
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      class="btn btn-primary"
                      style={{
                        margin: 0,
                      }}
                    >
                      Search
                    </button>
                  </form>
                </div>
                <div class="w-100">
                  <label
                    for="formGroupExampleInput"
                    class="h5 ml-2 mt-2 text-dark font-weight-bold"
                  >
                    Tên bảng:
                  </label>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const list = [];
                      pages.map((page) => {
                        list.push(
                          ...page.tables.filter(
                            (table) =>
                              table.name?.toLocaleLowerCase() ===
                              searching.table.trim().toLocaleLowerCase()
                          )
                        );
                      });
                      handleRedirectSearching(list);
                    }}
                    class="d-flex align-item-center"
                    style={{
                      gap: "20px",
                    }}
                  >
                    <div class="w-100">
                      <input
                        type="text"
                        class="form-control"
                        id="formGroupExampleInput"
                        placeholder="Example input"
                        onChange={({ target: { value } }) => {
                          handleSearching("table", value);
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      class="btn btn-primary"
                      style={{
                        margin: 0,
                      }}
                    >
                      Search
                    </button>
                  </form>
                </div>
              </section>
              <div className="privilege-pages d-flex flex-wrap">
                {pages.map((page) => (
                  <Page page={page} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Page = (props) => {
  const { proxy } = useSelector((state) => state);
  const { page } = props;
  const [tables, setTables] = useState(page.tables);
  const [active, setActive] = useState(false);

  const location = useLocation();

  const { id } = useParams();
  const _token = localStorage.getItem("_token");

  const checkTrigger = async (event, button) => {
    const grant = event.target.checked;

    if (grant) {
      const request = await fetch(`${proxy()}/privileges/create/detail`, {
        method: "POST",
        headers: {
          Authorization: _token,
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          detail: {
            privilegegroup_id: parseInt(id),
            button_id: button.button.id,
          },
        }),
      });

      const response = await request.json();
      console.log("GRANT", response);
      event.target.checked = true;
    } else {
      const request = await fetch(`${proxy()}/privileges/detail`, {
        method: "DELETE",
        headers: {
          Authorization: _token,
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          detail: {
            privilegegroup_id: parseInt(id),
            button_id: button.button.id,
          },
        }),
      });

      const response = await request.json();

      event.target.checked = false;
    }
  };

  useEffect(() => {
    const id = location.hash.split("#")?.[1];
    let table = "";
    for (let j = 0; j < props.page.tables.length; j++) {
      if (props.page.tables[j].id === id) {
        table = id;
        break;
      }
    }
    console.log(
      "condition",
      id === props.page.page_id,
      table !== "",
      id,
      props.page.page_id
    );
    if (id === props.page.page_id || table !== "") {
      setActive(true);
    } else {
      setActive(false);
    }
  }, [location]);

  return (
    <div id={props.page.page_id} className="privilege-page w-50">
      <span
        style={{ fontWeight: "bold" }}
        class={`h5 ${active ? "text-primary" : "text-dark"}`}
      >
        {page.page_title}
      </span>

      {tables.map((table) => (
        <div className="privilege-table" id={table.id}>
          <div className="table-title">
            <span class={`font-weight-bold ${active ? "text-primary" : ""}`}>
              Tên bảng: {table.name}
            </span>
          </div>
          <div className="buttons">
            {table.buttons.map((button) => (
              <div className="button" style={{ display: "flex" }}>
                <div className="checkbox">
                  <input
                    type="checkbox"
                    checked={button.grantted}
                    onChange={(e) => {
                      checkTrigger(e, button);
                    }}
                  />
                </div>
                <div className="button-name">
                  <span>{button.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
export default COMPONENT;
