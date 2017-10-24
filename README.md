# Introduction


## Why this module?

Database manipulations can be very boring, you need to establish a connection, send query, close connection, re-establish the broken connection... And usually you need to use a connection pool.

With this module, you don't need to care about those things anymore, `dbexecutors` will do those things for you. 

And this is all you need to do:
1. Get the Executor.
2. Execute commands.


## Basic Usage

For example, with MysqlExecutor, you just need to create a executor first:
```js
const executor = getMysqlExecutor({
  host: "localhost",
  port: 3306,
  //...
});
```

Then you can use it like this:
```js
(async function() {
  //...
  await executor.insert("t1", { name: "x", age: 6, gender: 1 });
  //...
  await executor.select(...);
  //...
})();
```

CRUD functions all return Promise Objects. So it's easy to use then with ES8's `async` function.

RedisExecutor works the same way.

```js
const executor = getRedisExecutor();
```

```js
(async function() {
  //...
  await executor.set("test_string", "hello, redisexecutor");
  //...
})();
```

