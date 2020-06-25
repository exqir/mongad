import { run } from 'fp-ts/lib/ReaderTaskEither'
import { fold } from 'fp-ts/lib/Either'
import { MongoError } from 'mongodb'
import { insertOne, insertMany } from '../src/lib/insert'
import { setupMongo } from './_util'

const { connectToDatabase, getMongo } = setupMongo()

const collection = 'testCollection'

describe('insertOne', () => {
  test('left value should contain error', async () => {
    const { db, client } = getMongo()

    // close connection to provoke error from mongo
    await client.close()

    const result = await run(insertOne(collection, {}), db)

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

  test('right value should contain created document', async () => {
    const { db } = getMongo()

    const obj = { name: 'testName', property: 'testProperty' }

    const result = await run(insertOne(collection, obj), db)

    fold(
      err => {
        throw err
      },
      doc => expect(doc).toMatchObject(obj)
    )(result)
  })
})

describe('insertMany', () => {
  test('left value should contain error', async () => {
    const { db, client } = getMongo()

    // close connection to provoke error from mongo
    await client.close()

    const result = await run(insertMany(collection, [{}]), db)

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

  test('right value should contain all the created documents', async () => {
    const { db } = getMongo()

    const toBeInserted = [
      { name: 'testName', property: 'testProperty' },
      { name: 'testName1', property: 'testProperty' },
    ]

    const result = await run(insertMany(collection, toBeInserted), db)

    fold(
      err => {
        throw err
      },
      doc => expect(doc).toEqual(toBeInserted)
    )(result)
  })
})
