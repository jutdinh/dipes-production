import React, { useEffect, useState } from "react";
import { Statistics_API } from "../../../APis/statistics.api";
import { useSelector } from "react-redux";
import { DelayLoading } from "../../../Hooks/DelayLoading";
import { LoadingIcon } from "../../../Icons/loading.icon";
import { Link, useSearchParams } from "react-router-dom";
import { Pagination } from "react-bootstrap";
import { Statistic } from "./Statistic";

const STATE_LOADING = {
  SUCCESS: 1,
  PENDING: 2,
  FAILED: 3,
};

export const ColumnChart = ({ props }) => {
  const MAX_ITEM_DISPLAY = 15;
  const [MAX_PAGE, setMAX_PAGE] = useState();
  const [searchParams, setSearchParams] = useSearchParams();
  let CURRENT_PAGE = searchParams.get("page") || 1;
  CURRENT_PAGE = CURRENT_PAGE > MAX_PAGE ? MAX_PAGE : CURRENT_PAGE;

  const { post } = Statistics_API;
  const { lang, proxy, auth, functions } = useSelector((state) => state);
  const [value, setValue] = useState({
    fields: [],
    statistics: {},
    statistics_key: [],
    column_fields: [],
  });

  const SEARCH_FIELD = [value.fields[0]];

  const [isFetching, setIsFetching] = useState(STATE_LOADING.PENDING);

  const find_max_length_field_column = (list) => {
    let MAX_INDEX = 0;
    for (let i = 0; i < list.length; i++) {
      if (list[i].length >= list[MAX_INDEX].length) {
        MAX_INDEX = i;
      }
    }
    return list[MAX_INDEX];
  };

  useEffect(() => {
    const start_time = new Date().getTime();
    post(props.api, proxy(), {})
      .then((res) => {
        const { success, content, statistics, fields } = res;
        const statistics_key = Object.keys(statistics);

        DelayLoading(start_time, () => setIsFetching(STATE_LOADING.SUCCESS));
        setMAX_PAGE(Math.ceil(statistics_key.length / MAX_ITEM_DISPLAY));
        setValue({
          fields,
          statistics,
          statistics_key,
          column_fields: find_max_length_field_column(
            Object.values(statistics).map((item) => Object.keys(item))
          ),
        });
      })
      .catch(() => {
        DelayLoading(start_time, () => setIsFetching(STATE_LOADING.FAILED));
      });
  }, []);

  if (isFetching === STATE_LOADING.PENDING) {
    return (
      <div
        style={{
          width: "50px",
          margin: "auto",
        }}
      >
        <LoadingIcon />
      </div>
    );
  } else if (isFetching === STATE_LOADING.FAILED) {
    return <p class="text-center font-weight-bold">{lang["not found"]}</p>;
  }
  const list = [];

  for (
    let i = (CURRENT_PAGE - 1) * MAX_ITEM_DISPLAY,
      number_of_item = (CURRENT_PAGE - 1) * MAX_ITEM_DISPLAY;
    number_of_item < CURRENT_PAGE - 1 + MAX_ITEM_DISPLAY &&
    i < value.statistics_key.length;
    i++
  ) {
    const item = value.statistics_key[i];
    const searched_item = searchParams.get(SEARCH_FIELD[0]?.fomular_alias);
    if (
      !searched_item ||
      (searched_item && item.toString().trim() === searched_item?.trim())
    ) {
      number_of_item++;
      list.push(
        <tr key={item}>
          <th scope="row" class="text-center">
            {number_of_item}
          </th>
          <td>{item}</td>
          {value.column_fields.map((key) => (
            <td key={key}>{value.statistics?.[item]?.[key] || 0}</td>
          ))}
        </tr>
      );
    }
  }

  return (
    <section class="mx-2 ">
      <p
        class="font-weight-bold  mb-2 h1"
        style={{
          fontSize: "16px",
        }}
      >
        Thống kê
      </p>
      <section>
        <p class="font-weight-bold  mb-2 h1">Chọn tiêu chí thống kê</p>
        <Statistic fields={SEARCH_FIELD} />
      </section>
      <div class="table-responsive">
        <table class="table table-hover table-striped">
          <thead>
            <tr>
              <th
                scope="col"
                class="font-weight-bold"
                style={{
                  textAlign: "center",
                }}
              >
                STT
              </th>
              <th
                scope="col"
                class="font-weight-bold"
                style={{
                  textAlign: "center",
                }}
              >
                {value.fields[0]?.field_name}
              </th>
              {value.column_fields.map((item, index) => {
                return (
                  <th
                    key={index}
                    scope="col"
                    class="font-weight-bold"
                    style={{
                      textAlign: "center",
                    }}
                  >
                    {item}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>{list}</tbody>
        </table>
      </div>
      {MAX_PAGE > 1 ? (
        <Pagination TOTAL_ITEM={value.statistics_key.length} />
      ) : null}
    </section>
  );
};
