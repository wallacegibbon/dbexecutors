const { getMongoExecutor } = require("../..")


const executor = getMongoExecutor('mongodb://localhost:27017')

(async function() {
    await executor.insert("testdb", "testcoll", { a: 3, b: 2})

})().catch(console.error)
