const { getRedisExecutor } = require("../..")


const executor = getRedisExecutor({
    connectionLimit: 2,
    password: "asdf",
    dbNum: 3,
})


async function testCrud() {
    console.log("Testing get empty key.".padEnd(75, "-"))
    await executor.execute(["set", "blahblah", "what?"])
}

(async function () {
    await testCrud()

})().catch(console.error)


