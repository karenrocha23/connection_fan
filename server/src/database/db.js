import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const pasta = path.dirname(fileURLToPath(import.meta.url));
const caminhoBanco = path.join(pasta, 'estoque.db');

const db = new Database(caminhoBanco);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Cria as tabelas caso ainda não existam
db.exec(readFileSync(path.join(pasta, 'schema.sql'), 'utf-8'));

export default db;
