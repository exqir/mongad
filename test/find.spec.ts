import * as mongo from 'mongodb-memory-server'
import { run } from 'fp-ts/lib/ReaderTaskEither'
import { fold } from 'fp-ts/lib/Either'
import { Db, connect, MongoClient, MongoError } from 'mongodb'
import { findOne, findMany } from '../src/lib/find'

let memoryServer: mongo.MongoMemoryServer
let client: MongoClient
let db: Db

async function connectToDatabase() {
  client = await connect(await memoryServer.getConnectionString(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  db = client.db(await memoryServer.getDbName())
}

beforeAll(async () => {
  memoryServer = new mongo.MongoMemoryServer()
})

afterAll(async () => {
  await memoryServer.stop()
})

beforeEach(async () => {
  await connectToDatabase()
})

afterEach(async () => {
  await db.dropDatabase()
  await client.close()
})

const collection = 'testCollection'

describe('findOne', () => {
  test('should return Left if a MongoError occured', async () => {
    // close connection to provoke error from mongo
    await client.close()

    const result = await run(findOne(collection, {}), db)

    expect(result._tag).toEqual('Left')
    expect(() =>
      fold(
        err => {
          throw err
        },
        _ => null
      )(result)
    ).toThrow(MongoError)
    // reconnect to database to not break afterEach reset function
    await connectToDatabase()
  })

  test('right value should contain the requested document', async () => {
    const toBeFound = [
      { name: 'testName', property: 'testProperty' },
      { name: 'testName', property: 'anotherProperty' },
    ]
    await db.collection(collection).insertMany(toBeFound)

    const result = await run(findOne(collection, { name: 'testName' }), db)

    fold(
      err => {
        throw err
      },
      res => expect(res).toEqual(toBeFound[0])
    )(result)
  })
})

describe('findMany', () => {
  test('left value should contain error', async () => {
    // close connection to provoke error from mongo
    await client.close()

    const result = await run(findMany(collection, {}), db)

    // reconnect to database to not break afterEach reset function
    await connectToDatabase()
    expect(result._tag).toEqual('Left')
    expect(() =>
      fold(
        err => {
          throw err
        },
        _ => null
      )(result)
    ).toThrow(MongoError)
  })

  test('right value should contain all requested documents', async () => {
    const toBeFound = [
      { name: 'testName', property: 'testProperty' },
      { name: 'testName', property: 'anotherProperty' },
    ]
    await db
      .collection(collection)
      .insertMany([{ name: 'some', property: 'none' }, ...toBeFound])

    const result = await run(findMany(collection, { name: 'testName' }), db)

    fold(
      err => {
        throw err
      },
      res => expect(res).toEqual(toBeFound)
    )(result)
  })
})
