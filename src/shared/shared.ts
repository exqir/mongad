import { Db, MongoError, Collection, Cursor } from 'mongodb'
import { compose } from 'ramda'
import { Either, left, right } from 'fp-ts/lib/Either'

/**
 * Get collection from Database
 * @param {string} collection Name of collection
 * @param {Db} db Mongo Database object
 * @returns {Collection} Collection with given name from provided Database
 */
export const getCollection = <T>(collection: string) => (db: Db): Collection<T> => db.collection(collection)

/**
 * Takes a Promise of Type `R` and returns an Either with the success value on the right side and a `MongoError` on the left side in case of failure.
 * @param {Promise<R>} p Promise<R>
 * @returns {Either<MongoError, R>} Either<MongoError, R>
 */
export const promiseToEither = <R>(p: Promise<R>) => p.then(r => right<MongoError, R>(r)).catch(err => left<MongoError, R>(err))

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
export function applyToCollection<R>(collection: string, f: (collection: Collection<R>) => Promise<R>): (db: Db) => Promise<Either<MongoError, R>>
export function applyToCollection<R>(collection: string, f: (collection: Collection<R>) => Promise<R[]>): (db: Db) => Promise<Either<MongoError, R[]>>
export function applyToCollection<R>(collection: string, f: (collection: Collection<R>) => Promise<R | R[]>) {
  return compose(
    promiseToEither,
    f,
    getCollection<R>(collection),
  )
}
