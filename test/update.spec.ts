import * as mongo from 'mongodb-memory-server'
import { run } from 'fp-ts/lib/ReaderTaskEither'
import { fold } from 'fp-ts/lib/Either'
import { Db, connect, MongoClient, MongoError } from 'mongodb'
import { updateOne, updateMany } from '../src/lib/update'

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

describe('updateOne', () => {
  test('left value should contain error', async () => {
    // close connection to provoke error from mongo
    await client.close()

    const result = await run(updateOne(collection, {}, {}), db)

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

  test('right value should contain the updated document', async () => {
    const obj = { name: 'testName', property: 'testProperty' }
    await db.collection(collection).insertOne(obj)

    const result = await run(
      updateOne(
        collection,
        { name: 'testName' },
        { $set: { property: 'postUpdate' } }
      ),
      db
    )

    fold(
      err => {
        throw err
      },
      res => expect(res).toMatchObject({ ...obj, property: 'postUpdate' })
    )(result)
  })
})

describe('updateMany', () => {
  test('left value should contain error', async () => {
    // close connection to provoke error from mongo
    await client.close()

    const result = await run(updateMany(collection, {}, {}), db)

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

  test('right value should contain all updated documents', async () => {
    const toBeUpdated = [
      { name: 'testName', property: 'testProperty' },
      { name: 'testName', property: 'anotherProperty' },
    ]
    await db.collection(collection).insertMany(toBeUpdated)

    const result = await run(
      updateMany(
        collection,
        { name: 'testName' },
        { $set: { property: 'postUpdate' } }
      ),
      db
    )

    fold(
      err => {
        throw err
      },
      res => {
        expect(res).toMatchObject([
          { name: 'testName', property: 'postUpdate' },
          { name: 'testName', property: 'postUpdate' },
        ])
      }
    )(result)
  })
})
