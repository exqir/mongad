import * as mongo from 'mongodb-memory-server'
import { Db, connect, MongoClient, MongoError } from 'mongodb'
import { updateOne, updateMany } from './update'

let memoryServer: mongo.MongoMemoryServer = null;
let client: MongoClient = null;
let db: Db = null;

async function connectToDatabase() {
  client = await connect(
    await memoryServer.getConnectionString(),
    { useNewUrlParser: true }
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

describe('updateOne', () => {
  test('left value should contain error', async () => {
    // close connection to provoke error from mongo
    await client.close()

    const result = await updateOne(collection, {}, {})
      .run(db)

    // reconnect to database to not break afterEach reset function
    await connectToDatabase()
    expect(() =>
      result.fold(
        err => { throw err },
        _ => null,
      )
    ).toThrow(MongoError)
  })

  test('right value should contain the updated document', async () => {
    const obj = { name: 'testName', property: 'testProperty' }
    await db.collection(collection).insertOne(obj)

    const result = await updateOne(collection, { name: 'testName' }, { $set: { property: 'postUpdate' } })
      .run(db)

    result.fold(
      err => { throw err },
      res => {
        expect(res).toMatchObject({ ...obj, property: 'postUpdate' })
      },
    )
  })
})

describe('updateMany', () => {
  test('left value should contain error', async () => {
    // close connection to provoke error from mongo
    await client.close()

    const result = await updateMany(collection, {}, {})
      .run(db)

    // reconnect to database to not break afterEach reset function
    await connectToDatabase()
    expect(() =>
      result.fold(
        err => { throw err },
        _ => null,
      )
    ).toThrow(MongoError)
  })

  test('right value should contain all updated documents', async () => {
    const toBeUpdated = [
      { name: 'testName', property: 'testProperty' },
      { name: 'testName', property: 'anotherProperty' },
    ]
    await db.collection(collection).insertMany(toBeUpdated)

    const result = await updateMany(collection, { name: 'testName' }, { $set: { property: 'postUpdate' } })
      .run(db)

    result.fold(
      err => { throw err },
      res => {
        expect(res).toMatchObject([{ name: 'testName', property: 'postUpdate' }, { name: 'testName', property: 'postUpdate' }])
      },
    )
  })
})