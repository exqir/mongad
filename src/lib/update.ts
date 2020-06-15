import {
  Db,
  FilterQuery,
  Collection,
  UpdateWriteOpResult,
  MongoError,
  UpdateOneOptions,
  UpdateManyOptions,
  UpdateQuery,
} from 'mongodb'
import { ReaderTaskEither, apSecond } from 'fp-ts/lib/ReaderTaskEither'

import { applyToCollection } from './shared'
import { findOne, findMany } from './find'

type Update<T> = UpdateQuery<T> | Partial<T>

const updateO = <T>(
  query: FilterQuery<T>,
  update: Update<T>,
  options?: UpdateOneOptions
) => (collection: Collection<T>) => collection.updateOne(query, update, options)
const updateM = <T>(
  query: FilterQuery<T>,
  update: Update<T>,
  options?: UpdateManyOptions
) => (collection: Collection<T>) =>
  collection.updateMany(query, update, options)

function _updateO<T extends object>(
  collection: string,
  query: FilterQuery<T>,
  update: Update<T>,
  options?: UpdateOneOptions
): ReaderTaskEither<Db, MongoError, UpdateWriteOpResult> {
  return (db: Db) => () =>
    applyToCollection<T, UpdateWriteOpResult>(
      collection,
      updateO<T>(query, update, options)
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
  update: Update<T>,
  options?: UpdateOneOptions
): ReaderTaskEither<Db, MongoError, T | null> {
  return apSecond(findOne<T>(collection, query))(
    _updateO(collection, query, update, options)
  )
}

function _updateM<T extends object>(
  collection: string,
  query: FilterQuery<T>,
  update: Update<T>,
  options?: UpdateManyOptions
): ReaderTaskEither<Db, MongoError, UpdateWriteOpResult> {
  return (db: Db) => () =>
    applyToCollection<T, UpdateWriteOpResult>(
      collection,
      updateM<T>(query, update, options)
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
  update: Update<T>,
  options?: UpdateManyOptions
): ReaderTaskEither<Db, MongoError, T[]> {
  return apSecond(findMany<T>(collection, query))(
    _updateM(collection, query, update, options)
  )
}
