import {
  Db,
  InsertOneWriteOpResult,
  Collection,
  InsertWriteOpResult,
} from 'mongodb'
import { head, view } from 'ramda'
import { ReaderTaskEither, } from 'fp-ts/lib/ReaderTaskEither'
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { Task } from 'fp-ts/lib/Task'

import { applyToCollection } from './shared'
import { insertResultLens } from './lenses'

// TODO: Type Collections with Generic. However, this might cause errors through falsy type inference
const insertO = <T>(document: T) => (collection: Collection) => collection.insertOne(document)
const insertM = <T>(documents: T[]) => (collection: Collection) => collection.insertMany(documents)

/**
 * 
 * @param collection 
 * @param document 
 */
export function insertOne<T extends object>(collection: string, document: T) {
  return new ReaderTaskEither((db: Db) => new TaskEither(
    // add <InserWriteOneResult> and solve resulting type error of res inside map
    new Task(() => applyToCollection<InsertOneWriteOpResult>(collection, insertO<T>(document))(db))
  )).map(res => head(
    view<InsertOneWriteOpResult, (T & { _id: string })[]>(insertResultLens<T>(), res)
  ))
}

/**
 * 
 * @param collection 
 * @param document 
 */
export function insertMany<T extends object>(collection: string, documents: T[]) {
  return new ReaderTaskEither((db: Db) => new TaskEither(
    // add <InserWriteOneResult> and solve resulting type error of res inside map
    new Task(() => applyToCollection<InsertWriteOpResult>(collection, insertM<T>(documents))(db))
  )).map(res =>
    view<InsertWriteOpResult, (T & { _id: string })[]>(insertResultLens<T>(), res)
  )
}