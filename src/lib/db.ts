import mysql from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var _listenifyDbPool: mysql.Pool | undefined;
}

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '4000', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'Listenify';

export function getDbPool(): mysql.Pool {
  if (!global._listenifyDbPool) {
    global._listenifyDbPool = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    console.log('✅ TiDB / MySQL connection pool initialized');
  }
  return global._listenifyDbPool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const pool = getDbPool();
  const [rows] = await pool.query(sql, params);
  return rows as T;
}
