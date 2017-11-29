# Introduction


## What is this?

Database manipulations can be very boring, you need to create a connection, do CRUD by sending commands to database server, close connection, re-establish the broken connection... And with Node.js, you also need to listen to those network events and deal with a lot of callbacks.

A connection pool could make it easier, but most Node.js connection pool packages didn't give us the async/await interface, and you still need to `release` the connection after you use it. Sometimes I just want a function that helps me execute a sql string, or a redis command. I don't want to care about the network connection stuffs, or listen to any network events.

With this package, you don't need to do those boring things anymore, `dbexecutors` give you a simple Promise-based interface, and do all those necessary things underground.


## Basic Usage

For example, with MysqlExecutor, you just need to create a executor first(tell it which server to connect):
```js
const executor = dbexecutors.getMysqlExecutor({
  host: "localhost",
  port: 3306,
  password: "asdf",
  //...
});
```

Then you can use it like this(code should be inside an async function):
```js
//...
await executor.insert("t1", { name: "x", age: 6, gender: 1 });
// You can also write:
await executor.execute('INSERT INTO t1(name, age) VALUES("x", 6)');

//...
const r = await executor.select("t1", { name: "x" });
//...
```

RedisExecutor works the same way.

```js
const executor = dbexecutors.getRedisExecutor({
  host: "localhost",
  port: 6379,
  password: "asdf",
});
```

```js
//...
await executor.execute([ "set", "test_string", "hello, redisexecutor" ]);
//...
const r = await executor.execute([ "get", "test_string" ]);
//...
```


## Transaction

For redis, you don't need transaction, you can and should use redis script instead. These are some contents you can find in <https://redis.io/topics/transactions>

> A Redis script is transactional by definition, so everything you can do with a Redis transaction, you can also do with a script, and usually the script will be both simpler and faster.

Actually Redis may remove transaction in the future and use redis script only.

> However it is not impossible that in a non immediate future we'll see that the whole user base is just using scripts. If this happens we may deprecate and finally remove transactions.


For mysql, you do need transaction. In this case, you need to get connection from the connection pool and release it after you finishing your query.

It's still the Promise based way, you can see the example in `test/mysql/transaction.js`.


