const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend DICRI escuchando en http://localhost:${PORT}`);
});
