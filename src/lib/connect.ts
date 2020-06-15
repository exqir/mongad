import {
  connect as mongoConnect,
  MongoClient,
  MongoError,
  MongoClientOptions,
} from 'mongodb'
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { promiseToEither } from './shared'

export const connect = (
  uri: string,
  options: MongoClientOptions = {}
): TaskEither<MongoError, MongoClient> => {
  return () =>
    promiseToEither(
      mongoConnect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ...options,
      })
    )
}

export const getDb = (db: string) => (client: MongoClient) => {
  return client.db(db)
}
