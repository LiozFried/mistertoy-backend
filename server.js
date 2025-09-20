import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'

import { loggerService } from './services/logger.service.js'
loggerService.info('server.js loaded...')

const app = express()

app.use(cookieParser())
app.use(express.json())

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('public'))
} else {
    const corsOptions = {
        origin: [
            'http://127.0.0.1:3000',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
        ],
        credentials: true,
    }
    app.use(cors(corsOptions))
}

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { toyRoutes } from './api/toys/toy.routes.js'
import { toyService } from './api/toys/toy.service.js'
import { reviewRoutes } from './api/review/review.routes.js'
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'

app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/toy', toyRoutes)
app.use('/api/review', reviewRoutes)

app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3030
app.listen(port, () => {
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
    toyService.connectAndSetup()
})