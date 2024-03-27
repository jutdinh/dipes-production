const { Controller } = require("../../config/controllers");
const { Projects, ProjectsRecord } = require("../../models/Projects");
const { ProjectMembers } = require("../../models/ProjectMembers");
const { Tables, TablesRecord } = require("../../models/Tables");
const { Versions, VersionsRecord } = require("../../models/Versions");
const { intValidate, objectComparator } = require("../../functions/validator");
const { Fields, FieldsRecord } = require("../../models/Fields");
const { Apis, ApisRecord } = require("../../models/Apis");

const { Buttons, ButtonsRecord } = require("../../models/Buttons");

const Model = require("../../config/models/model");
const Cache = require("../Cache/Cache");
const fs = require("fs");
const { Database } = require("../../config/models/database");

const UI_PATH = "public/config/ui.json";

const {
  RESULT_PER_SEARCH_PAGE,
  DEFAULT_ERROR_CALCLATED_VALUE,
  TOTAL_DATA_PER_PARTITION,
} = require("../enums");

class Api extends Controller {
  #__versions = new Versions();
  #__projects = new Projects();
  #__projectMembers = new ProjectMembers();
  #__tables = new Tables();
  #__fields = new Fields();
  #__apis = new Apis();
  #__btns = new Buttons();

  constructor() {
    super();
  }

  get = async (req, res) => {
    this.writeReq(req);

    /* Logical code goes here */

    this.writeRes({ status: 200, message: "Sample response" });
    res.status(200).send({
      success: true,
      content: "Hế nhô quơ",
      data: [],
    });
  };

  getFieldsByTableId = async (tableId) => {
    const fields = await this.#__fields.findAll({ table_id: tableId });
    return fields;
  };

  getFields = async (fieldIds) => {
    const fields = await this.#__fields.findAll({ id: { $in: fieldIds } });
    return fields ? fields : [];
  };

  getField = async (fieldId) => {
    const field = await this.#__fields.find({ id: fieldId });
    return field;
  };

  getTable = async (tableId) => {
    const table = await this.#__tables.find({ id: tableId });
    return table;
  };

  getTables = async (tableIds) => {
    const tables = await this.#__tables.findAll({ id: { $in: tableIds } });
    return tables;
  };

  getApiInputInfo = async (req, res) => {
    /* NOT TESTED */
    const { api_id } = req.params;
    const context = {
      success: false,
    };
    if (api_id) {
      const api = await this.#__apis.find({ api_id });
      if (api) {
        const API = new ApisRecord(api);

        const method = API.api_method.value();

        const tableIDs = API.tables.valueOrNot();
        const bodyIDs = API.body.valueOrNot();
        const paramIDs = API.params.valueOrNot();
        const fieldIds = API.fields.valueOrNot().map((f) => f.id);

        const tables = await this.getTables(tableIDs);
        const body = await this.getFields(bodyIDs);
        const params = await this.getFields(paramIDs);
        const fields = await this.getFields(fieldIds);
        const display_fields = API.fields.valueOrNot();

        for (let i = 0; i < body.length; i++) {
          const { id } = body[i];
          const keys = {};

          for (let i = 0; i < tables.length; i++) {
            const { foreign_keys, primary_key } = tables[i];
            const foreignKeys = foreign_keys ? foreign_keys : [];
            const primaryKey = primary_key ? primary_key : [];

            const fk = foreignKeys.find((key) => key.field_id == id);
            if (fk) {
              keys.foreign = fk;
            }
            const pk = primaryKey.find((key) => key == id);

            if (pk) {
              keys.primary = true;
            }
          }
          body[i].keys = { ...keys };
        }
        context.success = true;
        context.data = {
          tables,
          body,
          params,
          fields,
          display_fields,
        };
      }
    }
    res.status(200).send(context);
  };

  getAutoIncrementID = async (req, res) => {
    const { field_id } = req.params;
    const context = {
      success: false,
      content: "Ngo nghinh nhi, la lung nhi",
    };
    if (field_id && intValidate(field_id)) {
      const id = parseInt(field_id);
      const field = await this.#__fields.find({ id });

      if (field) {
        const table = await this.#__tables.find({ id: field.table_id });
        if (table) {
          const { primary_key, foreign_keys } = table;
          const foreignKey = foreign_keys.find(
            (key) => key.field_id == field.id
          );
          if (foreignKey) {
            const foreignField = await this.#__fields.find({
              id: foreignKey.ref_field_id,
            });
            if (foreignField) {
              const { field_alias, PATTERN } = foreignField;
              const autoID = await Fields.makeAutoIncreament(
                field_alias,
                PATTERN
              );
              context.data = {
                id: autoID,
              };
              context.success = true;
            } else {
              context.content = "Bảng chứa khóa chính khum tồn tại";
            }
          } else {
            const { field_alias, PATTERN } = field;
            const autoID = await Fields.makeAutoIncreament(
              field_alias,
              PATTERN
            );
            context.data = {
              id: autoID,
            };
            context.success = true;
          }
        } else {
          context.content = "Bảng khum tồn tại";
        }
      } else {
        context.content = "Trường này khum tồn tại";
      }
    } else {
      context.content = "Field id khum hợp lệ";
    }
    res.status(200).send(context);
  };

  getForeignStructure = async (req, res) => {
    const { table_id } = req.params;
    console.log("CONTEXT");
    const context = {
      success: false,
      content: "Ngo nghinh nhi, la lung nhi",
      data: {},
    };

    if (table_id && intValidate(table_id)) {
      const id = parseInt(table_id);
      const table = await this.#__tables.find({ id });

      if (table) {
        const { table_alias } = table;
        const model = new Model(table_alias);
        const Table = model.getModel();

        const fields = await this.#__fields.allFieldsOfASingleTable({
          table_id: table.id,
        });
        context.data.fields = fields;
        context.data.table = table;
      } else {
        context.content = "Bảng dữ liệu primary khum tồn tại";
      }
    } else {
      context.content = "Table id khum hợp lệ";
    }
    res.status(200).send(context);
  };

  getAllTablesAndFields = async (req, res) => {
    const fields = await this.#__fields.findAll({});
    const tables = await this.#__tables.findAll({});

    const formattedFields = [];
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];

      const Field = new FieldsRecord(field);
      const infor = await Field.get();
      formattedFields.push(infor);
    }

    res
      .status(200)
      .send({ success: true, data: { tables, fields: formattedFields } });
  };

  importUI = async (req, res) => {
    const { ui } = req.body;
    if (ui && ui.data) {
      const stringifiedUI = JSON.stringify(ui);
      if (fs.existsSync(UI_PATH)) {
        fs.unlinkSync(UI_PATH);
      }

      await this.syncChronizeButtons(ui);

      fs.writeFileSync(UI_PATH, stringifiedUI);
      res.status(200).send({ success: true, content: "SUCCESSFULLY WRITE UI" });
    } else {
      res.status(200).send({ success: false, content: "INVALID FILE CONFIG" });
    }
  };

  syncChronizeButtons = async (ui = {}) => {
    const { data } = ui;

    if (data) {
      const pages = this.flatteningPages(data);
      const tableTypes = this.tableTypes;

      await this.#__btns.removeAll();
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        const flattenComponents = this.flatteningComponents(page.component);
        const tables = flattenComponents.filter(
          (cpn) => tableTypes.indexOf(cpn.name) != -1
        );

        for (let j = 0; j < tables.length; j++) {
          const table = tables[j];

          const { children } = table;
          const customButtons = children.filter(
            (child) => child.name == "custom_button"
          );

          const defaultButtons = this.defaultButtons.map((btn) => {
            const Button = new ButtonsRecord({
              button_id: btn,
              table_id: table.id,
              api_id: table.props.buttons[btn].api.api_id,
            });
            // console.log(Button.get())
            return Button;
          });

          const objectiveCustomButtons = customButtons.map((btn) => {
            const { id, props } = btn;
            const Button = new ButtonsRecord({
              button_id: id,
              table_id: table.id,
              api_id: props.api.api_id,
            });
            return Button;
          });

          // await Promise.all( [ ...defaultButtons, ...objectiveCustomButtons ].map( Button => Button.save() ) )

          const Buttons = [...defaultButtons, ...objectiveCustomButtons];
          for (let k = 0; k < Buttons.length; k++) {
            await Buttons[k].save();
          }
        }
      }
    }
  };

  getUI = (req, res) => {
    if (fs.existsSync(UI_PATH)) {
      const stringifiedUI = fs.readFileSync(UI_PATH);
      try {
        const ui = JSON.parse(stringifiedUI);
        res
          .status(200)
          .send({ success: true, content: "SUCCESSFULLY RETRIEVE UI", ui });
      } catch {
        res.status(200).send({ success: false, content: "INVALID UI CONFIG" });
      }
    } else {
      res.status(200).send({ success: false, content: "UI NOT FOUND" });
    }
  };

  translateColIndexToName = (index) => {
    /**
     * @desc Dịch số nguyên thành tên của một partition
     *
     *
     * @params [
     *      index <Int>
     * ]
     *
     * @return String
     *
     * @note Phần giải thích tên của partition đã được làm tường minh ở phương thức this.generatePeriodIndex, mục (1)
     *
     */

    return `${index * TOTAL_DATA_PER_PARTITION}-${
      (index + 1) * TOTAL_DATA_PER_PARTITION - 1
    }`;
  };

  generateRandomData = async (req, res) => {
    const verified = await this.verifyToken(req);

    const context = {
      success: false,
      content: "",
    };

    if (verified) {
      const {
        foreign_table,
        foreign_value,
        table,
        onField,
        indexField,
        amount,
        pattern,
        onOption,
        prefix,
      } = req.body;
      const targetTables = await this.#__tables.findAll({ id: table });
      if (targetTables.length > 0) {
        const targetTable = targetTables[0];
        const fields = await this.#__fields.findAll({
          id: { $in: [onField, indexField, onOption] }, //onField_Option
        });
        const targetTableFields = await this.#__fields.findAll({
          table_id: targetTable.id,
        });
        if (fields.length == 3) {
          const index = fields.find((f) => f.id == indexField);
          const field = fields.find((f) => f.id == onField);
          const option = fields.find((f) => f.id == onOption);
        
          if (index && field && option) {
            const currentValues = await Database.selectAll(
              "RFID_AMOUNT_CODE_MARK"
            );

            let currentValue = 2_293_562_354_761_728;

            if (currentValues && currentValues.length > 0) {
              const record = currentValues[0];
              currentValue = record ? record.value : 0;
              await Database.update(
                "RFID_AMOUNT_CODE_MARK",
                {},
                { value: currentValue + amount }
              );
            } else {
              await Database.insert("RFID_AMOUNT_CODE_MARK", {
                value: amount + currentValue,
              });
            }

            const { foreign_keys } = targetTable;
            const targetKey = foreign_keys.find(
              (key) => key.table_id == foreign_table
            );
            if (targetKey) {
              const { field_id, table_id } = targetKey;
              const foreignField = targetTableFields.find(
                (f) => f.id == field_id
              );
              const primaryTables = await this.#__tables.findAll({
                id: table_id,
              });
              const primaryTable = primaryTables[0];

              const { primary_key } = primaryTable;
              const primalField = await this.#__fields.find({
                id: primary_key[0],
              });

              const dataset = [];

              const primaryData = await Database.selectAll(
                primaryTable.table_alias,
                { [primalField.fomular_alias]: foreign_value }
              );
              if (primaryData.length > 0) {
                const primaryRecord = primaryData[0];
                for (let i = 0; i < amount; i++) {
                  const current = i + currentValue;
                  const value = this.translateBase10toBase36(current);
                  const barcode = this.formatEPCData(pattern, value);
                  const getPrefix = this.prefix(prefix, value);

                  const record = {
                    [index.fomular_alias]: i + 1,
                    [field.fomular_alias]: barcode,
                    [option.fomular_alias]: getPrefix + barcode,
                    [foreignField.fomular_alias]: foreign_value,
                    ...primaryRecord,
                  };
                  dataset.push(record);
                }

                let cache = await Cache.getData(
                  `${targetTable.table_alias}-periods`
                );
                if (!cache) {
                  cache = {
                    key: `${targetTable.table_alias}-periods`,
                    value: [],
                  };
                  await Cache.setData(`${targetTable.table_alias}-periods`, []);
                }

                const periods = cache.value;
                const sumerizes = await Database.selectAll(
                  targetTable.table_alias,
                  { position: "sumerize" }
                );

                let sumerize = sumerizes[0];

                if (!sumerize) {
                  sumerize = {
                    position: "sumerize",
                    total: 0,
                  };
                  await Database.insert(targetTable.table_alias, sumerize);
                }

                const positions = [];
                for (let j = 0; j < periods.length; j++) {
                  const { position, total } = periods[j];

                  if (total < TOTAL_DATA_PER_PARTITION) {
                    const amount = TOTAL_DATA_PER_PARTITION - total;
                    for (let h = 0; h < amount; h++) {
                      positions.push(position);
                      periods[j].total += 1;
                      if (positions.length >= dataset.length) {
                        break;
                      }
                    }
                  }
                }

                if (positions.length < dataset.length) {
                  const newPartition = this.translateColIndexToName(
                    periods.length
                  );
                  const amount = dataset.length - positions.length;
                  for (let i = 0; i < amount; i++) {
                    positions.push(newPartition);
                  }
                  const newPeriods = {
                    position: newPartition,
                    total: amount,
                  };
                  periods.push(newPeriods);
                }

                dataset.map((record, index) => {
                  record.position = positions[index];
                });
                await Database.insertMany(targetTable.table_alias, dataset);
                await Cache.setData(
                  `${targetTable.table_alias}-periods`,
                  periods
                );

                sumerize.total += dataset.length;
                await Database.update(
                  targetTable.table_alias,
                  { position: "sumerize" },
                  { ...sumerize }
                );

                context.content = "Generate code succeed";
                context.success = true;
              } else {
                context.content = "Foreign key failure";
                context.success = true;
              }
            } else {
              context.content = "Foreign field not found";
            }
          } else {
            context.content = "Invalid field set 2";
          }
        } else {
          context.content = "Invalid field set 1";
        }
      } else {
        context.content = "Table not found";
      }
    } else {
      context.content = "Invalid token";
    }
    res.send(context);
  };
}
module.exports = Api;
