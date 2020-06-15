import * as mongo from 'mongodb-memory-server'
import { fold } from 'fp-ts/lib/Either'
import { MongoClient, Db, connect as mongoConnect } from 'mongodb'
import { connect, getDb } from '../src/lib/connect'

let memoryServer: mongo.MongoMemoryServer

beforeAll(async () => {
  memoryServer = new mongo.MongoMemoryServer()
})

afterAll(async () => {
  await memoryServer.stop()
})

describe('connect', () => {
  test('left value should contain error', async () => {
    const result = await connect('mongodb://fail', {
      // Reduce the timeout, otherwise the test itself would timeout.
      serverSelectionTimeoutMS: 5,
    })()

    expect(() =>
      fold<Error, object, any>(
        err => {
          throw err
        },
        _ => null
      )(result)
    ).toThrow()
  })

  test('right value should contain the MongoClient', async () => {
    const result = await connect(await memoryServer.getConnectionString())()

    fold<Error, MongoClient, any>(
      err => {
        throw err
      },
      res => {
        expect(res).toBeInstanceOf(MongoClient)
        res.close()
      }
    )(result)
  })
})

describe('getDb', () => {
  test('should get Db from MongoClient', async () => {
    const client = await mongoConnect(
      await memoryServer.getConnectionString(),
      { useNewUrlParser: true, useUnifiedTopology: true }
    )

    const result = getDb(await memoryServer.getDbName())(client)

    expect(result).toBeInstanceOf(Db)
  })
})
