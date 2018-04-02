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
  RedisExecutorError,
  MongoExecutorError,
}
