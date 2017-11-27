const { getMysqlExecutor } = require("../..");


const config = {
  connectionLimit: 2,
  host: "localhost",
  port: 3306,
  user: "root",
  password: "asdf",
  database: "blah",
};

const executor = getMysqlExecutor(config);


async function testCrud() {
  var r;

  try {
    const r = await executor.transaction([
      `update t1 set age=32 where name="Luke"`,
      `update t1 get`,
      `update t1 set age=31 where name="Jessica"`,
    ]);
    console.log("R:", r);
  } catch (e) {
    console.error("E:", e);
  }

  try {
    const r = await executor.transaction([
      `update t1 set age=32 where name="Luke"`,
      `update t1 set age=31 where name="Jessica"`,
    ]);
    console.log("R:", r);
  } catch (e) {
    console.error("E:", e);
  }
}


(async function() {
  await testCrud();

})().catch(console.error);


