import * as mongo from 'mongodb-memory-server'
import { Db, connect, MongoClient, MongoError } from 'mongodb'
import { insertOne, findMany, deleteMany } from './operations'

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

describe('Database shared functions', () => {
  const collection = 'testCollection'

  describe('create', () => {
    test('left value should contain error', async () => {
      // close connection to provoke error from mongo
      await client.close()

      const result = await insertOne(collection, {})
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

    test('right value should contain created document', async () => {
      const obj = { name: 'testName', property: 'testProperty' }

      const result = await insertOne(collection, obj)
        .run(db)

      result.fold(
        err => { throw err },
        doc => expect(doc).toMatchObject(obj),
      )
    })
  })

  describe('read', () => {
    test('left value should contain error', async () => {
      // close connection to provoke error from mongo
      await client.close()

      const result = await findMany(collection, {})
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

    test('right value should contain all requested documents', async () => {
      const obj = { name: 'testName', property: 'testProperty' }
      const otherObj = { name: 'testName', property: 'anotherProperty' }
      await db.collection(collection).insertMany([
        obj,
        { name: 'some', property: 'none' },
        otherObj,
      ])

      const result = await findMany(collection, { name: 'testName' })
        .run(db)

      result.fold(
        err => { throw err },
        doc => {
          expect(doc).toHaveLength(2)
          expect(doc).toContainEqual(obj)
          expect(doc).toContainEqual(otherObj)
        },
      )
    })
  })

  describe('delete', () => {
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

    test('right value should containe number of deleted entries', async () => {
      await db.collection(collection).insertMany([
        { name: 'testName', property: 'testProperty' },
        { name: 'some', property: 'none' },
        { name: 'testName', property: 'anotherProperty' }
      ])

      const result = await deleteMany(collection, { name: 'testName' })
        .run(db)

      result.fold(
        err => { throw err },
        res => expect(res).toEqual(2),
      )
    })
  })
})