# Introduction


## What is this?

Database manipulations can be very boring, you need to create a connection, do CRUD by sending commands to database server, close connection, re-establish the broken connection... And with Node.js, you also need to listen to those network events and deal with a lot of callbacks.

A connection pool could make it easier, but most Node.js connection pool packages didn't give us the async/await interface, and you still need to `release` the connection after you use it. Sometimes I just want a function that helps me execute a sql string, or a redis command. I don't want to care about the network connection stuffs, or listen to any network events.

With this package, you don't need to do those boring things anymore, `dbexecutors` give you a simple Promise-based interface, and do all those necessary things underground.


## Basic Usage

For example, with MysqlExecutor, you just need to create a executor first(tell it which server to connect):
```js
const executor = getMysqlExecutor({
  host: "localhost",
  port: 3306,
  password: "1234",
  //...
});
```

Then you can use it like this(code should be inside an async function):
```js
//...
await executor.insert("t1", { name: "x", age: 6, gender: 1 });
//...
await executor.select("t1", { name: "x" });
//...
```

RedisExecutor works the same way.

```js
const executor = getRedisExecutor({
  host: "locoalhost",
  port: 6379,
  password: "1234",
});
```

```js
//...
await executor.set("test_string", "hello, redisexecutor");
//...
await executor.get("test_string");
//...
```

