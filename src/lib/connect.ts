import {
  connect as mongoConnect,
  MongoClient,
  MongoError,
  MongoClientOptions,
} from 'mongodb'
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { toTaskEither } from './shared'

export const connect = (
  uri: string,
  options: MongoClientOptions = {}
): TaskEither<MongoError, MongoClient> => {
  return toTaskEither(() =>
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
