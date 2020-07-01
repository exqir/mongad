import { run } from 'fp-ts/lib/ReaderTaskEither'
import { fold } from 'fp-ts/lib/Either'
import { MongoError } from 'mongodb'
import { deleteOne, deleteMany } from '../src/lib/delete'
import { setupMongo } from './_util'

const { connectToDatabase, getMongo } = setupMongo()

const collection = 'testCollection'

describe('deleteOne', () => {
  test('left value should contain error', async () => {
    const { db, client } = getMongo()
    await db.collection(collection).insertMany([
      { name: 'testName', property: 'testProperty' },
      { name: 'some', property: 'none' },
    ])
    // close connection to provoke error from mongo
    await client.close()

    const result = await run(deleteOne(collection, { name: 'testName' }), db)

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

  test('right value should contain the deleted document', async () => {
    const { db } = getMongo()

    const toBeDeleted = [
      { name: 'testName', property: 'testProperty' },
      { name: 'testName', property: 'anotherProperty' },
    ]
    await db.collection(collection).insertMany([...toBeDeleted])

    const result = await run(deleteOne(collection, { name: 'testName' }), db)

    fold(
      err => {
        throw err
      },
      res => expect(res).toEqual(toBeDeleted[0])
    )(result)
  })
})

describe('deleteMany', () => {
  test('left value should contain error', async () => {
    const { db, client } = getMongo()

    await db.collection(collection).insertMany([
      { name: 'testName', property: 'testProperty' },
      { name: 'some', property: 'none' },
    ])
    // close connection to provoke error from mongo
    await client.close()

    const result = await run(deleteMany(collection, { name: 'testName' }), db)

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

  test('right value should contain all deleted documents', async () => {
    const { db } = getMongo()

    const toBeDeleted = [
      { name: 'testName', property: 'testProperty' },
      { name: 'testName', property: 'anotherProperty' },
    ]
    await db
      .collection(collection)
      .insertMany([{ name: 'some', property: 'none' }, ...toBeDeleted])

    const result = await run(deleteMany(collection, { name: 'testName' }), db)

    fold(
      err => {
        throw err
      },
      res => expect(res).toEqual(toBeDeleted)
    )(result)
  })
})
