const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./db');
const contactRoutes = require('./routes/contacts');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/contacts', contactRoutes);

const PORT = process.env.PORT || 3000;