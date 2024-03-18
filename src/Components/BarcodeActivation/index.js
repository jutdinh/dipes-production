import { useSelector } from "react-redux";
import { Option } from "../Option";
import { useState } from "react";
import { IsNumber } from "../../utils/isNumber";
import Swal from "sweetalert2";

export const BarCodeActivation = ({ props, title_list, othersPayload }) => {
  const { lang, proxy } = useSelector((state) => state);
  const [data, setData] = useState({
    master: props?.master.id,
    table: props?.table.id,
    criteria: props?.criteria.id,
    ...othersPayload,
  });

  const input_list = [
    {
      label: "Từ:",
      key: "from",
    },
    {
      label: "Đến:",
      key: "to",
    },
  ];

  const handleChangeInput = (key, value) =>
    setData((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log("submit", data);
        Swal.fire({
          title: lang["loading"],
          allowEscapeKey: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      }}
    >
      <section className="mx-2">
        {title_list?.map((title, i) => (
          <h5 key={i}>{title}</h5>
        ))}

        <section style={props.style}>
          <Option
            label={props?.master.table_name}
            onChange={({ label, value }) => {
              setData((prev) => ({ ...prev, value }));
            }}
            primary_key={props?.master.primary_key[0]}
            table_id={props?.master.id}
          />
          <p>Điều kiện lọc: {props?.criteria.field_name}</p>
          <section
            className="d-flex justify-content-between"
            style={{
              gap: "20px",
            }}
          >
            {input_list.map(({ label, key }) => (
              <section
                style={{
                  flex: 1,
                }}
                key={key}
              >
                <p>{label}</p>
                <input
                  className="w-100"
                  onChange={({ target: { value } }) => {
                    if (IsNumber(value) || value === "") {
                      handleChangeInput(key, +value);
                    }
                  }}
                  value={data?.[key] || ""}
                />
              </section>
            ))}
          </section>
          <section>
            <button
              type="submit"
              style={{ minWidth: "105px" }}
              class="btn btn-success mr-2"
            >
              {lang["btn.update"]}
            </button>
            <button
              type="button"
              id="closeModalExportFileSample"
              class="btn btn-danger"
              data-dismiss="modal"
            >
              {lang["btn.close"]}
            </button>
          </section>
        </section>
      </section>
    </form>
  );
};
