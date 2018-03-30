const { getMysqlExecutor } = require("./lib/mysqlexecutor")
const { getRedisExecutor } = require("./lib/redisexecutor")
const { getMongoExecutor } = require("./lib/mongoexecutor")

module.exports = {
    getMysqlExecutor,
    getRedisExecutor,
    getMongoExecutor,
}
