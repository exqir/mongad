import { Db, InsertOneWriteOpResult, FilterQuery, DeleteWriteOpResultObject, Collection } from 'mongodb'
import { head, view, compose } from 'ramda'
import { ReaderTaskEither, } from 'fp-ts/lib/ReaderTaskEither'
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { Task } from 'fp-ts/lib/Task'

import { applyToCollection, toArray, insertResultLens, opResultValueLens } from './shared'

const insertO = <T>(document: T) => (collection: Collection) => collection.insertOne(document)
const findM = <T>(query: FilterQuery<T>) => (collection: Collection<T>) => collection.find(query)
const deleteM = <T>(query: FilterQuery<T>) => (collection: Collection) => collection.deleteMany(query)

/**
 * 
 * @param collection 
 * @param document 
 */
export function insertOne<T extends object>(collection: string, document: T) {
  return new ReaderTaskEither((db: Db) => new TaskEither(
    // add <InserWriteOneResult> and solve resulting type error of res inside map
    new Task(() => applyToCollection(collection, insertO<T>(document))(db))
  )).map(res => head(
    view<InsertOneWriteOpResult, (T & { _id: string })[]>(insertResultLens<T>(), res)
  ))
}

/**
 * 
 * @param collection
 * @param query 
 */
export function findMany<T extends object>(collection: string, query: FilterQuery<T>) {
  return new ReaderTaskEither((db: Db) => new TaskEither(
    new Task(() => applyToCollection<T>(collection, compose(
      toArray,
      findM(query),
    ))(db))
  ))
}

/**
 * 
 * @param collection 
 * @param query 
 */
export function deleteMany<T extends object>(collection: string, query: FilterQuery<T>) {
  return new ReaderTaskEither((db: Db) => new TaskEither(
    new Task(() => applyToCollection<DeleteWriteOpResultObject>(collection, deleteM<T>(query))(db))
  )).map(view<DeleteWriteOpResultObject, number>(opResultValueLens()))
}
