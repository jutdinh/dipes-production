const { Database } = require("../config/models/database");

const ValidateFieldByConditions = async ({
  condition_type,
  item,
  data,
  key,
  failed_value,
  success_value,
  condition_column = [],
}) => {
  let isFailed = false;

  switch (condition_type) {
    case "NOT_NULL":
      if (!item) {
        isFailed = true;
      } else {
        for (let i = 0; i < condition_column.length; i++) {
          const {
            comparison_value,
            condition_type: type,
            key: column_key,
          } = condition_column[i];

          switch (type) {
            case "NOT_NULL":
              if (!item[column_key]) {
                isFailed = true;
                break;
              }

              if (comparison_value?.table_alias) {
                const obj = await Database.select(
                  comparison_value.table_alias,
                  {
                    [comparison_value.field_alias]: item[column_key],
                  }
                );

                if (!obj) {
                  isFailed = true;
                }
              }
              break;
            case "NULL":
              break;
            case "BOOLEAN":
              if (item[column_key] === comparison_value) {
              } else {
                isFailed = true;
              }
              break;
          }
        }
        if (data[key]) {
          data[key] = success_value || null;
        }
      }
      if (isFailed) {
        const keys = Object.keys(data);
        if (
          failed_value !== undefined &&
          failed_value !== null &&
          keys.includes(key)
        ) {
          data[key] = failed_value;
        }
      }
      break;
    case "NULL":
      const keys = Object.keys(data);
      if (item) {
        isFailed = true;
        if (failed_value && keys.includes(key)) {
          data[key] = failed_value;
        }
      } else if (keys.includes(key)) {
        data[key] = success_value || "";
      }
      break;
  }

  return { data, isFailed };
};

module.exports = { ValidateFieldByConditions };
