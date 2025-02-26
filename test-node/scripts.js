//! what using
//! express node nodemon mongodb

const { MongoClient } = require('mongodb')
const express = require('express')
var cors = require('cors')
const app = express()
const PORT = 8080
app.use(express.json())
app.use(cors())

//! mongodb
const mongoClient = new MongoClient('mongodb+srv://viewer:0803739347@devcluster.brf48.mongodb.net/?retryWrites=true&w=majority&appName=devCluster')

//! Connect to MongoDB once when the server starts Connect to MongoDB once when the server starts Connect to MongoDB once when the server starts
const mongoDBConnect = async () => {
  try {
    await mongoClient.connect()
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Initial connection to MongoDB failed:', error.message)
    process.exit(1)
  }
}
mongoDBConnect()

//! productdata
app.post('/createProduct', async (req, res) => {
  const { name, price, stock, description } = req.body
  const statusResponse = { dataValid: true, message: '' }

  //! validate type
  if (typeof name !== 'string') {
    statusResponse.message = 'invalid product name : requried, must be a text'
    statusResponse.dataValid = false
  }
  if (!isFinite(price) || price < 0) {
    statusResponse.message = 'invalid product price : requried, must be an integer'
    statusResponse.dataValid = false
  }
  if (!isFinite(stock) || stock < 0) {
    statusResponse.message = 'invalid product stock : requried, must be an integer'
    statusResponse.dataValid = false
  }

  //! to db here
  const inserteProduct = async () => {
    try {
      await mongoClient
        .db('testProduct')
        .collection('products')
        .insertOne({
          ...{
            name,
            price,
            stock,
            description: description ?? '',
          },
        })
      res.status(200).send({
        message: `${name} insert`,
        ...{ name, price, stock },
      })
    } catch (error) {
      console.error('Connection failed:', error.message)
      res.status(400).send({
        message: `connect db error ${error.message}`,
      })
    } finally {
      console.log(`post ${name} complete`)
    }
  }

  if (statusResponse.dataValid) {
    inserteProduct()
  } else {
    res.status(400).send({ message: statusResponse.message })
  }
})

//! get product data
app.get('/getProduct', async (req, res) => {
  let products

  try {
    products = await mongoClient.db('testProduct').collection('products').find().sort({ price: -1 }).toArray()
  } catch (error) {
    res.status(400).send({
      message: `${error}`,
    })
  } finally {
    res.status(200).send({
      message: `request product successful`,
      products: products,
    })
  }
})

//! create mockup data
app.get('/createProductData', async (req, res) => {
  const mockData = ['shirt', 'shoe', 'pants', 'gloves', 'hat']
  const operation = await Promise.all(
    mockData.map(async (value, index) => {
      const insertProduct = await mongoClient
        .db('testProduct')
        .collection('products')
        .insertOne({
          ...{
            name: value,
            price: Math.floor(Math.random() * (5000 - 0) + 0),
            stock: Math.floor(Math.random() * (999 - 0) + 0),
            description: '',
          },
        })
      return insertProduct
    })
  )

  res.status(200).send({
    message: `mockup product successful`,
    operation,
  })
})

//*! Gracefully close the MongoDB connection on server shutdown
process.on('SIGINT', async () => {
  await mongoClient.close()
  console.log('MongoDB connection closed')
  process.exit(0)
})

app.listen(PORT, () => console.log(`server http://localhost:${PORT} is ready`))
