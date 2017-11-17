const { getMysqlExecutor } = require("../..");


/**
 * You can create a test table "t1" with the following sql command:
    CREATE TABLE t1(
      id INT PRIMARY KEY AUTO_INCREMENT, name TEXT, gender INT, age INT
    );
 *
 */

const config = {
  connectionLimit: 2,
  host: "localhost",
  port: 3306,
  user: "root",
  password: "asdf",
  database: "blah",
};

const executor = getMysqlExecutor(config);
//executor.disableLog();
//executor.disableLogColor();



async function testCrud() {
  console.log("Testing INSERT.".padEnd(75, "-"));
  await executor.insert("t1", { name: "Wallace", age: 26, gender: 1 });
  await executor.insert("t1", { name: "wx", age: 26, gender: 1 });
  await executor.insert("t1", { name: "Luke", gender: 1 });
  await executor.insert("t1", { name: "Jessica", age: 28 });

  console.log("Testing DELETE.".padEnd(75, "-"));
  await executor.remove("t1", { name: "wx" });

  console.log("Testing UPDATE.".padEnd(75, "-"));
  await executor.update("t1", { age: 27 }, { name: "Wallace", gender: 1 });
  await executor.update("t1", { gender: 2 }, 'name="Jessica" AND age=28');


  console.log("Testing SELECT.".padEnd(75, "-"));
  const r = await executor.select("t1", [ "name" ], { gender: 1 },
                              "ORDER BY name DESC LIMIT 3 OFFSET 1");
  console.log("r:", r);

  r.forEach(o => console.log(o.name));

}


(async function() {
  await testCrud();

})().catch(console.error);

