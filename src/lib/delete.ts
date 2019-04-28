import {
  Db,
  FilterQuery,
  DeleteWriteOpResultObject,
  Collection,
} from 'mongodb'
import { ReaderTaskEither, } from 'fp-ts/lib/ReaderTaskEither'
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { Task } from 'fp-ts/lib/Task'

import { applyToCollection } from './shared'
import { findMany } from './find'

const deleteM = <T>(query: FilterQuery<T>) => (collection: Collection) => collection.deleteMany(query)

function _deleteMany<T extends object>(collection: string, query: FilterQuery<T>) {
  return new ReaderTaskEither((db: Db) => new TaskEither(
    new Task(() => applyToCollection<DeleteWriteOpResultObject>(collection, deleteM<T>(query))(db))
  ))
}
/**
 * 
 * @param collection 
 * @param query 
 */
export function deleteMany<T extends object>(collection: string, query: FilterQuery<T>) {
  return findMany(collection, query).applyFirst(_deleteMany<T>(collection, query))
}