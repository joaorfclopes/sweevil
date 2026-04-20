import dotenv from 'dotenv'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import mongoose from 'mongoose'
import path from 'path'
import categoryRoute from './routes/categoryRoute.js'
import emailRoute from './routes/emailRoute.js'
import galleryImageRoute from './routes/galleryImageRoute.js'
import orderRoute from './routes/orderRoute.js'
import productRoute from './routes/productRoute.js'
import uploadRoute from './routes/uploadRoute.js'
import userRoute from './routes/userRoute.js'

dotenv.config()

// Critical environment variable check
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables')
}

const app = express()
const port = process.env.BACKEND_PORT || process.env.PORT || 5000

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/sweevil')

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      // Use APP_DOMAIN env var instead of the Host header to prevent open redirect
      const appDomain = process.env.APP_DOMAIN
      if (!appDomain) {
        return next()
      }
      res.redirect(301, `https://${appDomain}${req.url}`)
    } else {
      next()
    }
  })
}

app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', globalLimiter)

app.use('/api/users', userRoute)
app.use('/api/products', productRoute)
app.use('/api/orders', orderRoute)
app.use('/api/uploads', uploadRoute)
app.use('/api/email', emailRoute)
app.use('/api/gallery', galleryImageRoute)
app.use('/api/categories', categoryRoute)

app.get('/api/config/stripe', (req, res) => {
  res.send(process.env.STRIPE_PUBLISHABLE_KEY || '')
})

const __dirname = path.resolve()

app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

app.use(express.static(path.join(__dirname, '/frontend/build')))

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
)

app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  console.error(err.stack)
  const statusCode = err.statusCode || 500
  res.status(statusCode).send({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}! 🚀`)
})
