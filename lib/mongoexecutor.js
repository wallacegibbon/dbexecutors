const objecthash = require("./objecthash")
const { RedisExecutorError } = require("./errors")
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
        Object.assign(this, { conn: null, error: null })
        mongodb.MongoClient.connect(config, (err, client) => {
            if (!err) {
                this.conn = client
            } else {
                this.err = err
            }
        })
    }

    /**
     * The MongoDB connect process is asynchronous, the connection may not be
     * ready when you want to use it. So check is needed before operations.
     */
    checkConn() {
        if (!this.conn) {
            if (!err) {
                throw new MongoExecutorError("the client is not ready yet")
            } else {
                throw new MongoExecutorError(this.error.message)
            }
        }
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
    async insert(dbName, collName, data) {
        this.checkConn()
        if (!Array.isArray(data)) {
            data = [ data ];
        }
        return await insertDocuments(this.coll(dbName, collName), data)
    }

    /**
     * Find data that match the query.
     * @param {string} dbName
     * @param {string} collName
     * @param {Object} query
     */
    async find(dbName, collName, query) {
        this.checkConn()
        return await findDocuments(this.coll(dbName, collName), query)
    }

    /**
     * Update data record in MongoDB
     * @param {string} dbName
     * @param {string} collName
     * @param {Object} query
     * @param {Object} updateRule MongoDB op like: { $set: { b: 1 } }
     */
    async update(dbName, collName, query, updateRule) {
        this.checkConn()
        return await updateDocument(this.coll(dbName, collName), query, updateRule)
    }

    /**
     * 
     * @param {string} dbName
     * @param {string} collName
     * @param {Object} query 
     */
    async remove(dbName, collName, query) {
        this.checkConn()
        return await removeDocument(this.coll(dbName, collName), query)
    }

    close() {
        this.checkConn()
        this.mongoClient.close()
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

