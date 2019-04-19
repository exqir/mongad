import { Db, InsertOneWriteOpResult, MongoError, FilterQuery, DeleteWriteOpResultObject } from 'mongodb'
import { head, lens, view } from 'ramda'
import { ReaderTaskEither } from 'fp-ts/lib/ReaderTaskEither'
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { Task } from 'fp-ts/lib/Task'
import { left, right } from 'fp-ts/lib/Either'

interface OpResult {
  result: {
    ok: number,
    n: number,
  }
}

function createResultLens() {
  return lens<OpResult, number, OpResult>(
    opResult => opResult.result.ok,
    (value, opResult) => ({ ...opResult, result: { ...opResult.result, ok: value } })
  )
}

function createWriteResultLens<T>() {
  return lens<InsertOneWriteOpResult, (T & { _id: string })[], InsertOneWriteOpResult>(
    insterResult => insterResult.ops,
    (value, insertResult) => ({ ...insertResult, ops: value }),
  )
}

function getResultFromOpResult(opResult: OpResult) {
  const lens = createResultLens()
  return view<OpResult, number>(lens, opResult)
}

function getDocumentFromInsertResult<T>(insertResult: InsertOneWriteOpResult) {
  const lens = createWriteResultLens<T>()
  return head(
    view<InsertOneWriteOpResult, (T & { _id: string })[]>(lens, insertResult)
  )
}

export function create<T extends object>(collection: string, document: T) {
  return new ReaderTaskEither((db: Db) => new TaskEither(
    new Task(() => db
      .collection(collection)
      .insertOne(document)
      .then(res => right<MongoError, InsertOneWriteOpResult>(res))
      .catch(err => left<MongoError, InsertOneWriteOpResult>(err))
    )
  )).map<T & { _id: string }>(getDocumentFromInsertResult)
}

export function read<T extends object>(collection: string, query: FilterQuery<T>) {
  return new ReaderTaskEither((db: Db) => new TaskEither(
    new Task(() => db
      .collection(collection)
      .find(query)
      .toArray()
      .then(docs => right<MongoError, (T & { _id: string })[]>(docs))
      .catch(err => left<MongoError, (T & { _id: string })[]>(err))
    )
  ))
}

export function del<T extends object>(collection: string, query: FilterQuery<T>) {
  return new ReaderTaskEither((db: Db) => new TaskEither(
    new Task(() => db
      .collection(collection)
      .deleteMany(query)
      .then(res => right<MongoError, DeleteWriteOpResultObject>(res))
      .catch(err => left<MongoError, DeleteWriteOpResultObject>(err))
    )
  )).map(getResultFromOpResult)
}