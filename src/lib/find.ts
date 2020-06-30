import {
  Db,
  Collection,
  FilterQuery,
  MongoError,
  FindOneOptions,
} from 'mongodb'
import { ReaderTaskEither } from 'fp-ts/lib/ReaderTaskEither'
import { flow } from 'fp-ts/lib/function'

import { applyToCollection, toArray } from './shared'

const findO = <T>(query: FilterQuery<T>, options?: FindOneOptions) => (
  collection: Collection<T>
) => collection.findOne(query, options)
const findM = <T>(query: FilterQuery<T>, options?: FindOneOptions) => (
  collection: Collection<T>
) => collection.find(query, options)

/**
 * `findOne` fetches the first document matching the query from the collection or null if no match was found.
 * It wraps MongoDB's [findOne](http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#findOne)
 * into a `ReaderTaskEither<Db, MongoError, T | null>`.
 * @param {string} collection - The collection to search the document in.
 * @param {FilterQuery<T>} query - The query to filter documents by.
 * @param {FindOneOptions} [options] - Optional settings for the query operations.
 * @returns {ReaderTaskEither<Db, MongoError, T | null>} ReaderTaskEither containing the document found by `findOne` or a `MongoError`
 * @example
 *  import { run } from 'fp-ts/lib/ReaderTaskEither'
 *  import { findOne } from 'mongad'
 *
 *  const todo1 = run(findOne('todos', { _id: '1' }), db)
 * @see {@link http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#findOne|findOne}
 * @since 0.1.0
 */
export function findOne<T extends object>(
  collection: string,
  query: FilterQuery<T>,
  options?: FindOneOptions
): ReaderTaskEither<Db, MongoError, T | null> {
  return (db: Db) => () =>
    applyToCollection<T>(collection, findO<T>(query, options))(db)
}

/**
 * `findMany` fetches all documents matching the query from the collection.
 * It wraps MongoDB's [find](http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#find)
 * into a `ReaderTaskEither<Db, MongoError, T[]>`.
 * @param {string} collection - The collection to search the document in.
 * @param {FilterQuery<T>} query - The query to filter documents by.
 * @param {FindOneOptions} [options] - Optional settings for the query operations.
 * @returns {ReaderTaskEither<Db, MongoError, T[]} ReaderTaskEither containing an array of documents found by `find` or a `MongoError`
 * @example
 * import { run } from 'fp-ts/lib/ReaderTaskEither'
 * import { findMany } from 'mongad'
 *
 * const openTodos = run(findMany('todos', { done: false }), db)
 * @see {@link http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#find|find}
 * @since 0.1.0
 */
export function findMany<T extends object>(
  collection: string,
  query: FilterQuery<T>,
  options?: FindOneOptions
): ReaderTaskEither<Db, MongoError, T[]> {
  return (db: Db) => () =>
    applyToCollection<T>(
      collection,
      flow(findM<T>(query, options), toArray)
    )(db)
}
