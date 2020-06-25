import { Db, connect, MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

async function connectToDatabase(server: MongoMemoryServer) {
  const client = await connect(await server.getConnectionString(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  const db = client.db(await server.getDbName())

  return { client, db }
}

export function setupMongo({ autoConnect = true } = {}) {
  let client: MongoClient | undefined
  let db: Db | undefined
  const memoryServer = new MongoMemoryServer()

  async function assignConnection() {
    const connection = await connectToDatabase(memoryServer)
    client = connection.client
    db = connection.db
  }

  afterAll(async () => {
    await memoryServer.stop()
  })

  if (autoConnect) {
    beforeEach(async () => {
      await assignConnection()
    })

    afterEach(async () => {
      if (db) await db.dropDatabase()
      if (client) await client.close()
    })
  }

  return {
    mongo: memoryServer,
    connectToDatabase: assignConnection,
    getMongo: () => ({ db: db!, client: client! }),
  }
}
