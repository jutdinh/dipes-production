import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export const Statistic = ({ fields }) => {
  const { lang } = useSelector((state) => state);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [queryField, setQueryField] = useState(
    fields.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.fomular_alias]: searchParams.get(curr.fomular_alias) || "",
      }),
      {}
    )
  );

  const handleSubmitEvent = (e) => {
    e.preventDefault();

    let query = "";
    for (let k in queryField) {
      if (queryField[k] !== "") {
        if (query !== "") {
          query += `&${k}=${queryField[k]}`;
        } else {
          query += `${k}=${queryField[k]}`;
        }
      }
    }
    navigate(`?${query}`);
  };

  return (
    <form onSubmit={handleSubmitEvent}>
      <section class="row block-statis">
        {fields.map((field) => (
          <div class="col-md-4" key={field.fomular_alias}>
            <div class="form-group">
              <label class="font-weight-bold">{field.field_name}</label>
              <input
                type="text"
                class="form-control"
                placeholder={field.field_name}
                min="0"
                value={queryField[field.fomular_alias] || ""}
                onChange={({ target: { value } }) => {
                  setQueryField((prev) => ({
                    ...prev,
                    [field.fomular_alias]: value,
                  }));
                }}
              ></input>
            </div>
          </div>
        ))}
        <div class="col-md-12 text-right">
          <button
            class="btn btn-secondary mr-3"
            onClick={(e) => {
              setSearchParams();
              setQueryField({});
            }}
            type="reset"
          >
            <i class="fa fa-history mr-1 icon-search"></i>
            {lang["Refresh"]}
          </button>
          <button class="btn btn-primary mr-3" type="submit">
            <i class="fa fa-search mr-1 icon-search"></i>
            {lang["search"]}
          </button>
        </div>
      </section>
    </form>
  );
};
