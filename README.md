# Mon(g)ad

Monadic wrapper around MongoDB, using data types from [fp-ts](https://github.com/gcanti/fp-ts).

# Functions

```js
connect(uri: string, options?: MongoClientOptions }) => TaskEither<MongoError, MongoClient>
```

```js
findOne<T>(collection: string, query: FilterQuery<T>) => ReaderTaskEither<Db, MongoError, T>
```

```js
findMany<T>(collection: string, query: FilterQuery<T>) => ReaderTaskEither<Db, MongoError, T[]>
```

```js
insertOne<T>(collection: string, document: T) => ReaderTaskEither<Db, MongoError, T>
```

```js
insertMany<T>(collection: string, documents: T[]) => ReaderTaskEither<Db, MongoError, T[]>
```

```js
updateOne<T>(collection: string, query: FilterQuery<T>, update: {}) => ReaderTaskEither<Db, MongoError, T>
```

```js
updateMany<T>(collection: string, query: FilterQuery<T>, update: {}) => ReaderTaskEither<Db, MongoError, T[]>
```

```js
deleteOne<T>(collection: string, query: FilterQuery<T>) => ReaderTaskEither<Db, MongoError, T>
```

```js
deleteMany<T>(collection: string, query: FilterQuery<T>) => ReaderTaskEither<Db, MongoError, T[]>
```

This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).
