import { memo, useState } from "react";
import { useSelector } from "react-redux";
import { AsyncPaginate } from "react-select-async-paginate";
import { ForeignData_API } from "../../APIs/ForeignData.api";

const Component = ({ label, table_id, primary_key, onChange }) => {
  const [data, setData] = useState({
    options: [],
    hasMore: false,
    additional: {
      page: 0,
    },
  });
  const [selectedValue, setSelectedValue] = useState();

  const { lang, proxy, auth, pages, functions } = useSelector((state) => state);
  const _token = localStorage.getItem("_token");

  const handleGetData = async (page = 0) => {
    try {
      const res = await ForeignData_API.get(proxy(), _token, {
        table_id,
        start_index: page,
      });

      const alias = res.fields.find(
        (field) => field.id === primary_key
      )?.fomular_alias;

      let newData = {
        options: [],
        hasMore: false,
        additional: {
          page: 0,
        },
      };

      if (res.data.length) {
        setData((prev) => {
          newData = {
            additional: { page: page + 1 },
            hasMore: res.data.length ? true : false,
            options: res.data.map((item) => ({
              label: item[alias],
              value: item[alias],
            })),
          };

          return {
            additional: { page: page + 1 },
            hasMore: res.data.length ? true : false,
            options: [
              ...prev.options,
              ...res.data.map((item) => ({
                label: item[alias],
                value: item[alias],
              })),
            ],
          };
        });
      }

      return newData;
    } catch (err) {
      console.log("OPTION ERROR:", err);
    }
  };

  const handleOnchange = (props) => {
    setSelectedValue(props);
    onChange(props);
  };

  return (
    <div class="w-100">
      <div class="">
        <form>
          <div class="form-group">
            <label className="mt-2" for="name">{label}</label>

            <AsyncPaginate
              loadOptions={async (search, loadedOptions, { page }) => {
                return await handleGetData(page);
              }}
              onChange={({ label, value }) => {
                if (value === "unSelect") {
                  handleOnchange("");
                  return;
                }
                handleOnchange({ label, value });
              }}
              options={[
                {
                  value: "unSelect",
                  label: "Un select",
                },
              ]}
              isSearchable={true}
              styles={{
                menuList: (base) => ({
                  ...base,
                  maxHeight: "300px",
                }),
              }}
              value={selectedValue}
              additional={{
                page: 0,
              }}
              allowCreateWhileLoading={false} // Không cho phép tạo mới khi đang tải dữ liệu
            />
          </div>
        </form>
      </div>
    </div>
  );
};
export const Option = memo(Component);
