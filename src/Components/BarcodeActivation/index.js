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
      <section className="mx-2">
        {title_list?.map((title, i) => (
          <h5 key={i}>{title}</h5>
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
          <p>Điều kiện lọc: {props?.criteria.field_name}</p>
          <section
            className="d-flex justify-content-between"
            style={{
              gap: "20px",
            }}
          >
            {input_list.map(({ label, key, ...props }) => (
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
                      handleChangeInput(key, +value, props);
                    }
                  }}
                  value={data?.[key]?.value || ""}
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
