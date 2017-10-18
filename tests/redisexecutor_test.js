const { getRedisExecutor } = require("../lib/redisexecutor");


const config = {
  connectionLimit: 2,

  //keepalivePeriod: 1000*60*3,
  keepalivePeriod: 1000*3,
};

const executor = getRedisExecutor(config);


async function testCrud() {
  console.log("Testing String.".padEnd(75, "-"));
  await executor.execute([ "set", "test_string", "hello, redisexecutor" ]);
  var r = await executor.execute([ "get", "test_string" ]);
  console.log("r:", r);

  console.log("Testing Hash.".padEnd(75, "-"));
  await executor.execute([ "hmset", "test_hash", "name", "Wallace", "age", 26 ]);
  var r = await executor.execute([ "hgetall", "test_hash" ]);
  console.log("r:", r);
}


(async function() {
  await testCrud();

})().catch(console.error);


