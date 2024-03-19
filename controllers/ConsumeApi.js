const { Controller } = require("../config/controllers");
const { Apis, ApisRecord } = require("../models/Apis");
const { Fields } = require("../models/Fields");
const { Tables } = require("../models/Tables");
const Model = require("../config/models/model");
const { Projects } = require("../models/Projects");
const {
  intValidate,
  floatValidate,
  objectComparator,
} = require("../functions/validator");
const { removeDuplicate } = require("../functions/modulars");

const { Database } = require("../config/models/database");
const {
  translateUnicodeToBlanText,
  formatDecNum,
} = require("../functions/auto_value");

const fastcsv = require("fast-csv");
const XLSX = require("xlsx-js-style");

const fetch = require("node-fetch");

const Cache = require("./Cache/Cache");
const { Privileges } = require("../models/Privileges");
const { Statistics, StatisticsRecord } = require("../models/Statistics");

const {
  UserPrivileges,
  UserPrivilegesRecord,
} = require("../models/UserPrivileges");
const {
  PrivilegeGroup,
  PrivilegeGroupRecord,
} = require("../models/PrivilegeGroup");
const {
  PrivilegeDetail,
  PrivilegeDetailRecord,
} = require("../models/PrivilegeDetail");
const { Buttons, ButtonsRecord } = require("../models/Buttons");

const fileType = require("file-type");
const fs = require("fs");
const { Accounts } = require("../models/Accounts");

const {
  RESULT_PER_SEARCH_PAGE,
  DEFAULT_ERROR_CALCLATED_VALUE,
  TOTAL_DATA_PER_PARTITION,
} = require("./enums");

const TEMP_STORAGE_PATH = "public/temp";
const FILE_PATH = "public/files";

class ConsumeApi extends Controller {
  /**
   *      Khởi tạo controller.
   *
   *      Các thuộc tính #__xxx được hiểu là các thuộc tính private.
   *
   *      Hầu hết các thuộc tính private của controller này là đối tượng cơ sở dữ liệu
   * và chúng được dùng để truy vấn các bảng chứa cấu hình hệ thống.
   *
   *      Bên trong constructor là các thuộc tính public và hiển nhiên chúng mang giá
   * trị rỗng.
   *
   */

  #__apis = new Apis();
  #__tables = new Tables();
  #__fields = new Fields();
  #__projects = new Projects();
  #__privileges = new Privileges();
  #__statistics = new Statistics();

  #__userprivileges = new UserPrivileges();
  #__privilegegroup = new PrivilegeGroup();
  #__privilegedetail = new PrivilegeDetail();
  #__buttons = new Buttons();

  constructor() {
    super();
    this.url = "";
    this.req = undefined;
    this.res = undefined;
    this.API = undefined;
  }

  NotFound = () => {
    this.res.status(404).send({ succes: false, content: "404 - Not found" });
    // this.res.redirect("http://115.78.237.91:2089/login")
  };

  Forbidden = () => {
    this.res.status(403).send({ succes: false, content: "403 - Forbidden" });
  };

  InvalidToken = () => {
    this.res
      .status(498)
      .send({ success: false, content: "498 - Invalid token" });
  };

  isANormalPutApiOrACalculateOne = () => {
    const Api = this.API.get();
    const { api_method, body, body_update_method } = Api;
    if (api_method == "put") {
      if (body_update_method) {
        const calculates = body_update_method.filter((field) => {
          const { field_id, method } = field;

          const index = body.indexOf(field_id);
          if (index != -1 && method == "calculate") {
            return true;
          }
          return false;
        });
        if (calculates.length > 0) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  };

  consume = async (req, res, api_id) => {
    /**
     *  @funcName Phân giải API
     *
     *  @desc Đại khái là truy vấn API, dự án, tất cả bảng & trường hiện có rồi nhét tất cả vào this như
     *  những thuộc tính public. Cụ thể:
     *  (1): Giải mã url
     *      VD: "/page/M%C3%A1y%20In%20R20%20MAX" => "/page/Máy In R20 Max"
     *
     *  (2): Truy vấn toàn bộ thông tin gồm
     *      + API đang được truy cập
     *      + Dự án ( chính xác là tất cả dự án nhưng vì chỉ có duy nhất một dự án trong mỗi server production
     * nên chúng ta sẽ quy ước "dự án" và "tất cả dự án" là như nhau và đều ám chỉ về dự án hiện tại )
     *      + Tất cả bảng
     *      + Tất cả trường
     *
     *  (3): Nếu
     *       Api tồn tại
     *       && Phương thức của api cùng loại với phương thức đang được sử dụng
     *       && Api đang ở trạng thái hoạt động
     *       && Dự án tồn tại
     *      => (4)
     *      Trường hợp bất kể điều kiện nào trả về false => (8)
     *
     *  (4): Khởi tạo các thông tin cơ sở và nhét hết tụi nó vào controller thông qua this.
     *
     *  (5)(6)(7): Phân tích kiểu dự án thông qua thuộc tính project_type và sử dụng switch-case để điều hướng
     *
     *  (8): Trả về 404 - not found
     */

    this.writeReq(req);
    const start = new Date();

    const { url, method } = req;
    /*(1)*/ this.url = decodeURI(url);
    this.req = req;
    this.res = res;
    /*(2)*/ const [api, projects, tables, fields] = await Promise.all([
      this.#__apis.find({ api_id }),
      this.#__projects.findAll(),
      this.#__tables.findAll(),
      this.#__fields.findAll(),
    ]);
    console.log("PROJECT:::", this.projects);
    /*(3)*/ if (
      api &&
      api.api_method == method.toLowerCase() &&
      api.status &&
      projects[0]
    ) {
      /*(4)*/ const Api = new ApisRecord(api);
      const project = projects[0];
      this.project = project;

      this.API = Api;

      this.fields = fields;
      this.tables = tables.map((table) => {
        const { id } = table;
        table.fields = fields.filter((field) => field.table_id == id);
        return table;
      });

      const { project_type } = project;
      /*(6)*/ if (project_type == "database") {
        switch (api.api_method) {
          case "get":
            await this.GET();
            console.log("GET AT CONSUME API FILE::");
            const end = new Date();
            // // console.log("PROCCESS IN : " + `${end - start} `)
            break;

          case "post":
            await this.POST();
            break;
          case "put":
            await this.PUT();
            break;
          case "delete":
            await this.DELETE();
            break;
          default:
            this.NotFound();
            break;
        }
        /*(7)*/
      } else {
        switch (api.api_method) {
          case "get":
            await this.REMOTE_GET();
            break;

          case "post":
            await this.REMOTE_POST();
            break;
          case "put":
            await this.REMOTE_PUT();

            break;
          case "delete":
            await this.REMOTE_DELETE();
            break;
          default:
            this.NotFound();
            break;
        }
      }
    } else {
      /*(8)*/ this.NotFound();
    }
  };

  checkButtonPrivilege = async (api, user) => {
    /**
     *
     *  @name: Kiểm tra nhóm quyền của người dùng User xem nó có được phân quyền trên API hay khum
     *
     *  @param: [
     *      api: <API>
     *      user: <Account>
     *  ]
     *
     *  @desc: Giải thích về mối quan hệ giữa người dùng, nhóm phân quyền, nút và API chúng ta có quan hệ sau:
     *
     *
     *      - 1 người dùng <-> 1 nhóm quyền
     *      - 1 nhóm quyền <-> nhiều chi tiết phân quyền
     *      - 1 chi tiết phân quyền <-> 1 nút
     *      - 1 nút <->  1 API
     *
     *      Giải thuật này tạm thời có thể chạy đúng nhưng hiệu xuất đang khá tệ, O(3n):
     *
     *      1. Nếu người dùng là admin hay uad thì pass luôn khỏi test
     *
     *      2.  Nếu người dùng là user bình thường thì tiếp tục
     *      3.  Gọi toàn bộ quyền có username là username của user, nếu kết quả tồn tại và có ít nhất 1 kết quả thì chọn kết quả đầu tiên, nếu không thì -> (10)
     *      4.  Gọi toàn bộ chi tiết quyền của nhóm phân quyền tìm được ở (3)
     *      5.  Chọn ra toàn bộ button_id từ các chi tiết phân quyền
     *      6.  Chọn ra toàn bộ Buttons
     *      7.  Lọc ra những button thuộc nhóm phân quyền dựa vào danh sách button_id ở bước 5
     *      8.  Chọn ra nút có chứa api_id của tham số api
     *      9.  Nếu nút đó tồn tại -> return true, nếu khum -> return false
     *      10. Return false
     *
     *
     */

    const { api_id } = api;
    const { username } = user;
    /* 1 */ if (this.isAdmin(user)) {
      return true;
      /* 2 */
    } else {
      /* 3 */ const privilegeGroup = await this.#__userprivileges.findAll({
        username,
      });
      if (privilegeGroup && privilegeGroup.length > 0) {
        const group = privilegeGroup[0];
        const { privilegegroup_id } = group;

        /* 4 */ const privilegedetails = await this.#__privilegedetail.find({
          privilegegroup_id,
        });
        const button_ids = privilegedetails.map((btn) => btn.button_id);
        const buttons = await this.#__buttons.findAll();

        const privilegeButtons = buttons.filter(
          (button) => button_ids.indexOf(button.id) != -1
        );
        const targetAPI = privilegeButtons.find(
          (button) => button.api_id == api_id
        );
        if (targetAPI) {
          return true;
        }
        return false;
      } else {
        return false;
      }
    }
  };

  consumeUI = async (req, res, api_id) => {
    /**
     *  @name Phân giải API của UI
     *
     *  @desc Đại khái là truy vấn API, dự án, tất cả bảng & trường hiện có rồi nhét tất cả vào this như
     *  những thuộc tính public. Cụ thể:
     *  (1): Xác thực token, vì đây là chổ những API private được sử dụng để truy vấn dữ liệu và quan hệ dữ
     *  liệu và ràng buộc dữ liệu khá lỏng nên buộc phải dùng token, ép người dùng phải truy cập thông qua UI
     *  Nếu token hợp lệ => (2), nếu không => (8)
     *
     *  (2): Giải mã url
     *      VD: "/page/M%C3%A1y%20In%20R20%20MAX" => "/page/Máy In R20 Max"
     *
     *  (3): Truy vấn toàn bộ thông tin gồm
     *      + API đang được truy cập
     *      + Dự án ( chính xác là tất cả dự án nhưng vì chỉ có duy nhất một dự án trong mỗi server production
     * nên chúng ta sẽ quy ước "dự án" và "tất cả dự án" là như nhau và đều ám chỉ về dự án hiện tại )
     *      + Tất cả bảng
     *      + Tất cả trường
     *      + Toàn bộ quyền truy cập của người dùng hiện tại
     *
     *  (4): Nếu
     *       Api tồn tại
     *       && Phương thức của api cùng loại với phương thức đang được sử dụng
     *       && Api đang ở trạng thái hoạt động
     *       && Dự án tồn tại
     *      => (5)
     *      Trường hợp bất kể điều kiện nào trả về false => (7)
     *
     *  (5): Khởi tạo các thông tin cơ sở và nhét hết tụi nó vào controller thông qua this.
     *
     *  (6): Phân tích kiểu dự án và điều hướng bằng switch case, với mỗi route sẽ có một phân quyền riêng,
     *  Việc phân tích phân quyền sẽ do một method khác trong controller đảm nhiệm. Nếu người dùng hiện tại
     *  có đủ quyền, họ sẽ được đi đến route tương ứng. Nếu không => this.Forbidden()
     *
     *  (7): Trả về 404 - Not found
     *
     *  (8): Trả về 498 - Token không hợp lệ
     */

    this.writeReq(req);
    const start = new Date();

    /*(1)*/ const verified = await this.verifyToken(req);
    this.req = req;
    this.res = res;

    if (verified) {
      const user = this.decodeToken(req.header("Authorization"));
      const { url, method } = req;
      /*(2)*/ this.url = decodeURI(url);
      /*(3)*/ const [api, projects, tables, fields, privileges] =
        await Promise.all([
          this.#__apis.find({ api_id }),
          this.#__projects.findAll(),
          this.#__tables.findAll(),
          this.#__fields.findAll(),
          this.#__privileges.findAll({ username: user.username }),
        ]);
      /*(4)*/ if (
        api &&
        api.api_method == method.toLowerCase() &&
        api.status &&
        projects[0]
      ) {
        /*(5)*/ const Api = new ApisRecord(api);
        const project = projects[0];
        this.project = project;

        this.API = Api;

        this.fields = fields;
        this.tables = tables.map((table) => {
          const { id } = table;
          table.fields = fields.filter((field) => field.table_id == id);
          return table;
        });

        const apiTables = api.tables.map((table_id) =>
          this.tables.find((tb) => tb.id == table_id)
        );
        // // // console.log(api)
        let isGranted;

        const { project_type } = project;
        /*(6)*/ if (project_type == "database") {
          switch (api.api_method) {
            case "get":
              isGranted = this.hasEnoughPrivileges(
                apiTables,
                [Privileges.READ],
                privileges
              );
              if (isGranted) {
                await this.GET_UI();
                const end = new Date();
                // // console.log("PROCCESS IN : " + `${end - start} `)
              } else {
                this.Forbidden();
              }
              break;

            case "post":
              isGranted = this.hasEnoughPrivileges(
                apiTables,
                [Privileges.WRITE],
                privileges
              );
              if (isGranted) {
                await this.POST_UI();
                const end = new Date();
                // // console.log("PROCCESS IN : " + `${end - start} `)
              } else {
                this.Forbidden();
              }
              break;

            case "put":
              const updateButtonPrivilege = await this.checkButtonPrivilege(
                api,
                user
              );
              isGranted = this.hasEnoughPrivileges(
                apiTables,
                [Privileges.MODIFY],
                privileges
              );
              if (isGranted && updateButtonPrivilege) {
                await this.PUT_UI();
                const end = new Date();
                // // console.log("PROCCESS IN : " + `${end - start} `)
              } else {
                this.Forbidden();
              }
              break;
            case "delete":
              const deleteButtonPrivilege = await this.checkButtonPrivilege(
                api,
                user
              );
              isGranted = this.hasEnoughPrivileges(
                apiTables,
                [Privileges.PURGE],
                privileges
              );
              if (isGranted && deleteButtonPrivilege) {
                await this.DELETE_UI();
                const end = new Date();
                // // console.log("PROCCESS IN : " + `${end - start} `)
              } else {
                this.Forbidden();
              }

              break;
            default:
              this.NotFound();
              break;
          }
        } else {
          switch (api.api_method) {
            case "get":
              await this.REMOTE_GET();
              break;

            case "post":
              await this.REMOTE_POST();
              break;
            case "put":
              await this.REMOTE_PUT();
              break;
            case "delete":
              await this.REMOTE_DELETE();
              break;
            default:
              this.NotFound();
              break;
          }
        }
      } else {
        /*(7)*/ this.NotFound();
      }
    } else {
      /*(8)*/ this.InvalidToken();
    }
  };

  tearTablesAndFieldsToObjects = () => {
    /**
     *
     * @name Tạm dịch là "Xé bảng và trường của chúng rồi gom lại thành từng cục tương ứng"
     *
     *
     * @desc
     *  Trước tiên, bảng ( table ) và trường ( field ) là 2 thực thể riêng biệt và chỉ liên hệ với nhau thông qua khóa ngoại
     * field.table_id. Nên để tiện cho việc sử dụng sau này, cần gom các field có table_id giống nhau vào một mảng và nhét chúng
     * vào table có id tương ứng. Ngoài ra, method này còn gom các trường là đối số (params) và dữ liệu từ request body (body)
     * lại với nhau nhờ vào cấu hình của Api.
     *
     * @params []
     *  Phương thức này về cơ bản là không cần truyền tham số. Tuy nhiên, dữ liệu để chạy được lấy từ controller, chúng bao gồm:
     *  1. API <ApisRecord>
     *  2. tables <Object>[]  => Xem models.Tables để tham khảo cấu trúc
     *  3. fields <Object>[]  => Xem models.Fields để tham khảo cấu trúc
     *
     * @return
     *  Phương thức này trả về một mảng các object tables với một vài thuộc tính mới như sau:
     * {
     *     id: 27,
     *     table_alias:     <String[32]>
     *     table_name:      <String>,
     *     version_id:      <Int>,
     *     primary_key:     <Int>[],
     *     foreign_keys:    <Object{
     *                          table_id <Int>,
     *                          field_id <Int>,
     *                          ref_field_id <Int>
     *                      }>[],
     *     create_by: <String>,
     *     create_at: <Datetime>,
     *     fields: <Object>[],
     *     body: <Object>[],
     *     params: <Object>[]
     *  },
     *
     *  @note
     *  fields, body & params có cùng cấu trúc tương tự như fields
     */

    const tableIds = this.API.tables.value();
    const bodyIds = this.API.body.valueOrNot();
    const paramIds = this.API.params.valueOrNot();

    const tables = tableIds.map((tbID) => {
      const table = this.tables.find((tb) => tb.id == tbID);
      return table;
    });
    const bodyFields = this.fields.filter((fd) => bodyIds.indexOf(fd.id) != -1);
    const paramFields = this.fields.filter(
      (fd) => paramIds.indexOf(fd.id) != -1
    );

    const objects = tables.map((table = {}) => {
      const fieldsBelongToThisTable = this.fields.filter(
        (field) => field.table_id == table?.id
      );
      const paramsBelongToThisTable = paramFields.filter(
        (field) => field.table_id == table?.id
      );
      const bodyBeLongToThisTable = bodyFields.filter(
        (field) => field.table_id == table?.id
      );
      return {
        ...table,
        fields: fieldsBelongToThisTable,
        body: bodyBeLongToThisTable,
        params: paramsBelongToThisTable,
      };
    });
    return objects;
  };

  getFieldsByTableId = (tableId) => {
    /**
     * @desc Lấy thông tin tất cả các trường thuộc bảng với table.id == tableId
     *
     * @params [
     *      tableId: <Int>
     * ]
     *
     * @return fields<Objetc>[] || []
     */

    const fields = this.fields.filter((fd) => fd.table_id == tableId);
    return fields;
  };

  getFieldsByTableAlias = (tableAlias) => {
    /**
     * @desc Lấy thông tin tất cả các trường thuộc bảng với table.table_alias == tableAlias
     *
     * @params [
     *      tableAlias: <String>
     * ]
     *
     * @return fields<Objetc>[] || []
     */
    const table = this.getTableByAlias(tableAlias);
    const tableId = table ? table.table_id : undefined;
    const fields = this.fields.filter((fd) => fd.table_id == tableId);
    return fields;
  };

  getFields = (fieldIds) => {
    /**
     * @desc Lấy thông tin tất cả các trường có field.id thuộc danh sách fieldIds
     *
     * @params [
     *      fieldIds: <Int>[]
     * ]
     *
     * @return fields<Objetc>[] || []
     *
     */

    const fields = fieldIds
      .map((id) => {
        const field = this.fields.find((f) => f.id == id);
        return field;
      })
      .filter((f) => f != undefined);
    return fields;
  };

  getFieldByAlias = (fieldAlias) => {
    /**
     * @desc Lấy thông tin trường có field.fomular_alias là fieldAlias
     *
     * @params [
     *      fieldAliases: <String>
     * ]
     *
     * @return fields<Objetc>
     *
     */

    const field = this.fields.find((f) => f.fomular_alias == fieldAlias);
    return field;
  };

  getFieldsByAlias = (fieldAliases) => {
    /**
     * @desc Lấy thông tin tất cả các trường có field.fomular_alias thuộc danh sách fieldAliases
     *
     * @params [
     *      fieldAliases: <String>[]
     * ]
     *
     * @return fields<Objetc>[]  ||  []
     *
     */

    const fields = fieldAliases
      .map((alias) => {
        const field = this.fields.find((f) => f.fomular_alias == alias);
        return field;
      })
      .filter((f) => f != undefined);
    return fields;
  };

  getField = (fieldId) => {
    /**
     * @desc Lấy thông tin trường có field.id == fieldId
     *
     * @params [
     *      fieldId: <Int>
     * ]
     *
     * @return fields<Objetc> || undefined
     *
     */

    const field = this.fields.find((fd) => fieldId == fd.id);
    return field;
  };

  getTable = (tableId) => {
    /**
     * @desc Lấy thông tin bảng có table.id == table.id
     *
     * @params [
     *      tableId: <Int>
     * ]
     *
     * @return fields<Objetc> || undefined
     *
     */

    const table = this.tables.find((tb) => tb.id == tableId);
    return table;
  };

  isFieldForeign = (field, table) => {
    /**
     * @desc Kiểm tra một trường có phải là khóa ngoại của bảng hay không
     *
     * @params [
     *      field <Object>,
     *      table <Object>
     * ]
     *
     * @return foreign_key<Objetc> || undefined
     *
     * @note
     * foreign_key<{
     *      field_id:       <Int>
     *      table_id:       <Int>
     *      ref_field_id:   <Int>
     * }>
     *
     */

    const { id } = field;
    const { foreign_keys } = table;

    const fk = foreign_keys.find((key) => key.field_id == id);
    return fk;
  };

  extractBase64ToFile = async (file = "") => {
    /**
     * @desc Chuyển đổi base64 thành file, mặc nhiên file là một chuỗi rỗng nếu nó không tồn tại
     *       Func này sẽ tự detect phần mở rộng của tệp rồi ghi lại chính xác phần mở rộng đó. Trường hợp
     *  phần mở rộng không hợp lệ, hoặc không tìm ra được phần mở rộng phù hợp thì dữ liệu của tệp sẽ được
     *  lưu trong một tệp txt.
     *
     * @params [
     *      file {
     *          file_name: <String>,
     *          base64: <Base64>
     *      }
     * ]
     *
     * @return filePath <String>
     *
     * @note Hiển nhiên cái func này sẽ lưu file ở thư mục tạm, được lưu trong hằng TEMP_STORAGE_PATH
     *
     */

    const { base64, filename } = file;

    const base64Data = base64.split(";base64,").pop();
    const buffer = Buffer.from(base64Data, "base64");

    const type =
      typeof filename == "string" ? filename.split(".").pop() : "txt";
    const fileName = this.getFormatedUUID();
    const fullPath = `${TEMP_STORAGE_PATH}/${fileName}.${type}`;
    fs.writeFileSync(fullPath, type ? buffer : base64Data);

    return fullPath;
  };

  formatFileName = (fileName) => {
    return `public${fileName}`;
  };

  moveFile = (sourcePath, destinationPath) => {
    /**
     * @desc Dịch chuyển tệp từ vị trí này đến vị trí khác
     *
     * @params [
     *      sourcePath <String>,
     *      destinationPath <String>
     * ]
     *
     * @return undefined
     *
     *
     */

    try {
      fs.renameSync(sourcePath, destinationPath);
      console.log(
        `File moved successfully from ${sourcePath} to ${destinationPath}`
      );
    } catch (err) {
      console.error("Error moving file:", err);
    }
  };

  removeFile = (filePath) => {
    /**
     * @desc Xóa tệp
     *
     * @params [
     *      filePath <String>
     * ]
     *
     * @return undefined
     *
     *
     */

    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Error removing file:", err);
    }
  };

  parseType = (field, value) => {
    /**
     * @desc Ép kiểu dữ liệu từ dữ liệu thô thành dữ liệu tương ứng của nó với cấu hình của trường
     *
     * @params [
     *      field <Object> => Xem models.fields
     *      value <Any>
     * ]
     *
     * @detail
     *
     * (1)      Với kiểu dữ liệu thuộc dòng kiểu nguyên [ INT, INT UNSIGNED, BIGINT, BIGINT UNSIGNED ]
     *
     * (1.1)    Với số nguyên và dữ liệu không tự động tăng ( !AUTO_INC )
     *          Xác thực kiểu dữ liệu là số nguyên hợp lệ và ép sang kiểu nguyên.
     *              a. Với số nguyên hợp lệ
     *                  - Nếu giá trị của số nguyên vừa được ép nằm trong giới hạn MIN - MAX thì kể như hợp lệ
     *              và trả về { valid: true,  result: parseInt( value ) }
     *                  - Nếu không, trả về { valid: false, reason: "Giá trị không thuộc giới hạn cho phép" }
     *              b. Với số nguyên không hợp lệ, trả về { valid: false, reason: "Dữ liệu của trường số nguyên & NO_AUTO phải là kiểu int" }
     *
     * (1.2)    Với số nguyên và dữ liệu tự động tăng
     *              a. Nếu giá trị là một số nguyên hợp lệ => { valid: true, result: parseInt(value) };
     *              b. Nếu không => return { valid: true, result: value };
     *              @note Trường hợp này có thể xãy ra lỗi
     *
     *
     *
     *
     * (2)      Với kiểu dữ liệu thuộc dòng số thực [ DECIMAL, DECIMAL UNSIGNED ]
     *          Kiểm tra tính hợp lệ của dữ liệu.
     *
     * (2.1)    Nếu dữ liệu hợp lệ
     *              - Và trong giới hạn MIN - MAX => { valid: true, result: parseFloat(fixedValue) }
     *              - Nếu không => { valid: false, reason: "Giá trị không thuộc giới hạn cho phép" }
     * (2.2)    Nếu không => { valid: false, reason: "Dữ liệu của trường số thực phải là một số thực" }
     *
     *
     *
     *
     *
     * (3)      Với dữ liệu thuộc dòng Boolean, dử dụng typeof để xác định kiểu và trả về kết quả
     *
     *
     *
     * (4)      Với dữ liệu thuộc dòng thời gian [ Date, Datetime ]
     *          Tạo một thực thể kiểu Date() bằng giá trị của value,
     *              - Nếu kết quả trả về là NaN => { valid: false, reason: "Ngày giờ không hợp lệ" }
     *              - Nếu không => { valid: true, result: date }
     *
     *
     * (5)      Với dữ liệu kiểu TEXT
     *          Ép dữ liệu sang dạng chuỗi và đo độ dài,
     *              - Nếu độ dài trong khoảng cho phép => { valid: true, result: value.toString() }
     *              - Nếu không => { valid: false, reason: "Chuỗi có độ dài lớn hơn giới hạn cho phép" }
     *
     *
     * (6)      Với kiểu CHAR
     *          Tương tự TEXT, tuy nhiên giới hạn độ dài của kiểu CHAR luôn là 1
     *
     *
     * (7)      Với dữ liệu thuộc nhóm PHONE || EMAIL => luôn trả về { valid: true, result: value }
     *
     *
     * (8)      Nếu không tìm thấy kiểu dữ liệu => { valid: false }
     *
     *
     *
     */

    const type = field.DATATYPE;

    if (value !== undefined && value !== "") {
      const { MAX, MIN } = field;
      switch (type) {
        /*(1)*/ case "INT":
        case "INT UNSIGNED":
        case "BIGINT":
        case "BIGINT UNSIGNED":
          const { AUTO_INCREMENT } = field;
          /*(1.1)*/ if (!AUTO_INCREMENT) {
            const validateInt = intValidate(value);
            if (validateInt) {
              const intValue = parseInt(value);
              if (intValue >= MIN && intValue <= MAX) {
                return { valid: true, result: intValue };
              } else {
                return {
                  valid: false,
                  reason: "Giá trị không thuộc giới hạn cho phép",
                };
              }
            } else {
              return {
                valid: false,
                reason:
                  "Dữ liệu của trường số nguyên & NO_AUTO phải là kiểu int",
              };
            }
            /*(1.2)*/
          } else {
            // if (intValidate(value)) {
            //     return { valid: true, result: parseInt(value) };
            // } else {
            //     return { valid: true, result: value };
            // }
            return { valid: true, result: value };
          }
        /*(2)*/ case "DECIMAL":
        case "DECIMAL UNSIGNED":
          const validateDouble = floatValidate(value);
          /*(2.1)*/ if (validateDouble) {
            const { DECIMAL_PLACE } = field;
            const floatNumber = parseFloat(value);

            const fixedValue = floatNumber.toFixed(
              DECIMAL_PLACE ? DECIMAL_PLACE : 0
            );
            if (
              floatNumber >= parseFloat(MIN) &&
              floatNumber <= parseFloat(MAX)
            ) {
              return { valid: true, result: parseFloat(fixedValue) };
            } else {
              return {
                valid: false,
                reason: "Giá trị khum nằm trong giới hạn cho phép",
              };
            }

            /*(2.2)*/
          } else {
            return {
              valid: false,
              reason: "Dữ liệu của trường số thực phải là một số thực",
            };
          }
        /*(3)*/ case "BOOL":
          const typeBool = typeof value;
          if (typeBool == "boolean") {
            return { valid: true, result: value };
          } else {
            return {
              valid: false,
              reason:
                "Dữ liệu của trường BOOL phải là giá trị trong ENUM [ true, false ]",
            };
          }
        /*(4)*/ case "DATE":
        case "DATETIME":
          const date = new Date(value);
          if (!isNaN(date)) {
            return { valid: true, result: date };
          } else {
            return { valid: false, reason: "Ngày giờ hông hợp lệ" };
          }
        /*(5)*/ case "TEXT":
          const stringifiedValue = value ? value.toString() : "";
          const { LENGTH } = field;
          if (LENGTH && LENGTH > 0 && stringifiedValue.length <= LENGTH) {
            return { valid: true, result: stringifiedValue };
          } else {
            return {
              valid: false,
              reason: "Chuỗi có độ dài lớn hơn giới hạn cho phép",
            };
          }
        /*(6)*/ case "CHAR":
          const charifiedValue = value.toString();
          if (charifiedValue.length == 1) {
            return { valid: true, result: charifiedValue };
          }
          return {
            valid: false,
            reason: "Kiểu char yêu cầu dữ liệu với độ dài bằng 1",
          };
        /*(7)*/ case "PHONE":
        case "EMAIL":
          return { valid: true, result: value };
        case "FILE":
          try {
          } catch {}
          return { valid: true, result: value };

        /*(8)*/ default:
          return { valid: false };
      }
    } else {
      const { NULL } = field;
      if (NULL) {
        return { valid: true, result: null };
      } else {
        return { valid: false, reason: "Dữ liệu rỗng" };
      }
    }
  };

  parseCriteriasToStrings = (criterias = "") => {
    const regex = /(\s*AND\s*|\s*OR\s*|\s*NOT\s*)/i;
    const parts = criterias.split(regex);

    const result = [];
    let currentClause = { operator: null, fomular: "" };

    for (const part of parts) {
      const trimmedPart = part.trim();

      if (["AND", "OR", "NOT"].includes(trimmedPart.toUpperCase())) {
        if (currentClause.fomular !== "") {
          result.push({
            operator: currentClause.operator,
            fomular: currentClause.fomular,
          });
        }
        currentClause = { operator: trimmedPart.toUpperCase(), fomular: "" };
      } else {
        currentClause.fomular += part;
      }
    }

    // Add the last clause to the result
    if (currentClause.fomular !== "") {
      result.push({
        operator: currentClause.operator,
        fomular: currentClause.fomular,
      });
    }

    return result;
  };

  getPropByPath = (object, path) => {
    /**
     *  Đệ quy liên tục cho đến khi path chỉ còn một phần tử thì trả về kết quả,
     *
     *  Nếu ở vòng cuối cùng, tức là path.length == 0 mà object vẫn còn tồn tại thì vẫn trả về object, nếu không thì trả về value,
     *
     *  Chắc chắn ở vòng cuối cùng value chỉ có thể là object hoặc value đang tìm kiếm, hễ value cần truy xuất không phải một list
     * thì kể như mọi thứ ok, vì list có thể dẫn đến cái mapping function gặp vấn đề với object.
     *
     *
     */

    const value = object[path[0]];
    if (path.length > 0 && value != undefined) {
      return this.getPropByPath(value, path.slice(1, path.length));
    } else {
      if (path.length == 0) {
        return object;
      }
      return value;
    }
  };

  setPropByPath = (object, path, value) => {
    /**
     * Đệ quy này sẽ không tái tạo vòng lập bằng cách trả về kết quả trực tiếp mà nó trả về kết quả thông qua việc recursive qua toàn bộ
     * children nằm trên path và đặt lại kết quả của chúng bằng một đệ quy ở cấp thấp hơn.
     *
     * Cho đến khi đi đến path cuối cùng thì trả về kế quả đã được cập nhật, các kết quả sẽ lần lượt được cập nhật cho đến khi recursive
     * dừng lại.
     *
     * Đệ quy này trả về một object với các children đã cập nhật trạng thái mới.
     *
     *
     */

    if (path.length <= 1) {
      object = { ...object, [path[0]]: value };
    } else {
      object[path[0]] = this.setPropByPath(
        object[path[0]],
        path.slice(1, path.length),
        value
      );
    }
    return object;
  };

  generatePeriodIndex = (rawIndex) => {
    /**
     *
     * @params rawIndex <INT>
     *
     * @desc
     *      Tạo (các) đối tượng chứa thông tin các partition sao cho số lượng dữ liệu được truy vấn từ chúng vừa đủ
     *  bằng số lượng truy vấn mỗi request được định nghĩa bởi RESULT_PER_SEARCH_PAGE
     *
     *
     *  (1). Các period được gọi từ controller chứa dữ liệu của toàn bộ partition hiện có, mỗi partition có cấu trúc như sau:
     *          partition <{
     *              position: <String>,
     *              total: <Int>
     *          }>
     *  ngoài ra các position cũng có cấu trúc của riêng chúng `<start>-<end>`  với với start, end là cặp số nguyên biểu thị thứ tự
     *  của cặp giá trị tại hai đầu mút bên trong bảng dữ liệu, ví dụ:
     *          {
     *              position: "10000-19999",
     *              total: 8000
     *          }<Partition>
     * biểu thị partition này hiện có 8,000 phần tử, phần tử đầu tiên ở vị trí 10,000 và phần tử cuối cùng (có thể đạt đến) vị trí 19,999.
     * Một partition không nhất thiết phải được lấp đầy, nhưng nó không thể chứa hơn 10,000 phần tử, đó là quy ước chung.
     *
     *
     * (2). Sau khi xác thực rawIndex là một số nguyên hợp lệ và partions không rỗng
     *      - Ép rawIndex sang kiểu nguyên và gán nó vào START_INDEX
     *      - Đặt một biến khác tên PRIMAL_START_POINT mang giá trị của START_INDEX * RECORD_PER_PAGE
     *          @explain => Với một lượng dữ liệu lớn khủng khiếp lên đến hàng trăm triệu dữ liệu, không thể truy vấn tất cả trong một lần
     * nên buộc phải ngắt từng phần đển gọi, với UI hiện tại có thể hiển thị 15 ( RECORD_PER_PAGE ) records một lần request, cách truy vấn
     * này có thể cho phép xem dữ liệu ở những partition cuối cùng, nơi index của bảng ghi có thể lên đến hàng trăm triệu một cách nhanh chóng
     * mà không cần phải truy vấn những bảng ghi trước chúng.
     *
     *
     *
     * (3). Map toàn bộ partition, qua mỗi partition, trừ PRIMAL_START_POINT với total của partion hiện tại cho đến khi PRIMAL_START_POINT
     * nhỏ hơn hoặc bằng 0,
     *      a. Đặt lại thuộc tính total cho partition thứ i bằng số lượng indexes còn lại
     *      b. Đặt lại thuộc tính from cho partion thứ i bằng vị trí bắt đầu lấy dữ liệu
     *      c. Đặt lại thuộc tính to cho partion thứ i bằng vị trí kết thúc lấy dữ liệu
     *      => break;
     *
     *
     * (4). Khởi tạo một mảng tên FINALE_PARTITIONS với giá trị khởi tạo là TARGET_PARTITION đã tìm thấy ở (3)
     * (5). Khởi tạo biến TOTAL_RESULT_ITEM với giá trị là số lượng bảng ghi sẽ trả về, mặc nhiên là RECORD_PER_PAGE
     * (6). Tính tổng số lượng phần tử còn cần phải lấy kể từ partition kế tiếp bằng cách lấy TOTAL_RESULT_ITEM trừ đi tổng số lượng
     *  hiện tại của partition vừa tìm được, giá trị total này đã được làm mới ở (3.a)
     * (7). Chạy vòng lập từ partition tiếp theo đến partition cuối cùng để tìm những partition kế tiếp cho đến khi tìm đủ số lượng
     *  bảng ghi yêu cầu.
     *      a. Đặt một chiếc biến total với giá trị là tổng số lượng phần tử hiện có của partition hiện tại
     *      b. Đặt một chiếc biến CURRENT_REMAINING_INDEX với giá trị là số lượng phần tử còn thiếu ở thời điểm hiện tại
     *      c. Trừ số lượng phần tử còn thiếu với tổng số lượng phần tử hiện có của partition
     *      d. Luôn đặt vị trí khởi đầu là 0 cho tất cả các partition.
     *      e. Nếu số lượng còn thiếu lớn hơn total thì vị trí kết thúc là tổng số lượng, nếu khum thì vị trí kết thúc là
     *  số lượng phần tử còn thiếu
     *      f. Thêm partition vào FINALE_PARTITIONS
     *      g. Nếu số lượng phần tử còn thiếu <= 0 thì kết thúc vòng lập
     *
     *
     */

    /*(1)*/ const partitions = this.periods;
    const RECORD_PER_PAGE = RESULT_PER_SEARCH_PAGE;
    if (intValidate(rawIndex) && partitions.length > 0) {
      /*(2)*/ const START_INDEX = parseInt(rawIndex);
      let PRIMAL_START_POINT = START_INDEX * RECORD_PER_PAGE;

      const PARTITION_LENGTH = partitions.length;
      let TARGET_PARTITION_INDEX = 0;

      /*(3)*/ for (let i = 0; i < PARTITION_LENGTH; i++) {
        const total = partitions[i]["total"];
        const CURRENT_REMAINING_INDEX = PRIMAL_START_POINT;

        PRIMAL_START_POINT -= total;

        if (PRIMAL_START_POINT <= 0) {
          TARGET_PARTITION_INDEX = i;
          partitions[i]["total"] = total - CURRENT_REMAINING_INDEX; // (a)
          partitions[i]["from"] = CURRENT_REMAINING_INDEX; // (b)
          partitions[i]["to"] = CURRENT_REMAINING_INDEX + RECORD_PER_PAGE; // (c)
          break;
        }
      }

      /*(4)*/ const FINALE_PARTITIONS = [partitions[TARGET_PARTITION_INDEX]];
      /*(5)*/ const TOTAL_RESULT_ITEM = RECORD_PER_PAGE;
      /*(6)*/ let REMAINING_ITEM_AMOUNT =
        TOTAL_RESULT_ITEM - partitions[TARGET_PARTITION_INDEX]["total"];

      /*(7)*/ for (
        let i = TARGET_PARTITION_INDEX + 1;
        i < PARTITION_LENGTH;
        i++
      ) {
        const total = partitions[i]["total"]; // a
        const CURRENT_REMAINING_INDEX = REMAINING_ITEM_AMOUNT; // b
        REMAINING_ITEM_AMOUNT -= total; // c
        partitions[i]["from"] = 0; // d
        partitions[i]["to"] =
          REMAINING_ITEM_AMOUNT > 0 ? total : CURRENT_REMAINING_INDEX; // e

        FINALE_PARTITIONS.push(partitions[i]); // f

        if (REMAINING_ITEM_AMOUNT <= 0) break; // g
      }
      return FINALE_PARTITIONS;
    } else {
      return [
        {
          position: partitions[0]?.position,
          from: 0,
          to: RECORD_PER_PAGE,
        },
      ];
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

  sortTablesByKeys = (tables) => {
    /**
     * @desc Sắp xếp danh sách bảng theo thứ tự khóa ngoại của bảng đầu tiên
     *
     * (1). Khởi tạo danh sách kết quả với giá trị khởi đầu là bảng đầu tiên
     * (2). Khởi tạo danh sách bảng còn lại với giá trị khởi đầu là toàn bộ phần còn lại của danh sách bảng sau khi trừ đi phần tử đầu tiên
     * (3). Hễ mà danh sách bảng còn lại chưa rỗng:
     *      a. Khởi tạo mảng rỗng với tên foreignKeys
     *      b. Bằng việc ánh xạ lần lượt các bảng nằm trong danh sách kết quả hiện tại, chọn ra tất cả khóa ngoại của chúng và nhét hết vào foreignKeys
     *      c. Chạy nguyên một cái vòng lập qua từng phần tử của mảng khóa ngoại, chọn ra bảng chứa khóa chính tương ứng với từng khóa
     *  và thêm chúng vào danh sách kết quả hiện tại. Đồng thời, xóa bảng đó khỏi danh sách bảng còn lại
     *
     *
     * @params [
     *      tables <object>[]
     * ]
     *
     * @return tables <object>[]
     *
     *
     */

    let sortedTables = [tables[0]]; // 1
    let remainingTables = tables.slice(1, tables.length); // 2

    while (remainingTables.length > 0) {
      // 3
      const foreignKeys = []; // a
      sortedTables.map((tb) => {
        foreignKeys.push(...tb.foreign_keys);
      }); // b

      for (let i = 0; i < foreignKeys.length; i++) {
        // c
        const { table_id } = foreignKeys[i];
        const targetTable = remainingTables.find((tb) => tb.id == table_id);
        if (targetTable) {
          sortedTables.push(targetTable);
          remainingTables = remainingTables.filter((tb) => tb.id != table_id);
        }
      }
    }
    return sortedTables;
  };

  PRECISE_PARTITIONS = (partitions, START_INDEX, RECORD_AMOUNT) => {
    /**
     *
     * @params [
     *      partitions      <Object>[],
     *      START_INDEX     <Int>,
     *      RECORD_AMOUNT   <Int>
     * ]
     *
     * @desc Thu gọn partition, giải thích ngắn gọn là
     *       "Từ phần tử START_INDEX, chọn ra một số RECORD_AMOUNT bảng ghi nhất định và trả về những PARTITIONS chứa những bảng ghi ấy"
     *
     * (1). Khởi tạo biến & hằng:
     *      partition_length => độ dài hiện có của danh sách partitions.
     *      remain_index => số lượng phần tử còn lại, nhỏ này dùng để tìm partition chứa item ở vị trí START_INDEX
     *      targetStartIndex => partition chứa START_INDEX
     *      targetItem => vị trí của START_INDEX bên trong partition chứa nó.
     *
     * (2). Dùng vòng lập for để tìm vị trí của partition chứa START_INDEX bằng cách cộng partition_counter với độ dài của mỗi
     *  partition mà vòng lập đi qua, cho đến khi partition_count lơn hơn hoặc bằng START_INDEX.
     *  Nếu partition_count > START_INDEX:
     *      - Đặt tartgetStartItem = remain_index - 1
     *      - Đặt targetStartIndex = index hiện tại của vòng lập
     *  Nếu khum: remain_index = remain_index - độ dài của partition
     *
     *
     * (3). Đặt một số biến để xử lý dữ liệu của partition vừa tìm được
     *      - remain_items_container: là mảng data của partition vừa tìm được
     *      - remain_items: là mảng các bảng ghi được lấy từ vị trí START_INDEX
     *      - finalePartitions: Mảng rỗng chứa các partition kết quả
     *      - precisedTargetPartition: là một instance copy từ partition vùa tìm được
     *
     * (4). Nếu remain_items có độ dài lớn hơn RECORD_AMOUNT:
     *      - Đặt lại thuộc tính data cho precisedTargetPartition với giá trị là lát cắt từ START_INDEX đến START_INDEX + DATA_AMOUNT
     *
     * @return partitions <Object>[]
     *
     * @note
     *
     * partition <{
     *     position: "<start>-<end>"
     *     data: <Object>[]
     * }>
     *
     */

    /*(1)*/ const partitions_length = partitions.length;
    let partition_counter = 0;
    let remain_index = START_INDEX;
    let targetStartIndex = 0;
    let targetStartItem = 0;

    /*(2)*/ for (let i = 0; i < partitions_length; i++) {
      const data = partitions[i]["data"];
      const data_length = data.length;
      partition_counter += data_length;

      if (partition_counter >= START_INDEX) {
        let latest_index = remain_index - 1;
        targetStartIndex = i;
        targetStartItem = latest_index;
        break;
      } else {
        remain_index -= data_length;
      }
    }

    /*(3)*/ let remain_items_container = partitions[targetStartIndex]["data"];
    let remain_items = remain_items_container.slice(
      targetStartItem,
      remain_items_container.length
    );

    const finalePartitions = [];
    const precisedTargetPartition = { ...partitions[targetStartIndex] };

    /*(4)*/ if (remain_items.length > RECORD_AMOUNT) {
      precisedTargetPartition["data"] = remain_items.slice(0, RECORD_AMOUNT);
      finalePartitions.push(precisedTargetPartition);
      /*(5)*/
    } else {
      precisedTargetPartition["data"] = remain_items.slice(0, RECORD_AMOUNT);
      finalePartitions.push(precisedTargetPartition);
      let result_counter = precisedTargetPartition["data"].length;

      for (let i = targetStartIndex + 1; i < partitions_length; i++) {
        let data = partitions[i]["data"];
        let data_length = data.length;
        let required_item_amount = RECORD_AMOUNT - result_counter;

        if (required_item_amount > data_length) {
          finalePartitions.push(partitions[i]);
          result_counter += data_length;
        } else {
          partitions[i]["data"] = data.slice(0, required_item_amount);
          finalePartitions.push(partitions[i]);
          result_counter += data_length;
          break;
        }
      }
    }

    return finalePartitions;
  };

  formatCalculateString = (rawString = "") => {
    let string = rawString.toUpperCase();
    const fomulars = [
      {
        fomular: "DATE",
        prefix: " new Date",
        postfix: ".getDate() ",
      },
      {
        fomular: "MONTH",
        prefix: " (new Date",
        postfix: ".getMonth() + 1) ",
      },
      {
        fomular: "YEAR",
        prefix: " new Date",
        postfix: ".getFullYear() ",
      },
    ];

    // // // console.log(string)

    for (let i = 0; i < fomulars.length; i++) {
      // // // console.log(string)
      const { fomular, prefix, postfix } = fomulars[i];
      const splitted = string.split(fomular);

      if (splitted.length > 1) {
        for (let h = 1; h < splitted.length; h++) {
          // // // console.log(splitted[h-1])
          splitted[h - 1] += prefix;
          const post = splitted[h];
          let newPost = "";
          let loopBreak = false;
          for (let j = 0; j < post.length; j++) {
            newPost += post[j];
            if (post[j] == ")" && !loopBreak) {
              newPost += postfix;
              loopBreak = true;
              // break
            }
          }
          splitted[h] = newPost;
        }
      }
      // // // console.log(911, splitted)
      string = splitted.join("");
      // // // console.log(913, string)

      if (i == fomulars.length - 1) {
        let dateSplitted = string.split("new Date");
        for (let k = 0; k < dateSplitted.length; k++) {
          const piece = dateSplitted[k];
          // // console.log(piece)
          if (piece.length > 2) {
            let pieceCopy = "";
            let loopBreak = false;
            for (let c = 0; c < piece.length; c++) {
              pieceCopy += piece[c];

              if (piece[c] == "(" && !loopBreak) {
                pieceCopy += "'";
              }

              if (piece[c + 1] == ")" && !loopBreak) {
                pieceCopy += "'";
                loopBreak = true;
              }
            }
            dateSplitted[k] = pieceCopy;
          }
        }
        string = dateSplitted.join("new Date");
      }
    }

    return string;
  };

  GET = async (PARAMS_PLACE = 3) => {
    const tableids = this.API.tables.valueOrNot();
    const tables = tableids.map((id) => this.getTable(id));
    const params = this.getFields(this.API.params.valueOrNot());
    const fields = this.getFields(
      this.API.fields.valueOrNot().map((field) => field.id)
    );
    let paramQueries = [];

    const datafrom = intValidate(this.req.header("start-at"))
      ? parseInt(this.req.header("start-at"))
      : 0;
    let dataPerBreak = intValidate(this.req.header("data-amount"))
      ? parseInt(this.req.header("data-amount"))
      : RESULT_PER_SEARCH_PAGE;
    let tmpDataFrom = datafrom;

    if (dataPerBreak > 100_000) {
      this.res.status(200).send({
        success: false,
        msg: "Invalid data amount ( maximum 100.000 records per request )",
      });
    } else {
      const startTime = new Date();

      if (params.length > 0) {
        const formatedUrl = this.url.replaceAll("//", "/");
        const splittedURL = formatedUrl.split("/");
        const paramValues =
          splittedURL.slice(
            PARAMS_PLACE
          ); /* The 3 number is the first index of params located in url, this can be changed to flexible with url format */

        let paramsValid = true;
        paramQueries = params.map((param, index) => {
          const query = {};
          const parsedValue = this.parseType(param, paramValues[index]);
          query[param.fomular_alias] = parsedValue.result;
          if (paramValues[index] == "") {
            paramsValid = false;
          }
          return { table_id: param.table_id, query };
        });
        if (paramValues.length < params.length || !paramsValid) {
          this.res.status(200).send({
            msg: "INVALID PARAMS SET",
            data: [],
          });
          return;
        }
      }

      const foreignKeys = [];
      tables.map((tb) => {
        if (tb) {
          foreignKeys.push(...tb.foreign_keys);
        }
      });

      const mainTable = tables[0];

      if (!mainTable) {
        return this.res.status(500).send({
          message: "MAIN TABLE IS NULL CONSUMEAPI AT line number 1514 ",
        });
      }

      const paramQuery = paramQueries.filter((q) => q.table_id == mainTable.id);

      const sideQueries = {};
      paramQuery.map((sideQuery) => {
        const { query } = sideQuery;
        const keys = Object.keys(query);
        return (sideQueries[`${keys[0]}`] = query[keys[0]]);
      });

      let partitions = [];

      const dataLimitation = await Database.selectFields(
        mainTable.table_alias,
        { position: "sumerize" },
        ["total"]
      );

      const stringifiedPeriods = await Cache.getData(
        `${tables[0].table_alias}-periods`
      );
      const periods = stringifiedPeriods?.value;
      if (stringifiedPeriods && periods.length > 0) {
        partitions = periods;
      } else {
      }
      const redundantPartitions = [];

      if (paramQueries.length > 0) {
        let data_counter = 0;
        let finale_raw_data_counter = 0;
        let found = false;
        for (let i = 0; i < partitions.length; i++) {
          const redundantPartition = partitions[i];

          if (redundantPartition && redundantPartition.total) {
            const currentDataLength = redundantPartition.total;
            data_counter += currentDataLength;
            tmpDataFrom -= currentDataLength;

            if (tmpDataFrom < 0 && !found) {
              const redundantPartitionData = await Database.selectAll(
                mainTable.table_alias,
                { position: partitions[i].position, ...sideQueries }
              );
              const data = redundantPartitionData.slice(
                redundantPartitionData.length + tmpDataFrom,
                redundantPartitionData.length
              );

              redundantPartitions.push({
                position: partitions[i].position,
                total: data.length,
                data: data,
              });
              found = true;
              finale_raw_data_counter += data.length;
              continue;
            }

            if (finale_raw_data_counter < dataPerBreak && found) {
              const redundantPartitionData = await Database.selectAll(
                mainTable.table_alias,
                { position: partitions[i].position, ...sideQueries }
              );

              redundantPartitions.push({
                position: partitions[i].position,
                total: redundantPartitionData.length,
                data: redundantPartitionData,
              });
              finale_raw_data_counter += redundantPartitionData.length;

              if (finale_raw_data_counter >= dataPerBreak) {
                break;
              }
            }
          }
        }
      } else {
        let data_counter = 0;
        let finale_raw_data_counter = 0;
        let found = false;
        for (let i = 0; i < partitions.length; i++) {
          const redundantPartition = partitions[i];

          if (redundantPartition && redundantPartition.total) {
            const currentDataLength = redundantPartition.total;
            data_counter += currentDataLength;
            tmpDataFrom -= currentDataLength;
            // // // console.log(630, data_counter, found, finale_raw_data_counter, tmpDataFrom )
            if (tmpDataFrom < 0 && !found) {
              const redundantPartitionData = await Database.selectAll(
                mainTable.table_alias,
                { position: partitions[i].position }
              );
              const data = redundantPartitionData.slice(
                redundantPartitionData.length + tmpDataFrom,
                redundantPartitionData.length
              );
              // // // console.log(636, redundantPartitionData.length + tmpDataFrom, redundantPartitionData.length)
              redundantPartitions.push({
                position: partitions[i].position,
                total: data.length,
                data: data,
              });
              found = true;
              finale_raw_data_counter += data.length;
              continue;
            }

            if (finale_raw_data_counter < dataPerBreak && found) {
              finale_raw_data_counter += redundantPartition.total;
              // // // console.log(656, finale_raw_data_counter)

              const redundantPartitionData = await Database.selectAll(
                mainTable.table_alias,
                { position: partitions[i].position }
              );

              redundantPartitions.push({
                position: partitions[i].position,
                total: redundantPartitionData.length,
                data: redundantPartitionData,
              });
              if (finale_raw_data_counter >= dataPerBreak) {
                break;
              }
            }
          }
        }
      }

      // redundantPartitions.map(par => {
      //     const { position, total, data } = par;
      //     // // console.log()
      //     // // console.log(position)
      //     // // console.log(total)
      //     // // console.log(data)
      // })

      if (redundantPartitions.length > 0) {
        const partitions = this.PRECISE_PARTITIONS(
          redundantPartitions,
          tmpDataFrom + 1,
          dataPerBreak
        );
        const keySortedTables = this.sortTablesByKeys(tables);
        const cacheData = {};

        keySortedTables.map((table) => {
          cacheData[table.table_alias] = [];
        });

        const data = [];

        for (let i = 0; i < partitions.length; i++) {
          data.push(...partitions[i].data); // P[i]
        }

        const finaleData = data;

        let filtedData = finaleData.filter((record) => record != undefined);
        const calculates = this.API.calculates.valueOrNot();

        if (calculates.length > 0) {
          filtedData = filtedData.map((record) => {
            const calculateValue = {};
            const keys = Object.keys(record);
            keys.sort((key_1, key_2) => (key_1.length > key_2.length ? 1 : -1));
            for (let i = 0; i < calculates.length; i++) {
              const { fomular_alias, fomular } = calculates[i];
              let result = this.formatCalculateString(fomular);

              keys.map((key) => {
                /* replace the goddamn fomular with its coresponding value in record values */
                result = result.replaceAll(key, record[key]);
              });
              try {
                calculateValue[fomular_alias] = eval(result);
              } catch {
                calculateValue[
                  fomular_alias
                ] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
              }
            }
            return { ...record, ...calculateValue };
          });
        }
        const rawAPIFields = this.API.fields.valueOrNot();

        const apiFields = this.getFields(rawAPIFields.map((field) => field.id));

        const displayFields = apiFields.map((field) => {
          const { id, display_name } = field;
          const corespondingField = apiFields.find((f) => f.id == id);
          return { display_name, ...corespondingField };
        });

        const calculateDisplay = calculates.map((field) => {
          const { fomular_alias, display_name } = field;
          return { fomular_alias, display_name };
        });

        const model = new Model(mainTable.table_alias);
        const Table = model.getModel();

        const sumerize = await Table.__findCriteria__({ position: "sumerize" });
        const statistic = this.API.statistic.valueOrNot();
        const statistics = [];

        if (sumerize && !objectComparator(sumerize, {})) {
          statistic.map((statis) => {
            const { display_name, fomular_alias, fomular, group_by } = statis;
            const statisRecord = { display_name };
            if (group_by && group_by.length > 0) {
              const rawData = sumerize[fomular_alias];
              if (rawData != undefined) {
                if (fomular == "AVERAGE") {
                  const headers = Object.keys(rawData);
                  const values = Object.values(rawData).map(
                    ({ total, value }) => value
                  );

                  statisRecord["data"] = { headers, values };
                  statisRecord["type"] = "table";
                } else {
                  const headers = Object.keys(rawData);
                  const values = Object.values(rawData);
                  statisRecord["data"] = { headers, values };
                  statisRecord["type"] = "table";
                }
              }
            } else {
              statisRecord["type"] = "text";
              statisRecord["data"] = sumerize[fomular_alias];
            }
            statistics.push(statisRecord);
          });
        }

        const endTime = new Date();
        // // console.log("API CALL IN " + `${endTime - startTime}`)

        this.res.status(200).send({
          msg: "Successfully retrieved data",
          success: true,
          total: finaleData.length,
          count: dataLimitation[0]?.total,
          data: filtedData,
          fields: [...displayFields, ...calculateDisplay],
          statistic: statistics,
        });
      } else {
        this.res.status(200).send({
          msg: "Successfully retrieved data",
          success: true,
          total: [],
          data: [],
          fields,
          count: dataLimitation[0]?.total,
        });
      }
    }
  };

  GET_UI = async (defaultFromIndex) => {
    const PARAMS_PLACE = 3;
    const tables = this.tearTablesAndFieldsToObjects();
    const params = this.getFields(this.API.params.valueOrNot());
    const fromIndex = defaultFromIndex
      ? defaultFromIndex
      : this.req.header(`start_index`);

    if (!this.periods) {
      const start = new Date();
      const periods = await Cache.getData(`${tables[0].table_alias}-periods`);
      if (periods) {
        this.periods = periods.value;
      } else {
        this.periods = [];
        await Cache.setData(`${tables[0].table_alias}-periods`, []);
      }
      const end = new Date();
      // // console.log(`GET CACHE PARTITION IN: ${end - start}`)
    }

    const indices = this.generatePeriodIndex(fromIndex);
    // // // console.log(indices)
    let paramQueries = [];

    if (params.length > 0) {
      const formatedUrl = this.url.replaceAll("//", "/");
      const splittedURL = formatedUrl.split("/");
      const paramValues =
        splittedURL.slice(
          PARAMS_PLACE
        ); /* The 3 number is the first index of params located in url, this can be changed to flexible with url format */

      let paramsValid = true;
      paramQueries = params.map((param, index) => {
        const query = {};
        const parsedValue = this.parseType(param, paramValues[index]);
        query[param.fomular_alias] = parsedValue.result;
        if (paramValues[index] == "") {
          paramsValid = false;
        }
        return { table_id: param.table_id, query };
      });
      if (paramValues.length < params.length || !paramsValid) {
        this.res.status(200).send({
          msg: "INVALID PARAMS SET",
          data: [],
        });
        return;
      }
    }

    const primaryKeys = {};
    const foreignKeys = {};

    const rawAPIFields = this.API.fields.valueOrNot();
    const apiFields = this.getFields(rawAPIFields.map((field) => field.id));
    const dbFields = this.fields;
    for (let i = 0; i < tables.length; i++) {
      const { primary_key, foreign_keys, table_alias } = tables[i];
      primaryKeys[table_alias] = primary_key ? primary_key : [];
      foreignKeys[table_alias] = foreign_keys ? foreign_keys : [];
    }
    let sumerize = {};
    const rawData = [];
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const queriesDataFromParams = paramQueries.filter(
        (tb) => tb.table_id == table.id
      );

      let query = {};
      for (let j = 0; j < queriesDataFromParams.length; j++) {
        query = { ...query, ...queriesDataFromParams[j].query };
      }

      const { id, table_alias, table_name, primary_key, foreign_keys } = table;
      const model = new Model(table_alias);
      const Table = model.getModel();
      await Table.__createIndex__("position");
      const data = [];

      if (objectComparator(query, {})) {
        sumerize = await Table.__findCriteria__({ position: "sumerize" });
        for (let j = 0; j < indices.length; j++) {
          const period = indices[j];

          const splittedData = await Table.__findAll__({
            position: period.position,
          });
          for (let ii = period.from; ii < period.to; ii++) {
            data.push(splittedData[ii]);
          }
        }
      } else {
        const keys = Object.keys(query);
        const formatedQuery = {};
        keys.map((key) => {
          formatedQuery[`${key}`] = query[key];
        });

        const partition = await Table.__findAll__(formatedQuery);

        if (partition) {
          let partitionData = partition;

          const keys = Object.keys(query);
          const values = Object.values(query);

          for (let h = 0; h < keys.length; h++) {
            if (partitionData) {
              partitionData = partitionData.filter(
                (record) => record[keys[h]] == values[h]
              );
            }
          }
          if (partitionData) {
            data.push(...partitionData);
          }
        }
      }
      rawData.push({
        table_id: id,
        table_alias,
        table_name,
        primary_key,
        foreign_keys,
        data,
      });
    }
    rawData.sort((a, b) => (a.data.length > b.data.length ? 1 : -1));
    let mergedRawData = rawData[0].data;

    let filteringData = mergedRawData;

    let filtedData = filteringData.filter((record) => record != undefined);
    const calculates = this.API.calculates.valueOrNot();

    if (calculates.length > 0) {
      filtedData = filtedData.map((record) => {
        const calculateValue = {};
        const keys = Object.keys(record);
        keys.sort((key_1, key_2) => (key_1.length > key_2.length ? 1 : -1));
        for (let i = 0; i < calculates.length; i++) {
          const { fomular_alias, fomular } = calculates[i];
          let result = this.formatCalculateString(fomular);
          keys.map((key) => {
            /* replace the goddamn fomular with its coresponding value in record values */
            result = result.replaceAll(key, record[key]);
          });
          try {
            calculateValue[fomular_alias] = eval(result);
          } catch {
            calculateValue[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
          }
        }
        return { ...record, ...calculateValue };
      });
    }

    const displayFields = apiFields.map((field) => {
      const { id, display_name } = field;
      const corespondingField = apiFields.find((f) => f.id == id);
      return { display_name, ...corespondingField };
    });

    const calculateDisplay = calculates.map((field) => {
      const { fomular_alias, display_name } = field;
      return { fomular_alias, display_name };
    });

    const statistic = this.API.statistic.valueOrNot();
    const statistics = [];

    if (sumerize && !objectComparator(sumerize, {})) {
      statistic.map((statis) => {
        const { display_name, fomular_alias, fomular, group_by } = statis;
        const statisRecord = { display_name };
        if (group_by && group_by.length > 0) {
          const rawData = sumerize[fomular_alias];
          if (rawData != undefined) {
            if (fomular == "AVERAGE") {
              const headers = Object.keys(rawData);
              const values = Object.values(rawData).map(
                ({ total, value }) => value
              );

              statisRecord["data"] = { headers, values };
              statisRecord["type"] = "table";
            } else {
              const headers = Object.keys(rawData);
              const values = Object.values(rawData);
              statisRecord["data"] = { headers, values };
              statisRecord["type"] = "table";
            }
          }
        } else {
          statisRecord["type"] = "text";
          statisRecord["data"] = sumerize[fomular_alias];
        }
        statistics.push(statisRecord);
      });
    }

    this.res.status(200).send({
      msg: "GET",
      success: true,
      fields: [...displayFields, ...calculateDisplay],
      data: filtedData,
      sumerize: sumerize?.total,
      statistic: statistics,
    });
    return;
  };

  POST = async () => {
    const tables = this.tearTablesAndFieldsToObjects();
    const tearedBody = [];
    const primaryKeys = {};
    const foreignKeys = {};

    /**
     *  Tearing the fucking body to seperate objects that contain only their fields alone
     *
     *  After these lines of code, we've got a goddamn object called "tearedBody" which is a list of objects with the structure below
     *  {
     *      table_alias: "NSDKGFK6JLKANFSJFK1D6A4",
     *      data: {
     *          "fomular_alias": "coresponding_value",
     *          ...
     *      }
     *  }
     *
     *  And two objects called primaryKeys & foreignKeys, they contain every key exists in tables set.
     *
     */

    for (let i = 0; i < tables.length; i++) {
      const { primary_key, foreign_keys, table_alias, body, id, fields } =
        tables[i];
      const tearedObject = { table_id: id, table_alias, data: {} };

      primaryKeys[table_alias] = primary_key ? primary_key : [];
      foreignKeys[table_alias] = foreign_keys ? foreign_keys : [];

      for (let j = 0; j < body.length; j++) {
        const field = body[j];
        const { fomular_alias } = field;
        const { DATATYPE, AUTO_INCREMENT, PATTERN, id } = field;
        let isAutoIncreTriggerd = false;
        if (this.req.body[fomular_alias] != undefined) {
          const primaryKey = primaryKeys[table_alias].find((key) => key == id);
          if (primaryKey) {
            const foreignKey = foreignKeys[table_alias].find(
              (key) => key.field_id == id
            );
            if (foreignKey) {
              tearedObject.data[fomular_alias] = this.req.body[fomular_alias];
            } else {
              if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
                tearedObject.data[fomular_alias] =
                  await this.makeAutoIncreament(table_alias, PATTERN);
              } else {
                tearedObject.data[fomular_alias] = this.req.body[fomular_alias];
              }
            }
          } else {
            tearedObject.data[fomular_alias] = this.req.body[fomular_alias];
          }
        } else {
          if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
            const foreignKey = foreignKeys[table_alias].find(
              (key) => key.field_id == id
            );
            if (foreignKey) {
              const foreignField = this.getField(foreignKey.ref_field_id);
              const foreignTable = this.getTable(foreignField.table_id);
              tearedObject.data[fomular_alias] = await this.makeAutoIncreament(
                foreignTable.table_alias,
                PATTERN
              );
            } else {
              tearedObject.data[fomular_alias] = await this.makeAutoIncreament(
                table_alias,
                PATTERN
              );
            }
          } else {
            tearedObject.data[fomular_alias] = this.req.body[fomular_alias];
          }
        }
      }
      tearedBody.push(tearedObject);
    }

    let typeError = false;
    const errorFields = [];
    const existedPrimaryKeys = [];
    const foreignConflicts = [];

    for (let i = 0; i < tearedBody.length; i++) {
      const object = tearedBody[i];
      const { table_id, data } = object;
      const fields = this.getFieldsByTableId(table_id);
      const table = this.getTable(table_id);
      const { foreign_keys } = table;

      for (let j = 0; j < fields.length; j++) {
        const { id, fomular_alias, field_name } = fields[j];

        const isThisFieldForeign = foreign_keys.find(
          (key) => key.field_id == id
        );

        if (isThisFieldForeign) {
          fields[j].NULL = true;
        }
        const validate = this.parseType(fields[j], data[fomular_alias]);
        const { valid, result, reason } = validate;
        if (valid) {
          tearedBody[i].data[fomular_alias] = result;
        } else {
          errorFields.push({
            field: `${fomular_alias}-${field_name}`,
            value: data[fomular_alias],
            reason,
          });
          typeError = true;
        }

        if (
          fields[j].DATATYPE == "FILE" &&
          Array.isArray(data[fomular_alias])
        ) {
          const files = data[fomular_alias];
          for (let f = 0; f < files.length; f++) {
            const extractedFilePath = await this.extractBase64ToFile(files[f]);
            tearedBody[i].data[fomular_alias][f] = extractedFilePath;
          }
        }
      }
    }

    const sortedTables = this.sortTablesByKeys(tables);
    const sortedBody = [];
    if (!typeError) {
      for (let i = 0; i < sortedTables.length; i++) {
        const tb = sortedTables[i];
        const corespondingTable = tearedBody.find(
          (body) => body.table_id == tb.id
        );
        const slaves = this.detectAllSlave(tb);
        const { data } = corespondingTable;

        for (let j = 0; j < slaves.length; j++) {
          const slave = slaves[j];
          const { foreign_keys } = slave;
          for (let h = 0; h < sortedBody.length; h++) {
            const body = sortedBody[h];

            if (body.table_id != undefined && body.table_id == slave.id) {
              const foreign_key = foreign_keys.find(
                (key) => key.table_id == tb.id
              );
              if (foreign_key) {
                const { field_id, ref_field_id } = foreign_key;
                const field = this.getField(field_id);
                const ref_field = this.getField(ref_field_id);
                body.data[`${field.fomular_alias}`] =
                  data[`${ref_field.fomular_alias}`];
              }
            }
          }
        }
        sortedBody.push(corespondingTable);
      }

      for (let i = 0; i < sortedBody.length; i++) {
        const body = sortedBody[i];
        const table = this.getTable(body.table_id);
        const slaves = this.detectAllSlave(table);

        for (let j = 0; j < slaves.length; j++) {
          const slave = slaves[j];

          for (let h = 0; h < sortedBody.length; h++) {
            const body = sortedBody[h];
            if (body.table_id != undefined && body.table_id == slave.id) {
              sortedBody[h].data = { ...sortedBody[i].data, ...body.data };
            }
          }
        }
      }

      // primary key check

      const primaryKeyValuesSelectFunc = [];
      for (let i = 0; i < sortedBody.length; i++) {
        const { table_id, data } = sortedBody[i];
        const table = this.getTable(table_id);

        const { primary_key } = table;
        const primaryQuery = {};
        const primaryFields = this.getFields(primary_key);
        for (let j = 0; j < primaryFields.length; j++) {
          const field = primaryFields[j];
          primaryQuery[field.fomular_alias] = data[field.fomular_alias];
        }
        primaryKeyValuesSelectFunc.push(
          Database.selectAll(table.table_alias, primaryQuery)
        );
      }

      const primaryKeyValues = await Promise.all(primaryKeyValuesSelectFunc);

      for (let i = 0; i < sortedBody.length; i++) {
        const primaryValues = primaryKeyValues[i];

        if (primaryValues && primaryValues.length > 0) {
          const { table_id } = sortedBody[i];
          const table = this.getTable(table_id);

          const conflictObject = {
            table: table.table_name,
            key: primaryValues,
          };
          existedPrimaryKeys.push(conflictObject);
        }
      }

      if (existedPrimaryKeys.length == 0) {
        // foreign check

        for (let i = 0; i < sortedBody.length; i++) {
          const { table_id, data } = sortedBody[i];
          const table = this.getTable(table_id);
          const { foreign_keys } = table;

          const referenceTables = foreign_keys.map((key) => {
            return {
              table: this.getTable(key.table_id),
              field: this.getField(key.field_id),
            };
          });

          for (let j = 0; j < referenceTables.length; j++) {
            const refTable = referenceTables[j].table;
            const slaveField = referenceTables[j].field;
            const corespondingTearedBody = sortedBody.find(
              (body) => body.table_id == refTable.id
            );

            if (!corespondingTearedBody) {
              const { table_alias, primary_key } = refTable;
              const primaryQuery = {};
              const primaryFields = this.getFields(primary_key);
              if (primaryFields.length == 1) {
                const field = primaryFields[0];
                primaryQuery[field.fomular_alias] =
                  data[slaveField.fomular_alias];

                const corespondingPrimaryData = await Database.selectAll(
                  table_alias,
                  primaryQuery
                );
                if (corespondingPrimaryData.length == 0) {
                  foreignConflicts.push({
                    field: slaveField.fomular_alias,
                    references: field.fomular_alias,
                    value: data[slaveField.fomular_alias],
                  });
                }
              } else {
                foreignConflicts.push({
                  table: refTable.table_name,
                  error: `Cấu hình khóa ngoại không hợp lệ`,
                });
              }
            }
          }
        }
      }
    }
    let success = true;
    let msg = "";
    if (
      errorFields.length == 0 &&
      existedPrimaryKeys.length == 0 &&
      foreignConflicts.length == 0
    ) {
      for (let i = 0; i < sortedBody.length; i++) {
        const { table_alias, table_id, data } = sortedBody[i];

        const table = this.getTable(table_id);
        const { foreign_keys } = table;

        for (let j = 0; j < foreign_keys.length; j++) {
          const { field_id, table_id, ref_field_id } = foreign_keys[j];
          const corespondingBody = sortedBody.find(
            (body) => body.table_id == table_id
          );

          if (!corespondingBody) {
            const table = this.getTable(table_id);
            const field = this.getField(field_id);
            const ref_field = this.getField(ref_field_id);
            const foreignData = await Database.selectAll(table.table_alias, {
              [ref_field.fomular_alias]: data[field.fomular_alias],
            });
            if (foreignData.length > 0) {
              delete foreignData[0].position;

              const keys = Object.keys(foreignData[0]);
              keys.map((key) => {
                data[key] = foreignData[0][key];
              });
            }
          }
        }

        /**
         * Move file from temp to file folder
         */

        for (let i = 0; i < tearedBody.length; i++) {
          const object = tearedBody[i];
          const { table_id, data } = object;
          const fields = this.getFieldsByTableId(table_id);

          for (let j = 0; j < fields.length; j++) {
            const { fomular_alias } = fields[j];

            if (
              fields[j].DATATYPE == "FILE" &&
              Array.isArray(data[fomular_alias])
            ) {
              const files = data[fomular_alias];
              for (let k = 0; k < files.length; k++) {
                const file = files[k];
                const newPath = file.replace(TEMP_STORAGE_PATH, FILE_PATH);
                this.moveFile(file, newPath);
                data[fomular_alias][k] = newPath.replace("public", "");
              }
            }
          }
        }

        let cache = await Cache.getData(`${table_alias}-periods`);
        if (!cache) {
          await Cache.setData(`${table_alias}-periods`, []);
          cache = {
            key: `${table_alias}-periods`,
            value: [],
          };
        }
        const periods = cache.value;
        let found = false;
        let targetPosition = "";
        let tartgetPositionObject = {};
        let targetPositionIndex = 0;
        for (let j = 0; j < periods.length; j++) {
          if (!found) {
            const { position, total } = periods[j];
            if (total < TOTAL_DATA_PER_PARTITION) {
              targetPosition = position;
              tartgetPositionObject = periods[j];
              targetPositionIndex = j;
              found = true;
            }
          }
        }

        if (found) {
          data.position = targetPosition;
          await Database.insert(`${table_alias}`, data);
          tartgetPositionObject.total += 1;
          periods[targetPositionIndex] = tartgetPositionObject;
        } else {
          const newPosition = this.translateColIndexToName(periods.length);
          const serializedData = [];
          serializedData.push(data);

          const newPartition = {
            position: newPosition,
            total: 1,
          };
          data.position = newPosition;
          await Database.insert(`${table_alias}`, data);
          periods.push(newPartition);
        }

        await Cache.setData(`${table_alias}-periods`, periods);
        const sum = await Database.select(table_alias, {
          position: "sumerize",
        });
        if (sum) {
          await Database.update(
            table_alias,
            { position: "sumerize" },
            { total: sum.total + 1 }
          );
        } else {
          const newSumerize = {
            position: "sumerize",
            total: 1,
          };
          await Database.insert(table_alias, newSumerize);
        }

        // const Statis = await this.#__statistics.findAll({ table_id })
        // const statis = new StatisticsRecord(Statis[0] ? Statis[0] : { calculates: [], statistic: [], table_id })

        // const statistic = statis.statistic.valueOrNot()
        // const calculates = statis.calculates.valueOrNot()

        // const statisSum = await Database.select(table_alias, { position: "sumerize" })

        // for (let i = 0; i < calculates.length; i++) {
        //     const { fomular_alias, fomular } = calculates[i]
        //     let result = this.formatCalculateString(fomular);
        //     const keys = Object.keys(data)
        //     keys.map(key => {
        //         /* replace the goddamn fomular with its coresponding value in record values */
        //         result = result.replaceAll(key, data[key])
        //     })
        //     try {
        //         data[fomular_alias] = eval(result)
        //     } catch {
        //         data[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
        //     }
        // }
        // for (let i = 0; i < statistic.length; i++) {
        //     const statis = statistic[i]
        //     const { fomular_alias, field, group_by, fomular } = statis;
        //     const stringifyGroupKey = group_by.map(group => data[group]).join("_")
        //     const statisField = statisSum[fomular_alias];
        //     if (!statisField) {
        //         if (group_by && group_by.length > 0) {
        //             statisSum[fomular_alias] = {}
        //         } else {
        //             statisSum[fomular_alias] = 0
        //         }
        //     }
        //     if (fomular == "SUM") {
        //         if (typeof (data[field]) == "number") {
        //             if (group_by && group_by.length > 0) {

        //                 if (!statisSum[fomular_alias][stringifyGroupKey]) {
        //                     statisSum[fomular_alias][stringifyGroupKey] = data[field]
        //                 } else {
        //                     statisSum[fomular_alias][stringifyGroupKey] += data[field]
        //                 }
        //             } else {
        //                 statisSum[fomular_alias] += data[field]
        //             }
        //         }
        //     }

        //     if (fomular == "AVERAGE") {
        //         if (typeof (data[field]) == "number") {
        //             if (group_by && group_by.length > 0) {

        //                 if (!statisSum[fomular_alias][stringifyGroupKey]) {
        //                     statisSum[fomular_alias][stringifyGroupKey] = {
        //                         total: 1,
        //                         value: data[field]
        //                     }
        //                 } else {
        //                     if (statisSum[fomular_alias][stringifyGroupKey].value) {
        //                         statisSum[fomular_alias][stringifyGroupKey].value = (statisSum[fomular_alias][stringifyGroupKey].value * statisSum[fomular_alias][stringifyGroupKey].total + data[field]) / (statisSum[fomular_alias][stringifyGroupKey].total + 1)
        //                     } else {
        //                         statisSum[fomular_alias][stringifyGroupKey].value = data[field]
        //                     }
        //                     statisSum[fomular_alias][stringifyGroupKey].total += 1
        //                 }
        //             } else {
        //                 statisSum[fomular_alias] = (statisSum[fomular_alias][stringifyGroupKey] * statisSum.total + data[field]) / (statisSum.total + 1)
        //             }
        //         }
        //     }

        //     if (fomular == "COUNT") {
        //         if (group_by && group_by.length > 0) {

        //             if (!statisSum[fomular_alias][stringifyGroupKey]) {
        //                 statisSum[fomular_alias][stringifyGroupKey] = 1
        //             } else {
        //                 statisSum[fomular_alias][stringifyGroupKey] += 1
        //             }
        //         } else {
        //             statisSum[fomular_alias] += 1
        //         }
        //     }
        // }
        // await Database.update(table_alias, { position: "sumerize" }, { ...statisSum })
      }
    } else {
      success = false;
      /**
       *
       * Remove fail file
       */

      for (let i = 0; i < tearedBody.length; i++) {
        const object = tearedBody[i];
        const { table_id, data } = object;
        const fields = this.getFieldsByTableId(table_id);

        for (let j = 0; j < fields.length; j++) {
          const { fomular_alias } = fields[j];

          if (
            fields[j].DATATYPE == "FILE" &&
            Array.isArray(data[fomular_alias])
          ) {
            const files = data[fomular_alias];
            for (let k = 0; k < files.length; k++) {
              const file = files[k];
              this.removeFile(file);
            }
          }
        }
      }
    }
    this.res.status(200).send({
      msg: "POST",
      success,
      conflict: {
        type: errorFields,
        primary: existedPrimaryKeys,
        foreign: foreignConflicts,
      },
    });
    return;
  };

  makeAutoIncreament = async (table_alias, pattern, distance = 0) => {
    // // console.log(table_alias)
    const auto_id = await Database.getAutoIncrementId(`${table_alias}-id`);
    const number = auto_id + distance;
    let result = pattern;
    if (!pattern) {
      result = "[N]";
    }
    const today = new Date();
    const date = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    result = result.replaceAll("[DD]", date);
    result = result.replaceAll("[MM]", month);
    result = result.replaceAll("[YYYY]", year);
    const numberPlaces = [];
    for (let i = 0; i < result.length; i++) {
      if (result[i] === "[") {
        var temp = "";
        for (let j = i + 1; j < result.length; j++) {
          if (result[j] === "N" && result[j] !== "]") {
            temp += result[j];
          } else {
            if (result[j] === "]") {
              numberPlaces.push(temp);
              i = j;
              temp = "";
            }
          }
        }
      }
    }

    if (numberPlaces.length == 0) {
      result += "[N]";
      numberPlaces.push("N");
    }
    const places = numberPlaces.map((place) => {
      const placeLength = place.length;
      let numberLength = number.toString().length;
      let header = "";
      for (let i = 0; i < placeLength; i++) {
        header += "0";
      }
      const result =
        header.slice(0, placeLength - numberLength) + number.toString();
      return { place, value: result };
    });
    for (let i = 0; i < places.length; i++) {
      const { place, value } = places[i];
      result = result.replace(`[${place}]`, value);
    }
    return result;
  };

  POST_UI = async () => {
    const tables = this.tearTablesAndFieldsToObjects();
    const tearedBody = [];
    const primaryKeys = {};
    const foreignKeys = {};

    for (let i = 0; i < tables.length; i++) {
      const { primary_key, foreign_keys, table_alias, body, id, fields } =
        tables[i];
      const tearedObject = { table_id: id, table_alias, data: {} };

      primaryKeys[table_alias] = primary_key ? primary_key : [];
      foreignKeys[table_alias] = foreign_keys ? foreign_keys : [];

      for (let j = 0; j < body.length; j++) {
        const field = body[j];
        const { fomular_alias } = field;
        const { DATATYPE, AUTO_INCREMENT, PATTERN, id } = field;

        if (this.req.body[fomular_alias] != undefined) {
          const primaryKey = primaryKeys[table_alias].find((key) => key == id);
          if (primaryKey) {
            const foreignKey = foreignKeys[table_alias].find(
              (key) => key.field_id == id
            );
            if (foreignKey) {
              tearedObject.data[fomular_alias] = this.req.body[fomular_alias];
            } else {
              if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
                tearedObject.data[fomular_alias] =
                  await this.makeAutoIncreament(table_alias, PATTERN);
              } else {
                tearedObject.data[fomular_alias] = this.req.body[fomular_alias];
              }
            }
          } else {
            tearedObject.data[fomular_alias] = this.req.body[fomular_alias];
          }
        } else {
          if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
            const foreignKey = foreignKeys[table_alias].find(
              (key) => key.field_id == id
            );
            if (foreignKey) {
              const foreignField = this.getField(foreignKey.ref_field_id);
              const foreignTable = this.getTable(foreignField.table_id);
              tearedObject.data[fomular_alias] = await this.makeAutoIncreament(
                foreignTable.table_alias,
                PATTERN
              );
            } else {
              tearedObject.data[fomular_alias] = await this.makeAutoIncreament(
                table_alias,
                PATTERN
              );
            }
          } else {
            tearedObject.data[fomular_alias] = this.req.body[fomular_alias];
          }
        }
      }
      tearedBody.push(tearedObject);
    }
    console.log("TEARED BODY::", tearedBody);
    let typeError = false;
    let primaryConflict = false;
    let foreignConflict = false;

    const Statis = await this.#__statistics.findAll({ table_id: tables[0].id });
    const statis = new StatisticsRecord(
      Statis[0]
        ? Statis[0]
        : { calculates: [], statistic: [], table_id: tables[0].id }
    );

    const statistic = statis.statistic.valueOrNot();
    const calculates = statis.calculates.valueOrNot();

    for (let i = 0; i < tearedBody.length; i++) {
      const object = tearedBody[i];
      const { table_id, table_alias, data } = object;
      const fields = this.getFieldsByTableId(table_id);
      tearedBody[i].errorFields = [];

      for (let j = 0; j < fields.length; j++) {
        const { fomular_alias } = fields[j];
        const validate = this.parseType(fields[j], data[fomular_alias]);
        const { valid, result, reason } = validate;
        if (valid) {
          tearedBody[i].data[fomular_alias] = result;
        } else {
          tearedBody[i].errorFields.push({
            field: fields[j],
            value: data[fomular_alias],
            reason,
          });
          typeError = true;
        }

        if (
          fields[j].DATATYPE == "FILE" &&
          Array.isArray(data[fomular_alias])
        ) {
          const files = data[fomular_alias];
          for (let f = 0; f < files.length; f++) {
            const extractedFilePath = await this.extractBase64ToFile(files[f]);
            tearedBody[i].data[fomular_alias][f] = extractedFilePath;
          }
        }
      }
    }

    /**
     * Response JSON remains
     */

    if (!typeError) {
      const { primary_key, foreign_keys, table_alias } = tables[0];
      const primaryFields = this.getFields(primary_key);
      const data = tearedBody[0].data;
      const keyList = primaryFields.map((key) => data[key.fomular_alias]);

      const query = {};

      primaryFields.map((field) => {
        query[`${field.fomular_alias}`] = data[field.fomular_alias];
      });

      const doesThisKeyExist = Database.selectAll(table_alias, query);
      const queries = [doesThisKeyExist];

      for (let i = 0; i < foreign_keys.length; i++) {
        const { field_id, table_id, ref_field_id } = foreign_keys[i];
        const [thisField] = this.getFields([field_id]);
        const [thatField] = this.getFields([ref_field_id]);
        const thatTable = this.getTable(table_id);
        const query = {};
        query[`${thatField.fomular_alias}`] = data[thisField.fomular_alias];
        queries.push(Database.selectAll(`${thatTable.table_alias}`, query));
      }
      const allKeys = await Promise.all(queries);
      // // // console.log(allKeys)
      const primaryRecord = allKeys[0];

      const foreignRecords = allKeys.slice(1, allKeys.length);
      const atLeastOneForeignisInvalid = foreignRecords.filter(
        (record) => record == undefined || record.length == 0
      );

      if (
        primaryRecord &&
        primaryRecord.length == 0 &&
        atLeastOneForeignisInvalid.length == 0
      ) {
        for (let i = 0; i < tearedBody.length; i++) {
          const { table_alias, data } = tearedBody[i];
          let cache = await Cache.getData(`${table_alias}-periods`);
          if (!cache) {
            await Cache.setData(`${table_alias}-periods`, []);
            cache = {
              key: `${table_alias}-periods`,
              value: [],
            };
          }
          const periods = cache.value;
          let found = false;
          let targetPosition = "";
          let tartgetPositionObject = {};
          let targetPositionIndex = 0;
          for (let j = 0; j < periods.length; j++) {
            if (!found) {
              const { position, total } = periods[j];
              if (total < TOTAL_DATA_PER_PARTITION) {
                targetPosition = position;
                tartgetPositionObject = periods[j];
                targetPositionIndex = j;
                found = true;
              }
            }
          }

          allKeys.map(([foreignData]) => {
            if (foreignData) {
              delete foreignData.id;
              delete foreignData._id;
              const foreignDataKeys = Object.keys(foreignData);
              foreignDataKeys.map((key) => {
                data[key] = foreignData[key];
              });
            }
          });

          /**
           * Move file from temp to file folder
           */

          for (let i = 0; i < tearedBody.length; i++) {
            const object = tearedBody[i];
            const { table_id, data } = object;
            const fields = this.getFieldsByTableId(table_id);

            for (let j = 0; j < fields.length; j++) {
              const { fomular_alias } = fields[j];

              if (
                fields[j].DATATYPE == "FILE" &&
                Array.isArray(data[fomular_alias])
              ) {
                const files = data[fomular_alias];
                for (let k = 0; k < files.length; k++) {
                  const file = files[k];
                  const newPath = file.replace(TEMP_STORAGE_PATH, FILE_PATH);
                  this.moveFile(file, newPath);
                  data[fomular_alias][k] = newPath.replace("public", "");
                }
              }
            }
          }

          if (found) {
            data.position = targetPosition;
            await Database.insert(`${table_alias}`, data);
            tartgetPositionObject.total += 1;
            periods[targetPositionIndex] = tartgetPositionObject;
          } else {
            const newPosition = this.translateColIndexToName(periods.length);
            const serializedData = [];
            serializedData.push(data);

            const newPartition = {
              position: newPosition,
              total: 1,
            };
            data.position = newPosition;
            await Database.insert(`${table_alias}`, data);
            periods.push(newPartition);
          }

          await Cache.setData(`${table_alias}-periods`, periods);

          const sum = await Database.select(table_alias, {
            position: "sumerize",
          });
          if (sum) {
            await Database.update(
              table_alias,
              { position: "sumerize" },
              { total: sum.total + 1 }
            );
          } else {
            const newSumerize = {
              position: "sumerize",
              total: 1,
            };
            await Database.insert(table_alias, newSumerize);
          }

          // const statisSum = await Database.select(table_alias, { position: "sumerize" })

          // for (let i = 0; i < calculates.length; i++) {
          //     const { fomular_alias, fomular } = calculates[i]
          //     let result = this.formatCalculateString(fomular);
          //     const keys = Object.keys(data)
          //     keys.map(key => {
          //         /* replace the goddamn fomular with its coresponding value in record values */
          //         result = result.replaceAll(key, data[key])
          //     })
          //     try {
          //         data[fomular_alias] = eval(result)
          //     } catch {
          //         data[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
          //     }
          // }
          // for (let i = 0; i < statistic.length; i++) {
          //     const statis = statistic[i]
          //     // // // console.log(statis)
          //     const { fomular_alias, field, group_by, fomular } = statis;
          //     const stringifyGroupKey = group_by.map(group => data[group]).join("_")

          //     // // // console.log(1741, stringifyGroupKey)

          //     const statisField = statisSum[fomular_alias];
          //     if (!statisField) {
          //         if (group_by && group_by.length > 0) {
          //             statisSum[fomular_alias] = {}
          //         } else {
          //             statisSum[fomular_alias] = 0
          //         }
          //     }
          //     if (fomular == "SUM") {
          //         if (typeof (data[field]) == "number") {
          //             if (group_by && group_by.length > 0) {

          //                 if (!statisSum[fomular_alias][stringifyGroupKey]) {
          //                     statisSum[fomular_alias][stringifyGroupKey] = data[field]
          //                 } else {
          //                     statisSum[fomular_alias][stringifyGroupKey] += data[field]
          //                 }
          //             } else {
          //                 statisSum[fomular_alias] += data[field]
          //             }
          //         }
          //     }

          //     if (fomular == "AVERAGE") {
          //         if (typeof (data[field]) == "number") {
          //             if (group_by && group_by.length > 0) {

          //                 if (!statisSum[fomular_alias][stringifyGroupKey]) {
          //                     statisSum[fomular_alias][stringifyGroupKey] = {
          //                         total: 1,
          //                         value: data[field]
          //                     }
          //                 } else {
          //                     if (statisSum[fomular_alias][stringifyGroupKey].value) {
          //                         statisSum[fomular_alias][stringifyGroupKey].value = (statisSum[fomular_alias][stringifyGroupKey].value * statisSum[fomular_alias][stringifyGroupKey].total + data[field]) / (statisSum[fomular_alias][stringifyGroupKey].total + 1)
          //                     } else {
          //                         statisSum[fomular_alias][stringifyGroupKey].value = data[field]
          //                     }
          //                     statisSum[fomular_alias][stringifyGroupKey].total += 1
          //                 }
          //             } else {
          //                 statisSum[fomular_alias] = (statisSum[fomular_alias][stringifyGroupKey] * statisSum.total + data[field]) / (statisSum.total + 1)
          //             }
          //         }
          //     }

          //     if (fomular == "COUNT") {
          //         if (group_by && group_by.length > 0) {

          //             if (!statisSum[fomular_alias][stringifyGroupKey]) {
          //                 statisSum[fomular_alias][stringifyGroupKey] = 1
          //             } else {
          //                 statisSum[fomular_alias][stringifyGroupKey] += 1
          //             }
          //         } else {
          //             statisSum[fomular_alias] += 1
          //         }
          //     }
          // }
          // await Database.update(table_alias, { position: "sumerize" }, { ...statisSum })
        }
      } else {
        if (primaryRecord && primaryRecord.length > 0) {
          primaryConflict = true;
        }

        if (atLeastOneForeignisInvalid.length > 0) {
          foreignConflict = true;
        }

        /**
         *
         * Remove fail file
         */

        for (let i = 0; i < tearedBody.length; i++) {
          const object = tearedBody[i];
          const { table_id, data } = object;
          const fields = this.getFieldsByTableId(table_id);

          for (let j = 0; j < fields.length; j++) {
            const { fomular_alias } = fields[j];

            if (
              fields[j].DATATYPE == "FILE" &&
              Array.isArray(data[fomular_alias])
            ) {
              const files = data[fomular_alias];
              for (let k = 0; k < files.length; k++) {
                const file = files[k];
                this.removeFile(file);
              }
            }
          }
        }
      }
    } else {
      /**
       *
       * Kinda weird why the fuck did you split type error from errors group ?
       *
       *
       * Remove fail file
       */
      for (let i = 0; i < tearedBody.length; i++) {
        const object = tearedBody[i];
        const { table_id, data } = object;
        const fields = this.getFieldsByTableId(table_id);

        for (let j = 0; j < fields.length; j++) {
          const { fomular_alias } = fields[j];

          if (
            fields[j].DATATYPE == "FILE" &&
            Array.isArray(data[fomular_alias])
          ) {
            const files = data[fomular_alias];
            for (let k = 0; k < files.length; k++) {
              const file = files[k];
              this.removeFile(file);
            }
          }
        }
      }
    }
    this.res
      .status(200)
      .send({ msg: "POST", typeError, primaryConflict, foreignConflict });
  };

  getTableByAlias = (alias) => {
    const table = this.tables.find((tb) => tb.table_alias == alias);
    return table;
  };

  PUT = async () => {
    const tables = this.tearTablesAndFieldsToObjects();
    const params = this.getFields(this.API.params.valueOrNot());
    let paramQueries = [];
    let isBulkUpdate = false;
    // console.log("UPDATE HERE::", tables, tables[0].body, params);

    // console.log("REQ BODY::", this.req.body);
    if (params.length > 0) {
      const formatedUrl = this.url.replaceAll("//", "/");
      const splittedURL = formatedUrl.split("/");
      const paramValues =
        splittedURL.slice(
          3
        ); /* The 3 number is the first index of params located in url, this can be changed to flexible with url format */

      let paramsValid = true;

      if (
        !paramValues?.[0] &&
        this.req.body?.data.length &&
        Object.values(this.req.body?.condition || {}).length
      ) {
        isBulkUpdate = true;
      }

      paramQueries = params.map((param, index) => {
        const query = {};
        const parsedValue = this.parseType(param, paramValues[index]);
        query[param.fomular_alias] = parsedValue.result;

        if (paramValues[index] == "") {
          paramsValid = false;
        }

        return { table_id: param.table_id, query };
      });

      if (isBulkUpdate !== true) {
        if (paramValues.length < params.length || !paramsValid) {
          this.res.status(200).send({
            msg: "INVALID PARAMS SET",
            data: [],
          });
          return;
        }
      }
    }
    // console.log("PARAMS QUERY:", paramQueries);
    const tearedBody = [];
    const primaryKeys = {};
    const foreignKeys = {};
    let typeError = false;

    const handleValidateDataType = (data, foreignKeys, primaryKeys) => {
      let table_alias;
      let primaryK;
      let fields;

      for (let i = 0; i < tables.length; i++) {
        const {
          primary_key,
          foreign_keys,
          table_alias: alias,
          body,
          id,
          fields: f,
        } = tables[i];

        fields = f;
        table_alias = alias;
        primaryK = primary_key;

        primaryKeys[table_alias] = primary_key ? primary_key : [];
        foreignKeys[table_alias] = foreign_keys ? foreign_keys : [];

        for (let j = 0; j < body.length; j++) {
          const field = body[j];
          const { fomular_alias } = field;

          const { DATATYPE, AUTO_INCREMENT, PATTERN, id } = field;
          if (data[fomular_alias] != undefined) {
            const primaryKey = primaryKeys[table_alias].find(
              (key) => key == id
            );
            if (primaryKey) {
              const foreignKey = foreignKeys[table_alias].find(
                (key) => key.field_id == id
              );
              if (foreignKey) {
              } else {
                if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
                  // tearedObject.data[fomular_alias] = await Fields.makeAutoIncreament(table_alias, PATTERN)
                } else {
                  const { valid, result } = this.parseType(
                    field,
                    data[fomular_alias]
                  );

                  if (valid) {
                  } else {
                    return {
                      isValid: false,
                      key: fomular_alias,
                      actual_data: data[fomular_alias],
                      expect_type: field.DATATYPE,
                    };
                  }
                }
              }
            } else {
              const { valid, result } = this.parseType(
                field,
                data[fomular_alias]
              );
              if (valid) {
              } else {
                return {
                  isValid: false,
                  key: fomular_alias,
                  actual_data: data[fomular_alias],
                  expect_type: field.DATATYPE,
                };
              }
            }
          } else {
            if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
              const foreignKey = foreignKeys[table_alias].find(
                (key) => key.field_id == id
              );
              if (foreignKey) {
                const foreignField = this.getField(foreignKey.ref_field_id);
                const foreignTable = this.getTable(foreignField.table_id);
                // tearedObject.data[fomular_alias] = await Fields.makeAutoIncreament(foreignTable.table_alias, PATTERN)
              } else {
                // tearedObject.data[fomular_alias] = await Fields.makeAutoIncreament(table_alias, PATTERN)
                isAutoIncreTriggerd = true;
              }
            } else {
              const { valid, result } = this.parseType(
                field,
                this.req.body[fomular_alias]
              );

              if (valid) {
              } else {
                return {
                  isValid: false,
                  key: fomular_alias,
                  actual_data: data[fomular_alias],
                  expect_type: field.DATATYPE,
                };
              }
            }
          }
        }
      }
      return { isValid: true, table_alias, primaryK, fields };
    };

    for (let i = 0; i < tables.length; i++) {
      const { primary_key, foreign_keys, table_alias, body, id, fields } =
        tables[i];
      const tearedObject = { table_id: id, table_alias, data: {} };

      primaryKeys[table_alias] = primary_key ? primary_key : [];
      foreignKeys[table_alias] = foreign_keys ? foreign_keys : [];

      for (let j = 0; j < body.length; j++) {
        const field = body[j];
        const { fomular_alias } = field;

        const { DATATYPE, AUTO_INCREMENT, PATTERN, id } = field;
        if (this.req.body[fomular_alias] != undefined) {
          const primaryKey = primaryKeys[table_alias].find((key) => key == id);
          if (primaryKey) {
            const foreignKey = foreignKeys[table_alias].find(
              (key) => key.field_id == id
            );
            if (foreignKey) {
              tearedObject.data[fomular_alias] = this.req.body[fomular_alias];
            } else {
              if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
                // tearedObject.data[fomular_alias] = await Fields.makeAutoIncreament(table_alias, PATTERN)
              } else {
                const { valid, result } = this.parseType(
                  field,
                  this.req.body[fomular_alias]
                );

                if (valid) {
                  tearedObject.data[fomular_alias] = result;
                } else {
                  typeError = true;
                }
              }
            }
          } else {
            const { valid, result } = this.parseType(
              field,
              this.req.body[fomular_alias]
            );
            if (valid) {
              tearedObject.data[fomular_alias] = result;
            } else {
              typeError = true;
            }
          }
        } else {
          if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
            const foreignKey = foreignKeys[table_alias].find(
              (key) => key.field_id == id
            );
            if (foreignKey) {
              const foreignField = this.getField(foreignKey.ref_field_id);
              const foreignTable = this.getTable(foreignField.table_id);
              // tearedObject.data[fomular_alias] = await Fields.makeAutoIncreament(foreignTable.table_alias, PATTERN)
            } else {
              // tearedObject.data[fomular_alias] = await Fields.makeAutoIncreament(table_alias, PATTERN)
              isAutoIncreTriggerd = true;
            }
          } else {
            const { valid, result } = this.parseType(
              field,
              this.req.body[fomular_alias]
            );

            if (valid) {
              tearedObject.data[fomular_alias] = result;
            } else {
              typeError = true;
            }
          }
        }
      }
      tearedBody.push(tearedObject);
    }

    const MeasureExecutionTime = async (cb, name) => {
      const start = new Date().getTime();

      await cb();

      console.log("END TIME ", name, " ::", new Date().getTime() - start);
      return;
    };

    /*START BULK UPDATE BY EXCEL  */
    if (isBulkUpdate) {
      const data = this.req.body?.data;
      const mapping_foreign_key = {};
      const mapping_table_alias_primary_keys = {};
      // MEMORY RISK, DATA CAN BE TOO LARGE
      await MeasureExecutionTime(() => {
        for (let i = 0; i < tables.length; i++) {
          const { foreign_keys, fields, table_alias, primary_key } = tables[i];

          mapping_table_alias_primary_keys[table_alias] = fields.find((field) =>
            primary_key.includes(field.id)
          );

          foreign_keys.map((key) => {
            const { field_id, table_id, ref_field_id } = key;
            const field = this.getField(field_id);
            const ref_field = this.getField(ref_field_id);

            mapping_foreign_key[field.fomular_alias] = ref_field.fomular_alias;
          });
        }
      }, "MAPPING FOREIGN KEY");

      let modified_data = {};

      const unique_field_keys = Object.keys(this.req.body?.unique_fields || {});
      const mapping_unique_fields = {};

      const isError = {
        DATA_TYPE: {
          status: false,
          data: [],
        },
        UNIQUE: {
          status: false,
          data: [],
        },
      };

      await MeasureExecutionTime(() => {
        for (let i = 0; i < data?.length; i++) {
          for (let j = 0; j < unique_field_keys.length; j++) {
            /*
              data = [{A:1},{B:2},{A:1}]
              unique_field_keys = [A]
            */
            const key = unique_field_keys[j]; // A
            const unique_data = data[i][key]; // data[0][A]

            if (mapping_unique_fields[key]?.[unique_data]) {
              isError.UNIQUE.status = true;
              isError.UNIQUE.data.push({ [key]: unique_data });

              continue;
            }

            if (!mapping_unique_fields[key]) {
              mapping_unique_fields[key] = {};
            }

            mapping_unique_fields[key][unique_data] = true;
          }

          if (isError.UNIQUE.status) {
            return;
          }

          const res = handleValidateDataType(data[i], foreignKeys, primaryKeys);

          const primarykey = res.fields?.find((field) =>
            res.primaryK.includes(field.id)
          );

          if (data[i][primarykey.fomular_alias]) {
            if (modified_data[res.primaryK]) {
              modified_data[res.primaryK].data.push(
                data[i][primarykey.fomular_alias]
              );
            } else {
              modified_data[res.primaryK] = {
                alias: primarykey.fomular_alias,
                data: [data[i][primarykey.fomular_alias]],
              };
            }
            //slow
            // modified_data[res.primaryK] = {
            //   alias: primarykey.fomular_alias,
            //   data: [
            //     ...(modified_data?.[res.primaryK]?.data || []),
            //     data[i][primarykey.fomular_alias],
            //   ],
            // };
          }

          if (res.isValid === false) {
            console.log("handleValidateDataType res::", res);
            isError.DATA_TYPE.status = true;
            isError.DATA_TYPE.data = res;
            return;
          }
        }
      }, `validate data type ${isError.DATA_TYPE.status} ${isError.UNIQUE.status}`);

      if (isError.DATA_TYPE.status) {
        return this.res.status(200).send({
          success: false,
          errors: {
            type: "type error",
            description: "Some fields have invalid data type",
            data: {
              key: isError.DATA_TYPE.data.key,
              actual_data:
                isError.DATA_TYPE.data?.actual_data || "Do not have data",
              expect_type: isError.DATA_TYPE.data.expect_type,
            },
          },
        });
      }

      if (isError.UNIQUE.status) {
        return this.res.status(200).send({
          success: false,
          errors: {
            type: "type error",
            description: "Some fields have duplicate data",
            data: isError.UNIQUE.data,
          },
        });
      }

      let foreignData = {};
      let isForeignKeyValid = true;

      await MeasureExecutionTime(async () => {
        for (let i = 0; i < tables.length; i++) {
          for (let j = 0; j < foreignKeys[tables[i].table_alias].length; j++) {
            const { table_id, field_id, ref_field_id } =
              foreignKeys[tables[i].table_alias][j];

            const table = this.getTable(table_id);
            const field = this.getField(field_id);
            const ref_field = this.getField(ref_field_id);
            const searching_data = [];

            for (let i = 0; i < data?.length; i++) {
              if (
                data[i][field.fomular_alias] &&
                !searching_data.includes(data[i][field.fomular_alias])
              ) {
                searching_data.push(data[i][field.fomular_alias]);
              }
            }

            if (searching_data.length) {
              let res = [];

              await MeasureExecutionTime(async () => {
                res = await Database.selectAll(table.table_alias, {
                  [ref_field.fomular_alias]: { $in: searching_data },
                });
              }, `SELECT ALL SEARCHING DATA:: ${table.table_alias}`);

              if (res.length !== searching_data.length) {
                isForeignKeyValid = false;
                return;
              }
              foreignData[ref_field.fomular_alias] = res;
            }
          }
        }
      }, `validate foreign keys ${isForeignKeyValid}`);

      if (!isForeignKeyValid) {
        return this.res.status(200).send({
          success: false,
          errors: {
            type: "foreign keys",
            description: "Some datasets have invalid foreign keys",
          },
        });
      }

      for (let i = 0; i < tables.length; i++) {
        const { table_alias, ...props } = tables[i];

        const slaves = this.detectAllSlave(tables[i]);
        let response = [];

        let updated_data = [];

        MeasureExecutionTime(() => {
          updated_data = data.map((item) => {
            const key = Object.keys(this.req.body.condition);

            let convertedItem = {};

            let condition = {};

            for (let i = 0; i < key.length; i++) {
              let k = key[i];
              if (mapping_foreign_key[key[k]]) {
                k = mapping_foreign_key[key[k]];
              }
              if (item[k]) {
                condition[k] = item[k];
              }
            }

            for (const k in item) {
              let key = k;
              let findedItem = {};
              convertedItem = item;
              if (mapping_foreign_key[k]) {
                key = mapping_foreign_key[k];
              }

              findedItem = foreignData[key]?.find((i) => i[key] === item[k]);

              convertedItem[key] = item[k];

              convertedItem = Object.assign(convertedItem, findedItem);
            }

            return {
              value: convertedItem,
              condition,
            };
          });
        }, "convert data for updating");

        await MeasureExecutionTime(async () => {
          response = await Database.updateMany(table_alias, updated_data);
        }, `UPDATE ${table_alias} table`);

        let res = [];

        await MeasureExecutionTime(async () => {
          if (modified_data?.[props.primary_key]?.alias) {
            res = await Database.selectAll(table_alias, {
              [modified_data[props.primary_key].alias]: {
                $in: modified_data[props.primary_key].data,
              },
            });
          }
        }, `SELECT ALL ${table_alias}`);

        await MeasureExecutionTime(async () => {
          await Promise.all(
            slaves.map((slave) => {
              return Database.updateMany(
                slave.table_alias,
                res.map((item) => ({
                  condition: {
                    [modified_data[props.primary_key].alias]:
                      item[modified_data[props.primary_key].alias],
                  },
                  value: item,
                }))
              );
            })
          );
        }, `UPDATE SLAVE ${slaves.join()}`);
      }
      return this.res.status(200).send({
        success: true,
      });
    }
    /* END BULK UPDATE BY EXCEL  */
    for (let i = 0; i < tearedBody.length; i++) {
      const object = tearedBody[i];
      const { table_id, data } = object;
      const fields = this.getFieldsByTableId(table_id);

      for (let j = 0; j < fields.length; j++) {
        const { fomular_alias } = fields[j];

        if (
          fields[j].DATATYPE == "FILE" &&
          Array.isArray(data[fomular_alias])
        ) {
          const files = data[fomular_alias];
          for (let k = 0; k < files.length; k++) {
            const extractedFilePath = await this.extractBase64ToFile(files[k]);
            tearedBody[i].data[fomular_alias][k] = extractedFilePath;
          }
        }
      }
    }

    if (!typeError) {
      const sortedTables = this.sortTablesByKeys(tables);
      let mergedParams = {};
      paramQueries.map(({ query }) => {
        mergedParams = { ...mergedParams, ...query };
      });

      const sortedBody = [];

      // MERGE ANY PRIMARY KEY IF FOUND
      for (let i = 0; i < sortedTables.length; i++) {
        const { id, primary_key } = sortedTables[i];
        const corespondingBody = tearedBody.find((body) => body.table_id == id);

        const primaryFields = this.getFields(primary_key);
        primaryFields.map((field) => {
          if (mergedParams[field.fomular_alias] != undefined) {
            corespondingBody.data[field.fomular_alias] =
              mergedParams[field.fomular_alias];
          }
        });
        sortedBody.push(corespondingBody);
      }

      // MERGE FOREIGN KEYS IF FOUND & FILL MASTER DATA IF IT's UNDEFINED

      for (let i = 0; i < sortedTables.length; i++) {
        const { id, foreign_keys } = sortedTables[i];
        const corespondingBody = tearedBody.find((body) => body.table_id == id);

        foreign_keys.map((key) => {
          const { field_id, table_id, ref_field_id } = key;
          const field = this.getField(field_id);
          const ref_field = this.getField(ref_field_id);
          if (mergedParams[field.fomular_alias] != undefined) {
            corespondingBody.data[field.fomular_alias] =
              mergedParams[field.fomular_alias];

            for (let h = 0; h < sortedBody.length; h++) {
              if (sortedBody[h].table_id == table_id) {
                sortedBody[h].data[ref_field.fomular_alias] =
                  mergedParams[field.fomular_alias];
              }
            }
          }
          if (mergedParams[ref_field.fomular_alias] != undefined) {
            corespondingBody.data[field.fomular_alias] =
              mergedParams[ref_field.fomular_alias];
          }
        });
      }

      for (let i = 0; i < sortedBody.length; i++) {
        const body = sortedBody[i];
        const table = this.getTable(body.table_id);
        const slaves = this.detectAllSlave(table);

        for (let j = 0; j < slaves.length; j++) {
          const slave = slaves[j];

          for (let h = 0; h < sortedBody.length; h++) {
            const body = sortedBody[h];
            if (body.table_id != undefined && body.table_id == slave.id) {
              sortedBody[h].data = { ...sortedBody[i].data, ...body.data };
            }
          }
        }
      }

      let areAllQueriesReturnAtLeastOneRecord = true;
      for (let i = 0; i < sortedBody.length; i++) {
        const { table_id, data } = sortedBody[sortedBody.length - i - 1];

        const table = this.getTable(table_id);
        const { table_alias, primary_key } = table;
        const primaryFields = this.getFields(primary_key);
        const updateQuery = {};

        primaryFields.map((field) => {
          const { fomular_alias } = field;
          if (data[fomular_alias] != undefined) {
            updateQuery[fomular_alias] = data[fomular_alias];
          }
        });

        const masters = this.detectAllMaster(table);
        const existedMasters = masters.filter((master) =>
          sortedBody.find((body) => body.table_id == master.id)
        );

        existedMasters.map((master) => {
          const corespondingBody = sortedBody.find(
            (tb) => tb.table_id == master.id
          );
          const { table_id, data } = corespondingBody;
          const { primary_key } = master;

          const primaryFields = this.getFields(primary_key);
          primaryFields.map((field) => {
            const { fomular_alias } = field;
            if (data[fomular_alias] != undefined) {
              updateQuery[fomular_alias] = data[fomular_alias];
            }
          });
        });

        const queryResult = await Database.count(table_alias, updateQuery);
        if (queryResult == 0) {
          areAllQueriesReturnAtLeastOneRecord = false;
          break;
        }
      }

      if (areAllQueriesReturnAtLeastOneRecord) {
        let areAllForeignKeyValid = true;

        for (let i = 0; i < sortedBody.length; i++) {
          const { table_id, data } = sortedBody[sortedBody.length - i - 1];

          const table = this.getTable(table_id);
          const { table_alias, foreign_keys } = table;

          const outsideMasters = foreign_keys.filter((key) => {
            const { table_id } = key;
            const corespondingBody = sortedBody.find(
              (body) => body.table_id == table_id
            );
            return !corespondingBody;
          });

          for (let j = 0; j < outsideMasters.length; j++) {
            if (areAllForeignKeyValid) {
              const { table_id, field_id, ref_field_id } = outsideMasters[j];
              const table = this.getTable(table_id);
              const field = this.getField(field_id);
              const ref_field = this.getField(ref_field_id);

              const foreignData = await Database.selectAll(table.table_alias, {
                [ref_field.fomular_alias]: data[field.fomular_alias],
              });
              if (foreignData.length == 0) {
                areAllForeignKeyValid = false;
              } else {
                delete foreignData[0].position;
                sortedBody[sortedBody.length - i - 1].data = {
                  ...data,
                  ...foreignData[0],
                };
              }
            }
          }
        }

        if (areAllForeignKeyValid) {
          for (let i = 0; i < sortedBody.length; i++) {
            const { table_id, data } = sortedBody[sortedBody.length - i - 1];

            const table = this.getTable(table_id);
            const { table_alias, primary_key, foreign_keys } = table;
            const primaryFields = this.getFields(primary_key);
            const updateQuery = {};

            const thisTableFields = this.getFieldsByTableId(table_id);

            primaryFields.map((field) => {
              const { fomular_alias } = field;
              if (data[fomular_alias] != undefined) {
                updateQuery[fomular_alias] = data[fomular_alias];
              }
            });

            const masters = this.detectAllMaster(table);
            const existedMasters = masters.filter((master) =>
              sortedBody.find((body) => body.table_id == master.id)
            );

            existedMasters.map((master) => {
              const corespondingBody = sortedBody.find(
                (tb) => tb.table_id == master.id
              );
              const { table_id, data } = corespondingBody;
              const { primary_key, foreign_keys } = master;

              const primaryFields = this.getFields(primary_key);
              primaryFields.map((field) => {
                const { fomular_alias } = field;
                if (data[fomular_alias] != undefined) {
                  updateQuery[fomular_alias] = data[fomular_alias];
                }
              });
            });

            const originDatas = await Database.selectAll(
              table_alias,
              updateQuery
            );

            const originData = originDatas[0];
            if (originData) {
              const fields = this.getFieldsByTableId(table_id);

              for (let k = 0; k < fields.length; k++) {
                const field = fields[k];

                if (
                  field.DATATYPE == "FILE" &&
                  Array.isArray(originData[field.fomular_alias])
                ) {
                  const files = originData[field.fomular_alias];

                  for (let f = 0; f < files.length; f++) {
                    const file = this.formatFileName(files[f]);
                    this.removeFile(file);
                  }

                  const newFiles = data[field.fomular_alias]
                    ? data[field.fomular_alias]
                    : [];
                  for (let f = 0; f < newFiles.length; f++) {
                    const file = newFiles[f];
                    const newPath = file.replace(TEMP_STORAGE_PATH, FILE_PATH);
                    this.moveFile(file, newPath);
                    data[field.fomular_alias][f] = newPath.replace(
                      "public",
                      ""
                    );
                  }
                }
              }
            }

            const slaves = this.detectAllSlave(table);
            // // console.log(`${table.table_name} => `, slaves.map(slave => slave.table_name).join(', '))

            foreign_keys.map((key) => {
              const { field_id, table_id, ref_field_id } = key;
              const field = this.getField(field_id);
              const ref_field = this.getField(ref_field_id);

              data[ref_field.fomular_alias] = data[field.fomular_alias];
            });

            await Database.update(table_alias, updateQuery, { ...data });

            // if (queryResult == 1) {
            //     await Promise.all(slaves.map(slave => {
            //         return Database.update(slave.table_alias, updateQuery, { ...data })
            //     }))
            // } else {
            // }

            const targetRecords = await Database.selectAll(
              table_alias,
              updateQuery
            );

            // // // console.log(targetRecords)
            targetRecords.map((record) => {
              delete record.position;
            });

            for (let j = 0; j < targetRecords.length; j++) {
              const record = targetRecords[j];
              const recordUpdateQuery = {};

              primaryFields.map((field) => {
                const { fomular_alias } = field;
                if (record[fomular_alias] != undefined) {
                  recordUpdateQuery[fomular_alias] = record[fomular_alias];
                }
              });

              console.log(
                "UPDATE SLAVE::",
                recordUpdateQuery,
                record,
                primaryFields,
                "table",
                table,
                "targetRecords",
                targetRecords,
                "updateQuery",
                updateQuery,
                // slaves,
                "END UPDATE SALVE::"
              );

              Promise.all(
                slaves.map((slave) => {
                  return Database.update(slave.table_alias, recordUpdateQuery, {
                    ...record,
                  });
                })
              );
            }
            // const Statis = await this.#__statistics.findAll({ table_id })
            // const statis = new StatisticsRecord(Statis[0] ? Statis[0] : { calculates: [], statistic: [], table_id })

            // const statistics = statis.statistic.valueOrNot()
            // const calculates = statis.calculates.valueOrNot()

            // // // // console.log(data)
            // for (let br = 0; br < originDatas.length; br++) {
            //     const originData = originDatas[br];
            //     // // // console.log(originData)

            //     if (calculates && calculates.length > 0) {
            //         const keys = Object.keys(data)
            //         keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);

            //         for (let i = 0; i < calculates.length; i++) {
            //             const { fomular_alias, fomular } = calculates[i]
            //             let result = this.formatCalculateString(fomular);
            //             let originResult = this.formatCalculateString(fomular)
            //             keys.map(key => {
            //                 result = result.replaceAll(key, data[key])
            //                 originResult = originResult.replaceAll(key, originData[key])
            //             })
            //             try {
            //                 data[fomular_alias] = eval(result)
            //             } catch {
            //                 data[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
            //             }
            //             try {
            //                 originData[fomular_alias] = eval(originResult)
            //             } catch {
            //                 originData[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
            //             }
            //         }
            //     }

            //     if (statistics && statistics.length > 0) {
            //         const sumerize = await Database.select(table_alias, { position: "sumerize" })
            //         const statisSum = sumerize
            //         for (let i = 0; i < statistics.length; i++) {
            //             const statis = statistics[i]
            //             const { fomular_alias, field, group_by, fomular } = statis;
            //             const stringifyGroupKey = group_by.map(group => data[group]).join("_")
            //             const statisField = statisSum[fomular_alias];

            //             if (!statisField) {
            //                 if (group_by && group_by.length > 0) {
            //                     statisSum[fomular_alias] = {}
            //                 } else {
            //                     statisSum[fomular_alias] = 0
            //                 }
            //             }

            //             if (fomular == "SUM") {
            //                 if (typeof (data[field]) == "number") {
            //                     if (group_by && group_by.length > 0) {

            //                         if (!statisSum[fomular_alias][stringifyGroupKey]) {
            //                             statisSum[fomular_alias][stringifyGroupKey] = data[field]
            //                         } else {
            //                             statisSum[fomular_alias][stringifyGroupKey] = statisSum[fomular_alias][stringifyGroupKey] - originData[field] + data[field]
            //                         }
            //                     } else {
            //                         statisSum[fomular_alias] = statisSum[fomular_alias][stringifyGroupKey] - originData[field] + data[field]
            //                     }
            //                 }
            //             }

            //             if (fomular == "AVERAGE") {
            //                 if (group_by && group_by.length > 0) {

            //                     if (!statisSum[fomular_alias][stringifyGroupKey]) {
            //                         statisSum[fomular_alias][stringifyGroupKey] = {
            //                             value: data[field],
            //                             total: 1
            //                         }
            //                     } else {
            //                         statisSum[fomular_alias][stringifyGroupKey].value = (statisSum[fomular_alias][stringifyGroupKey].value * statisSum[fomular_alias][stringifyGroupKey].total - originData[field] + data[field]) / (statisSum[fomular_alias][stringifyGroupKey].total)
            //                         statisSum[fomular_alias][stringifyGroupKey].value += 1
            //                     }
            //                 } else {
            //                     statisSum[fomular_alias] = (statisSum[fomular_alias][stringifyGroupKey] * statisSum.total - originData[field] + data[field]) / (statisSum.total)
            //                 }
            //             }

            //             if (fomular == "COUNT") {
            //                 if (group_by && group_by.length > 0) {
            //                     const newGroup = stringifyGroupKey;
            //                     const oldGroup = group_by.map(group => originData[group]).join("_")
            //                     if (newGroup != oldGroup) {
            //                         if (!statisSum[fomular_alias][newGroup]) {
            //                             statisSum[fomular_alias][newGroup] = 1
            //                         } else {
            //                             statisSum[fomular_alias][newGroup] += 1
            //                         }
            //                         statisSum[fomular_alias][oldGroup] -= 1
            //                         if (statisSum[fomular_alias][oldGroup] == 0) {
            //                             delete statisSum[fomular_alias][oldGroup]
            //                         }
            //                     }
            //                 }
            //             }
            //         }
            //         await Database.update(table_alias, { position: "sumerize" }, { ...statisSum })
            //     }
            // }
          }

          this.res.status(200).send({ success: true });
        } else {
          for (let i = 0; i < tearedBody.length; i++) {
            const object = tearedBody[i];
            const { table_id, data } = object;
            const fields = this.getFieldsByTableId(table_id);

            for (let j = 0; j < fields.length; j++) {
              const { fomular_alias } = fields[j];

              if (
                fields[j].DATATYPE == "FILE" &&
                Array.isArray(data[fomular_alias])
              ) {
                const files = data[fomular_alias];
                for (let k = 0; k < files.length; k++) {
                  const file = files[k];
                  this.removeFile(file);
                }
              }
            }
          }

          this.res.status(200).send({
            success: false,
            errors: {
              type: "foreign keys",
              description: "Some datasets have invalid foreign keys",
            },
          });
        }
      } else {
        for (let i = 0; i < tearedBody.length; i++) {
          const object = tearedBody[i];
          const { table_id, data } = object;
          const fields = this.getFieldsByTableId(table_id);

          for (let j = 0; j < fields.length; j++) {
            const { fomular_alias } = fields[j];

            if (
              fields[j].DATATYPE == "FILE" &&
              Array.isArray(data[fomular_alias])
            ) {
              const files = data[fomular_alias];
              for (let k = 0; k < files.length; k++) {
                const file = files[k];
                this.removeFile(file);
              }
            }
          }
        }

        this.res.status(200).send({
          success: false,
          errors: {
            type: "not found",
            description: "Some params return empty dataset",
          },
        });
      }
    } else {
      for (let i = 0; i < tearedBody.length; i++) {
        const object = tearedBody[i];
        const { table_id, data } = object;
        const fields = this.getFieldsByTableId(table_id);

        for (let j = 0; j < fields.length; j++) {
          const { fomular_alias } = fields[j];

          if (
            fields[j].DATATYPE == "FILE" &&
            Array.isArray(data[fomular_alias])
          ) {
            const files = data[fomular_alias];
            for (let k = 0; k < files.length; k++) {
              const file = files[k];
              this.removeFile(file);
            }
          }
        }
      }
      this.res.status(200).send({
        success: false,
        errors: {
          type: "type error",
          description: "Some fields have invalid data type",
        },
      });
    }
  };
  ///end
  findSlaveRecursive = (table, master) => {
    const { foreign_keys } = table;
    const slaveRelation = foreign_keys.find((key) => key.table_id == master.id);

    if (slaveRelation) {
      return true;
    } else {
      if (foreign_keys.length == 0) {
        return false;
      } else {
        let found = false;
        for (let i = 0; i < foreign_keys.length; i++) {
          const { table_id } = foreign_keys[i];
          const nextMaster = this.getTable(table_id);
          if (!found) {
            found = this.findSlaveRecursive(nextMaster, master);
          }
        }
        return found;
      }
    }
  };

  detectAllSlave = (master) => {
    const tables = this.tables;
    const slaves = [];
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      let found = this.findSlaveRecursive(table, master);
      if (found) {
        slaves.push(table);
      }
    }
    return slaves;
  };

  detectAllMaster = (slave) => {
    const tables = this.tables;
    const masters = [];

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];

      const slaves = this.detectAllSlave(table);
      const isAMaster = slaves.find((tb) => tb.id == slave.id);

      if (isAMaster) {
        masters.push(table);
      }
    }
    return masters;
  };

  PUT_UI = async () => {
    /* CONSTRAINTS CHECK REQUIRED  */
    const tables = this.tearTablesAndFieldsToObjects();
    const params = this.getFields(this.API.params.valueOrNot());

    const data = this.req.body;
    let paramQueries = [];

    if (params.length > 0) {
      const formatedUrl = this.url.replaceAll("//", "/");
      const splittedURL = formatedUrl.split("/");
      const paramValues =
        splittedURL.slice(
          3
        ); /* The 3 number is the first index of params located in url, this can be changed to flexible with url format */

      let paramsValid = true;
      paramQueries = params.map((param, index) => {
        const query = {};
        const parsedValue = this.parseType(param, paramValues[index]);
        query[param.fomular_alias] = parsedValue.result;

        if (paramValues[index] == "") {
          paramsValid = false;
        }
        return { table_id: param.table_id, query };
      });
      if (paramValues.length < params.length || !paramsValid) {
        this.res.status(200).send({
          msg: "INVALID PARAMS SET",
          data: [],
        });
        return;
      }
    }

    const tearedBody = [];
    const primaryKeys = {};
    const foreignKeys = {};

    for (let i = 0; i < tables.length; i++) {
      const { primary_key, foreign_keys, table_alias, body, id, fields } =
        tables[i];
      const tearedObject = { table_id: id, table_alias, data: {} };

      primaryKeys[table_alias] = primary_key ? primary_key : [];
      foreignKeys[table_alias] = foreign_keys ? foreign_keys : [];

      for (let j = 0; j < body.length; j++) {
        const field = body[j];
        const { fomular_alias } = field;
        const { DATATYPE, AUTO_INCREMENT, PATTERN, id } = field;

        if (this.req.body[fomular_alias] != undefined) {
          const primaryKey = primaryKeys[table_alias].find((key) => key == id);
          if (primaryKey) {
            const foreignKey = foreignKeys[table_alias].find(
              (key) => key.field_id == id
            );
            if (foreignKey) {
              tearedObject.data[fomular_alias] = this.req.body[fomular_alias];
            } else {
              if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
                tearedObject.data[fomular_alias] =
                  await this.makeAutoIncreament(table_alias, PATTERN);
              } else {
                tearedObject.data[fomular_alias] = this.req.body[fomular_alias];
              }
            }
          } else {
            tearedObject.data[fomular_alias] = this.req.body[fomular_alias];
          }
        } else {
          if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
            const foreignKey = foreignKeys[table_alias].find(
              (key) => key.field_id == id
            );
            if (foreignKey) {
              const foreignField = this.getField(foreignKey.ref_field_id);
              const foreignTable = this.getTable(foreignField.table_id);
              tearedObject.data[fomular_alias] = await this.makeAutoIncreament(
                foreignTable.table_alias,
                PATTERN
              );
            } else {
              tearedObject.data[fomular_alias] = await this.makeAutoIncreament(
                table_alias,
                PATTERN
              );
            }
          } else {
            tearedObject.data[fomular_alias] = this.req.body[fomular_alias];
          }
        }
      }
      tearedBody.push(tearedObject);
    }

    for (let i = 0; i < tearedBody.length; i++) {
      const object = tearedBody[i];
      const { table_id, data } = object;
      const fields = this.getFieldsByTableId(table_id);

      for (let j = 0; j < fields.length; j++) {
        const { fomular_alias } = fields[j];

        if (
          fields[j].DATATYPE == "FILE" &&
          Array.isArray(data[fomular_alias])
        ) {
          const files = data[fomular_alias];
          for (let k = 0; k < files.length; k++) {
            const extractedFilePath = await this.extractBase64ToFile(files[k]);
            tearedBody[i].data[fomular_alias][k] = extractedFilePath;
          }
        }
      }
    }

    const table = tables[0];

    let query = {};

    for (let i = 0; i < paramQueries.length; i++) {
      const paramQuery = paramQueries[i].query;
      query = { ...query, ...paramQuery };
    }

    const { primary_key, foreign_keys, fields, table_alias } = table;
    const indexQuery = {};
    const primaryFields = this.getFields(primary_key);

    // // console.log(2424, data)

    const recordIndex = primaryFields.map(
      (field) => query[field.fomular_alias]
    );

    primaryFields.map((field) => {
      indexQuery[field.fomular_alias] = data[field.fomular_alias];
      delete data[field.fomular_alias];
    });

    const keys = Object.keys(query);
    const formatedQuery = {};
    keys.map((key) => {
      formatedQuery[`${key}`] = query[key];
    });

    /* PRIMARY CHECK */

    const doesThisKeyExist = await Database.selectAll(
      table_alias,
      formatedQuery
    );
    const truePrimaryRecord = doesThisKeyExist[0];
    if (truePrimaryRecord != undefined) {
      const originData = truePrimaryRecord;

      const fields = this.getFieldsByTableId(table.id);

      for (let j = 0; j < fields.length; j++) {
        const { fomular_alias } = fields[j];
        const validate = this.parseType(fields[j], data[fomular_alias]);
        const { valid, result, reason } = validate;
        if (valid) {
          data[fomular_alias] = result;
        }
      }

      /* FOREIGN KEY CHECK */

      const foreignSerialized = foreign_keys.map((key) => {
        const { field_id, table_id, ref_field_id } = key;
        const foreignTable = this.getTable(table_id);

        const [thisField] = this.getFields([field_id]);
        const [thatField] = this.getFields([ref_field_id]);

        return { field: thisField, foreignTable, ref: thatField };
      });

      const foreignData = await Promise.all(
        foreignSerialized.map((key) => {
          const { field, foreignTable, ref } = key;
          const queryValue = data[field.fomular_alias]
            ? data[field.fomular_alias]
            : data[ref.fomular_alias];
          if (queryValue) {
            return Database.selectAll(foreignTable.table_alias, {
              [`${ref.fomular_alias}`]: data[field.fomular_alias]
                ? data[field.fomular_alias]
                : data[ref.fomular_alias],
            });
          }
        })
      );
      // // console.log(2476, foreignData)
      let areForeignDataValid = true;

      for (let i = 0; i < foreignData.length; i++) {
        if (foreignData[i]) {
          if (foreignData[i].length == 0) {
            areForeignDataValid = false;
          } else {
            const foreignRecord = foreignData[i][0];
            const keys = Object.keys(foreignRecord);
            keys.map((key) => (data[key] = foreignRecord[key]));
          }
        }
      }

      if (areForeignDataValid) {
        // // console.log(2490, data)
        // const partitionData = partition.data;

        const originDatas = await Database.selectAll(
          table_alias,
          formatedQuery
        );
        const originData = originDatas[0];

        if (originData) {
          const fields = this.getFieldsByTableId(table.id);
          // console.log(originData)

          for (let k = 0; k < fields.length; k++) {
            const field = fields[k];

            if (
              field.DATATYPE == "FILE" &&
              Array.isArray(originData[field.fomular_alias])
            ) {
              const files = originData[field.fomular_alias];

              for (let f = 0; f < files.length; f++) {
                const file = this.formatFileName(files[f]);
                this.removeFile(file);
              }

              const newFiles = data[field.fomular_alias];
              for (let f = 0; f < newFiles.length; f++) {
                const file = newFiles[f];
                const newPath = file.replace(TEMP_STORAGE_PATH, FILE_PATH);
                this.moveFile(file, newPath);

                data[field.fomular_alias][f] = newPath.replace("public", "");
              }
            }
          }
        }

        await Database.update(`${table_alias}`, formatedQuery, { ...data });

        const slaves = this.detectAllSlave(table);
        for (let i = 0; i < slaves.length; i++) {
          const startAt = new Date();
          const slave = slaves[i];
          // // console.log(2498, data)
          await Database.update(`${slave.table_alias}`, formatedQuery, {
            ...data,
          });

          const endAt = new Date();
          // // console.log(`Synchorized data in table ${slave.table_name} costs: ${endAt - startAt}ms`)
        }

        // const Statis = await this.#__statistics.findAll({ table_id: tables[0].id })
        // const statis = new StatisticsRecord(Statis[0] ? Statis[0] : { calculates: [], statistic: [], table_id: tables[0].id })

        // const statistics = statis.statistic.valueOrNot()
        // const calculates = statis.calculates.valueOrNot()

        // if (calculates && calculates.length > 0) {
        //     const keys = Object.keys(data)
        //     keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);

        //     for (let i = 0; i < calculates.length; i++) {
        //         const { fomular_alias, fomular } = calculates[i]
        //         let result = this.formatCalculateString(fomular);
        //         let originResult = this.formatCalculateString(fomular)
        //         keys.map(key => {
        //             result = result.replaceAll(key, data[key])
        //             originResult = originResult.replaceAll(key, originData[key])
        //         })
        //         try {
        //             data[fomular_alias] = eval(result)
        //         } catch {
        //             data[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
        //         }
        //         try {
        //             originData[fomular_alias] = eval(originResult)
        //         } catch {
        //             originData[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
        //         }
        //     }
        // }

        // if (statistics && statistics.length > 0) {
        //     const sumerize = await Database.select(table_alias, { position: "sumerize" })
        //     const statisSum = sumerize
        //     for (let i = 0; i < statistics.length; i++) {
        //         const statis = statistics[i]
        //         const { fomular_alias, field, group_by, fomular } = statis;
        //         const stringifyGroupKey = group_by.map(group => data[group]).join("_")
        //         const statisField = statisSum[fomular_alias];

        //         if (!statisField) {
        //             if (group_by && group_by.length > 0) {
        //                 statisSum[fomular_alias] = {}
        //             } else {
        //                 statisSum[fomular_alias] = 0
        //             }
        //         }

        //         if (fomular == "SUM") {
        //             if (typeof (data[field]) == "number") {
        //                 if (group_by && group_by.length > 0) {

        //                     if (!statisSum[fomular_alias][stringifyGroupKey]) {
        //                         statisSum[fomular_alias][stringifyGroupKey] = data[field]
        //                     } else {
        //                         statisSum[fomular_alias][stringifyGroupKey] = statisSum[fomular_alias][stringifyGroupKey] - originData[field] + data[field]
        //                     }
        //                 } else {
        //                     statisSum[fomular_alias] = statisSum[fomular_alias][stringifyGroupKey] - originData[field] + data[field]
        //                 }
        //             }
        //         }

        //         if (fomular == "AVERAGE") {
        //             if (group_by && group_by.length > 0) {

        //                 if (!statisSum[fomular_alias][stringifyGroupKey]) {
        //                     statisSum[fomular_alias][stringifyGroupKey] = {
        //                         value: data[field],
        //                         total: 1
        //                     }
        //                 } else {
        //                     statisSum[fomular_alias][stringifyGroupKey].value = (statisSum[fomular_alias][stringifyGroupKey].value * statisSum[fomular_alias][stringifyGroupKey].total - originData[field] + data[field]) / (statisSum[fomular_alias][stringifyGroupKey].total)
        //                     statisSum[fomular_alias][stringifyGroupKey].value += 1
        //                 }
        //             } else {
        //                 statisSum[fomular_alias] = (statisSum[fomular_alias][stringifyGroupKey] * statisSum.total - originData[field] + data[field]) / (statisSum.total)
        //             }
        //         }

        //         if (fomular == "COUNT") {
        //             if (group_by && group_by.length > 0) {
        //                 const newGroup = stringifyGroupKey;
        //                 const oldGroup = group_by.map(group => originData[group]).join("_")
        //                 if (newGroup != oldGroup) {
        //                     if (!statisSum[fomular_alias][newGroup]) {
        //                         statisSum[fomular_alias][newGroup] = 1
        //                     } else {
        //                         statisSum[fomular_alias][newGroup] += 1
        //                     }
        //                     statisSum[fomular_alias][oldGroup] -= 1
        //                     if (statisSum[fomular_alias][oldGroup] == 0) {
        //                         delete statisSum[fomular_alias][oldGroup]
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     // // console.log(2605, statisSum)
        //     await Database.update(table_alias, { position: "sumerize" }, { ...statisSum })
        // }

        this.res.send({ success: true });
      } else {
        for (let i = 0; i < tearedBody.length; i++) {
          const object = tearedBody[i];
          const { table_id, data } = object;
          const fields = this.getFieldsByTableId(table_id);

          for (let j = 0; j < fields.length; j++) {
            const { fomular_alias } = fields[j];

            if (
              fields[j].DATATYPE == "FILE" &&
              Array.isArray(data[fomular_alias])
            ) {
              const files = data[fomular_alias];
              for (let k = 0; k < files.length; k++) {
                const file = files[k];
                this.removeFile(file);
              }
            }
          }
        }

        this.res.send({ success: false });
      }
    } else {
      for (let i = 0; i < tearedBody.length; i++) {
        const object = tearedBody[i];
        const { table_id, data } = object;
        const fields = this.getFieldsByTableId(table_id);

        for (let j = 0; j < fields.length; j++) {
          const { fomular_alias } = fields[j];

          if (
            fields[j].DATATYPE == "FILE" &&
            Array.isArray(data[fomular_alias])
          ) {
            const files = data[fomular_alias];
            for (let k = 0; k < files.length; k++) {
              const file = files[k];
              this.removeFile(file);
            }
          }
        }
      }
      this.res.send({ success: false });
    }
  };

  DELETE = async () => {
    const tables = this.tearTablesAndFieldsToObjects();
    const params = this.getFields(this.API.params.valueOrNot());
    let paramQueries = [];

    if (params.length > 0) {
      const formatedUrl = this.url.replaceAll("//", "/");
      const splittedURL = formatedUrl.split("/");
      const paramValues = splittedURL.slice(3);

      let paramsValid = true;
      paramQueries = params.map((param, index) => {
        const query = {};
        query[param.fomular_alias] = paramValues[index];
        if (paramValues[index] == "") {
          paramsValid = false;
        }
        return { table_id: param.table_id, query };
      });
      if (paramValues.length < params.length || !paramsValid) {
        this.res.status(200).send({
          msg: "INVALID PARAMS SET",
          data: [],
        });
        return;
      }
    }
    const table = tables[0];
    let query = {};

    for (let i = 0; i < paramQueries.length; i++) {
      const paramQuery = paramQueries[i].query;
      query = { ...query, ...paramQuery };
    }

    const { primary_key, foreign_keys, fields, table_alias } = table;
    const indexQuery = {};
    const primaryFields = this.getFields(primary_key);

    primaryFields.map((field) => {
      indexQuery[field.fomular_alias] = query[field.fomular_alias];
    });

    const keys = Object.keys(query);
    const formatedQuery = {};
    const itemQuery = {};
    keys.map((key) => {
      const qr = {};
      formatedQuery[`${key}`] = query[key];
    });

    const model = new Model(table_alias);
    const Table = model.getModel();

    const doesThisKeyExist = await Database.selectAll(
      table_alias,
      formatedQuery
    );
    const primaryRecord = doesThisKeyExist[0];

    if (primaryRecord) {
      const slaves = this.detectAllSlave(table);
      const slaveryBoundRecords = await Promise.all(
        slaves.map((slave) => Database.count(slave.table_alias, formatedQuery))
      );
      const isBoundBySlaves = slaveryBoundRecords.find((count) => count > 0);
      // // // console.log(slaveryBoundRecords)
      if (!isBoundBySlaves) {
        const sumerize = await Table.__findCriteria__({ position: "sumerize" });

        const deletedItems = await Database.selectAll(`${table_alias}`, query);

        await Database.deleteMany(`${table_alias}`, query);

        const cache = await Cache.getData(`${table_alias}-periods`);
        const periods = cache.value;

        for (let i = 0; i < periods.length; i++) {
          const period = periods[i];
          if (period.position == primaryRecord.position) {
            periods[i].total -= 1;
            break;
          }
        }
        await Cache.setData(`${table_alias}-periods`, periods);
        await Table.__manualUpdate__(
          { position: "sumerize" },
          { total: sumerize.total - deletedItems.length }
        );

        for (let h = 0; h < deletedItems.length; h++) {
          const record = deletedItems[h];

          for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            const { fomular_alias } = field;
            if (
              field.DATATYPE == "FILE" &&
              Array.isArray(record[fomular_alias])
            ) {
              const files = record[fomular_alias];
              for (let f = 0; f < files.length; f++) {
                this.removeFile(this.formatFileName(files[f]));
              }
            }
          }
        }

        // const Statis = await this.#__statistics.findAll({ table_id: tables[0].id })
        // const statis = new StatisticsRecord(Statis[0] ? Statis[0] : { calculates: [], statistic: [], table_id: tables[0].id })

        // const statistics = statis.statistic.valueOrNot()
        // const calculates = statis.calculates.valueOrNot()

        // for (let i = 0; i < deletedItems.length; i++) {
        //     const originData = deletedItems[i]

        //     if (calculates && calculates.length > 0) {
        //         const keys = Object.keys(originData)
        //         keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);

        //         for (let i = 0; i < calculates.length; i++) {
        //             const { fomular_alias, fomular } = calculates[i]
        //             let originResult = this.formatCalculateString(fomular)
        //             keys.map(key => {
        //                 originResult = originResult.replaceAll(key, originData[key])
        //             })
        //             try {
        //                 originData[fomular_alias] = eval(originResult)
        //             } catch {
        //                 originData[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
        //             }
        //         }
        //     }

        //     if (statistics && statistics.length > 0) {
        //         const sumerize = await Table.__findCriteria__({ position: "sumerize" })
        //         const statisSum = sumerize
        //         for (let i = 0; i < statistics.length; i++) {
        //             const statis = statistics[i]
        //             const { fomular_alias, field, group_by, fomular } = statis;
        //             const stringifyGroupKey = group_by.map(group => originData[group]).join("_")
        //             const statisField = statisSum[fomular_alias];

        //             if (!statisField) {
        //                 if (group_by && group_by.length > 0) {
        //                     statisSum[fomular_alias] = {}
        //                 } else {
        //                     statisSum[fomular_alias] = 0
        //                 }
        //             }

        //             if (fomular == "SUM") {
        //                 if (typeof (originData[field]) == "number") {
        //                     if (group_by && group_by.length > 0) {
        //                         if (!statisSum[fomular_alias][stringifyGroupKey]) {
        //                             statisSum[fomular_alias][stringifyGroupKey] = 0
        //                         } else {
        //                             statisSum[fomular_alias][stringifyGroupKey] = statisSum[fomular_alias][stringifyGroupKey] - originData[field]
        //                         }
        //                     } else {
        //                         statisSum[fomular_alias] = statisSum[fomular_alias] - originData[field]
        //                     }
        //                 }
        //             }

        //             if (fomular == "AVERAGE") {
        //                 if (typeof (originData[field]) == "number") {
        //                     if (group_by && group_by.length > 0) {

        //                         if (!statisSum[fomular_alias][stringifyGroupKey]) {
        //                             statisSum[fomular_alias][stringifyGroupKey] = {
        //                                 total: 0,
        //                                 value: 0
        //                             }
        //                         } else {
        //                             if (statisSum.total - 1 <= 0) {
        //                                 delete statisSum[fomular_alias][stringifyGroupKey]
        //                             } else {
        //                                 statisSum[fomular_alias][stringifyGroupKey].value = (statisSum[fomular_alias][stringifyGroupKey].value * statisSum[fomular_alias][stringifyGroupKey].total - originData[field]) / (statisSum[fomular_alias][stringifyGroupKey].total - 1)
        //                                 statisSum[fomular_alias][stringifyGroupKey].total -= 1
        //                             }
        //                         }
        //                     } else {
        //                         if (statisSum.total - 1 == 0) {
        //                             delete statisSum[fomular_alias]
        //                         } else {
        //                             statisSum[fomular_alias] = (statisSum[fomular_alias][stringifyGroupKey] * statisSum.total - originData[field]) / (statisSum.total - 1)
        //                         }
        //                     }
        //                 }
        //             }

        //             if (fomular == "COUNT") {
        //                 if (group_by && group_by.length > 0) {
        //                     const oldGroup = group_by.map(group => originData[group]).join("_")

        //                     statisSum[fomular_alias][oldGroup] -= 1
        //                     if (statisSum[fomular_alias][oldGroup] == 0) {
        //                         delete statisSum[fomular_alias][oldGroup]
        //                     }
        //                 }
        //             }
        //         }
        //         await Database.update(table_alias, { position: "sumerize" }, { ...statisSum })
        //     }
        // }

        this.res.status(200).send({
          success: true,
          errors: {},
        });
      } else {
        // slaveries bound
        this.res.status(200).send({
          success: false,
          errors: {
            type: "relation violating",
            description: "Foreign key violation",
          },
        });
      }
    } else {
      // primary record not found
      this.res.status(200).send({
        success: false,
        errors: {
          type: "not found",
          description: "Target record(s) not found",
        },
      });
    }
  };

  DELETE_UI = async () => {
    const tables = this.tearTablesAndFieldsToObjects();
    const params = this.getFields(this.API.params.valueOrNot());
    let paramQueries = [];

    /* CASCADING OPTION REQUIRED  */

    if (params.length > 0) {
      const formatedUrl = this.url.replaceAll("//", "/");
      const splittedURL = formatedUrl.split("/");
      const paramValues = splittedURL.slice(3);

      let paramsValid = true;
      paramQueries = params.map((param, index) => {
        const query = {};
        query[param.fomular_alias] = paramValues[index];
        if (paramValues[index] == "") {
          paramsValid = false;
        }
        return { table_id: param.table_id, query };
      });
      if (paramValues.length < params.length || !paramsValid) {
        this.res.status(200).send({
          msg: "INVALID PARAMS SET",
          data: [],
        });
        return;
      }
    }
    const table = tables[0];
    let query = {};

    for (let i = 0; i < paramQueries.length; i++) {
      const paramQuery = paramQueries[i].query;
      query = { ...query, ...paramQuery };
    }

    const { primary_key, foreign_keys, fields, table_alias } = table;
    const indexQuery = {};
    const primaryFields = this.getFields(primary_key);

    primaryFields.map((field) => {
      indexQuery[field.fomular_alias] = query[field.fomular_alias];
    });

    const keys = Object.keys(query);
    const formatedQuery = {};
    const itemQuery = {};
    keys.map((key) => {
      const qr = {};
      formatedQuery[`${key}`] = query[key];
    });

    const model = new Model(table_alias);
    const Table = model.getModel();

    const doesThisKeyExist = await Database.selectAll(
      table_alias,
      formatedQuery
    );
    const primaryRecord = doesThisKeyExist[0]; // ? this may cause error if more than 1 partition were returned

    // const partitionData = partition.data;
    if (primaryRecord) {
      const slaves = this.detectAllSlave(table);
      const slaveryBoundRecords = await Promise.all(
        slaves.map((slave) => Database.count(slave.table_alias, formatedQuery))
      );
      const isBoundBySlaves = slaveryBoundRecords.find((count) => count > 0);

      if (!isBoundBySlaves) {
        const sumerize = await Table.__findCriteria__({ position: "sumerize" });
        await Database.deleteMany(`${table_alias}`, query);

        const newTotal = await Database.getEstimateCount(table_alias);

        const cache = await Cache.getData(`${table_alias}-periods`);
        const periods = cache.value;

        for (let i = 0; i < periods.length; i++) {
          const period = periods[i];
          if (period.position == primaryRecord.position) {
            periods[i].total = newTotal - 1;
            break;
          }
        }

        await Cache.setData(`${table_alias}-periods`, periods);
        const originData = primaryRecord;
        const deletedItems = originData ? [originData] : [];

        for (let h = 0; h < deletedItems.length; h++) {
          const record = deletedItems[h];

          for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            const { fomular_alias } = field;
            if (
              field.DATATYPE == "FILE" &&
              Array.isArray(record[fomular_alias])
            ) {
              const files = record[fomular_alias];
              for (let f = 0; f < files.length; f++) {
                this.removeFile(this.formatFileName(files[f]));
              }
            }
          }
        }

        // const Statis = await this.#__statistics.findAll({ table_id: tables[0].id })
        // const statis = new StatisticsRecord(Statis[0] ? Statis[0] : { calculates: [], statistic: [], table_id: tables[0].id })

        // const statistics = statis.statistic.valueOrNot()
        // const calculates = statis.calculates.valueOrNot()

        // if (calculates && calculates.length > 0) {
        //     const keys = Object.keys(originData)
        //     keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);

        //     for (let i = 0; i < calculates.length; i++) {
        //         const { fomular_alias, fomular } = calculates[i]
        //         let originResult = this.formatCalculateString(fomular)
        //         keys.map(key => {
        //             originResult = originResult.replaceAll(key, originData[key])
        //         })
        //         try {
        //             originData[fomular_alias] = eval(originResult)
        //         } catch {
        //             originData[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
        //         }
        //     }
        // }

        // if (statistics && statistics.length > 0) {
        //     const sumerize = await Table.__findCriteria__({ position: "sumerize" })
        //     const statisSum = sumerize
        //     for (let i = 0; i < statistics.length; i++) {
        //         const statis = statistics[i]
        //         const { fomular_alias, field, group_by, fomular } = statis;

        //         const stringifyGroupKey = group_by.map(group => originData[group]).join("_")
        //         const statisField = statisSum[fomular_alias];

        //         if (!statisField) {
        //             if (group_by && group_by.length > 0) {
        //                 statisSum[fomular_alias] = {}
        //             } else {
        //                 statisSum[fomular_alias] = 0
        //             }
        //         }

        //         if (fomular == "SUM") {
        //             if (typeof (originData[field]) == "number") {
        //                 if (group_by && group_by.length > 0) {
        //                     if (!statisSum[fomular_alias][stringifyGroupKey]) {
        //                         statisSum[fomular_alias][stringifyGroupKey] = 0
        //                     } else {
        //                         statisSum[fomular_alias][stringifyGroupKey] = statisSum[fomular_alias][stringifyGroupKey] - originData[field]
        //                     }
        //                 } else {
        //                     statisSum[fomular_alias] = statisSum[fomular_alias] - originData[field]
        //                 }
        //             }
        //         }

        //         if (fomular == "AVERAGE") {
        //             if (typeof (originData[field]) == "number") {
        //                 if (group_by && group_by.length > 0) {

        //                     if (!statisSum[fomular_alias][stringifyGroupKey]) {
        //                         statisSum[fomular_alias][stringifyGroupKey] = {
        //                             total: 0,
        //                             value: 0
        //                         }
        //                     } else {
        //                         if (statisSum.total - 1 <= 0) {
        //                             delete statisSum[fomular_alias][stringifyGroupKey]
        //                         } else {
        //                             statisSum[fomular_alias][stringifyGroupKey].value = (statisSum[fomular_alias][stringifyGroupKey].value * statisSum[fomular_alias][stringifyGroupKey].total - originData[field]) / (statisSum[fomular_alias][stringifyGroupKey].total - 1)
        //                             statisSum[fomular_alias][stringifyGroupKey].total -= 1
        //                         }
        //                     }
        //                 } else {
        //                     if (statisSum.total - 1 == 0) {
        //                         delete statisSum[fomular_alias]
        //                     } else {
        //                         statisSum[fomular_alias] = (statisSum[fomular_alias][stringifyGroupKey] * statisSum.total - originData[field]) / (statisSum.total - 1)
        //                     }
        //                 }
        //             }
        //         }

        //         if (fomular == "COUNT") {
        //             if (group_by && group_by.length > 0) {
        //                 const oldGroup = group_by.map(group => originData[group]).join("_")

        //                 statisSum[fomular_alias][oldGroup] -= 1
        //                 if (statisSum[fomular_alias][oldGroup] == 0) {
        //                     delete statisSum[fomular_alias][oldGroup]
        //                 }
        //             }
        //         }
        //     }
        //     await Database.update(table_alias, { position: "sumerize" }, { ...statisSum })
        // }

        // await Table.__manualUpdate__({ position: "sumerize" }, { total: newTotal - 1 })
        this.res.send({ success: true });
      } else {
        this.res.status(200).send({
          success: false,
          errors: {
            type: "relation violating",
            description: "Foreign key violation",
          },
        });
      }
    } else {
      this.res.status(200).send({
        success: false,
        errors: {
          type: "not found",
          description: "Target record(s) not found",
        },
      });
    }
  };

  generateRemoteURL = () => {
    const { proxy_server } = this.project
      ? this.project
      : { proxy_server: "http://127.0.0.1" };

    const url = this.req.url;
    const api_id = this.API.api_id.value();

    const splitByAPIID = url.split(api_id);
    const paramPart = splitByAPIID[1] ? splitByAPIID[1] : "";
    const paramValues = paramPart.split("/").slice(1, 100000);

    const remote_url = this.API.remote_url.value();
    return `${proxy_server}${remote_url}${paramValues.join()}`;
  };

  REMOTE_GET = async () => {
    const remoteURL = this.generateRemoteURL();
    // // console.log(remoteURL)
    const context = {
      success: true,
      data: [],
      statistic: [],
    };

    const response = await new Promise((resolve, reject) => {
      fetch(remoteURL, {
        headers: {
          Authorization: this.req.header("Authorization"),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          resolve({ error: err.toString() });
        });
    });

    const statistic = this.API.statistic.valueOrNot();
    const statistics = [];
    statistic.map((statis) => {
      const { display_name, fomular_alias, fomular, group_by } = statis;
      const statisRecord = { display_name };
      if (group_by && group_by.length > 0) {
        const rawData = response[fomular_alias];
        if (rawData != undefined) {
          if (fomular == "AVERAGE") {
            const headers = Object.keys(rawData);
            const values = Object.values(rawData).map(
              ({ total, value }) => value
            );

            statisRecord["data"] = { headers, values };
            statisRecord["type"] = "table";
          } else {
            const headers = Object.keys(rawData);
            const values = Object.values(rawData);
            statisRecord["data"] = { headers, values };
            statisRecord["type"] = "table";
          }
        }
      } else {
        statisRecord["type"] = "text";
        statisRecord["data"] = response[fomular_alias];
      }
      statistics.push(statisRecord);
    });

    const calculates = this.API.calculates.valueOrNot();
    const calculateDisplay = calculates.map((field) => {
      const { fomular_alias, display_name } = field;
      return { fomular_alias, display_name };
    });

    context.data = response.data;
    context.error = response.error;
    context.statistic = statistics;
    const fields = this.getFields(
      this.API.fields.valueOrNot().map((f) => f.id)
    );
    context.fields = [...fields, ...calculateDisplay];
    context.remote_server = this.project?.proxy_server;
    this.res.status(200).send(context);
  };

  setPropertyByPath = (data, path, value) => {
    if (data == undefined) {
      data = {};
    }
    if (path.length == 1) {
      data[path[0]] = value;
    } else {
      data[path[0]] = this.setPropertyByPath(
        data[path[0]],
        path.slice(1, path.length),
        value
      );
    }
    return data;
  };

  REMOTE_POST = async () => {
    let body = this.req.body;
    const remoteURL = this.generateRemoteURL();
    const requestBody = body;
    const apiBody = this.API.body.valueOrNot();
    const apiExternalBody = this.API.external_body.valueOrNot();

    for (let i = 0; i < apiExternalBody.length; i++) {
      const field = apiExternalBody[i];
      // console.log(field)
      const { fomular_alias, default_value } = field;
      body = this.setPropertyByPath(
        body,
        fomular_alias.split("."),
        default_value
      );
    }

    const response = await new Promise((resolve, reject) => {
      fetch(remoteURL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
        .then((res) => res.json())
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          resolve({
            success: false,
            error: err.toString(),
            content: "Remote server error",
          });
        });
    });

    const fields = this.getFields(
      this.API.fields.valueOrNot().map((f) => f.id)
    );
    const calculates = this.API.calculates.valueOrNot();
    const calculateDisplay = calculates.map((field) => {
      const { fomular_alias, display_name } = field;
      return { fomular_alias, display_name };
    });

    const statistic = this.API.statistic.valueOrNot();
    const statistics = [];
    statistic.map((statis) => {
      const { display_name, fomular_alias, fomular, group_by } = statis;
      const statisRecord = { display_name };
      if (group_by && group_by.length > 0) {
        const rawData = response[fomular_alias];
        if (rawData != undefined) {
          if (fomular == "AVERAGE") {
            const headers = Object.keys(rawData);
            const values = Object.values(rawData).map(
              ({ total, value }) => value
            );

            statisRecord["data"] = { headers, values };
            statisRecord["type"] = "table";
          } else {
            const headers = Object.keys(rawData);
            const values = Object.values(rawData);
            statisRecord["data"] = { headers, values };
            statisRecord["type"] = "table";
          }
        }
      } else {
        statisRecord["type"] = "text";
        statisRecord["data"] = response[fomular_alias];
      }
      statistics.push(statisRecord);
    });

    response.statistic = statistics;
    response.remote_server = this.project?.proxy_server;
    response.fields = [...fields, ...calculateDisplay];

    this.res.status(200).send(response);
  };

  REMOTE_PUT = async () => {
    const remoteURL = this.generateRemoteURL();
    const response = await new Promise((resolve, reject) => {
      fetch(remoteURL, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((res) => {
          resolve(res);
        });
    });

    this.res.status(200).send(response);
  };

  REMOTE_DELETE = async () => {
    const remoteURL = this.generateRemoteURL();
    const response = await new Promise((resolve, reject) => {
      fetch(remoteURL, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((res) => {
          resolve(res);
        });
    });

    this.res.status(200).send(response);
  };

  retrievePutData = async (req, res) => {
    this.writeReq(req);
    const { api_id } = req.params;
    const { url } = req;
    this.url = decodeURI(url);
    const [api, projects, tables, fields] = await Promise.all([
      this.#__apis.find({ api_id }),
      this.#__projects.findAll(),
      this.#__tables.findAll(),
      this.#__fields.findAll(),
    ]);
    if (api) {
      const Api = new ApisRecord(api);
      const project = projects[0];
      this.project = project;

      this.API = Api;
      this.req = req;
      this.res = res;
      this.fields = fields;
      this.tables = tables.map((table) => {
        const { id } = table;
        table.fields = fields.filter((field) => field.table_id == id);
        return table;
      });

      await this.GET_UI();
    } else {
      this.res.status(200).send("Not found");
    }
  };

  consumeSearch = async (req, res, api_id) => {
    this.writeReq(req);
    const start = new Date();

    const { url, method } = req;
    this.url = decodeURI(url);
    const [api, projects, tables, fields] = await Promise.all([
      this.#__apis.find({ api_id }),
      this.#__projects.findAll(),
      this.#__tables.findAll(),
      this.#__fields.findAll(),
    ]);
    if (api && api.status && api.api_method == method.toLowerCase()) {
      const Api = new ApisRecord(api);
      const project = projects[0];
      this.project = project;

      this.API = Api;
      this.req = req;
      this.res = res;
      this.fields = fields;
      this.tables = tables.map((table) => {
        const { id } = table;
        table.fields = fields.filter((field) => field.table_id == id);
        return table;
      });

      const { criteria } = req.body;
      req.body.query = { ...criteria };
      delete req.body.criteria;

      this.SEARCH_BROADCAST();
    } else {
      res.status(200).send({ success: false, content: "No API Found" });
    }
  };

  consumeExport = async (req, res, api_id) => {
    this.writeReq(req);

    const { url, method } = req;
    this.url = decodeURI(url);
    const [api, projects, tables, fields] = await Promise.all([
      this.#__apis.find({ api_id }),
      this.#__projects.findAll(),
      this.#__tables.findAll(),
      this.#__fields.findAll(),
    ]);
    // if (api && api.status && api.api_method == method.toLowerCase() ) {
    if (api && api.status) {
      const Api = new ApisRecord(api);
      const project = projects[0];
      this.project = project;

      this.API = Api;
      this.req = req;
      this.res = res;
      this.fields = fields;
      this.tables = tables.map((table) => {
        const { id } = table;
        table.fields = fields.filter((field) => field.table_id == id);
        return table;
      });

      const { export_type } = req.body;

      if (export_type == "excel") {
        this.EXPORT_EXCEL();
      } else {
        this.EXPORT_CSV();
      }
    } else {
      res.status(200).send({ success: false, content: "No API Found" });
    }
  };

  consumeImport = async (req, res, api_id) => {
    this.writeReq(req);

    const { url, method } = req;
    this.url = decodeURI(url);
    const [api, projects, tables, fields] = await Promise.all([
      this.#__apis.find({ api_id }),
      this.#__projects.findAll(),
      this.#__tables.findAll(),
      this.#__fields.findAll(),
    ]);
    // if (api && api.status && api.api_method == method.toLowerCase() ) {
    if (api && api.status) {
      const Api = new ApisRecord(api);
      const project = projects[0];
      this.project = project;

      this.API = Api;
      this.req = req;
      this.res = res;
      this.fields = fields;
      this.tables = tables.map((table) => {
        const { id } = table;
        table.fields = fields.filter((field) => field.table_id == id);
        return table;
      });

      const { type } = this.req.body;
      if (type == "import") {
        this.IMPORT();
      } else {
        this.DATA_VALIDATION();
      }
    } else {
      res.status(200).send({ success: false, content: "No API Found" });
    }
  };

  consumeStatis = async (req, res, api_id) => {
    this.writeReq(req);

    const { url, method } = req;
    this.url = decodeURI(url);
    const [api, projects, tables, fields] = await Promise.all([
      this.#__apis.find({ api_id }),
      this.#__projects.findAll(),
      this.#__tables.findAll(),
      this.#__fields.findAll(),
    ]);
    if (api && api.status && api.api_method == method.toLowerCase()) {
      // if (api && api.status) {
      const Api = new ApisRecord(api);
      const project = projects[0];
      this.project = project;

      this.API = Api;
      this.req = req;
      this.res = res;
      this.fields = fields;
      this.tables = tables.map((table) => {
        const { id } = table;
        table.fields = fields.filter((field) => field.table_id == id);
        return table;
      });

      this.STATIS();
    } else {
      res.status(200).send({ success: false, content: "No API Found" });
    }
  };

  validRecordOfDataByCriterias = (record, criterias = []) => {
    /**
     * Phân tích danh sách điều kiện từ trái sang phải, hiện tại chưa có ngoặc ưu tiên hay nhiều phân cấp
     * Phần tử đầu tiên kể như là điều kiện khởi đầu:
     *      - Nếu nó không tồn tại thì trả về true và lập tức kết thúc
     *      - Nếu nó true thì tiếp tục phân tích
     *      - Nếu nó false thì trả về false
     *
     */

    const firstCriteria = criterias[0];

    if (firstCriteria) {
      let fomular = firstCriteria.fomular;
      const NOW = new Date();

      const keys = Object.keys(record);
      keys.sort((key_1, key_2) => (key_1.length > key_2.length ? 1 : -1));

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        const field = this.getFieldByAlias(key);

        if (field && ["DATE", "DATETIME"].indexOf(field.DATATYPE) != -1) {
          const time = new Date(record[key]);

          fomular = fomular.replaceAll(key, time.getTime());
        } else {
          fomular = fomular.replaceAll(key, record[key]);
        }
      }
      const result = eval(fomular);
      // console.log( fomular, result )

      if (result) {
        criterias[0].value = true;

        const remainCriterias = criterias.slice(1, criterias.length);
        for (let i = 0; i < remainCriterias.length; i++) {
          const criteria = remainCriterias[i];

          const { operator } = criteria;

          let fomular = criteria.fomular;

          for (let j = 0; j < keys.length; j++) {
            const key = keys[j];

            const field = this.getFieldByAlias(key);

            if (field && ["DATE", "DATETIME"].indexOf(field.DATATYPE) != -1) {
              const time = new Date(record[key]);

              fomular = fomular.replaceAll(key, time.getTime());
            } else {
              fomular = fomular.replaceAll(key, record[key]);
            }
          }

          const nextResult = eval(fomular);
          criterias[i + 1].value = nextResult;
        }

        let final = result;

        for (let i = 1; i < criterias.length; i++) {
          const { operator, value } = criterias[i];
          if (final) {
            if (operator == "AND") {
              if (value && final) {
              } else {
                final = false;
              }
            }

            if (operator == "OR") {
              if (final || value) {
                final = false;
              } else {
                if (!final && !value) {
                  final = false;
                }
              }
            }
          } else {
            break;
          }
        }
        return final;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  STATIS = async () => {
    const tables = this.tearTablesAndFieldsToObjects();
    const table = tables[0];

    const api = await this.API.get();

    const { criterias, group_by, fomular, field } = api;

    const fields = [];
    tables.map((tb) => {
      fields.push(...tb.fields);
    });

    const query = this.req.body.criterias ? this.req.body.criterias : [];

    const formatedQuery = { $and: [] };
    const keys = Object.keys(query);

    keys.map((key) => {
      const qr = {};

      const [field] = this.getFieldsByAlias([key]);

      if (field) {
        const { DATATYPE, AUTO_INCREMENT } = field;
        if (
          Fields.stringFamily.indexOf(DATATYPE) != -1 ||
          (Fields.intFamily.indexOf(DATATYPE) != -1 && AUTO_INCREMENT)
        ) {
          /**
           *
           * This regex is restricted for string datatype
           *
           * An Int-family field with AUTO INCREMENT = true counts as a string field
           *
           */

          qr[`${key}`] = { $regex: query[key] }; //approximate
          // qr[`${key}`] = query[key] // exact
        } else {
          if (DATATYPE == "DATE" || DATATYPE == "DATETIME") {
            const date = new Date(query[key]);

            qr[`${key}`] = date;

            if (DATATYPE == "DATE") {
              // Mấy cái này sao này banh xác r tính
              // const day = date.getDate()
              // const month = date.getMonth() + 1
              // const year = date.getFullYear()
            }

            if (DATATYPE == "DATETIME") {
            }
          } else {
            qr[`${key}`] = query[key];
          }
        }

        formatedQuery["$and"].push(qr);
      }
    });

    const parsedCriterias = this.parseCriteriasToStrings(criterias);

    let partitions = [];

    const stringifiedPeriods = await Cache.getData(
      `${tables[0].table_alias}-periods`
    );
    const periods = stringifiedPeriods?.value;
    if (stringifiedPeriods && periods.length > 0) {
      partitions = periods;
    }

    let statistics = {};
    let averageCache = {};

    for (let i = 0; i < periods?.length; i++) {
      const period = periods[i];

      const { position } = period;

      const data = await Database.selectAll(table.table_alias, {
        $and: [...formatedQuery["$and"], { position }],
      });

      for (let k = 0; k < data.length; k++) {
        const record = data[k];
        const groupByStrings = [];

        const isRecordValid = this.validRecordOfDataByCriterias(
          record,
          parsedCriterias
        );

        if (isRecordValid) {
          for (let h = 0; h < group_by.length; h++) {
            const { fomular_alias } = group_by[h];
            groupByStrings.push(record[fomular_alias]);
          }

          if (groupByStrings.length == 0) {
            groupByStrings.push(field.field_name);
          }

          const currentValue = this.getPropByPath(statistics, groupByStrings);

          switch (fomular) {
            case "SUM":
              if (currentValue) {
                statistics = this.setPropByPath(
                  statistics,
                  groupByStrings,
                  currentValue + record[field.fomular_alias]
                );
              } else {
                statistics = this.setPropByPath(
                  statistics,
                  groupByStrings,
                  record[field.fomular_alias]
                );
              }
              break;
            case "AVERAGE":
              // Not tested yet
              if (currentValue) {
                const total = this.getPropByPath(averageCache, groupByStrings);
                let value = currentValue;
                const newValue =
                  (total * value + record[field.fomular_alias]) / (total + 1);
                statistics = this.setPropByPath(
                  statistics,
                  groupByStrings,
                  newValue
                );
                averageCache = this.setPropByPath(
                  averageCache,
                  groupByStrings,
                  total + 1
                );
              } else {
                statistics = this.setPropByPath(
                  statistics,
                  groupByStrings,
                  record[field.fomular_alias]
                );
                averageCache = this.setPropByPath(
                  averageCache,
                  groupByStrings,
                  1
                );
              }
              break;
            case "COUNT":
              if (currentValue) {
                statistics = this.setPropByPath(
                  statistics,
                  groupByStrings,
                  currentValue + 1
                );
              } else {
                statistics = this.setPropByPath(statistics, groupByStrings, 1);
              }
              break;
          }
        }
      }
    }
    this.res.status(200).send({
      success: true,
      content: "Succeed",
      statistics,
      fields: group_by,
    });
  };

  SEARCH = async () => {
    const tables = this.tearTablesAndFieldsToObjects();

    const table = tables[0];

    const { query, start_index, require_count, exact } = this.req.body;

    const start = (start_index ? start_index : 0) * RESULT_PER_SEARCH_PAGE;
    const end = start + RESULT_PER_SEARCH_PAGE;

    const keys = Object.keys(query);
    const fields = this.getFieldsByTableId(table.id);
    const result = [];
    let index = 0;
    let count = 0;

    const isAtLeastOneCriteriaIsNotNull = keys.filter((key) => {
      const value = query[key];
      return value;
    });

    if (isAtLeastOneCriteriaIsNotNull.length > 0) {
      const formatedQuery = { $and: [] };
      keys.map((key) => {
        const qr = {};
        qr[`${key}`] = { $regex: query[key] };
        formatedQuery["$and"].push(qr);
      });

      const data = await Database.selectFrom(
        table.table_alias,
        formatedQuery,
        start,
        end
      );

      let count;
      if (require_count) {
        count = await Database.count(table.table_alias, formatedQuery);
      }

      this.res.send({
        success: true,
        total: result.length,
        result,
        fields,
        data,
        count: count,
      });
    } else {
      this.req.body = {
        table_id: table.id,
        start_index: 0,
        criteria: {},
        require_count: false,
        exact: false,
        api_id: undefined,
      };
      this.FOREIGNDATA(this.req, this.res);
    }
  };

  SEARCH_BROADCAST = async () => {
    const tables = this.tearTablesAndFieldsToObjects();

    const table = tables[0];

    const { query, start_index, require_count, require_statistic, exact } =
      this.req.body;

    const RESULT_PER_SEARCH_PAGE = this.req.header("data-amount")
      ? parseInt(this.req.header("data-amount"))
      : 15;

    const start = (start_index ? start_index : 0) * RESULT_PER_SEARCH_PAGE;
    const end = start + RESULT_PER_SEARCH_PAGE;

    const keys = Object.keys(query);
    const fields = this.getFieldsByTableId(table.id);
    const result = [];
    let index = 0;
    let count = 0;

    const isAtLeastOneCriteriaIsNotNull = keys.filter((key) => {
      const value = query[key];
      return value != undefined;
    });

    // console.log(isAtLeastOneCriteriaIsNotNull)

    if (isAtLeastOneCriteriaIsNotNull.length > 0) {
      const formatedQuery = { $and: [] };
      keys.map((key) => {
        const qr = {};

        const [field] = this.getFieldsByAlias([key]);

        if (field) {
          const { DATATYPE, AUTO_INCREMENT } = field;
          if (
            Fields.stringFamily.indexOf(DATATYPE) != -1 ||
            (Fields.intFamily.indexOf(DATATYPE) != -1 && AUTO_INCREMENT)
          ) {
            /**
             *
             * This regex is restricted for string datatype
             *
             * An Int-family field with AUTO INCREMENT = true counts as a string field
             *
             */

            qr[`${key}`] = { $regex: query[key] }; //approximate
            // qr[`${key}`] = query[key] // exact
          } else {
            if (DATATYPE == "DATE" || DATATYPE == "DATETIME") {
              const date = new Date(query[key]);

              qr[`${key}`] = date;

              if (DATATYPE == "DATE") {
                // Mấy cái này sau này banh xác r tính
                // const day = date.getDate()
                // const month = date.getMonth() + 1
                // const year = date.getFullYear()
              }

              if (DATATYPE == "DATETIME") {
              }
            } else {
              if (Fields.intFamily.indexOf(DATATYPE) != -1) {
                qr[`${key}`] = parseInt(query[key]);
              } else {
                if (Fields.floatFamily.indexOf(DATATYPE) != -1) {
                  qr[`${key}`] = parseFloat(query[key]);
                } else {
                  qr[`${key}`] = query[key];
                }
              }
            }
          }

          formatedQuery["$and"].push(qr);
        }
      });

      const data = await Database.selectFrom(
        table.table_alias,
        formatedQuery,
        start,
        end
      );
      let count = 0;

      const statistics = this.API.statistic.valueOrNot();
      const statisData = {};
      const calculates = this.API.calculates.valueOrNot();
      const statistic = [];
      if (require_count) {
        count = await Database.count(table.table_alias, formatedQuery);
        // // console.log("REQ COUNT", count)
      }

      if (require_statistic) {
        count = await Database.count(table.table_alias, formatedQuery);
        // // console.log("REQ STATIS", count)

        if (statistics.length > 0) {
          for (let i = 0; i < count; i += 10000) {
            const tmpData = await Database.selectFrom(
              table.table_alias,
              formatedQuery,
              i,
              i + 10000
            );

            for (let j = 0; j < tmpData.length; j++) {
              const record = tmpData[j];

              const keys = Object.keys(record);

              keys.sort((key_1, key_2) =>
                key_1.length > key_2.length ? 1 : -1
              );

              for (let k = 0; k < calculates.length; k++) {
                const { fomular_alias, fomular } = calculates[k];
                let result = this.formatCalculateString(fomular);
                keys.map((key) => {
                  /* replace the goddamn fomular with its coresponding value in record values */
                  result = result.replaceAll(key, record[key]);
                });
                try {
                  record[fomular_alias] = eval(result);
                } catch {
                  record[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                }
              }

              statistics.map((statis) => {
                const { field, fomular_alias, fomular, group_by } = statis;
                const statisRecord = statisData[fomular_alias];

                const stringifiedKey = group_by
                  .map((group) => record[group])
                  .join("_");

                if (!statisRecord) {
                  if (group_by && group_by.length > 0) {
                    statisData[fomular_alias] = {};
                  } else {
                    statisData[fomular_alias] = 0;
                  }
                }

                if (fomular == "SUM") {
                  if (group_by && group_by.length > 0) {
                    if (!statisData[fomular_alias][stringifiedKey]) {
                      statisData[fomular_alias][stringifiedKey] = record[field];
                    } else {
                      statisData[fomular_alias][stringifiedKey] +=
                        record[field];
                    }
                  } else {
                    statisData[fomular_alias] += record[field];
                  }
                }

                if (fomular == "AVERAGE") {
                  if (group_by && group_by.length > 0) {
                    if (!statisData[fomular_alias][stringifiedKey]) {
                      statisData[fomular_alias][stringifiedKey] = {
                        total: 1,
                        value: record[field],
                      };
                    } else {
                      statisData[fomular_alias][stringifiedKey].value =
                        (statisData[fomular_alias][stringifiedKey].value *
                          statisData[fomular_alias][stringifiedKey].total +
                          record[field]) /
                        (statisData[fomular_alias][stringifiedKey].total + 1);
                      statisData[fomular_alias][stringifiedKey].total += 1;
                    }
                  } else {
                    statisData[fomular_alias] =
                      (statisData[fomular_alias] * (count - 1) +
                        record[field]) /
                      count;
                  }
                }

                if (fomular == "COUNT") {
                  if (group_by && group_by.length > 0) {
                    if (!statisData[fomular_alias][stringifiedKey]) {
                      statisData[fomular_alias][stringifiedKey] = 1;
                    } else {
                      statisData[fomular_alias][stringifiedKey] += 1;
                    }
                  } else {
                    statisData[fomular_alias] += 1;
                  }
                }
              });
            }
          }
          statistics.map((statis) => {
            const { display_name, fomular_alias, group_by, fomular } = statis;
            const statisRecord = { display_name };
            if (group_by && group_by.length > 0) {
              const rawData = statisData[fomular_alias];
              if (rawData != undefined) {
                if (fomular == "AVERAGE") {
                  const headers = Object.keys(rawData);
                  const values = Object.values(rawData).map(
                    ({ total, value }) => value
                  );

                  statisRecord["data"] = { headers, values };
                  statisRecord["type"] = "table";
                } else {
                  const headers = Object.keys(rawData);
                  const values = Object.values(rawData);
                  statisRecord["data"] = { headers, values };
                  statisRecord["type"] = "table";
                }
              }
            } else {
              statisRecord["type"] = "text";
              statisRecord["data"] = statisData[fomular_alias];
            }
            statistic.push(statisRecord);
          });
        }
      }

      data.map((record) => {
        const keys = Object.keys(record);

        keys.sort((key_1, key_2) => (key_1.length > key_2.length ? 1 : -1));

        for (let k = 0; k < calculates.length; k++) {
          const { fomular_alias, fomular } = calculates[k];
          let result = this.formatCalculateString(fomular);
          keys.map((key) => {
            /* replace the goddamn fomular with its coresponding value in record values */
            result = result.replaceAll(key, record[key]);
          });
          try {
            record[fomular_alias] = eval(result);
          } catch {
            record[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
          }
        }
      });

      const result = data;

      this.res.send({
        success: true,
        total: result.length,
        fields: [...fields, ...calculates],
        data: result,
        count: count,
        statistic,
      });
    } else {
      this.req.body = {
        table_id: table.id,
        start_index: 0,
        criteria: {},
        require_count: false,
        exact: false,
        api_id: undefined,
      };
      this.FOREIGNDATA(this.req, this.res);
    }
  };

  // SEARCH = async () => {

  //     const tables = this.tearTablesAndFieldsToObjects()

  //     const table = tables[0]

  //     const { query, start_index, require_count, exact } = this.req.body;

  //     let start = (start_index ? start_index : 0) * RESULT_PER_SEARCH_PAGE
  //     const end = start + RESULT_PER_SEARCH_PAGE

  //     const keys = Object.keys(query)
  //     const fields = this.getFieldsByTableId(table.id)
  //     const result = []
  //     let index = 0
  //     let count = 0;

  //     const isAtLeastOneCriteriaIsNotNull = keys.filter(key => {
  //         const value = query[key];
  //         return value
  //     })

  //     if (isAtLeastOneCriteriaIsNotNull.length > 0) {

  //         const formatedQuery = { $and: [] }
  //         keys.map(key => {
  //             const qr = {}
  //             qr[`data.${key}`] = { $regex: query[key] }
  //             formatedQuery["$and"].push(qr)
  //         })

  //         const dbo = await Database.getDBO()
  //         const regexMatches = { $and: [] }
  //         keys.map(key => {
  //             const match = {
  //                 input: `$$item.${key}`,
  //                 regex: query[key]
  //             }
  //             regexMatches["$and"].push({
  //                 $regexMatch: match
  //             })
  //         })

  //         const startTime = new Date()

  //         const filtedData = await dbo.collection(table.table_alias).aggregate([
  //             { $match: formatedQuery },
  //             {
  //                 $project: {
  //                     data: {
  //                         $filter: {
  //                             input: `$data`,
  //                             as: `item`,
  //                             cond: regexMatches
  //                         }
  //                     }
  //                 }
  //             }]
  //         ).toArray()

  //         const endTime = new Date()
  //         // // console.log(`FILTING DATA IN ${ endTime - startTime }`)

  //         let indexCounter = 0
  //         for( let i = 0 ; i < filtedData.length ; i++ ){
  //             const { data } = filtedData[i]
  //             if( require_count ){
  //                 count += data.length;

  //                 indexCounter += data.length;

  //                 if(start - indexCounter < 0 && result.length < RESULT_PER_SEARCH_PAGE ){
  //                     result.push( ...data.slice( start, start + RESULT_PER_SEARCH_PAGE ) )
  //                     start -= result.length
  //                 }
  //             }else{
  //                 if(result.length == RESULT_PER_SEARCH_PAGE){
  //                     break;
  //                 }else{
  //                     indexCounter += data.length;

  //                     if(start - indexCounter < 0 && result.length < RESULT_PER_SEARCH_PAGE ){
  //                         result.push( ...data.slice( start, start + RESULT_PER_SEARCH_PAGE ) )
  //                         start -= result.length
  //                     }
  //                 }
  //             }
  //         }

  //         let calculateData = result
  //         const calculates = this.API.calculates.valueOrNot();

  //         if (calculates.length > 0) {
  //             calculateData = calculateData.map(record => {
  //                 const calculateValue = {};
  //                 const keys = Object.keys(record)
  //                 keys.sort((key_1, key_2) => key_1.length > key_2.length ? 1 : -1);
  //                 for (let i = 0; i < calculates.length; i++) {
  //                     const { fomular_alias, fomular } = calculates[i]
  //                     let result = fomular;
  //                     keys.map(key => {
  //                         /* replace the goddamn fomular with its coresponding value in record values */
  //                         result = result.replaceAll(key, record[key])
  //                     })
  //                     try {
  //                         calculateValue[fomular_alias] = eval(result)
  //                     } catch {
  //                         calculateValue[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
  //                     }
  //                 }
  //                 return { ...record, ...calculateValue }
  //             })
  //         }

  //         this.res.send({
  //             success: true,
  //             total: calculateData.length,
  //             result: calculateData,
  //             fields: [...fields, ...calculates],
  //             data: calculateData,
  //             count: count
  //         })
  //     } else {
  //         this.req.body = {
  //             table_id: table.id,
  //             start_index: 0,
  //             criteria: {},
  //             require_count: false,
  //             exact: false,
  //             api_id: undefined
  //         }
  //         this.FOREIGNDATA(this.req, this.res)
  //     }
  // }

  hasEnoughPrivileges = (tables, rights, privileges) => {
    if (tables.length && tables.length > 0) {
      let isGranted = true;
      for (let i = 0; i < tables.length; i++) {
        const table_id = tables[i].id;
        const tablePrivileges = privileges.filter(
          (pri) => pri.table_id == table_id
        );

        for (let j = 0; j < tablePrivileges.length; j++) {
          const privilege = tablePrivileges[j];
          for (let h = 0; h < rights.length; h++) {
            const right = rights[h];
            // // // console.log(tables[i].table)
            // // // console.log(privilege[right])
            // // // console.log(privilege)
            // // // console.log(right)
            if (!privilege[right]) {
              isGranted = false;
            }
          }
        }
      }

      return isGranted;
    } else {
      return false;
    }
  };

  FOREIGNDATA = async (req, res) => {
    this.writeReq(req);

    const verified = await this.verifyToken(req);

    if (verified) {
      const user = this.decodeToken(req.header("Authorization"));
      const { table_id, start_index, criteria, require_count, exact, api_id } =
        req.body;
      const [tables, fields, privileges] = await Promise.all([
        this.#__tables.findAll(),
        this.#__fields.findAll(),
        this.#__privileges.findAll({ username: user.username }),
      ]);

      const table = tables.find((tb) => tb.id == table_id);

      if (table && req.method.toLowerCase() == "post") {
        // // // console.log(3220, privileges)
        const tbFields = fields.filter((f) => f.table_id == table_id);

        let api = await this.#__apis.find({ api_id });
        if (api == undefined) {
          api = {
            id: undefined,
            api_id: undefined,
            api_name: undefined,
            tables: [table.id],
            fields: tbFields.map((field) => {
              return {
                id: field.id,
                display_name: field.field_name,
                fomular_alias: field.fomular_alias,
              };
            }),
            body: tbFields.map((field) => field.id),
            params: table.primary_key,
          };
        }

        const api_table = tables.find((tb) => tb.id == api.tables[0]);
        let isGranted = this.hasEnoughPrivileges(
          [api_table],
          ["read"],
          privileges
        );

        if (this.isAdmin(user) || isGranted) {
          const Api = new ApisRecord(api);
          this.API = Api;
          this.req = req;
          this.res = res;

          this.fields = fields;
          this.tables = tables.map((table) => {
            const { id } = table;
            table.fields = fields.filter((field) => field.table_id == id);
            return table;
          });

          if (!criteria || objectComparator(criteria, {})) {
            this.API.params.value([]);
            this.GET_UI(start_index);
          } else {
            this.req.body = {
              query: criteria,
              start_index,
              require_count,
              exact,
            };
            this.SEARCH();
          }
        } else {
          res.status(200).send({
            success: false,
            content: "Không có quyền truy cập API này",
          });
        }
      } else {
        res.status(200).send({ success: false, content: "No TABLE Found" });
      }
    } else {
      res.status(200).send({ success: false, content: "Token không hợp lệ" });
    }
  };

  EXPORT_CSV = async () => {
    const start = new Date();
    const { criteria, export_fields } = this.req.body;

    const EXPORTER = "Khánh Chi Nè";
    const tables = this.tearTablesAndFieldsToObjects();

    const table = tables[0];
    let fields = this.fields.filter((field) => field.table_id == table.id);

    if (export_fields != undefined && export_fields.length > 0) {
      const rawFields = export_fields
        .map((alias) =>
          this.fields.find((field) => field.fomular_alias == alias)
        )
        .filter((field) => field != undefined);

      if (rawFields.length > 0) {
        fields = rawFields;
      } else {
        fields = [];
      }
    }

    const calculates = this.API.calculates.valueOrNot();
    const keys = fields.map((field) => field.fomular_alias);
    keys.sort((key_1, key_2) => (key_1.length > key_2.length ? 1 : -1));

    if (fields.length != 0) {
      const csvHeaders = [
        ...fields.map((field) => field.field_name),
        ...calculates.map((cal) => cal.display_name),
      ];
      const csvData = [];
      csvData.push(csvHeaders);
      const cache = await Cache.getData(`${table.table_alias}-periods`);
      const periods = cache.value;

      if (criteria == undefined || objectComparator(criteria, {})) {
        for (let i = 0; i < periods.length; i++) {
          const period = periods[i];
          const { position } = period;
          const data = await Database.selectAll(table.table_alias, {
            position,
          });
          csvData.push(
            ...data.map((record) => {
              const tmp = {};
              fields.map((field) => {
                tmp[field.fomular_alias] = record[field.fomular_alias];
              });

              calculates.map((calc) => {
                const { fomular, fomular_alias } = calc;
                let result = this.formatCalculateString(fomular);
                keys.map((key) => {
                  result = result.replaceAll(key, record[key]);
                });

                try {
                  tmp[fomular_alias] = eval(result);
                } catch {
                  tmp[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                }
              });

              return Object.values(tmp);
            })
          );
        }
      } else {
        const keys = Object.keys(criteria);
        for (let i = 0; i < periods.length; i++) {
          const period = periods[i];
          const { position } = period;
          const data = await Database.select(table.table_alias, { position });
          for (let j = 0; j < data.length; j++) {
            const record = data[j];
            delete record.id;
            delete record.position;
            let isValid = true;
            keys.map((key) => {
              if (record[key] != undefined && criteria[key] != undefined) {
                const recordProp = translateUnicodeToBlanText(
                  record[key].toString().toLowerCase()
                );
                const value = translateUnicodeToBlanText(
                  criteria[key].toString().toLowerCase()
                );

                if (!recordProp.includes(value)) {
                  isValid = false;
                }
              } else {
                isValid = false;
              }
            });
            if (isValid) {
              const tmp = {};
              fields.map((field) => {
                tmp[field.fomular_alias] = record[field.fomular_alias];
              });

              calculates.map((calc) => {
                const { fomular, fomular_alias } = calc;
                let result = this.formatCalculateString(fomular);
                keys.map((key) => {
                  result = result.replaceAll(key, record[key]);
                });

                try {
                  tmp[fomular_alias] = eval(result);
                } catch {
                  tmp[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                }
              });

              csvData.push(Object.values(tmp));
            }
          }
        }
      }

      const csvString = await fastcsv.writeToString(csvData, {
        headers: false,
        quoteColumns: true,
      });
      const end = new Date();

      this.res.setHeader("Content-Type", "text/csv; charset=ANSI");
      this.res.setHeader(
        "Content-Disposition",
        "attachment; filename=data.csv"
      );

      this.res.send(csvString);
    } else {
      this.res.send({ success: false, content: "No fields found!" });
    }
  };

  EXPORT_EXCEL = async () => {
    function styleHeaders(ws) {
      const headerStyle = {
        fill: {
          fgColor: { rgb: "008000" },
        },
        font: {
          bold: true,
          color: { rgb: "fffffff" },
        },
      };

      const colNum = XLSX.utils.decode_range(ws["!ref"]).e.c + 1;
      for (let i = 0; i < colNum; ++i) {
        const cellRef = XLSX.utils.encode_cell({ c: i, r: 0 });
        if (ws[cellRef]) {
          ws[cellRef].s = headerStyle;
        }
      }
    }

    const start = new Date();
    const {
      criteria,
      export_fields,
      condition_fields,
      unique_fields,
      data_for_filtering,
    } = this.req.body;
    const tables = this.tearTablesAndFieldsToObjects();
    const table = tables[0];
    let fields = this.fields.filter((field) => field.table_id == table.id);

    const tableFields = fields;

    if (export_fields != undefined && export_fields.length > 0) {
      const rawFields = export_fields
        .map((alias) =>
          this.fields.find((field) => field.fomular_alias == alias)
        )
        .filter((field) => field != undefined);

      if (rawFields.length > 0) {
        fields = rawFields;
      } else {
        fields = [];
      }
    }

    const selectedHeaders = fields;

    const headerRow = selectedHeaders.reduce(
      (obj, header) => ({
        ...obj,
        [header.fomular_alias]: `${header.field_name}(${header.fomular_alias}${
          condition_fields[header.fomular_alias] ? `-c` : ""
        }${unique_fields[header.fomular_alias] ? `-u` : ""})`,
      }),
      {}
    );

    const calculates = this.API.calculates.valueOrNot();

    calculates.map((calc) => {
      const { fomular_alias, display_name } = calc;
      headerRow[fomular_alias] = display_name;
    });
    const newCsvData = [headerRow];

    const keys = tableFields.map((field) => field.fomular_alias);
    keys.sort((key_1, key_2) => (key_1.length > key_2.length ? 1 : -1));

    const splittedData = [];

    if (fields.length != 0) {
      const cache = await Cache.getData(`${table.table_alias}-periods`);
      const periods = cache?.value || [];
      if (criteria == undefined || objectComparator(criteria, {})) {
        for (let i = 0; i < periods.length; i++) {
          const period = periods[i];
          const { position } = period;
          const data = await Database.selectAll(
            table.table_alias,
            {
              // position,
            },
            {
              skip: Number(data_for_filtering?.from),
              limit: Number(data_for_filtering?.to - data_for_filtering?.from),
            }
          );
          // console.log(
          //   "SELECT HERE:",
          //   data.length,
          //   data_for_filtering,
          //   table.table_alias
          // );
          // return;
          newCsvData.push(
            ...data.map((record) => {
              const tmp = {};
              fields.map((field) => {
                tmp[field.fomular_alias] = record[field.fomular_alias];
              });

              calculates.map((calc) => {
                const { fomular, fomular_alias } = calc;
                let result = this.formatCalculateString(fomular);
                keys.map((key) => {
                  result = result.replaceAll(key, record[key]);
                });

                try {
                  tmp[fomular_alias] = eval(result);
                } catch {
                  tmp[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                }
              });

              return tmp;
            })
          );
        }
      } else {
        const keys = Object.keys(criteria);
        for (let i = 0; i < periods.length; i++) {
          const period = periods[i];
          const { position } = period;

          const data = await Database.selectAll(table.table_alias, {
            position,
          });

          for (let j = 0; j < data.length; j++) {
            const record = data[j];
            delete record.id;
            delete record.__position__;
            let isValid = true;
            keys.map((key) => {
              if (record[key] != undefined && criteria[key] != undefined) {
                const recordProp = translateUnicodeToBlanText(
                  record[key].toString().toLowerCase()
                );
                const value = translateUnicodeToBlanText(
                  criteria[key].toString().toLowerCase()
                );

                if (!recordProp.includes(value)) {
                  isValid = false;
                }
              } else {
                isValid = false;
              }
            });
            if (isValid) {
              const tmp = {};
              fields.map((field) => {
                tmp[field.fomular_alias] = record[field.fomular_alias];
              });

              calculates.map((calc) => {
                const { fomular, fomular_alias } = calc;
                let result = this.formatCalculateString(fomular);
                keys.map((key) => {
                  result = result.replaceAll(key, record[key]);
                });

                try {
                  tmp[fomular_alias] = eval(result);
                } catch {
                  tmp[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
                }
              });
              const finalResult = {};
              const finaleFields = [...fields, ...calculates];
              finaleFields.map((field) => {
                finalResult[field.fomular_alias] = tmp[field.fomular_alias];
              });
              newCsvData.push(finalResult);
            }
          }
        }
      }
      const ws = XLSX.utils.json_to_sheet(newCsvData, { skipHeader: true });

      styleHeaders(ws);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, table.table_name);

      const statistics = this.API.statistic.valueOrNot();
      const statisData = [];
      const sumerize = await Database.select(table.table_alias, {
        position: "sumerize",
      });

      for (let i = 0; i < statistics.length; i++) {
        const statis = statistics[i];
        const { display_name, fomular_alias, fomular, group_by } = statis;
        const statisRecord = { display_name };
        if (group_by && group_by.length > 0) {
          const rawData = sumerize[fomular_alias];
          if (rawData != undefined) {
            if (fomular == "AVERAGE") {
              const headers = Object.keys(rawData);
              const values = Object.values(rawData).map(
                ({ total, value }) => value
              );

              statisRecord["data"] = { headers, values };
              statisRecord["type"] = "table";
            } else {
              const headers = Object.keys(rawData);
              const values = Object.values(rawData);
              statisRecord["data"] = { headers, values };
              statisRecord["type"] = "table";
            }
          }
        } else {
          statisRecord["type"] = "text";
          statisRecord["data"] = sumerize[fomular_alias];
        }
        statisData.push(statisRecord);
      }

      for (let i = 0; i < statisData.length; i++) {
        const { type, data, display_name } = statisData[i];
        if (type == "table") {
          const { headers, values } = data;
          const recordsData = [
            {
              key: "Tiêu chí",
              value: "Kết quả",
            },
          ];
          headers.map((header, index) => {
            const record = {
              ["key"]: header,
              ["value"]: values[index],
            };
            recordsData.push(record);
          });
          const ws = XLSX.utils.json_to_sheet(recordsData, {
            skipHeader: true,
          });
          styleHeaders(ws);
          XLSX.utils.book_append_sheet(wb, ws, display_name.slice(0, 30));
        } else {
          const recordsData = [
            {
              key: "Tiêu chí",
              value: "Kết quả",
            },
            {
              key: display_name,
              value: data,
            },
          ];
          const ws = XLSX.utils.json_to_sheet(recordsData, {
            skipHeader: true,
          });
          styleHeaders(ws);
          XLSX.utils.book_append_sheet(wb, ws, display_name.slice(0, 30));
        }
      }

      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

      this.res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      this.res.setHeader(
        "Content-Disposition",
        "attachment; filename=export.xlsx"
      );

      this.res.send(buffer);
    } else {
      this.res.send({ success: false, content: "No fields found!" });
    }
  };

  FormingImportData = async (record, autoID) => {
    const { table, import_fields, primaryFields, primaryKeys, foreignKeys } =
      this;
    const { table_alias } = table;
    const data = record;
    const body = import_fields;
    for (let j = 0; j < body.length; j++) {
      const field = body[j];

      const { fomular_alias } = field;
      const { DATATYPE, AUTO_INCREMENT, PATTERN, id } = field;
      if (record[fomular_alias] != undefined) {
        const primaryKey = primaryKeys.find((key) => key == id);
        if (primaryKey) {
          const foreignKey = foreignKeys.find((key) => key.field.id == id);
          if (foreignKey) {
            data[fomular_alias] = record[fomular_alias];
          } else {
            if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
              data[fomular_alias] = await this.makeAutoIncreament(
                table_alias,
                PATTERN,
                autoID
              );
            } else {
              data[fomular_alias] = record[fomular_alias];
            }
          }
        }
      } else {
        if (Fields.isIntFamily(DATATYPE) && AUTO_INCREMENT) {
          const foreignKey = foreignKeys.find((key) => key.field_id == id);
          if (foreignKey) {
            const foreignField = this.getField(foreignKey.ref_field_id);
            const foreignTable = this.getTable(foreignField.table_id);
            data[fomular_alias] = await this.makeAutoIncreament(
              foreignTable.table_alias,
              PATTERN,
              autoID
            );
          } else {
            data[fomular_alias] = await this.makeAutoIncreament(
              table_alias,
              PATTERN,
              autoID
            );
          }
        } else {
          data[fomular_alias] = record[fomular_alias];
        }
      }
    }
    return record;
  };

  DATA_VALIDATION = async () => {
    const start = new Date();
    const data = this.req.body.data ? this.req.body.data : [];
    const tables = this.tearTablesAndFieldsToObjects();
    const table = tables[0];

    const { fields, primary_key, foreign_keys, table_alias } = table;
    this.import_fields = this.getFieldsByTableId(table.id);
    this.primaryKeys = primary_key;
    this.primaryFields = this.getFields(primary_key);
    this.table = table;
    const rawIndices = [];

    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      const fields = this.getFieldsByTableId(table.id);
      const fieldAliases = fields.map((field) => field.fomular_alias);

      let areAllAliasesEquivalent = true;
      for (let i = 0; i < keys.length; i++) {
        if (fieldAliases.indexOf(keys[i]) == -1) {
          areAllAliasesEquivalent = false;
        }
      }

      if (areAllAliasesEquivalent) {
        for (let i = 0; i < data.length; i++) {
          rawIndices.push(i);
        }

        this.foreignKeys = foreign_keys.map((key) => {
          const { field_id, table_id, ref_field_id } = key;
          const table = this.getTable(table_id);
          const [field] = this.getFields([field_id]);
          const [refField] = this.getFields([ref_field_id]);
          return { table, field, refField };
        });

        const formedData = [];
        for (let i = 0; i < data.length; i++) {
          const record = data[i];
          const index = i;
          const formedRecord = await this.FormingImportData(record);
          formedData.push(formedRecord);
        }

        const primaryDataSet = formedData.map((record) => {
          const primaryQuery = {};
          this.primaryFields.map((field) => {
            primaryQuery[field.fomular_alias] = record[field.fomular_alias];
          });
          return primaryQuery;
        });

        // PRIMARY KEY CHECK

        const primaryData = await Database.selectAll(table.table_alias, {
          $or: primaryDataSet,
        });
        const serializedPrimaryData = {};
        primaryData.map((record) => {
          const key = this.primaryFields
            .map((field) => record[field.fomular_alias])
            .join("");
          serializedPrimaryData[key] = record;
        });
        // FOREIGN KEYS CHECK

        const serializedForeignData = {};
        for (let i = 0; i < foreign_keys.length; i++) {
          const master = foreign_keys[i];
          const { table_id, field_id, ref_field_id } = master;
          const masterTable = this.getTable(table_id);
          const field = this.getField(field_id);
          const refField = this.getField(ref_field_id);

          const foreignDataSet = formedData.map(
            (record) => record[field.fomular_alias]
          );
          const foreignData = await Database.selectAll(
            masterTable.table_alias,
            { [refField.fomular_alias]: { $in: foreignDataSet } }
          );
          const serialized = {};
          foreignData.map((record) => {
            delete record._id;
            serialized[record[refField.fomular_alias]] = record;
          });

          serializedForeignData[masterTable.table_alias] = serialized;
        }

        const checkedData = [];

        for (let i = 0; i < formedData.length; i++) {
          let record = formedData[i];
          record.errors = {
            primary: false,
            foreign: [],
            duplicate: false,
            type: [],
          };

          for (let j = 0; j < fields.length; j++) {
            const field = fields[j];
            const check = this.parseType(field, record[field.fomular_alias]);
            const { valid, result, reason } = check;
            if (valid) {
              record[field.fomular_alias] = result;
            } else {
              record.errors.type.push(field.fomular_alias);
            }
          }

          if (record.errors.type.length == 0) {
            let cloneCheckData = [...checkedData];
            for (let j = 0; j < this.primaryFields.length; j++) {
              const field = this.primaryFields[j];
              cloneCheckData = cloneCheckData.filter(
                (row) => row[field.fomular_alias] == record[field.fomular_alias]
              );
            }

            if (cloneCheckData.length > 0) {
              record.errors.duplicate = true;
            } else {
              const corespondingPrimaryKey = this.primaryFields
                .map((field) => record[field.fomular_alias])
                .join("");
              const corespondingPrimaryData =
                serializedPrimaryData[corespondingPrimaryKey];

              if (corespondingPrimaryData) {
                record.errors.primary = true;
              } else {
                for (let j = 0; j < this.foreignKeys.length; j++) {
                  const { table, field, refField } = this.foreignKeys[j];

                  const corespondingForeignData =
                    serializedForeignData[table.table_alias][
                      record[field.fomular_alias]
                    ];
                  if (corespondingForeignData) {
                    record = { ...record, ...corespondingForeignData };
                  } else {
                    record.errors.foreign.push(field.fomular_alias);
                  }
                }
              }
              checkedData.push(record);
            }
          }
          /** CHECK KEYS AND FILL ERRORS */
          delete record.position;
          formedData[i] = record;
        }

        this.res.send({ success: true, data: formedData });
      } else {
        this.res.send({ success: false });
      }
    } else {
      this.res.send({ success: false, data: [] });
    }
  };

  IMPORT = async () => {
    const start = new Date();

    const { data } = this.req.body;
    const tables = this.tearTablesAndFieldsToObjects();
    const table = tables[0];
    const fields = this.getFieldsByTableId(table.id);
    if (data && data.length > 0) {
      // if ( false ) {

      data.map((record) => {
        delete record.errors;
        fields.map((field) => {
          const { valid, result } = this.parseType(
            field,
            record[field.fomular_alias]
          );
          if (valid) {
            record[field.fomular_alias] = result;
          } else {
            record[field.fomular_alias] = "NULL";
          }
        });
      });

      let cache = await Cache.getData(`${table.table_alias}-periods`);
      if (!cache) {
        cache = {
          key: `${table.table_alias}-periods`,
          value: [],
        };
        await Cache.setData(`${table.table_alias}-periods`, []);
      }

      const periods = cache.value;
      const sumerizes = await Database.selectAll(table.table_alias, {
        position: "sumerize",
      });

      let sumerize = sumerizes[0];

      if (!sumerize) {
        sumerize = {
          position: "sumerize",
          total: 0,
        };
        await Database.insert(table.table_alias, sumerize);
      }

      const positions = [];
      for (let j = 0; j < periods.length; j++) {
        const { position, total } = periods[j];

        if (total < TOTAL_DATA_PER_PARTITION) {
          const amount = TOTAL_DATA_PER_PARTITION - total;
          for (let h = 0; h < amount; h++) {
            positions.push(position);
            periods[j].total += 1;
            if (positions.length >= data.length) {
              break;
            }
          }
        }
      }

      if (positions.length < data.length) {
        const newPartition = this.translateColIndexToName(periods.length);
        const amount = data.length - positions.length;
        for (let i = 0; i < amount; i++) {
          positions.push(newPartition);
        }

        const newPeriods = {
          position: newPartition,
          total: amount,
        };
        periods.push(newPeriods);
      }

      data.map((record, index) => {
        record.position = positions[index];
      });
      await Database.insertMany(table.table_alias, data);
      await Cache.setData(`${table.table_alias}-periods`, periods);

      sumerize.total += data.length;

      // // // console.log(sumerize)

      const calculates = this.API.calculates.valueOrNot();
      const statistics = this.API.statistic.valueOrNot();

      if (calculates.length > 0) {
        const keys = Object.keys(data[0]);
        keys.sort((key_1, key_2) => (key_1.length > key_2.length ? 1 : -1));

        for (let i = 0; i < calculates.length; i++) {
          const { fomular, fomular_alias } = calculates[i];

          data.map((record) => {
            let result = this.formatCalculateString(fomular);

            keys.map((key) => {
              result = result.replaceAll(key, record[key]);
            });

            try {
              record[fomular_alias] = eval(result);
            } catch {
              record[fomular_alias] = `${DEFAULT_ERROR_CALCLATED_VALUE}`;
            }
          });
        }
      }
      if (statistics.length > 0) {
        for (let i = 0; i < statistics.length; i++) {
          const { fomular_alias, field, group_by, fomular } = statistics[i];
          for (let h = 0; h < data.length; h++) {
            const stringifyGroupKey = group_by
              .map((group) => data[h][group])
              .join("_");
            const statisField = sumerize[fomular_alias];

            if (!statisField) {
              if (group_by.length > 0) {
                sumerize[fomular_alias] = {};
              } else {
                sumerize[fomular_alias] = 0;
              }
            }

            if (fomular == "SUM") {
              if (group_by.length > 0) {
                if (sumerize[fomular_alias][stringifyGroupKey] == undefined) {
                  sumerize[fomular_alias][stringifyGroupKey] = 0;
                }
                sumerize[fomular_alias][stringifyGroupKey] += data[h][field];
              } else {
                sumerize[fomular_alias] += data[h][field];
              }
            }

            if (fomular == "AVERAGE") {
              if (typeof data[h][field] == "number") {
                if (group_by && group_by.length > 0) {
                  if (!sumerize[fomular_alias][stringifyGroupKey]) {
                    sumerize[fomular_alias][stringifyGroupKey] = {
                      value: data[h][field],
                      total: 1,
                    };
                  } else {
                    sumerize[fomular_alias][stringifyGroupKey].value =
                      (sumerize[fomular_alias][stringifyGroupKey].value *
                        sumerize[fomular_alias][stringifyGroupKey].total +
                        data[h][field]) /
                      (sumerize[fomular_alias][stringifyGroupKey].total + 1);
                    sumerize[fomular_alias][stringifyGroupKey].total += 1;
                  }
                } else {
                  sumerize[fomular_alias] =
                    (sumerize[fomular_alias][stringifyGroupKey] *
                      sumerize.total +
                      data[h][field]) /
                    (sumerize.total + 1);
                }
              }
            }

            if (fomular == "COUNT") {
              if (group_by.length > 0) {
                if (sumerize[fomular_alias][stringifyGroupKey] == undefined) {
                  sumerize[fomular_alias][stringifyGroupKey] = 0;
                }
                sumerize[fomular_alias][stringifyGroupKey] += 1;
              } else {
                sumerize[fomular_alias] += 1;
              }
            }
          }
        }
      }

      await Database.update(
        table.table_alias,
        { position: "sumerize" },
        { ...sumerize }
      );
      const auto_id = await Database.getAutoIncrementId(
        `${table.table_alias}-id`
      );
      await Database.update(
        "auto_increment_collection",
        { name: `${table.table_alias}-id` },
        { id: auto_id + data.length }
      );
      this.res.send({ success: true });
    } else {
      this.res.send({ success: false });
    }
  };

  consumeDetail = async (req, res, api_id) => {
    this.writeReq(req);
    const start = new Date();

    const { url, method } = req;
    this.url = decodeURI(url);
    this.tables;
    const [api, projects, tables, fields] = await Promise.all([
      this.#__apis.find({ api_id }),
      this.#__projects.findAll(),
      this.#__tables.findAll(),
      this.#__fields.findAll(),
    ]);
    if (api && api.api_method == method.toLowerCase() && api.status) {
      const Api = new ApisRecord(api);
      const project = projects[0];
      this.project = project;

      this.API = Api;
      this.req = req;
      this.res = res;
      this.fields = fields;
      this.tables = tables.map((table) => {
        const { id } = table;
        table.fields = fields.filter((field) => field.table_id == id);
        return table;
      });

      if (project.project_type == "database") {
        this.CONSUME_DETAIL_RECORD();
      } else {
        this.consume(req, res, api_id);
      }
    } else {
      res.status(200).send({ succes: false, content: "Not found" });
    }
  };

  CONSUME_DETAIL_RECORD = async () => {
    const tables = this.tearTablesAndFieldsToObjects();
    const params = this.getFields(this.API.params.valueOrNot());

    const data = this.req.body;
    let paramQueries = [];

    if (params.length > 0) {
      const formatedUrl = this.url.replaceAll("//", "/");
      const splittedURL = formatedUrl.split("/");
      const paramValues =
        splittedURL.slice(
          3
        ); /* The 3 number is the first index of params located in url, this can be changed to flexible with url format */

      let paramsValid = true;
      paramQueries = params.map((param, index) => {
        const query = {};
        const parsedValue = this.parseType(param, paramValues[index]);
        query[param.fomular_alias] = parsedValue.result;

        if (paramValues[index] == "") {
          paramsValid = false;
        }
        return { table_id: param.table_id, query };
      });
      if (paramValues.length < params.length || !paramsValid) {
        this.res.status(200).send({
          msg: "INVALID PARAMS SET",
          data: [],
        });
        return;
      }
    }

    const table = tables[0];
    const fields = this.getFields(
      this.API.fields.valueOrNot().map((f) => f.id)
    );

    let formatedQuery = {};
    paramQueries.map(({ query }) => {
      formatedQuery = { ...formatedQuery, ...query };
    });

    const records = await Database.selectAll(table.table_alias, formatedQuery);

    if (records.length == 1) {
      const record = records[0];
      const result = {};
      for (let i = 0; i < fields.length; i++) {
        const { fomular_alias } = fields[i];
        result[fomular_alias] = record[fomular_alias];
      }
      this.res.status(200).send({ success: true, data: result, fields });
    } else {
      this.res.status(200).send({
        success: false,
        error: "Query return more than one record or nothing",
      });
    }
  };

  consumeCSync = async (req, res, apis_id) => {
    /**
     *
     *
     */

    this.writeReq(req);
    const start = new Date();

    const { url, method } = req;
    this.url = decodeURI(url);
    const [api, projects, tables, fields] = await Promise.all([
      this.#__apis.find({ api_id }),
      this.#__projects.findAll(),
      this.#__tables.findAll(),
      this.#__fields.findAll(),
    ]);

    if (api && api.api_method == method.toLowerCase() && api.status) {
      const Api = new ApisRecord(api);
      const project = projects[0];
      this.project = project;

      this.API = Api;
      this.req = req;
      this.res = res;
      this.fields = fields;
      this.tables = tables.map((table) => {
        const { id } = table;
        table.fields = fields.filter((field) => field.table_id == id);
        return table;
      });

      if (project.project_type == "database") {
        this.CONSUME_CASCADING_SYNCHRONIZE();
      }
    } else {
      res.status(200).send({ succes: false, content: "Not found" });
    }
  };

  CONSUME_CASCADING_SYNCHRONIZE = () => {
    const data = this.req.body.data ? this.req.body.data : [];
    const tables = this.tearTablesAndFieldsToObjects();
    const table = tables[0];

    const { fields, primary_key, foreign_keys, table_alias } = table;
    this.import_fields = this.getFieldsByTableId(table.id);
    this.primaryKeys = primary_key;
    this.primaryFields = this.getFields(primary_key);
    this.table = table;
    const rawIndices = [];

    if (data.length > 0) {
      console.log(data);
    }

    this.res.send({ success: true });
  };

  consumeBarcodeActivation = async (req, res) => {
    this.req = req;
    this.res = res;
    const [tables, fields] = await Promise.all([
      this.#__tables.findAll(),
      this.#__fields.findAll(),
    ]);

    this.tables = tables;
    this.fields = fields;

    if (req.method.toLowerCase() == "put") {
      const { table, criteria, master, from, to, value, select } = req.body;

      const mappedSelect = select?.reduce(
        (prev, { key, value }) => ({
          ...prev,
          [key]: value,
        }),
        {}
      );

      const updateTable = tables.find((tb) => tb.id == table);
      const primalTable = tables.find((tb) => tb.id == master);

      const criteriaField = await this.#__fields.find({ id: criteria });

      if (criteriaField && updateTable && primalTable) {
        const { foreign_keys } = updateTable;

        if (foreign_keys) {
          const key = foreign_keys.find((key) => key.table_id == master);

          if (key) {
            const { ref_field_id } = key;
            const refOn = await this.#__fields.find({ id: ref_field_id });

            const primalQuery = { [refOn.fomular_alias]: value };

            const primalRecord = await Database.selectAll(
              primalTable.table_alias,
              primalQuery
            );

            if (primalRecord) {
              const updateQuery = {
                $and: [
                  { [criteriaField.fomular_alias]: { $gte: from, $lte: to } },
                  mappedSelect,
                ],
              };

              if (primalRecord.length === 0) {
                return res.send({
                  success: false,
                  content: "Primary  data not found",
                });
              }

              const { id, position, ...mappingData } = primalRecord[0];
              updateTable.foreign_keys.map(({ ref_field_id, field_id }) => {
                const foreign = this.getField(field_id);
                const primary = this.getField(ref_field_id);
                if (mappingData[primary.fomular_alias]) {
                  mappingData[foreign.fomular_alias] =
                    mappingData[primary.fomular_alias];
                }
              });

              await Database.updateMany(updateTable.table_alias, [
                {
                  condition: {
                    [criteriaField.fomular_alias]: { $gte: from, $lte: to },
                    ...mappedSelect,
                  },
                  value: { ...mappingData },
                },
              ]);

              const data = await Database.selectAll(updateTable.table_alias, {
                ...updateQuery,
              });

              const slaves = this.detectAllSlave(updateTable);

              let slaves_fields = [];

              slaves.map(({ foreign_keys, table_alias }) => {
                foreign_keys.map(({ field_id, ref_field_id }) => {
                  const field = this.getField(field_id);

                  if (updateTable.primary_key.includes(ref_field_id)) {
                    const master_field = this.getField(ref_field_id);

                    slaves_fields.push({
                      slave_fomular_alias: field.fomular_alias,
                      table_alias,
                      master_fomular_alias: master_field.fomular_alias,
                    });
                  }
                });
              });

              /* START UPDATING SLAVES */

              let updatedData = [];

              slaves_fields.map(
                ({
                  slave_fomular_alias,
                  master_fomular_alias,
                  table_alias,
                }) => {
                  updatedData.push({
                    table_alias,
                    data: data.map(({ position, id, ...props }) => ({
                      condition: {
                        [slave_fomular_alias]: props[master_fomular_alias],
                      },
                      value: props,
                    })),
                  });
                }
              );

              const updated_list = [];

              updatedData.map(({ data, table_alias }) => {
                if (data.length) {
                  updated_list.push(Database.updateMany(table_alias, data));
                }
              });

              const res1 = await Promise.all(updated_list);

              /* END UPDATING SLAVES */

              return res.send({
                mappingData,
                res1,
                data,
                slaves_fields,
                slaves,
                primalRecord,
                updateQuery,
                primalTable,
                criteriaField,
                updateTable,
                updateQuery,
                refOn,
                primalQuery,
                updatedData,
                key,
              });
            } else {
              return res.send({
                success: false,
                content: "Foreign data not found",
              });
            }
          } else {
            return res.send({
              success: false,
              content: "Foreign keys not found",
            });
          }
        } else {
          return res.send({
            success: false,
            content: "Foreign keys not found",
          });
        }
      }

      return res.send({ success: false, content: "Invalid tableset" });
    } else {
      this.NotFound();
    }
  };
}

module.exports = ConsumeApi;
