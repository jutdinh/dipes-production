/**
    @createOn 06-04-2023
    @description Đối tượng chung nhất dành cho việc truy vấn cơ sở dữ liệu
        và sẽ được kế thừa bởi các đối tượng trong folder ./models
    @author Linguistic
**/
require("dotenv").config();
const { dbo } = require("../database/connector");
const db = process.env.STORAGE.toLowerCase();

class MySQL {
  /** 
        @desc Nhỏ này sẽ được định nghĩa sau
    **/
  constructor() {}
}

class Mongo {
  constructor() {}

  init = async () => {
    /**
     * @desc Khởi tạo liên kết với cơ sở dữ liệu
     *      Vì nhỏ này là phương thức bất đồng bộ nên phải
     *      chạy độc lập so với constructor
     * @params /
     * @author DS
     *
     */

    if (!this.dbo) {
      const db = await dbo();
      this.dbo = db;
    }
  };

  getDBO = async () => {
    await this.init();
    return this.dbo;
  };

  createIndex = async (table_name, index) => {
    await this.init();
    await this.dbo.collection(table_name).createIndex({ [index]: 1 });
  };

  getAutoIncrementId = async (table) => {
    await this.init();
    /**
     * @desc Phương thức này dùng để gọi ID tăng tự động của một bảng mỗi khi cần
     *      id mới để thêm một bảng ghi hoặc làm một cái gì đó có cần đến ID duy nhất
     *      Nhỏ này là phương thức bất đồng bộ
     * @params /
     * @author DS
     *
     */

    const id = await new Promise((resolve, reject) => {
      this.dbo
        .collection("auto_increment_collection")
        .findOne({ name: table }, (err, result) => {
          let newId;
          if (result) {
            const oldId = result.id;
            newId = result.id + 1;
            this.dbo.collection("auto_increment_collection").updateOne(
              { name: table },
              {
                $set: {
                  id: newId,
                },
              },
              (err, result) => {
                resolve(oldId);
              }
            );
          } else {
            newId = 1;
            this.dbo
              .collection("auto_increment_collection")
              .insertOne({ name: table, id: newId }, (err, result) => {
                resolve(0);
              });
          }
        });
    });
    return id + 1;
  };

  select = async (table, criteria = undefined) => {
    await this.init();
    /**
     * @desc Select là phương thức gọi dữ liệu từ một bảng thuộc cơ sở dữ liệu
     *
     *
     * @params
     *      - table String - tên bảng cần gọi dữ liệu
     *      - criteria {} - điều kiện dùng để truy vấn dữ liệu. Nếu điều kiện = undefined, nhỏ này
     *     sẽ mặc nhiên hiểu criteria = {} và trả về kết quả là toàn bộ bảng ghi hiện có.
     * @author DS
     *
     **/

    const query = criteria;

    const data = await new Promise((resolve, reject) => {
      if (criteria != undefined) {
        this.dbo
          .collection(table)
          .find(query, { projection: { _id: 0 } })
          .toArray((err, result) => {
            if (result) {
              if (result.length <= 1) {
                resolve(result[0]);
              } else {
                resolve(result);
              }
            } else {
              resolve([]);
            }
          });
      } else {
        this.dbo
          .collection(table)
          .find()
          .toArray((err, result) => {
            if (result) {
              resolve(result);
            } else {
              resolve([]);
            }
          });
      }
    });
    return data;
  };

  selectAll = async (table, criteria = undefined) => {
    await this.init();
    /**
     * @desc Select là phương thức gọi dữ liệu từ một bảng thuộc cơ sở dữ liệu
     *
     *
     * @params
     *      - table String - tên bảng cần gọi dữ liệu
     *      - criteria {} - điều kiện dùng để truy vấn dữ liệu. Nếu điều kiện = undefined, nhỏ này
     *     sẽ mặc nhiên hiểu criteria = {} và trả về kết quả là toàn bộ bảng ghi hiện có.
     * @author DS
     *
     **/

    const query = criteria;

    const data = await new Promise((resolve, reject) => {
      if (criteria != undefined) {
        this.dbo
          .collection(table)
          .find(query, { projection: { _id: 0 } })
          .toArray((err, result) => {
            resolve(result);
          });
      } else {
        this.dbo
          .collection(table)
          .find({}, { projection: { _id: 0 } })
          .toArray((err, result) => {
            resolve(result);
          });
      }
    });

    // const query = criteria || {};

    // const data = await new Promise((resolve, reject) => {
    //   const q = this.dbo
    //     .collection(table)
    //     .find(query, { projection: { _id: 0 } });

    //   console.log("SKIP", skip, limit);
    //   if (limit && limit >= 0) {
    //     q.limit(limit);
    //   }
    //   if (skip && skip >= 0) {
    //     q.skip(skip);
    //   }
    //   q.toArray((err, result) => {
    //     resolve(result);
    //   });
    // });

    return data;
  };

  selectFrom = async (table, query, from, to) => {
    await this.init();
    const data = await new Promise((resolve, reject) => {
      this.dbo
        .collection(table)
        .find(query, { skip: from, projection: { _id: 0 } })
        .limit(to - from)
        .toArray((err, result) => {
          resolve(result);
        });
    });

    return data;
  };

  selectFields = async (table, criteria, fields) => {
    await this.init();
    /**
     * @desc Select là phương thức gọi dữ liệu từ một bảng thuộc cơ sở dữ liệu
     *
     *
     * @params
     *      - table String - tên bảng cần gọi dữ liệu
     *      - criteria {} - điều kiện dùng để truy vấn dữ liệu. Nếu điều kiện = undefined, nhỏ này
     *     sẽ mặc nhiên hiểu criteria = {} và trả về kết quả là toàn bộ bảng ghi hiện có.
     * @author DS
     *
     **/

    const query = criteria;

    const projection = { _id: 0 };
    fields.map((field) => {
      projection[field] = 1;
    });

    const data = await new Promise((resolve, reject) => {
      if (criteria != undefined) {
        this.dbo
          .collection(table)
          .find(query, { projection })
          .toArray((err, result) => {
            resolve(result);
          });
      } else {
        this.dbo
          .collection(table)
          .find({}, { projection })
          .toArray((err, result) => {
            resolve(result);
          });
      }
    });
    return data ? data : [];
  };

  insert = async (table, value) => {
    await this.init();
    /**
     * @desc Insert là phương thức chèn dữ liệu vào một bảng thuộc cơ sở dữ liệu
     *
     *
     * @params
     *      - table String - tên bảng cần thêm dữ liệu
     *      - value {} - Dữ liệu sẽ được thêm mới vào bảng
     * @author DS
     *
     **/

    let id = value.id;
    if (!id) {
      id = await this.getAutoIncrementId(table);
    }
    const insertResult = await new Promise((resolve, reject) => {
      this.dbo.collection(table).insertOne({ id, ...value }, (err, result) => {
        resolve(result);
      });
    });
    return { id, ...value };
  };

  insertMany = async (table, objects) => {
    await this.init();
    /**
     * @desc Insert Many là phương thức chèn dữ liệu vào một bảng thuộc cơ sở dữ liệu
     *
     *
     * @params
     *      - table String - tên bảng cần thêm dữ liệu
     *      - objects - Dữ liệu sẽ được thêm mới vào bảng
     * @author Dev
     *
     **/

    for (let i = 0; i < objects.length; i++) {
      let { id } = objects[i];
      if (!id) {
        id = await this.getAutoIncrementId(table);
        objects[i].id = id;
      }
    }
    const insertResult = await new Promise((resolve, reject) => {
      this.dbo.collection(table).insertMany(objects, (err, result) => {
        resolve(result);
      });
    });
  };

  update = async (
    table,
    criteria,
    newValue,
    increasedData = {},
    upsert = false
  ) => {
    await this.init();
    /**
     * @desc Update là phương thức cập nhật một hoặc nhiều bảng ghi với một hoặc nhiều giá trị mới
     *
     *
     * @params
     *      - table String - tên bảng cần chỉnh sửa
     *      - criteria {} - điều kiện dùng để truy vấn dữ liệu.
     *      - value {} - Dữ liệu mới sẽ được cập nhật cho các bảng ghi thỏa mãn criteria
     * @author DS
     *
     **/

    const query = criteria;

    const updateResult = await new Promise((resolve, reject) => {
      this.dbo
        .collection(table)
        .updateMany(
          query,
          { $set: { ...newValue }, $inc: increasedData },
          { upsert: upsert },
          (err, result) => {
            resolve(result);
          }
        );
    });
  };

  updateMany = async (table, newValue) => {
    await this.init();
    /**
     * @desc Update là phương thức cập nhật một hoặc nhiều bảng ghi với một hoặc nhiều giá trị mới
     *
     *
     * @params
     *      - table String - tên bảng cần chỉnh sửa
     *      - criteria {} - điều kiện dùng để truy vấn dữ liệu.
     *      - value {} - Dữ liệu mới sẽ được cập nhật cho các bảng ghi thỏa mãn criteria
     * @author DS
     *
     **/

    return this.dbo.collection(table).bulkWrite(
      newValue.map((item) => ({
        updateMany: {
          filter: item.condition,
          update: { $set: item.value },
        },
      }))
    );
  };

  delete = async (table, criteria) => {
    await this.init();
    /**
     * @desc Delete là phương thức xóa dữ liệu
     *
     *
     * @params
     *      - table String - tên bảng cần xóa dữ liệu
     *      - criteria {} - điều kiện dùng để xóa dữ liệu.
     * @author DS
     *
     **/

    const query = criteria;
    const deleteResult = await new Promise((resolve, reject) => {
      this.dbo.collection(table).deleteOne(query, (err, result) => {
        resolve(result);
      });
    });
  };
  deleteMany = async (table, criteria) => {
    await this.init();
    /**
     * @desc Delete là phương thức xóa dữ liệu
     *
     *
     * @params
     *      - table String - tên bảng cần xóa dữ liệu
     *      - criteria {} - điều kiện dùng để xóa dữ liệu.
     * @author DS
     *
     **/

    const query = criteria;
    const deleteResult = await new Promise((resolve, reject) => {
      this.dbo.collection(table).deleteMany(query, (err, result) => {
        resolve(result);
      });
    });
  };

  count = async (table, query) => {
    await this.init();
    let criteria = query;
    if (query == undefined) {
      criteria = {};
    }
    const countResult = await this.dbo
      .collection(table)
      .countDocuments(criteria);

    return countResult;
  };

  getEstimateCount = async (table) => {
    await this.init();
    const countResult = await this.dbo
      .collection(table)
      .estimatedDocumentCount();
    return countResult;
  };
}

let Database;

switch (db) {
  case "mongo":
    Database = new Mongo();
    break;
  default:
    Database = new MySQL();
}

module.exports = {
  Database,
};
