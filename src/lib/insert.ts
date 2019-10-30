import {
  Db,
  InsertOneWriteOpResult,
  Collection,
  InsertWriteOpResult,
  MongoError,
} from 'mongodb'
import { head, view } from 'ramda'
import { ReaderTaskEither, map } from 'fp-ts/lib/ReaderTaskEither'

import { applyToCollection } from './shared'
import { insertResultLens } from './lenses'

// TODO: Type Collections with Generic. However, this might cause errors through falsy type inference
const insertO = <T>(document: T) => (collection: Collection<T>) =>
  collection.insertOne(document) as unknown as Promise<InsertOneWriteOpResult<T>>
const insertM = <T>(documents: T[]) => (collection: Collection<T>) =>
  collection.insertMany(documents) as unknown as Promise<InsertWriteOpResult<T>>

/**
 *
 * @param collection
 * @param document
 */
export function insertOne<T extends object>(
  collection: string,
  document: T
): ReaderTaskEither<Db, MongoError, T> {
  return map<InsertOneWriteOpResult<T>, T>(res => head(view<InsertOneWriteOpResult<T>, (T & { _id: string })[]>(insertResultLens<T>(), res)))(
    (db: Db) => () => applyToCollection<T, InsertOneWriteOpResult<T>>(collection, insertO<T>(document))(db)
  )
}

/**
 *
 * @param collection
 * @param document
 */
export function insertMany<T extends object>(
  collection: string,
  documents: T[],
): ReaderTaskEither<Db, MongoError, T[]> {
  return map<InsertWriteOpResult<T>, T[]>(res => view<InsertWriteOpResult<T>, (T & { _id: string })[]>(insertResultLens<T>(), res))(
    (db: Db) => () => applyToCollection<T, InsertWriteOpResult<T>>(collection, insertM<T>(documents))(db)
  )
}
