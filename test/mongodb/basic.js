const { getMongoExecutor } = require("../..")
const { inspect } = require("util")


const executor = getMongoExecutor('mongodb://localhost:27017')


function delay(ms) {
  return new Promise((res, rej) => setTimeout(res, ms))
}


(async function () {
  await executor.connect()

  var r
  r = await executor.insert("testdb", "testcoll", { a: 3, b: 2 })
  console.log("insert result:", inspect(r))

  r = await executor.update("testdb", "testcoll", { a: 3 }, { $set: { a: 30 }})
  // console.log("update result:", inspect(r))
  console.log("update count:", inspect(r.result.n))

  executor.close()
})().catch(console.error)

