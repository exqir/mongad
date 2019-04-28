import * as mongo from 'mongodb-memory-server'
import { Db, connect, MongoClient, MongoError } from 'mongodb'
import { deleteOne, deleteMany } from './delete'

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

describe('deleteOne', () => {
  test('left value should contain error', async () => {
    await db.collection(collection).insertMany([
      { name: 'testName', property: 'testProperty' },
      { name: 'some', property: 'none' }
    ])
    // close connection to provoke error from mongo
    await client.close()

    const result = await deleteOne(collection, { name: 'testName' })
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

  test('right value should contain the deleted document', async () => {
    const toBeDeleted = [
      { name: 'testName', property: 'testProperty' },
      { name: 'testName', property: 'anotherProperty' }
    ]
    await db.collection(collection).insertMany([
      ...toBeDeleted
    ])

    const result = await deleteOne(collection, { name: 'testName' })
      .run(db)

    result.fold(
      err => { throw err },
      res => expect(res).toEqual(toBeDeleted[0]),
    )
  })
})

describe('deleteMany', () => {
  test('left value should contain error', async () => {
    await db.collection(collection).insertMany([
      { name: 'testName', property: 'testProperty' },
      { name: 'some', property: 'none' }
    ])
    // close connection to provoke error from mongo
    await client.close()

    const result = await deleteMany(collection, { name: 'testName' })
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

  test('right value should contain all deleted documents', async () => {
    const toBeDeleted = [
      { name: 'testName', property: 'testProperty' },
      { name: 'testName', property: 'anotherProperty' }
    ]
    await db.collection(collection).insertMany([
      { name: 'some', property: 'none' },
      ...toBeDeleted
    ])

    const result = await deleteMany(collection, { name: 'testName' })
      .run(db)

    result.fold(
      err => { throw err },
      res => expect(res).toEqual(toBeDeleted),
    )
  })
})