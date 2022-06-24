import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import path from 'path'
import emailRoute from './routes/emailRoute.js'
import galleryImageRoute from './routes/galleryImageRoute.js'
import orderRoute from './routes/orderRoute.js'
import productRoute from './routes/productRoute.js'
import uploadRoute from './routes/uploadRoute.js'
import userRoute from './routes/userRoute.js'

dotenv.config()
const app = express()
const port = process.env.PORT || 5000

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/sweevil', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https')
      res.redirect(`https://${req.header('host')}${req.url}`)
    else next()
  })
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/users', userRoute)
app.use('/api/products', productRoute)
app.use('/api/orders', orderRoute)
app.use('/api/uploads', uploadRoute)
app.use('/api/email', emailRoute)
app.use('/api/gallery', galleryImageRoute)

app.get('/api/config/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb')
})

const __dirname = path.resolve()

app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

app.use(express.static(path.join(__dirname, '/frontend/build')))

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
)

app.use((err, req, res) => {
  res.status(500).send({ message: err.message })
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}! 🚀`)
})
