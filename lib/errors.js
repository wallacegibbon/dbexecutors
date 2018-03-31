class MysqlExecutorError extends Error {
  constructor(message) {
    super()
    errorObjInitializer.call(this, "MysqlExecutorError", message)
  }
}


class MysqlTranactionError extends MysqlExecutorError {
  constructor(message) {
    super()
    errorObjInitializer.call(this, "MysqlTranactionError", message)
  }
}


class RedisExecutorError extends Error {
  constructor(message) {
    super()
    errorObjInitializer.call(this, "RedisExecutorError", message)
  }
}


class MongoExecutorError extends Error {
  constructor(message) {
    super()
    errorObjInitializer.call(this, "MongoExecutorError", message)
  }
}


function errorObjInitializer(name, message) {
  this.name = name
  if (message instanceof Error) {
    this.message = message.message
  } else {
    this.message = message
  }
}


module.exports = {
  MysqlTranactionError,
  MysqlExecutorError,
  RedisExecutorError,
  MongoExecutorError,
}
