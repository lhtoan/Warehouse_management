const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./src/routes/auth.route');
const productRoutes = require('./src/routes/product.route');

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use('/', authRoutes);
app.use('/', productRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
