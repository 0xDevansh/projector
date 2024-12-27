import * as process from 'node:process'
import express from 'express'

const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send({ data: 'Hello world!', error: null })
})

app.listen(PORT, () => {
  console.log(`Started express server on port ${PORT}`)
})
