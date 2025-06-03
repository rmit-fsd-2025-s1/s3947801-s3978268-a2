import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: "209.38.26.237",
  user: "S3947801",
  password: "S3947801",
  database: "S3947801",
});

export default pool;
