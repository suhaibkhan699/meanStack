const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const postRoutes = require('./routes/posts')


const app = express()

mongoose.connect('mongodb+srv://suhaibkhan:0vVbJb6NXIe7pSM7@cluster0.smaz124.mongodb.net/?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected to DB!')
  })
  .catch(() => {
    console.log('Connection Failed to DB!')
  })

app.use(bodyParser.json())

// for url encoded data
app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  next()
})

app.use('/api/posts',postRoutes)

module.exports = app