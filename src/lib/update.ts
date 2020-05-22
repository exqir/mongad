import {
  Db,
  FilterQuery,
  Collection,
  UpdateWriteOpResult,
  MongoError,
} from 'mongodb'
import { ReaderTaskEither, apSecond } from 'fp-ts/lib/ReaderTaskEither'

import { applyToCollection } from './shared'
import { findOne, findMany } from './find'

const updateO = <T>(query: FilterQuery<T>, update: {}) => (
  collection: Collection
) => collection.updateOne(query, update)
const updateM = <T>(query: FilterQuery<T>, update: {}) => (
  collection: Collection
) => collection.updateMany(query, update)

function _updateO<T extends object>(
  collection: string,
  query: FilterQuery<T>,
  update: {}
): ReaderTaskEither<Db, MongoError, UpdateWriteOpResult> {
  return (db: Db) => () =>
    applyToCollection<UpdateWriteOpResult>(
      collection,
      updateO<T>(query, update)
    )(db)
}

/**
 *
 * @param collection
 * @param query
 * @param update
 */
export function updateOne<T extends object>(
  collection: string,
  query: FilterQuery<T>,
  update: {}
): ReaderTaskEither<Db, MongoError, T | null> {
  return apSecond(findOne<T>(collection, query))(
    _updateO(collection, query, update)
  )
}

function _updateM<T extends object>(
  collection: string,
  query: FilterQuery<T>,
  update: {}
): ReaderTaskEither<Db, MongoError, UpdateWriteOpResult> {
  return (db: Db) => () =>
    applyToCollection<UpdateWriteOpResult>(
      collection,
      updateM<T>(query, update)
    )(db)
}

/**
 *
 * @param collection
 * @param query
 * @param update
 */
export function updateMany<T extends object>(
  collection: string,
  query: FilterQuery<T>,
  update: {}
): ReaderTaskEither<Db, MongoError, T[]> {
  return apSecond(findMany<T>(collection, query))(
    _updateM(collection, query, update)
  )
}
