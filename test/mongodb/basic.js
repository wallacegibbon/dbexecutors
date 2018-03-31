const { getMongoExecutor } = require("../..")


const executor = getMongoExecutor('mongodb://localhost:27017')


function delay(ms) {
  return new Promise((res, rej) => setTimeout(res, ms))
}


(async function () {
  await executor.connect()

  const r = await executor.insert("testdb", "testcoll", { a: 3, b: 2 })
  console.log("r:", r)

})().catch(console.error)

