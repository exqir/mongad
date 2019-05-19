import * as mongo from 'mongodb-memory-server'
import { MongoClient, Db, connect } from 'mongodb'
import { conn, getDb } from './connect'

let memoryServer: mongo.MongoMemoryServer = null

beforeAll(async () => {
  memoryServer = new mongo.MongoMemoryServer()
})

afterAll(async () => {
  await memoryServer.stop()
})

describe('connect', () => {
  test('left value should contain error', async () => {
    const result = await conn({
      server: 'none',
      port: 1234,
    }).run()

    expect(() =>
      result.fold(
        err => {
          throw err
        },
        _ => null,
      ),
    ).toThrow()
  })

  test('right value should contain the MongoClient', async () => {
    const server = memoryServer.getConnectionString()
      .then(str => str.match(/\/\/(.+):/))
      .then(([, ip]) => ip)

    const result = await conn({
      server: await server,
      port: await memoryServer.getPort()
    }).run()

    result.fold(
      err => {
        throw err
      },
      res => {
        expect(res).toBeInstanceOf(MongoClient)
        res.close()
      }
    )
  })
})

describe('getDb', () => {
  test('should get Db from MongoClient', async () => {
    const client = await connect(
      await memoryServer.getConnectionString(),
      { useNewUrlParser: true },
    )

    const result = getDb(await memoryServer.getDbName())(client)

    expect(result).toBeInstanceOf(Db);
  })
})