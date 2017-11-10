const { getRedisExecutor } = require("../..");


const executor = getRedisExecutor({
  connectionLimit: 2,
  password: "asdf",
});

//executor.disableLog();



function delay(milliseconds) {
  return new Promise((res, _) => setTimeout(res, milliseconds));
}



async function testErrorOp() {
  while (true) {
    try {
      await executor.execute([ "aaget" ]);
    } catch (e) {
      console.error("Err:", e.message);
    }
    await delay(1000);
  }
}



(async function() {
  await testErrorOp();

})().catch(console.error);


