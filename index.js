const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.APP_PORT || 5003;

app.use(cors());
app.use(express.json());
app.use('/mezbaani/api', routes);

app.get('/mezbaani/', (req, res) => {
  res.send('🚀 Mezbaani API is running');
});

sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
