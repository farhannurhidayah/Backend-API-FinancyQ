const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Define Routes
app.use('/api/transactions', require('./routes/transactionRoutes'));

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
