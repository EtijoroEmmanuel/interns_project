import dotenv from "dotenv"
dotenv.config()

import app from "./app"
import { connectDB } from "./db/mongo"
import { logger } from "./utils/logger"

connectDB().catch((error) => {
  logger.error(`Failed to connect to database: ${error.message}`)
})

const PORT = process.env.PORT || 5002

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}!!!!`)
})

export default app
