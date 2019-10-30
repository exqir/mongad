import { connect as mongoConnect, MongoClient, MongoError } from 'mongodb'
import { TaskEither } from 'fp-ts/lib/TaskEither'
import { promiseToEither } from './shared'

interface DatabaseConfig {
  server: string;
  port: number;
}

export const connect = ({ server, port }: DatabaseConfig): TaskEither<MongoError, MongoClient> => {
  return () => promiseToEither(mongoConnect(`mongodb://${server}:${port}`, { useNewUrlParser: true }))
}

export const getDb = (db: string) => (client: MongoClient) => {
  return client.db(db)
}
