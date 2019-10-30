import * as mongo from 'mongodb-memory-server'
import { run } from 'fp-ts/lib/ReaderTaskEither';
import { fold } from 'fp-ts/lib/Either';
import { Db, connect, MongoClient, MongoError } from 'mongodb'
import { insertOne, insertMany } from './insert'

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

describe('insertOne', () => {
  test('left value should contain error', async () => {
    // close connection to provoke error from mongo
    await client.close()

    const result = await run(insertOne(collection, {}), db)

    // reconnect to database to not break afterEach reset function
    await connectToDatabase()
    expect(result._tag).toEqual('Left')
    expect(() => fold<MongoError, object, any>(
      err => { throw err },
      _ => null
    )(result)).toThrow(MongoError)
  })

  test('right value should contain created document', async () => {
    const obj = { name: 'testName', property: 'testProperty' }

    const result = await run(insertOne(collection, obj), db)

    fold<MongoError, object, any>(
      err => { throw err },
      doc => expect(doc).toMatchObject(obj),
    )(result)
  })
})

describe('insertMany', () => {
  test('left value should contain error', async () => {
    // close connection to provoke error from mongo
    await client.close()

    const result = await run(insertMany(collection, [{}]), db)

    // reconnect to database to not break afterEach reset function
    await connectToDatabase()
    expect(result._tag).toEqual('Left')
    expect(() => fold<MongoError, object, any>(
      err => { throw err },
      _ => null
    )(result)).toThrow(MongoError)
  })

  test('right value should contain all the created documents', async () => {
    const toBeInserted = [
      { name: 'testName', property: 'testProperty' },
      { name: 'testName1', property: 'testProperty' },
    ]

    const result = await run(insertMany(collection, toBeInserted), db)

    fold<MongoError, object, any>(
      err => { throw err },
      doc => expect(doc).toEqual(toBeInserted),
    )(result)
  })
})
