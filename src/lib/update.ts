import {
  Db,
  FilterQuery,
  Collection,
  UpdateWriteOpResult,
} from 'mongodb'
import { ReaderTaskEither, } from 'fp-ts/lib/ReaderTaskEither'
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { Task } from 'fp-ts/lib/Task'

import { applyToCollection } from './shared'
import { findMany } from './find'

const updateO = <T>(query: FilterQuery<T>, update: {}) => (collection: Collection) => collection.updateOne(query, update)

function _updateO<T extends object>(collection: string, query: FilterQuery<T>, update: {}) {
  return new ReaderTaskEither((db: Db) => new TaskEither(
    new Task(() => applyToCollection<UpdateWriteOpResult>(collection, updateO<T>(query, update))(db))
  ))
}

// TODO: Return updated items instead of number
/**
 * 
 * @param collection 
 * @param query 
 * @param update 
 */
export function updateOne<T extends object>(collection: string, query: FilterQuery<T>, update: {}) {
  return _updateO(collection, query, update).applySecond(findMany<T>(collection, query))
}