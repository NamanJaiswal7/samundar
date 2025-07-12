const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// app.use(cors({
//   origin: process.env.FRONTEND_ORIGIN,
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// Middleware
app.use(express.json());

// Routes
app.use('/api/altar', require('./routes/altarRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
