const objecthash = require("./objecthash");

const { inspect } = require("util");
const logger = require("lvlog");
const { RedisPool } = require("newredis");


class RedisExecutor {
  /**
   * Create a Redis connection pool and assign it to instance attribute "pool".
   * `config` is an object like { host: x, port: x, ... }.
   */
  constructor(config) {
    logger.info(`Create a new Redis connection pool on: ${inspect(config)}`);
    this.pool = new RedisPool(config);
    this.config = config;
  }


  /**
   * This function is just a simple wrapper for mysql's query method. It is
   * the most fundamental method.
   */
  async execute(command) {
    logger.trace(`Trying to execute redis query: ${command}`);
    const conn = await this.pool.getConnection();
    const r = await conn.execute(command);

    conn.release();
    return r;
  }


  /**
   * Wrapper for redis's "get" command
   */
  async get(key) {
    return await this.execute([ "get", key ]);
  }


  /**
   * Wrapper for redis's "set" command
   */
  async set(key, value) {
    return await this.execute([ "set", key, value ]);
  }


  /**
   * Wrapper for redis's "hmget" command
   */
  async hmget(key, fields) {
    return await this.execute([ "hmget", key ].concat(fields));
  }


  /**
   * Wrapper for redis's "hmset" command
   */
  async hmset(key, obj) {
    return await this.execute(objToHmsetStr(key, obj));
  }


  /**
   * Wrapper for redis's "hmset" command
   */
  async hgetall(key) {
    return await this.execute([ "hgetall", key ]);
  }


  /**
   * Wrapper for redis's "hmset" command
   */
  async del(key) {
    return await this.execute([ "del", key ]);
  }


  /**
   * Wrapper for redis's "hmset" command
   */
  async ttl(key) {
    return await this.execute([ "ttl", key ]);
  }
}



/**
 * objToHmsetStr("x", { a: 1, b: 2 }); ===> [ 'hmset', 'x', 'a', 1, 'b', 2 ]
 */
function objToHmsetStr(key, obj) {
  return [ "hmset", key ].concat([].concat(...Object.entries(obj)));
}



/**
 * This module level object holds all references of RedisPool Objects.
 */
const executors = {};


/**
 * This is the recommended way to get RedisExecutor objects from this module.
 */
function getRedisExecutor(config) {
  const key = config ? objecthash(config) : "default";

  if (executors[key])
    return executors[key];

  logger.info(`Create a new RedisExecutor Object (hash: "${key}")`);
  executors[key] = new RedisExecutor(config);

  return executors[key];
}


module.exports = {
  RedisExecutor,
  getRedisExecutor,
};

