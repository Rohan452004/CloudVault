const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const {connectDB} = require('./config/db');
const Auth = require('./routes/auth')
const s3Routes = require('./routes/s3Routes');
const s3BulkRoutes = require('./routes/s3bulkRoutes');
const platforms3Routes = require("./routes/platforms3Routes");
const platforms3BulkRoutes = require("./routes/platforms3bulkRoutes");
dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173" ,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/v1/auth', Auth);

app.use("/api/v1/self/s3", s3Routes);

app.use("/api/v1/self/s3/bulk", s3BulkRoutes);

app.use("/api/v1/platform/s3", platforms3Routes);

app.use("/api/v1/platform/s3/bulk", platforms3BulkRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
