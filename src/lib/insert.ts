import { Db, Collection, MongoError, OptionalId, WithId } from 'mongodb'
import { ReaderTaskEither } from 'fp-ts/lib/ReaderTaskEither'
import { map } from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/pipeable'

import { applyToCollection } from './shared'

// TODO: Type Collections with Generic. However, this might cause errors through falsy type inference
const insertO = <T extends OptionalId<{}>>(document: T) => (
  collection: Collection<T>
) => collection.insertOne(document as OptionalId<T>)
const insertM = <T extends OptionalId<{}>>(documents: T[]) => (
  collection: Collection<T>
) => collection.insertMany(documents as OptionalId<T>[])

/**
 *
 * @param collection
 * @param document
 */
export function insertOne<T extends OptionalId<{}>>(
  collection: string,
  document: T
): ReaderTaskEither<Db, MongoError, WithId<T>> {
  return (db: Db) =>
    pipe(
      () => pipe(db, applyToCollection(collection, insertO(document))),
      map(res => res.ops[0])
    )
}

/**
 *
 * @param collection
 * @param documents
 */
export function insertMany<T extends OptionalId<{}>>(
  collection: string,
  documents: T[]
): ReaderTaskEither<Db, MongoError, WithId<T>[]> {
  return (db: Db) =>
    pipe(
      () => pipe(db, applyToCollection(collection, insertM(documents))),
      map(res => res.ops)
    )
}
