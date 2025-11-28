const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,       // se lee del docker-compose
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: String(process.env.DB_ENCRYPT || 'false').toLowerCase() === 'true',
    trustServerCertificate: true,
  },
};

console.log('*** DB CONFIG RUNTIME ***', {
  NODE_ENV: process.env.NODE_ENV,
  user: dbConfig.user,
  passwordPreview: dbConfig.password
    ? dbConfig.password.substring(0, 5) + '***'
    : undefined,
  server: dbConfig.server,
  database: dbConfig.database,
  port: dbConfig.port
});

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Conectado a SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Error al conectar a SQL Server', err);
    throw err;
  });

module.exports = { sql, poolPromise };
