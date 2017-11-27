const { getRedisExecutor } = require("../..");

const executor = getRedisExecutor({
  connectionLimit: 2,
  password: "asdf",
});



async function testCrud() {
  var r;
  try {
    r = await executor.transaction([
      [ "set", "mycounter", 1 ],
      [ "incr", "mycounter" ],
      [ "blah" ],
      [ "incr", "mycounter" ],
    ]);
    console.log("R:", r);
  } catch (e) {
    console.error("E:", e);
  }

  try {
    r = await executor.transaction([
      [ "set", "mycounter", 1 ],
      [ "incr", "mycounter" ],
      [ "incr", "mycounter" ],
    ]);
    console.log("R:", r);
  } catch (e) {
    console.error("E:", e);
  }
}

(async function() {
  await testCrud();

})().catch(console.error);


