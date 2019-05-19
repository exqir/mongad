import { connect, MongoClient } from 'mongodb'
import { Task } from 'fp-ts/lib/Task'
import { promiseToEither } from './shared';

interface DatabaseConfig {
  server: string;
  port: number;
}

export const conn = ({ server, port }: DatabaseConfig) => {
  return new Task(() => promiseToEither(connect(`mongodb://${server}:${port}`, { useNewUrlParser: true })))
}

export const getDb = (db: string) => (client: MongoClient) => {
  return client.db(db);
}
