import postgres from 'postgres';

const connectionString = import.meta.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const url = new URL(connectionString);

const sql = postgres({
  host: url.hostname,
  port: Number(url.port),
  database: url.pathname.slice(1),
  username: url.username,
  password: url.password,
  ssl: 'require'
});

export default sql;
