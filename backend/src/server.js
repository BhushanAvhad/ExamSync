const express = require('express');
const cors = require('cors');
require('dotenv').config();

const timetableRoutes = require('./routes/timetableRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'ExamSync Optimization Engine API',
    status: 'healthy',
    version: '1.0.0',
  });
});

// Timetable API Endpoints
app.use('/api/timetable', timetableRoutes);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[ExamSync] Backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

