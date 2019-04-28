import * as mongo from 'mongodb-memory-server'
import { Db, connect, MongoClient, MongoError } from 'mongodb'
import { findOne, findMany } from './find'

let memoryServer: mongo.MongoMemoryServer = null
let client: MongoClient = null
let db: Db = null

async function connectToDatabase() {
  client = await connect(
    await memoryServer.getConnectionString(),
    { useNewUrlParser: true },
  )

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
  test('left value should contain error', async () => {
    // close connection to provoke error from mongo
    await client.close()

    const result = await findOne(collection, {}).run(db)

    // reconnect to database to not break afterEach reset function
    await connectToDatabase()
    expect(() =>
      result.fold(
        err => {
          throw err
        },
        _ => null,
      ),
    ).toThrow(MongoError)
  })

  test('right value should contain the requested document', async () => {
    const toBeFound = [
      { name: 'testName', property: 'testProperty' },
      { name: 'testName', property: 'anotherProperty' },
    ]
    await db.collection(collection).insertMany(toBeFound)

    const result = await findOne(collection, { name: 'testName' }).run(db)

    result.fold(
      err => {
        throw err
      },
      res => expect(res).toEqual(toBeFound[0]),
    )
  })
})

describe('findMany', () => {
  test('left value should contain error', async () => {
    // close connection to provoke error from mongo
    await client.close()

    const result = await findMany(collection, {}).run(db)

    // reconnect to database to not break afterEach reset function
    await connectToDatabase()
    expect(() =>
      result.fold(
        err => {
          throw err
        },
        _ => null,
      ),
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

    const result = await findMany(collection, { name: 'testName' }).run(db)

    result.fold(
      err => {
        throw err
      },
      res => expect(res).toEqual(toBeFound),
    )
  })
})
