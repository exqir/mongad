import * as mongo from 'mongodb-memory-server'
import { fold } from 'fp-ts/lib/Either';
import { MongoClient, Db, connect as mongoConnect } from 'mongodb'
import { connect, getDb } from './connect'

let memoryServer: mongo.MongoMemoryServer = null

beforeAll(async () => {
  memoryServer = new mongo.MongoMemoryServer()
})

afterAll(async () => {
  await memoryServer.stop()
})

describe('connect', () => {
  test('left value should contain error', async () => {
    const result = await connect({
      server: 'none',
      port: 1234,
    })()

    expect(() => fold<Error, object, any>(
      err => { throw err },
      _ => null
    )(result)).toThrow()
  })

  test('right value should contain the MongoClient', async () => {
    const server = memoryServer
      .getConnectionString()
      .then(str => str.match(/\/\/(.+):/))
      .then(([, ip]) => ip)

    const result = await connect({
      server: await server,
      port: await memoryServer.getPort(),
    })()

    fold<Error, MongoClient, any>(
      err => {
        throw err
      },
      res => {
        expect(res).toBeInstanceOf(MongoClient)
        res.close()
      },
    )(result)
  })
})

describe('getDb', () => {
  test('should get Db from MongoClient', async () => {
    const client = await mongoConnect(
      await memoryServer.getConnectionString(),
      { useNewUrlParser: true },
    )

    const result = getDb(await memoryServer.getDbName())(client)

    expect(result).toBeInstanceOf(Db)
  })
})
