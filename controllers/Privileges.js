const sharp = require("sharp");
const fs = require("fs");
const sizeOf = require("image-size");

const Crypto = require("./Crypto");

const { Controller } = require("../config/controllers");
const { Accounts } = require("../models/Accounts");

const { Privileges, PrivilegesRecord } = require("../models/Privileges");
const { Tables } = require("../models/Tables");

const {
  PrivilegeGroup,
  PrivilegeGroupRecord,
} = require("../models/PrivilegeGroup");
const {
  PrivilegeDetail,
  PrivilegeDetailRecord,
} = require("../models/PrivilegeDetail");

const { Buttons, ButtonsRecord } = require("../models/Buttons");

class PrivilegesController extends Controller {
  #__accounts = undefined;
  #__privileges = new Privileges();
  #__pg = new PrivilegeGroup();
  #__pd = new PrivilegeDetail();

  #__tables = new Tables();
  #__buttons = new Buttons();

  constructor() {
    super();
    this.#__accounts = new Accounts();
  }

  getPrivilegesOnTables = async (req, res) => {
    const verified = await this.verifyToken(req);

    const context = {
      success: false,
      content: "",
      data: {},
      status: 200,
    };
    if (verified) {
      const tables = await this.#__tables.findAll();
      const accounts = await this.#__accounts.findAll();
      const formatedTables = [];

      const serializeAccounts = {};
      accounts.map((account) => {
        serializeAccounts[account.username] = account;
      });

      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const table_id = table.id;
        table.accounts = await this.#__privileges.findAll({ table_id });
        for (let j = 0; j < table.accounts.length; j++) {
          const { username } = table.accounts[j];

          table.accounts[j].account = serializeAccounts[username];
        }
        formatedTables.push(table);
      }
      context.success = true;
      context.data = formatedTables;
    } else {
      context.content = "Token không hợp lệ";
      context.status = "0x4501040";
    }
    res.status(200).send(context);
  };

  getPrivilegesOnUsers = async (req, res) => {
    // in process
    const verified = await this.verifyToken(req);

    const context = {
      success: false,
      content: "",
      data: {},
      status: 200,
    };
    if (verified) {
      const accounts = await this.#__accounts.findAll();
      const tables = await this.#__tables.findAll();

      const serializeTables = {};
      tables.map((table) => {
        serializeTables[`${table.id}`] = table;
      });

      const formatedAccounts = [];
      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        const username = account.username;
        account.privileges = await this.#__privileges.findAll({ username });

        for (let j = 0; j < account.privileges.length; j++) {
          account.privileges[j].table =
            serializeTables[account.privileges[j].table_id];
        }
        formatedAccounts.push(account);
      }
      context.success = true;
      context.data = formatedAccounts;
    } else {
      context.content = "Token không hợp lệ";
      context.status = "0x4501040";
    }
    res.status(200).send(context);
  };

  changeUserPrivileges = async (req, res) => {
    const verified = await this.verifyToken(req);

    const context = {
      success: false,
      content: "",
      data: {},
      status: 200,
    };
    if (verified) {
      const decodedToken = this.decodeToken(req.header("Authorization"));
      const { username, table_id } = req.params;
      const { privileges } = req.body;
      if (this.isAdmin(decodedToken)) {
        const privilege = await this.#__privileges.find({
          username,
          table_id: parseInt(table_id),
        });

        if (privilege) {
          const Privilege = new PrivilegesRecord({
            ...privilege,
            ...privileges,
          });
          await Privilege.save();

          context.success = true;
          context.content = "Thay đổi thành công";
          context.status = "0x4501029";
        } else {
          context.content = "Quyền không tồn tại";
          context.status = "0x4501031";
        }
      } else {
        context.content = "Không có quyền thực hiện thao tác";
        context.status = "0x4501031";
      }
    } else {
      context.content = "Token không hợp lệ";
      context.status = "0x4501040";
    }
    res.status(200).send(context);
  };

  getUITree = async (req, res) => {
    const verified = await this.verifyToken(req);
    const { id } = req.params;

    const context = {
      success: false,
      content: "",
      pages: [],
      status: 200,
    };
    const tableTypes = this.tableTypes;
    const path = "public/config/ui.json";

    if (verified) {
      const decodedToken = this.decodeToken(req.header("Authorization"));

      if (this.isAdmin(decodedToken)) {
        if (fs.existsSync(path)) {
          const rawUI = fs.readFileSync(path);
          const ui = JSON.parse(rawUI);
          const pages = this.flatteningPages(ui.data);

          const availablePrivileges = await this.#__pd.findAll({
            privilegegroup_id: parseInt(id),
          });
          const buttonArray = await this.#__buttons.findAll();
          /**
           *
           *
           * Map these privilege to the tree
           */

          const buttons = {};
          for (let i = 0; i < buttonArray.length; i++) {
            const button = buttonArray[i];
            buttons[`${button.id}`] = button;
          }

          if (pages) {
            for (let i = 0; i < pages.length; i++) {
              const page = pages[i];
              const flattenComponents = this.flatteningComponents(
                page.component
              );
              const tables = flattenComponents.filter(
                (cpn) => tableTypes.indexOf(cpn.name) != -1
              );

              const data = {
                page_id: page.page_id,
                page_title: page.page_title,
                is_hidden: page.is_hidden,
                tables: tables.map((table) => {
                  const { props, id, children } = table;

                  const buttonsWhichBelongToThisTable = buttonArray.filter(
                    (btn) => btn.table_id === id
                  );
                  const buttonIds = buttonsWhichBelongToThisTable.map(
                    (btn) => btn.id
                  );

                  const thisTablePrivileges = availablePrivileges.filter(
                    (privilege) => {
                      const { button_id } = privilege;
                      return buttonIds.indexOf(button_id) != -1;
                    }
                  );

                  const serializedButtons = {};

                  for (let c = 0; c < thisTablePrivileges.length; c++) {
                    const { button_id } = thisTablePrivileges[c];
                    const correspondingButton = buttons[button_id];
                    serializedButtons[correspondingButton.button_id] = true;
                  }

                  const serializedThisTableButtons = {};
                  buttonsWhichBelongToThisTable.map((btn) => {
                    serializedThisTableButtons[btn.button_id] = btn;
                  });

                  if (props) {
                    const { name } = props;
                    const customButtons = children.filter(
                      (child) => child.name == "custom_button"
                    );
                    const buttons = [
                      // {
                      //     id: "detail",
                      //     title: "Xem chi tiết",
                      //     grantted: serializedButtons["detail"],
                      //     button: serializedThisTableButtons["detail"]
                      // },
                      {
                        id: "update",
                        title: "Cập nhật",
                        grantted: serializedButtons["update"],
                        button: serializedThisTableButtons["update"],
                      },
                      {
                        id: "delete",
                        title: "Xóa",
                        grantted: serializedButtons["delete"],
                        button: serializedThisTableButtons["delete"],
                      },
                    ];

                    for (let j = 0; j < customButtons.length; j++) {
                      const { id, props } = customButtons[j];
                      const { title, icon } = props;
                      const btn = {
                        id,
                        title,
                        icon,
                        grantted: serializedButtons[id],
                        button: serializedThisTableButtons[id],
                      };
                      buttons.push(btn);
                    }

                    return { id, name, buttons };
                  }
                }),
              };

              context.pages.push(data);
            }
          }
        }
      }
    }
    res.status(200).send(context);
  };

  createPrivilegeGroup = async (req, res) => {
    /**
     *
     * PRIVILEGES ["ad", "uad"]
     *
     * HEADERS: {
     *
     *      Authorization: <Token>
     * }
     *
     * BODY: {
     *
     *      group: {
     *          name: <String>
     *      }
     *
     * }
     *
     *
     */

    const verified = await this.verifyToken(req);

    const context = {
      success: false,
      content: "",
      status: 200,
    };
    if (verified) {
      const decodedToken = this.decodeToken(req.header("Authorization"));

      if (this.isAdmin(decodedToken)) {
        const { group } = req.body;

        if (group) {
          let name = group.name;
          if (name) {
            const oldGroupWithSameName = await this.#__pg.findAll({
              group_name: name,
            });
            if (oldGroupWithSameName.length == 0) {
              const Group = new PrivilegeGroupRecord({ group_name: name });

              await Group.save();
              const data = Group.get();

              context.success = true;
              context.data = data;
            } else {
              context.content = "Group with same name already existed";
            }
          } else {
            context.content = "Invalid request body";
          }
        } else {
          context.content = "Invalid request body";
        }
      } else {
        context.content = "Administrator rights required";
      }
    } else {
      context.content = "Invalid token";
    }
    res.send(context);
  };

  getAllPrivilegeGroup = async (req, res) => {
    /**
     *
     * PRIVILEGES ["ad", "uad"]
     *
     *
     * HEADERS: {
     *
     *      Authorization: <Token>
     * }
     *
     *
     */

    const verified = await this.verifyToken(req);

    const context = {
      success: false,
      content: "",
      status: 200,
    };
    if (verified) {
      const decodedToken = this.decodeToken(req.header("Authorization"));

      if (this.isAdmin(decodedToken)) {
        const groups = await this.#__pg.findAll();
        context.success = true;
        context.groups = groups;
      } else {
        context.content = "Administrator rights required";
      }
    } else {
      context.content = "Invalid token";
    }
    res.send(context);
  };

  updatePrivilegeGroup = async (req, res) => {
    /**
     *
     * PRIVILEGES ["ad", "uad"]
     *
     * HEADERS: {
     *
     *      Authorization: <Token>
     * }
     *
     * BODY: {
     *
     *      group: {
     *          privilegegroup_id: <Int>
     *          name: <String>
     *      }
     *
     * }
     *
     *
     */

    const verified = await this.verifyToken(req);

    const context = {
      success: false,
      content: "",
      status: 200,
    };
    if (verified) {
      const decodedToken = this.decodeToken(req.header("Authorization"));

      if (this.isAdmin(decodedToken)) {
        const { group } = req.body;

        if (group) {
          if (this.notNullCheck(group, ["name", "privilegegroup_id"]).valid) {
            let { name, privilegegroup_id } = group;
            const oldGroup = await this.#__pg.findAll({
              privilegegroup_id: parseInt(privilegegroup_id),
            });
            if (oldGroup.length != 0) {
              const Group = new PrivilegeGroupRecord({ ...oldGroup[0] }); // to prevent conflict in case multiple group with the same id

              Group.group_name.value(name);

              await Group.save();
              const data = Group.get();

              context.success = true;
              context.data = data;
            } else {
              context.content = `Group with id ${privilegegroup_id} does not exist`;
            }
          } else {
            context.content = "Invalid request body";
          }
        } else {
          context.content = "Invalid request body";
        }
      } else {
        context.content = "Administrator rights required";
      }
    } else {
      context.content = "Invalid token";
    }
    res.send(context);
  };

  deletePrivilegeGroup = async (req, res) => {
    /**
     *
     * PRIVILEGES ["ad", "uad"]
     *
     * HEADERS: {
     *
     *      Authorization: <Token>
     * }
     *
     * BODY: {
     *
     *      group: {
     *          privilegegroup_id: <Int>
     *          name: <String>
     *      }
     *
     * }
     *
     *
     */

    const verified = await this.verifyToken(req);

    const context = {
      success: false,
      content: "",
      status: 200,
    };
    if (verified) {
      const decodedToken = this.decodeToken(req.header("Authorization"));

      if (this.isAdmin(decodedToken)) {
        const { group } = req.body;

        if (group) {
          if (this.notNullCheck(group, ["privilegegroup_id"]).valid) {
            let { privilegegroup_id } = group;
            const oldGroup = await this.#__pg.findAll({
              privilegegroup_id: parseInt(privilegegroup_id),
            });
            if (oldGroup.length != 0) {
              const Group = new PrivilegeGroupRecord({ ...oldGroup[0] }); // to prevent conflict in case multiple group with the same id

              Group.remove();

              /**
               *
               * DELETE ALL PRIVILGE DETAIL WITH IN THIS GROUP
               *
               */

              context.success = true;
            } else {
              context.success = true;
              context.content = `Group with id ${privilegegroup_id} does not exist`;
            }
          } else {
            context.content = "Invalid request body";
          }
        } else {
          context.content = "Invalid request body";
        }
      } else {
        context.content = "Administrator rights required";
      }
    } else {
      context.content = "Invalid token";
    }
    res.send(context);
  };
}
module.exports = PrivilegesController;
