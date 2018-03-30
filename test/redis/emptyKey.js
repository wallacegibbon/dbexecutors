const { getRedisExecutor } = require("../..")


const executor = getRedisExecutor({
    connectionLimit: 2,
    password: "asdf",
})

//executor.disableLog()
//executor.disableLogColor()



async function testCrud() {
    console.log("Testing get empty key.".padEnd(75, "-"))
    var r = await executor.execute(["get", "blahblah"])
    console.log("r:", r)

    console.log("Testing hmget empty key.".padEnd(75, "-"))
    r = await executor.hmget("blahblah", ["a", "b"])
    console.log("r:", r)
}

(async function () {
    await testCrud()

})().catch(console.error)


