import * as mongo from 'mongodb-memory-server'
import { Db, connect, MongoClient, MongoError } from 'mongodb'
import { insertOne, findMany, deleteMany, updateOne } from './lib'

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

  describe('insertOne', () => {
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

  describe('findMany', () => {
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
      const toBeFound = [
        { name: 'testName', property: 'testProperty' },
        { name: 'testName', property: 'anotherProperty' }
      ]
      await db.collection(collection).insertMany([
        { name: 'some', property: 'none' },
        ...toBeFound,
      ])

      const result = await findMany(collection, { name: 'testName' })
        .run(db)

      result.fold(
        err => { throw err },
        res => expect(res).toEqual(toBeFound),
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

    test('right value should contain deleted documents', async () => {
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

    test('right value should contain number of updated documents', async () => {
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
})