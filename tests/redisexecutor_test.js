const { getRedisExecutor } = require("..");


const executor = getRedisExecutor();


async function testCrud() {
  console.log("Testing String.".padEnd(75, "-"));
  await executor.set("test_string", "hello, redisexecutor");
  var r = await executor.get("test_string");
  console.log("r:", r);

  console.log("Testing Hash.".padEnd(75, "-"));
  await executor.hmset("test_hash", { name: "Wallace", age: 26 });
  var r = await executor.hgetall("test_hash");
  console.log("r:", r);
}


function delay(milliseconds) {
  return new Promise((res, _) => setTimeout(res, milliseconds));
}


(async function() {
  while (true) {
    try {
      await testCrud();
    } catch (e) {
      console.error("Failed testCrud:", e);
    }

    await delay(1000);
  }

})().catch(console.error);


