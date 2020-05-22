import {
  Db,
  FilterQuery,
  DeleteWriteOpResultObject,
  Collection,
  MongoError,
} from 'mongodb'
import { ReaderTaskEither, apFirst } from 'fp-ts/lib/ReaderTaskEither'

import { applyToCollection } from './shared'
import { findOne, findMany } from './find'

const deleteO = <T>(query: FilterQuery<T>) => (collection: Collection) =>
  collection.deleteOne(query)
const deleteM = <T>(query: FilterQuery<T>) => (collection: Collection) =>
  collection.deleteMany(query)

function _deleteOne<T extends object>(
  collection: string,
  query: FilterQuery<T>
): ReaderTaskEither<Db, MongoError, DeleteWriteOpResultObject> {
  return (db: Db) => () =>
    applyToCollection<DeleteWriteOpResultObject>(
      collection,
      deleteO<T>(query)
    )(db)
}
/**
 *
 * @param collection
 * @param query
 */
export function deleteOne<T extends object>(
  collection: string,
  query: FilterQuery<T>
): ReaderTaskEither<Db, MongoError, T | null> {
  return apFirst(_deleteOne<T>(collection, query))(
    findOne<T>(collection, query)
  )
}

function _deleteMany<T extends object>(
  collection: string,
  query: FilterQuery<T>
): ReaderTaskEither<Db, MongoError, DeleteWriteOpResultObject> {
  return (db: Db) => () =>
    applyToCollection<DeleteWriteOpResultObject>(
      collection,
      deleteM<T>(query)
    )(db)
}
/**
 *
 * @param collection
 * @param query
 */
export function deleteMany<T extends object>(
  collection: string,
  query: FilterQuery<T>
): ReaderTaskEither<Db, MongoError, T[]> {
  return apFirst(_deleteMany<T>(collection, query))(
    findMany<T>(collection, query)
  )
}
