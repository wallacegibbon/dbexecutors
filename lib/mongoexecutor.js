const objecthash = require("./objecthash")
const { MongoExecutorError } = require("./errors")
const mongodb = require('mongodb')
const { Logger } = require("colourlogger")



class MongoExecutor extends Logger {
  /**
   * MongoDB configurations is usually represented as a URL. Object styled
   * configuration is not supported yet.
   * @param {Object|string} config
   */
  constructor(config) {
    super("MongoExecutor")
    this.config = config
    this.conn = null
    this.error = null
  }

  /**
   * Client should call `await connect()' to wait for the connection to be
   * ready.
   */
  connect() {
    return new Promise((res, rej) => {
      mongodb.MongoClient.connect(this.config, (err, client) => {
        if (err) {
          rej(new MongoExecutorError(err.message))
        } else {
          this.conn = client
          res("ok")
        }
      })
    })
  }

  /**
   * Get the collection object from database name and collection name.
   * @param {string} dbName
   * @param {string} collName
   */
  coll(dbName, collName) {
    return this.conn.db(dbName).collection(collName)
  }

  /**
   * Insert new record into MongoDB
   * @param {string} dbName
   * @param {string} collName
   * @param {Object} data
   */
  insert(dbName, collName, data) {
    if (!Array.isArray(data)) {
      data = [data];
    }
    return insertDocuments(this.coll(dbName, collName), data)
  }

  /**
   * Find data that match the query.
   * @param {string} dbName
   * @param {string} collName
   * @param {Object} query
   */
  find(dbName, collName, query) {
    return findDocuments(this.coll(dbName, collName), query)
  }

  /**
   * Update data record in MongoDB
   * @param {string} dbName
   * @param {string} collName
   * @param {Object} query
   * @param {Object} updateRule MongoDB op like: { $set: { b: 1 } }
   */
  update(dbName, collName, query, updateRule) {
    return updateDocument(this.coll(dbName, collName), query, updateRule)
  }

  /**
   *
   * @param {string} dbName
   * @param {string} collName
   * @param {Object} query
   */
  remove(dbName, collName, query) {
    return removeDocument(this.coll(dbName, collName), query)
  }

  close() {
    this.conn.close()
  }
}


function insertDocuments(collection, dataList) {
  return new Promise((res, rej) => {
    collection.insertMany(dataList, (err, result) => {
      if (!err) {
        res(result)
      } else {
        rej(err)
      }
    })
  })
}

function findDocuments(collection, query) {
  return new Promise((res, rej) => {
    collection.find(query).toArray((err, docs) => {
      if (!err) {
        res(docs)
      } else {
        rej(err)
      }
    })
  })
}

function updateDocument(collection, query, updateRule) {
  return new Promise((res, rej) => {
    collection.update(query, updateRule, (err, result) => {
      if (!err) {
        res(result)
      } else {
        rej(err)
      }
    })
  })
}


function removeDocument(collection, query) {
  return new Promise((res, rej) => {
    collection.deleteOne(query, (err, result) => {
      if (!err) {
        res(result)
      } else {
        rej(err)
      }
    })
  })
}



/**
 * This object holds all references of RedisConnectionPool Objects.
 */
const executors = {}


/**
 * This is the recommended way to get MongoExecutor objects from this module.
 */
function getMongoExecutor(config) {
  const key = config ? objecthash(config) : "default"

  if (!executors.hasOwnProperty(key)) {
    executors[key] = new MongoExecutor(config)
    return executors[key]
  } else {
    return executors[key]
  }
}


module.exports = {
  MongoExecutor,
  getMongoExecutor,
}

