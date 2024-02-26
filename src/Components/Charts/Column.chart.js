import { useEffect, useState } from "react";
import { Statistics_API } from "../../APis/statistics.api";
import { useSelector } from "react-redux";
import { DelayLoading } from "../../Hooks/DelayLoading";
import { LoadingIcon } from "../../Icons/loading.icon";

const STATE_LOADING = {
  SUCCESS: 1,
  PENDING: 2,
  FAILED: 3,
};

export const ColumnChart = ({ props }) => {
  const { post } = Statistics_API;
  const { lang, proxy, auth, functions } = useSelector((state) => state);
  const [value, setValue] = useState({
    fields: [],
    statistics: {},
    row_keys: [],
  });
  const [isFetching, setIsFetching] = useState(STATE_LOADING.PENDING);

  const find_max_length_keys = (list) => {
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
        DelayLoading(start_time, () => setIsFetching(STATE_LOADING.SUCCESS));
        setValue({
          fields,
          statistics,
          row_keys: find_max_length_keys(
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

  return (
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
          {value.row_keys.map((item, index) => {
            return (
              <th
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
      <tbody>
        {Object.keys(value.statistics).map((item, index) => (
          <tr>
            <th scope="row">{index + 1}</th>
            <td>{item}</td>
            {value.row_keys.map((key) => (
              <td>{value.statistics?.[item]?.[key] || 0}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
