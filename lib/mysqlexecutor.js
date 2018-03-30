const objecthash = require("./objecthash")

const { inspect } = require("util")
const mysql = require("mysql")

const { Logger } = require("colourlogger")
const { mkInsert, mkDelete, mkUpdate, mkSelect } = require("sqlmaker")
const { MysqlTranactionError, MysqlExecutorError } = require("./errors")



class MysqlExecutor extends Logger {
    /**
     * Create a Mysql connection pool and assign it to instance attribute "pool".
     * @param {Object} config - Object like { host: x, port: x, user: x, ... }
     */
    constructor(config) {
        super("MysqlExecutor")
        this.pool = mysql.createPool(config)
    }

    /**
     * Get a connection from the mysql connection pool. This is just a simple
     * wrapper for mysql's getConnection method.
     */
    getConnection() {
        return new Promise((res, rej) => {
            this.pool.getConnection((e, c) => e ? rej(e) : res(wrapper(c)))
        })
    }

    /**
     * This function is just a simple wrapper for mysql-node's query method.
     * It is the most fundamental method.
     */
    async execute(sqlString) {
        this.trace(`Trying to execute SQL string: ${sqlString}`)
        const conn = await this.getConnection()
        try {
            return await conn.execute(sqlString)
        } finally {
            conn.release()
        }
    }

    /**
     * e.g. select("t1", [ "name", "gender", "age" ], { gender: 1 },
     *             "ORDER BY age DESC LIMIT 3 OFFSET 1")
     *
     * e.g. select("t1", "*", { gender: 1 })
     *
     * @returns {Array} - Array of RowDataPacket object.
     */
    async select(table, fields, whereCond, extra) {
        const q = mkSelect(table, fields, whereCond, extra)
        return await this.execute(q)
    }

    /**
     * e.g. insert("t1", { name: "wallace", age: 26, gender: 1 })
     * @returns {OkPacket}
     */
    async insert(table, obj) {
        return await this.execute(mkInsert(table, obj))
    }

    /**
     * e.g. update("t1", { age: 27 }, { name: "wallace" })
     * @returns {OkPacket}
     */
    async update(table, newData, whereCond) {
        return await this.execute(mkUpdate(table, newData, whereCond))
    }

    /**
     * e.g. remove("t1", { name: "wallace", age: 26 })
     * @returns {OkPacket}
     */
    async remove(table, whereCond) {
        return await this.execute(mkDelete(table, whereCond))
    }

    /**
     * For basic `getConnection`, `query`, `release` test.
     */
    async testQuery() {
        const r = await this.execute('SHOW VARIABLES LIKE "wait_timeout"')
        this.info(`testQuery: ${r}`)
    }
}




/**
 * Wrap functions to conn, then you can use `await conn.beginTransaction()`.
 */
function wrapper(conn) {
    conn.transactionStart = beginTransactionPromise.bind(null, conn)
    conn.transactionRollback = rollbackPromise.bind(null, conn)
    conn.transactionCommit = commitPromise.bind(null, conn)
    conn.execute = queryPromise.bind(null, conn)

    return conn
}


function queryPromise(conn, sqlString) {
    return new Promise((res, rej) => {
        conn.query(sqlString, (e, result, _) => e ? rej(e) : res(result))
    })
}


function beginTransactionPromise(conn) {
    return new Promise((res, rej) => {
        conn.beginTransaction(e => e ? rej(e) : res())
    })
}


function rollbackPromise(conn) {
    return new Promise((res, rej) => conn.rollback(res))
}


function commitPromise(conn) {
    return new Promise((res, rej) => {
        conn.commit(e => e ? rej(e) : res())
    })
}



/**
 * This object holds all references of MysqlExecutor Objects.
 */
const executors = {}


/**
 * This is the recommended way to get MysqlExecutor objects from this module.
 */
function getMysqlExecutor(config) {
    const key = config ? objecthash(config) : "default"

    if (!executors.hasOwnProperty(key)) {
        executors[key] = new MysqlExecutor(config)
        return executors[key]
    } else {
        return executors[key]
    }
}


module.exports = {
    MysqlExecutor,
    getMysqlExecutor,
}

