import { InsertOneWriteOpResult, DeleteWriteOpResultObject } from 'mongodb'
import { lens } from 'ramda'

export function opResultValueLens() {
  return lens<DeleteWriteOpResultObject, number, DeleteWriteOpResultObject>(
    opResult => opResult.deletedCount,
    (value, opResult) => ({ ...opResult, deletedCount: value })
  )
}

export function insertResultLens<T>() {
  return lens<InsertOneWriteOpResult, T[], InsertOneWriteOpResult>(
    insertResult => insertResult.ops,
    (value, insertResult) => ({ ...insertResult, ops: value }),
  )
}