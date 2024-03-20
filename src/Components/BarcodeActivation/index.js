import { useSelector } from "react-redux";
import { Option } from "../Option";
import { useState } from "react";
import { IsNumber } from "../../utils/isNumber";
import Swal from "sweetalert2";
import { BarcodeActivation_API } from "../../APIs/BarcodeActivation.api";

export const BarCodeActivation = ({ props, title_list, othersPayload }) => {
  const { lang, proxy } = useSelector((state) => state);

  const input_list = [
    {
      label: "Từ:",
      key: "from",
      alias: "From field",
    },
    {
      label: "Đến:",
      key: "to",
      alias: "To field",
    },
  ];

  const [data, setData] = useState({
    master: {
      value: props?.master.id,
      alias: props.master.table_name,
    },
    table: {
      value: props?.table.id,
      alias: props.table.table_name,
    },
    criteria: {
      value: props?.criteria.id,
      alias: props?.criteria.field_name,
    },
    selection: {
      value: "",
      alias: props.master.table_name,
    },
    ...input_list.reduce(
      (prev, { key, alias }) => ({
        ...prev,
        [key]: { value: "", alias },
      }),
      {}
    ),
    ...othersPayload,
  });

  const handleChangeInput = (key, value, props) =>
    setData((prev) => ({ ...prev, [key]: { value, ...props } }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        let title = "";

        for (const k in data) {
          if (Array.isArray(data[k])) {
            const isEmpty = data[k].find((i) => !i.value);
            title = isEmpty?.key;
          } else if (!data[k].value) {
            title = data[k].alias;
          }
          if (title) {
            Swal.fire({
              title: lang["error"],
              text: `"${title}" is empty`,
              icon: "error",
              showConfirmButton: false,
              timer: 1500,
            });
            return;
          }
        }
        if (data.from.value > data.to.value) {
          Swal.fire({
            title: lang["error"],
            text: `value of "to field" is incorrect`,
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }

        Swal.fire({
          title: lang["loading"],
          allowEscapeKey: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const { table, criteria, master, from, to, selection, select } = data;
        const payload = {
          table: table.value,
          criteria: criteria.value,
          master: master.value,
          from: from.value,
          to: to.value,
          value: selection.value,
          select,
        };

        BarcodeActivation_API.post(proxy(), payload)
          .then(() => {
            Swal.fire({
              title: lang["success"],
              text: "Activating barcode successfully",
              icon: "success",
              showConfirmButton: true,
              confirmButtonText: lang["confirm"],
              allowOutsideClick: false,
            });
          })
          .catch((e) =>
            Swal.fire({
              title: lang["error"],
              text: `${e}`,
              icon: "error",
              showConfirmButton: false,
              timer: 1500,
            })
          );
      }}
    >
      <div className="preview p-3">
        <div
          class="d-flex align-items-center mt-2"
          style={{ fontWeight: "bold" }}
        >
          {props.name}
        </div>
        {title_list?.map((title, i) => (
          <h5 className="mt-2" key={i}>{title}</h5>
        ))}

        <section style={props.style}>
          <Option
            label={props?.master.table_name}
            onChange={({ label, value }) => {
              setData((prev) => ({
                ...prev,
                selection: {
                  alias: prev.selection.alias,
                  value,
                },
              }));
            }}
            primary_key={props?.master.primary_key[0]}
            table_id={props?.master.id}
          />
          <p>
            Điều kiện lọc:
            <span style={{ fontWeight: "bold" }}>
              {props?.criteria.field_name}
            </span>
          </p>
          <div className="condition d-flex flex-wrap">
            {input_list.map(({ label, key, ...props }) => (
              <div key={key} className="col-md-2 p-0 mr-5">
                <div className="form-group">
                  <label className="mt-3 mb-3">{label}</label>
                  <input
                  className="form-control"
                  style={{ borderRadius: "1px solid" }}
                  onChange={({ target: { value } }) => {
                    if (IsNumber(value) || value === "") {
                      handleChangeInput(key, +value, props);
                    }
                  }}
                  value={data?.[key]?.value || ""}
                />
                </div>
                {/* <p className="mt-3 mb-3">{label}</p>
                <input
                  className="mr-5"
                  style={{ borderRadius: "1px solid" }}
                  onChange={({ target: { value } }) => {
                    if (IsNumber(value) || value === "") {
                      handleChangeInput(key, +value, props);
                    }
                  }}
                  value={data?.[key]?.value || ""}
                /> */}
              </div>
            ))}
          </div>
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
      </div>
    </form>
  );
};
