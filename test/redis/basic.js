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
      await executor.execute([ "set", "test_string", "hello, redisexecutor" ]);
      var r = await executor.execute([ "get", "test_string" ]);
      console.log("r:", r);

      console.log("Testing hmset.".padEnd(75, "-"));
      await executor.hmset("test_hash", { name: "Wallace", age: 26 });

      console.log("Testing hgetall.".padEnd(75, "-"));
      var r = await executor.hgetall("test_hash");
      console.log("r:", r);

      console.log("Testing hmget(1).".padEnd(75, "-"));
      var r = await executor.hmget("test_hash", [ "name" ]);
      console.log("r:", r);

      console.log("Testing hmget(2).".padEnd(75, "-"));
      var r = await executor.hmget("test_hash");
      console.log("r:", r);

      console.log();
    } catch (e) {
      console.error("Failed testCrud:", e);
    }

    await delay(2000);
  }

}

(async function() {
  await testCrud();

})().catch(console.error);


