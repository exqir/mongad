import { run } from 'fp-ts/lib/ReaderTaskEither'
import { fold } from 'fp-ts/lib/Either'
import { MongoError } from 'mongodb'
import { updateOne, updateMany } from '../src/lib/update'
import { setupMongo } from './_util'

const { connectToDatabase, getMongo } = setupMongo()

const collection = 'testCollection'

describe('updateOne', () => {
  test('left value should contain error', async () => {
    const { db, client } = getMongo()

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
    const { db } = getMongo()

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
    const { db, client } = getMongo()

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
    const { db } = getMongo()

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
