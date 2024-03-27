const jwt = require("jsonwebtoken");
require("dotenv").config();
const events = require("./LogEvents");

const { EventLogsRecord } = require("../../models/EventLogs");
const { response } = require("./ResponseCode");
const { Projects, ProjectsRecord } = require("../../models/Projects");
const { ProjectMembers } = require("../../models/ProjectMembers");
const { intValidate } = require("../../functions/validator");
const { Versions, VersionsRecord } = require("../../models/Versions");

const permission = require("./permission");
const { Database } = require("../models/database");
const { v4: uuidv4 } = require("uuid");
class Controller {
  static permission = permission;

  #__code = undefined;
  #__projects = new Projects();
  #__projectMembers = new ProjectMembers();
  #__versions = new Versions();
  constructor() {
    this.tokenKey = process.env.TOKEN_KEY;
    this.events = events;
    this.#__code = response;
    this.__taskStatus = [1, 2, 3, 4, 5];

    this.EPC_LENGTH = 16;

    this.tableTypes = ["table", "table_param"];
    this.defaultButtons = ["detail", "update", "delete"];

    this.NUMBERS = "0 1 2 3 4 5 6 7 8 9".split(" ");
    this.LETTERS = "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z".split(
      " "
    );
    this.BASE = [...this.NUMBERS, ...this.LETTERS];
  }

  #__privileges = {
    uad: 1,
    ad: 0,
    pm: -1,
    pd: -2,
    ps: -3,
    manager: -4,
    supervisor: -5,
    deployer: -6,
  };

  getCode = (code) => {
    const responseCode = this.#__code[code];
    return responseCode ? responseCode : "Unknown problem";
  };

  checkPrivilege = (current, target) => {
    if (
      this.#__privileges[current] != undefined &&
      this.#__privileges[target] != undefined
    ) {
      return this.#__privileges[current] >= this.#__privileges[target];
    }
    return false;
  };

  notNullCheck = (data = {}, fields) => {
    // new
    let valid = true;
    const nullFields = [];
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (data[field] == undefined) {
        valid = false;
        nullFields.push(field);
        this.errorLog(`${field} NULL`);
      }
    }
    return { valid, nullFields };
  };

  makeToken = (data = {}) => {
    // new

    const token = jwt.sign(data, this.tokenKey);
    return token;
  };

  decodeToken = (token) => {
    // new
    const result = jwt.decode(token);
    return result;
  };

  isAdmin = (user) => {
    if (user.role == permission.ad || user.role == permission.uad) {
      return true;
    }
    return false;
  };

  removed_verifyToken = async (req) => {
    const token = req.header("Authorization");
    if (!token) {
      return false;
    } else {
      const result = await new Promise((resolve, reject) => {
        jwt.verify(token, this.tokenKey, (err, decoded) => {
          resolve({ err, decoded });
        });
      });

      if (result.err) {
        const projects = await Database.selectAll("projects", {});
        if (projects && projects[0]) {
          const { project_type, proxy_server } = projects[0];

          if (project_type == "api") {
            const response = await new Promise((resolve, reject) => {
              fetch(`${proxy_server}/auth/token/verify`, {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                },
                body: JSON.stringify({ token }),
              })
                .then((res) => res.json())
                .then((res) => {
                  resolve(res);
                });
            });
            const { success } = response;
            return success;
          }
        }
      }
      return true;
    }
  };

  verifyToken = async (req) => {
    const token = req.header("Authorization");
    if (!token) {
      return false;
    } else {
      const result = await new Promise((resolve, reject) => {
        jwt.verify(token, this.tokenKey, (err, decoded) => {
          resolve({ err, decoded });
        });
      });

      if (result.err) {
        return false;
      }
      return true;
    }
  };

  verifyCustomToken = async (token) => {
    if (!token) {
      return false;
    } else {
      const result = await new Promise((resolve, reject) => {
        jwt.verify(token, this.tokenKey, (err, decoded) => {
          resolve({ err, decoded });
        });
      });

      if (result.err) {
        return false;
      }
      return true;
    }
  };

  saveLog = async (
    logtype,
    ip,
    title,
    description,
    createBy,
    create_at = undefined
  ) => {
    const log = new EventLogsRecord({
      id: undefined,
      event_type: logtype,
      event_title: title,
      event_description: description,
      create_user: createBy,
      create_at: create_at ? create_at : new Date(),
      user_ip: ip,
    });
    await log.save();
  };

  getProject = async (rawProjectId) => {
    if (intValidate(rawProjectId)) {
      const project_id = parseInt(rawProjectId);
      const project = await this.#__projects.find({ project_id });
      if (project) {
        const Project = new ProjectsRecord(project);
        return Project;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  getProjectPrivilege = async (project_id, username) => {
    const member = await this.#__projectMembers.find({ project_id, username });
    if (member) {
      return member.permission;
    } else {
      return false;
    }
  };

  getVersion = async (raw_version_id) => {
    if (intValidate(raw_version_id)) {
      const version_id = parseInt(raw_version_id);
      const version = await this.#__versions.find({ version_id });
      if (version) {
        const Version = new VersionsRecord(version);
        return Version;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  translateBase10toAnyBase = (num, chars) => {
    if (num == 0) {
      return chars[0];
    }
    let result = "";
    while (num > 0) {
      const remainder = num % chars.length;
      num = Math.floor(num / chars.length);
      result = chars[remainder] + result;
    }
    return result;
  };

  translateBase10toBase36 = (num) => {
    return this.translateBase10toAnyBase(num, this.BASE);
  };

  formatEPCData = (pattern, value) => {
    // const stringifiedValue = value.toString()
    // const length = stringifiedValue.length;
    const date = new Date();
    const month = date.getMonth();

    const prefix = pattern ? pattern.slice(0, 4) : "RJV";

    return `${prefix}${this.LETTERS[month]}${date
      .getFullYear()
      .toString()
      .slice(2, 4)}${value.slice(2, value.length)}${value[0]}${value[1]}`;
  };

  prefix = (prefix, value) => {

    const showPrefix = prefix ? prefix : null;
    return `${showPrefix}`;
  };


  getFormatedUUID = () => {
    /**
     *  @type: functions
     *
     *  @libr: uuid
     *
     *  @desc:
     *  Tạo uuid với format là một chuỗi 32 ký tự liền nhau gồm số và chữ cái viết hoa
     *  (1): Tạo UUID từ thư viện
     *  (2): Biến đổi toàn bộ ký tự thường thành ký tự in hoa
     *  (3): Xoá toàn bộ dấu gạch [__dash__]
     *
     */
    let id = uuidv4(); // (1)
    id = id.toUpperCase(); // (2)
    id = id.replaceAll("-", ""); // (3)
    return id;
  };

  flatteningPages = (pages) => {
    /**
     * Ép dẹp cây pages thành mảng các page cùng cấp
     */

    const pgs = [];

    for (let i = 0; i < pages.length; i++) {
      pgs.push({ ...pages[i], children: [] });
      const { children } = pages[i];
      if (children) {
        pgs.push(...this.flatteningPages(children));
      }
    }
    return pgs;
  };

  flatteningComponents = (components = []) => {
    /**
     * Ép dẹp cây component thành mảng các component cùng cấp
     */

    const cpns = [];
    for (let i = 0; i < components.length; i++) {
      const { children } = components[i];
      cpns.push({ ...components[i] });
      if (children) {
        cpns.push(...this.flatteningComponents(children));
      }
    }
    return cpns;
  };

  writeReq = (request) => {
    const { originalUrl, method } = request;
    console.log(
      `FROM: ${request.connection.remoteAddress}\tREQ: ${method} - ${originalUrl}`
    );
  };

  writeRes = (response) => {
    const { status, message } = response;
    console.log(
      `TO  : ${response.connection.remoteAddress}\tRES: ${status} - ${message}`
    );
  };

  successLog = (msg, prefix = "") => {
    console.log(`${prefix}PASSED:   ${msg}`);
  };

  errorLog = (msg, prefix = "") => {
    console.log(`${prefix}ERROR!:   ${msg}`);
  };

  warningLog = (msg, prefix = "") => {
    console.log(`${prefix}WARNNING: ${msg}`);
  };

  infoLog = (msg, prefix = "") => {
    console.log(`${prefix}INFOR:    ${msg}`);
  };
}

module.exports = Controller;
