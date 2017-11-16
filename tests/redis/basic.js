const { getRedisExecutor } = require("../..");


const executor = getRedisExecutor({
  connectionLimit: 2,
  password: "asdf",
});

//executor.disableLog();
//executor.disableLogColor();



function delay(milliseconds) {
  return new Promise((res, _) => setTimeout(res, milliseconds));
}





async function testCrud() {
  while (true) {
    try {
      console.log("Testing String.".padEnd(75, "-"));
      await executor.set("test_string", "hello, redisexecutor");
      var r = await executor.get("test_string");
      console.log("r:", r);

      console.log("Testing Hash.".padEnd(75, "-"));
      await executor.hmset("test_hash", { name: "Wallace", age: 26 });

      console.log("Testing hgetall.".padEnd(75, "-"));
      var r = await executor.hgetall("test_hash");
      console.log("r:", r);

      console.log("Testing hmget.".padEnd(75, "-"));
      var r = await executor.hmget("test_hash", [ "name" ]);
      console.log("r:", r);

    } catch (e) {
      console.error("Failed testCrud:", e);
    }

    await delay(1000);
  }

}

(async function() {
  await testCrud();

})().catch(console.error);


