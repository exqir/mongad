# Mon(g)ad

Mon(g)ad is a thin layer wrapping [MongoDB](https://www.mongodb.com/) CRUD operations in data types from [fp-ts](https://github.com/gcanti/fp-ts).

## Installation

Add Mon(g)ad and its peerDependencies to your project via npm or yarn.

```bash
yarn add mongad mongodb
npm install mongad mongodb --save
```

## API

Mon(g)ad provides two functions for each CRUD operation, one for a single document and one for an array of documents.

### connect

`connect` establishes a connection to a MongoDB, wrapping MongoDB's [connect](http://mongodb.github.io/node-mongodb-native/3.5/api/MongoClient.html#.connect) method.

```ts
connect(uri: string, options?: MongoClientOptions }) => TaskEither<MongoError, MongoClient>
```

`{ useNewUrlParser: true }` is used a default for `MongoClientOptions`.

Example:

```js
import { connect } from 'mongad'

const client = connect('mongodb://localhost', {
  useUnifiedTopology: true,
})()
```

### getDb

`getDb` is a curried function to retrieve a [Db](http://mongodb.github.io/node-mongodb-native/3.5/api/Db.html) from a `MongoClient`.

```ts
getDb(db: string) => (client: MongoClient) => Db
```

Example:

```js
import { map } from 'fp-ts/lib/TaskEither'
import { connect, getDb } from 'mongad'

const todosDb = map(getDb('todo_db'))(
  connect('mongodb://localhost', { useUnifiedTopology: true })
)()
```

### findOne

`findOne` retrives one document matching the query from the collection or null, wraping MongoDB's [findOne](http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#findOne).

```ts
findOne<T>(collection: string, query: FilterQuery<T>) => ReaderTaskEither<Db, MongoError, T | null>
```

Example:

```js
import { run } from 'fp-ts/lib/ReaderTaskEither'
import { findOne } from 'mongad'

const todo1 = run(findOne('todos', { _id: '1' }), db)
```

### findMany

`findMany` retrieves an array of documents matching the query from the collection, wrapping MongoDB's [find](http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#find).

```ts
findMany<T>(collection: string, query: FilterQuery<T>) => ReaderTaskEither<Db, MongoError, T[]>
```

Example:

```js
import { run } from 'fp-ts/lib/ReaderTaskEither'
import { findMany } from 'mongad'

const openTodos = run(findMany('todos', { done: false }), db)
```

### insertOne

`insertOne` adds the provided document to the collection and returns it including the `_id`, wrapping MongoDB's [insertOne](http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#insertOne).

```ts
insertOne<T>(collection: string, document: T) => ReaderTaskEither<Db, MongoError, WithId<T>>
```

Example:

```js
import { run } from 'fp-ts/lib/ReaderTaskEither'
import { insertOne } from 'mongad'

const newTodo = run(
  insertOne('todos', { description: 'Do something', done: false }),
  db
)
```

### insertMany

`insertMany` adds all of the provided documents to the collection and returns them as an array including the `_id`s, wrapping MongoDB's [insertMany](http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#insertMany).

```ts
insertMany<T>(collection: string, documents: T[]) => ReaderTaskEither<Db, MongoError, T[]>
```

Example:

```js
import { run } from 'fp-ts/lib/ReaderTaskEither'
import { insertMany } from 'mongad'

const newTodos = run(
  insertMany('todos', [
    { description: 'Do something', done: false },
    { description: 'Something else ', done: false },
  ]),
  db
)
```

### updateOne

`updateOne` updates one document matching the query in the collection with the provided changes and returns the updated document, wrapping MongoDB's [updateOne](http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#updateOne).

```ts
updateOne<T>(collection: string, query: FilterQuery<T>, update: {}) => ReaderTaskEither<Db, MongoError, T | null>
```

Example:

```js
import { run } from 'fp-ts/lib/ReaderTaskEither'
import { updateOne } from 'mongad'

const updatedTodo = run(
  updateOne('todos', { _id: '1' }, { $set: { done: true } }),
  db
)
```

### updateMany

`updateMany` updates all of the documents matching the query in the collection with the provided changes and returns the updated documents as array, wrapping MongoDB's [updateMany](http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#updateMany).

```ts
updateMany<T>(collection: string, query: FilterQuery<T>, update: {}) => ReaderTaskEither<Db, MongoError, T[]>
```

Example:

```js
import { run } from 'fp-ts/lib/ReaderTaskEither'
import { updateMany } from 'mongad'

const updatedTodos = run(
  updateMany('todos', { done: false }, { $set: { done: true } }),
  db
)
```

### deleteOne

`deleteOne` removes one document matching the query from the collection returning the deleted document, wrapping MongoDB's [deleteOne](http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#deleteOne).

```ts
deleteOne<T>(collection: string, query: FilterQuery<T>) => ReaderTaskEither<Db, MongoError, T | null>
```

Example:

```js
import { run } from 'fp-ts/lib/ReaderTaskEither'
import { deleteOne } from 'mongad'

const removedTodo = run(deleteOne('todos', { _id: '1' }), db)
```

### deleteMany

`deleteOne` removes all documents matching the query from the collection returning the deleted documents as an array, wrapping MongoDB's [deleteMany](http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#deleteMany).

```ts
deleteMany<T>(collection: string, query: FilterQuery<T>) => ReaderTaskEither<Db, MongoError, T[]>
```

Example:

```js
import { run } from 'fp-ts/lib/ReaderTaskEither'
import { deleteMany } from 'mongad'

const removedTodos = run(deleteMany('todos', { done: true }), db)
```

This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).
