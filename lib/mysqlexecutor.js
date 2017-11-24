const objecthash = require("./objecthash");

const { inspect } = require("util");
const mysql = require("mysql");

const { Logger } = require("colourlogger");



class MysqlExecutor extends Logger {
  /**
   * Create a Mysql connection pool and assign it to instance attribute "pool".
   * @param {Object} config - Object like { host: x, port: x, user: x, ... }
   */
  constructor(config) {
    super("MysqlExecutor");
    this.pool = mysql.createPool(config);
  }


  /**
   * Get a connection from the mysql connection pool. This is just a simple
   * wrapper for mysql's getConnection method.
   */
  getConnection() {
    return new Promise((res, rej) => {
      this.pool.getConnection((e, conn) => e ? rej(e) : res(conn));
    });
  }


  /**
   * This function is just a simple wrapper for mysql-node's query method. It
   * is the most fundamental method.
   */
  async execute(sqlString) {
    this.trace(`Trying to execute SQL string: [${sqlString}]`);

    const conn = await this.getConnection();
    try {
      return await queryAsync(conn, sqlString);
    } finally {
      conn.release();
    }
  }


  /**
   * e.g. select("t1", [ "name", "gender", "age" ], { gender: 1 },
   *             "ORDER BY age DESC LIMIT 3 OFFSET 1");
   *
   * e.g. select("t1", "*", { gender: 1 });
   *
   */
  async select(table, fields, whereCond, extra) {
    const q = genSelect(table, fields, whereCond, extra);
    return await this.execute(q);
  }


  /**
   * e.g. insert("t1", { name: "wallace", age: 26, gender: 1 });
   */
  async insert(table, obj) {
    return await this.execute(genInsert(table, obj));
  }


  /**
   * e.g. update("t1", { age: 27 }, { name: "wallace" });
   */
  async update(table, newData, whereCond) {
    return await this.execute(genUpdate(table, newData, whereCond));
  }


  /**
   * e.g. remove("t1", { name: "wallace", age: 26 });
   */
  async remove(table, whereCond) {
    return await this.execute(genRemove(table, whereCond));
  }


  /**
   * For basic `getConnection`, `query`, `release` test.
   */
  async testQuery() {
    const r = await this.execute('SHOW VARIABLES LIKE "wait_timeout"');
    this.info(`testQuery response: ${r ? r[0].Value : null}`);
  }
}




/**
 * @param {string[]|string} fields - Array like [ "age", "gender" ] or "*".
 * @param {Object} whereCond - Object like { name: "Abc", age: 15 }.
 * @param {string} extra - "ORDER BY", "LIMIT", "OFFSET", etc.
 * @returns {Array} - Array of RowDataPacket object.
 *
 * SELECT name,gender FROM XX WHERE name="Abc" AND age=15
 */
function genSelect(table, fields, whereCond, extra) {
  const f = Array.isArray(fields) ? fields.map(x => `\`${x}\``) : fields;
  const w = whereCond ? `WHERE ${constructWhere(whereCond)}` : "";

  return `SELECT ${f} FROM \`${table}\` ${w} ${extra || ""}`;
}


/**
 * INSERT is the simplest operation, because there is no WHERE part in it.
 * @param {Object} obj - Object like { name: "Abc", age: 15, gender: 1 }.
 * @returns {OkPacket}
 *
 * INSERT INTO XX(name,age,gender) VALUES("Abc",15,1)
 */
function genInsert(table, obj) {
  const ks = Object.keys(obj).map(x => `\`${x}\``);
  const vs = Object.values(obj).map(toMysqlObj);

  return `INSERT INTO \`${table}\`(${ks}) VALUES(${vs})`;
}


/**
 * @param {Object} newData - Object like { age: 20, gender: 2 }.
 * @param {Object} whereCond - Object like: { name: "Abc", gender: 1 }.
 * @returns {OkPacket}
 *
 * UPDATE XX SET age=20,gender=2 WHERE name="Abc" AND gender=1
 */
function genUpdate(table, newData, whereCond) {
  const s = constructPairs(newData).join(",");
  const w = whereCond ? `WHERE ${constructWhere(whereCond)}` : "";

  return `UPDATE \`${table}\` SET ${s} ${w}`;
}


/**
 * @param {Object} whereCond - Object like: { name: "Abc", gender: 1 }.
 * @returns {OkPacket}
 *
 * DELETE FROM XX WHERE name="Abc" AND age=15
 * ("delete" is keyword of JS, use "remove" as the name instead.)
 */
function genRemove(table, whereCond) {
  const w = whereCond ? `WHERE ${constructWhere(whereCond)}` : "";

  return `DELETE FROM \`${table}\` ${w}`;
}



/**
 * Promise wrapper for mysql's connection.query.
 */
function queryAsync(conn, sqlString) {
  return new Promise((res, rej) => {
    conn.query(sqlString, (e, result, _) => e ? rej(e) : res(result));
  });
}



/**
 * Transform object { a:1, b: 2, c: 3 } to array [ "`a`=1","`b`=2","`c`=3" ].
 */
function constructPairs(obj) {
  return Object.entries(obj).map(([k, v]) => `\`${k}\`=${toMysqlObj(v)}`);
}


/**
 * Transform object { a: 1, b: 2, c: 3} to "`a`=1 AND `b`=2 AND `c`=3"
 * Since the "where" part could be complex, user may just pass string here.
 */
function constructWhere(whereObj) {
  if (typeof whereObj !== "string")
    return constructPairs(whereObj).join(" AND ");
  else
    return whereObj;
}


/**
 * Transform normal Javascript object to Mysql object. This function is used
 * to creating Mysql query string.
 *
 * For now, only String, Number, Date are supported.
 */
function toMysqlObj(obj) {
  if (obj === undefined || obj === null)
    return "NULL";

  switch (obj.constructor) {
  case Date:
    return `'${formatDate(obj)}'`;

  case String:
    return `'${obj.replace(/'/g, "''")}'`;

  case Number:
    return obj;

  default:
    throw new TypeError(`${util.inspect(obj)}`);
  }
}


/**
 * Transform a Date object to a string like "2017-10-14 13:33:21".
 */
function formatDate(dateObj) {
  return dateObj.toISOString().slice(0, 19).replace("T", " ");
}


/**
 * This object holds all references of MysqlExecutor Objects.
 */
const executors = {};


/**
 * This is the recommended way to get MysqlExecutor objects from this module.
 */
function getMysqlExecutor(config) {
  const key = config ? objecthash(config) : "default";

  if (executors[key])
    return executors[key];

  executors[key] = new MysqlExecutor(config);

  return executors[key];
}


module.exports = {
  MysqlExecutor,
  getMysqlExecutor,
};

