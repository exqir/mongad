import { connect as mongoConnect, MongoClient } from 'mongodb'
import { Task } from 'fp-ts/lib/Task'
import { promiseToEither } from './shared';

interface DatabaseConfig {
  server: string;
  port: number;
}

export const connect = ({ server, port }: DatabaseConfig) => {
  return new Task(() => promiseToEither(mongoConnect(`mongodb://${server}:${port}`, { useNewUrlParser: true })))
}

export const getDb = (db: string) => (client: MongoClient) => {
  return client.db(db);
}
