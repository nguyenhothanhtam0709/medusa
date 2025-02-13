import { asValue } from "awilix"
import Redis from "ioredis"
import FakeRedis from "ioredis-mock"
import { EOL } from "os"
import { Logger, MedusaContainer } from "../types/global"
import { ConfigModule } from "@medusajs/types"

type Options = {
  container: MedusaContainer
  configModule: ConfigModule
  logger: Logger
}

// TODO: Will be removed when the strict dependency on Redis in the core is removed
async function redisLoader({
  container,
  configModule,
  logger,
}: Options): Promise<{ shutdown: () => Promise<void> }> {
  let client!: Redis | FakeRedis

  if (configModule.projectConfig.redisUrl) {
    client = new Redis(configModule.projectConfig.redisUrl, {
      // Lazy connect to properly handle connection errors
      lazyConnect: true,
      ...(configModule.projectConfig.redisOptions ?? {}),
    })

    try {
      await client.connect()
      logger?.info(`Connection to Redis established`)
    } catch (err) {
      logger?.error(`An error occurred while connecting to Redis:${EOL} ${err}`)
    }

    container.register({
      redisClient: asValue(client),
    })
  } else {
    if (process.env.NODE_ENV === "production") {
      logger.warn(
        `No Redis url was provided - using Medusa in production without a proper Redis instance is not recommended`
      )
    }

    logger.info("Using fake Redis")

    // Economical way of dealing with redis clients
    client = new FakeRedis()

    container.register({
      redisClient: asValue(client),
    })
  }

  return {
    shutdown: async () => {
      client.disconnect()
    },
  }
}

export default redisLoader
