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



function delay(milliseconds) {
  return new Promise((res, _) => setTimeout(res, milliseconds))
}


async function testErrorOp() {
  while (true) {
    try {
      await executor.execute("SELECTT *")
    } catch (e) {
      console.error("**Err:", e.message)
    }
    await delay(1000)
  }
}


(async function () {
  testErrorOp()

})().catch(console.error)


