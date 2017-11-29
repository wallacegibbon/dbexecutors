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
  const conn = await executor.getConnection();

  await conn.transactionStart();

  try {
    await conn.execute(`update t1 set age=31 where name="Luke"`);
    //await conn.execute(`update t1 get`);
    await conn.execute(`update t1 set age=30 where name="Jessica"`);
    conn.transactionCommit();
  } catch (e) {
    conn.transactionRollback();
    console.error("E:", e);
  }

  conn.release();
}


(async function() {
  await testCrud();

})().catch(console.error);


