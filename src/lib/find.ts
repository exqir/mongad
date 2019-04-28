import {
  Db,
  Collection,
  FilterQuery,
} from 'mongodb'
import { compose } from 'ramda'
import { ReaderTaskEither, } from 'fp-ts/lib/ReaderTaskEither'
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { Task } from 'fp-ts/lib/Task'

import { applyToCollection, toArray } from './shared'

const findM = <T>(query: FilterQuery<T>) => (collection: Collection<T>) => collection.find(query)

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