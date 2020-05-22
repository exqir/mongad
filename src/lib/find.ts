import { Db, Collection, FilterQuery, MongoError } from 'mongodb'
import { ReaderTaskEither } from 'fp-ts/lib/ReaderTaskEither'
import { flow } from 'fp-ts/lib/function'

import { applyToCollection, toArray } from './shared'

const findO = <T>(query: FilterQuery<T>) => (collection: Collection<T>) =>
  collection.findOne(query)
const findM = <T>(query: FilterQuery<T>) => (collection: Collection<T>) =>
  collection.find(query)

/**
 *
 */
export function findOne<T extends object>(
  collection: string,
  query: FilterQuery<T>
): ReaderTaskEither<Db, MongoError, T | null> {
  return (db: Db) => () => applyToCollection<T>(collection, findO<T>(query))(db)
}

/**
 *
 * @param collection
 * @param query
 */
export function findMany<T extends object>(
  collection: string,
  query: FilterQuery<T>
): ReaderTaskEither<Db, MongoError, T[]> {
  return (db: Db) => () =>
    applyToCollection<T>(collection, flow(findM<T>(query), toArray))(db)
}
