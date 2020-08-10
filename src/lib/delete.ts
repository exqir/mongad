import {
  Db,
  FilterQuery,
  DeleteWriteOpResultObject,
  Collection,
  MongoError,
  CommonOptions,
} from 'mongodb'
import { pipe } from 'fp-ts/lib/pipeable'
import { ReaderTaskEither, chainFirst } from 'fp-ts/lib/ReaderTaskEither'

import { applyToCollection } from './shared'
import { findOne, findMany } from './find'

type DeleteOneOptions = CommonOptions & { bypassDocumentValidation?: boolean }
type DeleteManyOptions = CommonOptions

const deleteO = <T>(query: FilterQuery<T>, options?: DeleteOneOptions) => (
  collection: Collection<T>
) => collection.deleteOne(query, options)
const deleteM = <T>(query: FilterQuery<T>, options?: DeleteManyOptions) => (
  collection: Collection<T>
) => collection.deleteMany(query, options)

function _deleteOne<T extends object>(
  collection: string,
  query: FilterQuery<T>,
  options?: DeleteOneOptions
): ReaderTaskEither<Db, MongoError, DeleteWriteOpResultObject> {
  return applyToCollection<T, DeleteWriteOpResultObject>(
    collection,
    deleteO<T>(query, options)
  )
}
/**
 *
 * @param collection
 * @param query
 */
export function deleteOne<T extends object>(
  collection: string,
  query: FilterQuery<T>,
  options?: DeleteOneOptions
): ReaderTaskEither<Db, MongoError, T | null> {
  return pipe(
    findOne<T>(collection, query),
    chainFirst(() => _deleteOne<T>(collection, query, options))
  )
}

function _deleteMany<T extends object>(
  collection: string,
  query: FilterQuery<T>,
  options?: DeleteManyOptions
): ReaderTaskEither<Db, MongoError, DeleteWriteOpResultObject> {
  return applyToCollection<T, DeleteWriteOpResultObject>(
    collection,
    deleteM<T>(query, options)
  )
}
/**
 *
 * @param collection
 * @param query
 */
export function deleteMany<T extends object>(
  collection: string,
  query: FilterQuery<T>,
  options?: DeleteManyOptions
): ReaderTaskEither<Db, MongoError, T[]> {
  return pipe(
    findMany<T>(collection, query),
    chainFirst(() => _deleteMany<T>(collection, query, options))
  )
}
