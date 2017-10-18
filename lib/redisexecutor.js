const objecthash = require("./objecthash");
const logger = require("./logger");

const { inspect } = require("util");
const { RedisPool } = require("newredis");


class RedisExecutor {
  /**
   * Create a Redis connection pool and assign it to instance attribute "pool".
   * @config: an object like { host: x, port: x, ... }.
   */
  constructor(config) {
    logger.info(`Create a new Redis connection pool on: ${inspect(config)}`);
    this.pool = new RedisPool(config);

    this.config = config;

    const period = config.keepalivePeriod || 180000;
    setInterval(this.sendKeepalive.bind(this), period);
  }


  /**
   * Keep connection alive by sending request every @period milliseconds.
   */
  async sendKeepalive() {
    logger.info(`Send keepalive to ${this.config.host}:${this.config.port}`);

    await this.execute([ "set", "redis_keepalive", Date.now() ]);
  }


  /**
   * This function is just a simple wrapper for mysql's query method. It is
   * the most fundamental method.
   */
  async execute(command) {
    logger.trace(`Trying to execute redis query: ${command}`);
    try {
      const conn = await this.pool.getConnection();
      const r = await conn.execute(command);

      conn.release();
      return r;

    } catch (e) {
      logger.error(`RedisPool failed executing ${command}: ${inspect(e)}`);
      throw e;
    }
  }
}



/**
 * This module level object holds all references of RedisPool Objects.
 */
const executors = {};


/**
 * This is the recommended way to get RedisExecutor objects from this module.
 */
function getRedisExecutor(config) {
  const key = objecthash(config);

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


