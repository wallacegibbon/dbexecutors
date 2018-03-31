const objecthash = require("./objecthash")
const { RedisExecutorError } = require("./errors")

const { inspect } = require("util")
const { RedisConnectionPool } = require("newredis")
const { Logger } = require("colourlogger")



class RedisExecutor extends Logger {
  /**
   * Create a Redis connection pool and assign it to instance attribute "pool".
   * @param {Object} config - Object like { host: x, port: x, ... }.
   */
  constructor(config) {
    super("RedisExecutor")
    this.pool = new RedisConnectionPool(config)
    this.pool.disableLog()
  }

  /**
   * This function is just a simple wrapper for redis's execute method. It is
   * the most fundamental method.
   * @param {string[]} command - Array like [ "hgetall", "blah" ]
   */
  async execute(command) {
    this.debug(`Trying to execute redis command: ${inspect(command)}`)
    const conn = await this.pool.getConnection()
    try {
      return await conn.execute(command)
    } finally {
      conn.release()
    }
  }

  /**
   * Similar to hgetall, will parse the array returned by redis, and return
   * an object.
   * @param {string[]} fields
   * @returns {Object}
   */
  async hmget(key, fields) {
    if (!isNonEmptyArray(fields)) {
      throw new RedisExecutorError(`hmget fields: ${inspect(fields)}`)
    }
    const r = await this.execute(["hmget", key, ...fields])
    return listToObject_2(fields, r)
  }

  /**
   * @param {Object} obj
   */
  async hmset(key, obj) {
    return await this.execute(objToHmsetStr(key, obj))
  }

  /**
   * Redis will return hgetall result as array, this method parse the array,
   * and return an object.
   * @returns {Object}
   */
  async hgetall(key) {
    const r = await this.execute(["hgetall", key])
    return listToObject_1(r)
  }

  /**
   * Show details(`free` and `broken` flag) of connections in the connection
   * pool.
   */
  inspectPool() {
    this.info(`Pool status: ${inspect(this.pool.inspectPool())}`)
  }

  countFreeConn() {
    const poolStatus = this.pool.inspectPool()
    const s = poolStatus.filter(x => x.free || x.broken)
    this.info(`${s.length} of ${poolStatus.length} connections free.`)
  }
}



function isNonEmptyArray(obj) {
  return Array.isArray(obj) && obj.length > 0
}


/**
 * objToHmsetStr("x", { a: 1, b: 2 }) //=> [ 'hmset', 'x', 'a', 1, 'b', 2 ]
 * @param {string} key
 * @param {Object} obj
 */
function objToHmsetStr(key, obj) {
  return ["hmset", key, ...[].concat(...Object.entries(obj))]
}


/**
 * listToObject_1([ "a", 1, "b", 2, "c", 3 ]) //=> { a: 1, b: 2, c: 3 }
 * @param {string[]} list
 */
function listToObject_1(list) {
  const result = {}
  for (var i = 0; i < list.length; i += 2) {
    result[list[i]] = list[i + 1]
  }
  return result
}


/**
 * listToObject_2([ "a", "b", "c" ], [ 1, 2, 3 ]) //=> { a: 1, b: 2, c: 3 }
 * @param {string[]} l1
 * @param {string[]} l2
 */
function listToObject_2(l1, l2) {
  return pairsToObject(l1.map((x, i) => [x, l2[i]]))
}


/**
 * pairsToObject([[ "a", 1 ], [ "b", 2 ]]) //=> { a: 1, b: 2 }
 * @param {Array} pairList
 */
function pairsToObject(pairList) {
  const result = {}
  pairList.forEach(([k, v]) => result[k] = v)
  return result
}



/**
 * This object holds all references of RedisConnectionPool Objects.
 */
const executors = {}


/**
 * This is the recommended way to get RedisExecutor objects from this module.
 */
function getRedisExecutor(config) {
  const key = config ? objecthash(config) : "default"

  if (!executors.hasOwnProperty(key)) {
    executors[key] = new RedisExecutor(config)
    return executors[key]
  } else {
    return executors[key]
  }
}


module.exports = {
  RedisExecutor,
  getRedisExecutor,
}

