import * as mongo from 'mongodb-memory-server'
import { Db, connect, MongoClient, MongoError } from 'mongodb'
import { create, read } from './shared'

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

      const result = await create(collection, {})
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

      const result = await create(collection, obj)
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

      const result = await read(collection, {})
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

    test('right value should contain requested document', async () => {
      const obj = { name: 'testName', property: 'testProperty' }
      await db.collection(collection).insertMany([
        obj,
        { name: 'some', property: 'none' }
      ])

      const result = await read(collection, { name: 'testName' })
        .run(db)

      result.fold(
        err => { throw err },
        doc => {
          expect(doc).toHaveLength(1)
          expect(doc).toContainEqual(obj)
        },
      )
    })
  })
})