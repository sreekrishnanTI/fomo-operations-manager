const express = require('express');
const cors = require('cors');
require('dotenv').config();
const operationsRouter = require('./routes/operations');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'FOMO API is running' });
});

app.use('/api/operations', operationsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.listen(port, () => {
  console.log(`FOMO API running at http://localhost:${port}`);
});
