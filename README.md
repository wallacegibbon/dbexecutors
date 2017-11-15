# Introduction


## Why this module?

Database manipulations can be very boring, you need to create a connection, do CRUD by sending commands to database server, close connection, re-establish the broken connection...

A connection pool could make it easier, but you still need to `release` the connection after you use it. Sometimes I just want a function that help me execute a sql string, or a redis command. I don't want to care about the network connection stuffs.

With this package, the hope comes true.

You don't need to do those boring things anymore, `dbexecutors` will do it for you. And this is all you need to do:
1. Get the Executor.
2. Execute commands.

Whatever exception you met when executing a command, just `catch` the exception, and do what you usually do when normal exceptions raised. There is no need to handle any events, or release any resources.



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

