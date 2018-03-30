const { getMysqlExecutor } = require("../..")


/**
 * You can create a test table "t1" with the following sql command:
    CREATE TABLE t1(
      id INT PRIMARY KEY AUTO_INCREMENT, name TEXT, gender INT, age INT
    )
 *
 */

const config = {
    connectionLimit: 2,
    host: "localhost",
    port: 3306,
    user: "root",
    password: "asdf",
    database: "blah",
}

const executor = getMysqlExecutor(config)
//executor.disableLog()



/**
 * This is a test for mysql's connection pool, not for the executor
 */
async function testConnectionLimit() {
    process.stdout.write("Trying to get a connection from executor... ")
    const c1 = await executor.getConnection()
    console.log("Got.")

    process.stdout.write("Trying to get a connection from executor... ")
    const c2 = await executor.getConnection()
    console.log("Got.")

    setTimeout(() => c2.release(), 1000)

    process.stdout.write("Trying to get a connection from executor... ")
    const c3 = await executor.getConnection()
    console.log("Got.")
}



(async function () {
    await testConnectionLimit()

})().catch(console.error)


