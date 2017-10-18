const objecthash = require("./objecthash");
const logger = require("./logger");

const { inspect } = require("util");
const mysql = require("mysql");



class MysqlExecutor {
  /**
   * Create a Mysql connection pool and assign it to instance attribute "pool".
   * @config: an object like { host: x, port: x, database: x, user: x, ... }
   */
  constructor(config) {
    logger.info(`Create a new Mysql connection pool on: ${inspect(config)}`);
    this.pool = mysql.createPool(config);

    this.config = config;

    const period = config.keepalivePeriod || 180000;
    setInterval(this.sendKeepalive.bind(this), period);
  }


  /**
   * Keep connection alive by sending request every @period milliseconds.
   */
  async sendKeepalive() {
    const { host, port, database } = this.config;
    logger.info(`Send keepalive to ${host}:${port}:${database}`);

    const q = 'SHOW VARIABLES LIKE "wait_timeout"';
    const r = await this.query(q);

    logger.info(`Keepalive response: ${r ? r[0].Value : null}`);
  }


  /**
   * Get a connection from the mysql connection pool. This is just a simple
   * wrapper for mysql's getConnection method.
   */
  async getConnection() {
    try {
      return await getConnectionAsync(this.pool);
    } catch (e) {
      logger.error(`Mysql failed getting connection: ${inspect(e)}`);
      throw e;
    }
  }


  /**
   * This function is just a simple wrapper for mysql's query method. It is
   * the most fundamental method.
   */
  async query(sqlString) {
    logger.trace(`Trying to execute mysql query string: [${sqlString}]`);
    try {
      const conn = await this.getConnection();
      const r = await queryAsync(conn, sqlString);

      conn.release();
      return r;

    } catch (e) {
      logger.error(`Mysql failed executing [${sqlString}]: ${inspect(e)}`);
      throw e;
    }
  }


  /**
   * Insert is the simplest operation, because there is no "where" in it.
   * @obj: an object like { name: "Abc", age: 15, gender: 1 }.
   *
   * INSERT INTO XX(name,age,gender) VALUES("Abc",15,1)
   */
  async insert(table, obj) {
    const f = Object.keys(obj);
    const v = Object.values(obj).map(toMysqlObj);
    const q = `INSERT INTO ${table}(${f}) VALUES(${v})`;

    return await this.query(q);
  }


  /**
   * @newData: an object like { age: 20, gender: 2 }.
   * @whereCond: an object like: { name: "Abc", gender: 1 }.
   *
   * UPDATE XX SET age=20,gender=2 WHERE name="Abc" AND gender=1
   */
  async update(table, newData, whereCond) {
    const s = constructPairs(newData).join(",");
    const w = constructWhere(whereCond);
    const q = `UPDATE ${table} SET ${s} WHERE ${w}`;

    return await this.query(q);
  }


  /**
   * @fields: an array like [ "name", "gender" ] or "*".
   * @whereCond: an object like { name: "Abc", age: 15 }.
   * @extra: ORDER, LIMIT, etc.
   *
   * SELECT name,gender FROM XX WHERE name="Abc" AND age=15
   */
  async select(table, fields, whereCond, extra) {
    const w = constructWhere(whereCond);
    const q = `SELECT ${fields} FROM ${table} WHERE ${w} ${extra || ""}`;

    return await this.query(q);
  }


  /**
   * @whereCond: an object like { name: "Abc", age: 15 }.
   *
   * DELETE FROM XX WHERE name="Abc" AND age=15
   * ("delete" is keyword of JS, so use "remove" as the name instead.)
   */
  async remove(table, whereCond) {
    const q = `DELETE FROM ${table} WHERE ${constructWhere(whereCond)}`;

    return await this.query(q);
  }
}



/**
 * Promise wrapper for mysql's connection.query.
 */
function queryAsync(conn, sqlString) {
  return new Promise((res, rej) => {
    conn.query(sqlString, (err, result, _) => err ? rej(err) : res(result));
  });
}


/**
 * Promise wrapper for mysql's pool.getConnection.
 */
function getConnectionAsync(pool) {
  return new Promise((res, rej) => {
    pool.getConnection((err, conn) => err ? rej(err) : res(conn));
  });
}


/**
 * Transform object { a:1, b: 2, c: 3 } to array [ "a=1", "b=2", "c=3" ].
 */
function constructPairs(obj) {
  return Object.entries(obj).map(([k, v]) => `${k}=${toMysqlObj(v)}`);
}


/**
 * Transform object { a: 1, b: 2, c: 3} to "a=1 AND b=2 AND c=3"
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
  switch (obj.constructor) {
  case Date:
    return `"${formatDate(obj)}"`;

  case String:
    return `"${obj}"`;

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
 * This module level object holds all references of MysqlExecutor Objects.
 */
const executors = {};


/**
 * This is the recommended way to get MysqlExecutor objects from this module.
 */
function getMysqlExecutor(config) {
  const key = objecthash(config);

  if (executors[key])
    return executors[key];

  logger.info(`Create a new MysqlExecutor Object (hash: "${key}")`);
  executors[key] = new MysqlExecutor(config);

  return executors[key];
}


module.exports = {
  MysqlExecutor,
  getMysqlExecutor,
};

