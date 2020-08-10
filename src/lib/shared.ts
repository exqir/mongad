import { Db, MongoError, Collection, Cursor } from 'mongodb'
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither'
import { flow, Lazy, unsafeCoerce } from 'fp-ts/lib/function'
/**
 * Get collection from Database
 * @param {string} collection Name of collection
 * @param {Db} db Mongo Database object
 * @returns {Collection} Collection with given name from provided Database
 */
export const getCollection = <T>(collection: string) => (
  db: Db
): Collection<T> => db.collection(collection)

/**
 * Takes a lazy Promise of Type `R` and returns a TaskEither with the success value on the right side and a `MongoError` on the left side in case of failure.
 * @param {Lazy<Promise<R>>} f Lazy<Promise<R>>
 * @returns {TaskEither<MongoError, R>} TaskEither<MongoError, R>
 */
export const toTaskEither = <R>(
  f: Lazy<Promise<R>>
): TaskEither<MongoError, R> =>
  tryCatch(f, err => unsafeCoerce<unknown, MongoError>(err))

/**
 * Turns Cursor<T> into a Promise of T[]
 * @param {Cursor<T>} c Cursor<T>
 * @returns {Promise<T[]>} Promise<T[]>
 */
export const toArray = <T>(c: Cursor<T>) => c.toArray()

/**
 * Apply given function to collection and wrap the result in an Either containing `R` / `R[]` as result or a `MongoError`
 * @param {string} collection Name of collection to apply function to
 * @param {func} f Function taking a Collection<R> and returning a Promise<R> or Promise<R[]>
 */
export function applyToCollection<C, R = C>(
  collection: string,
  f: (collection: Collection<C>) => Promise<R | null>
): (db: Db) => TaskEither<MongoError, R>
export function applyToCollection<C, R = C>(
  collection: string,
  f: (collection: Collection<C>) => Promise<R[]>
): (db: Db) => TaskEither<MongoError, R[]>
export function applyToCollection<C, R = C>(
  collection: string,
  f: (collection: Collection<C>) => Promise<R | R[]>
) {
  return flow(getCollection<C>(collection), f, c => toTaskEither(() => c))
}
