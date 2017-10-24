const { getMysqlExecutor } = require("./lib/mysqlexecutor");
const { getRedisExecutor } = require("./lib/redisexecutor");

module.exports = {
  getMysqlExecutor,
  getRedisExecutor,
}
