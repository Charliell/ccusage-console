import sqlite3 from 'sqlite3';
import { logger } from '../utils/logger';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../data/database.sqlite');

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    logger.error('数据库连接失败:', err);
  } else {
    logger.info('数据库连接成功');
  }
});

// 创建数据表
export async function initDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 创建用户表
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'enterprise')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建项目表
    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        budget REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `;

    // 创建使用记录表
    const createUsageRecordsTable = `
      CREATE TABLE IF NOT EXISTS usage_records (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        project_id TEXT,
        usage_type TEXT NOT NULL,
        input_tokens INTEGER NOT NULL,
        output_tokens INTEGER NOT NULL,
        cost REAL NOT NULL,
        duration INTEGER,
        model_version TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `;

    // 创建预警设置表
    const createAlertSettingsTable = `
      CREATE TABLE IF NOT EXISTS alert_settings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        threshold_value REAL NOT NULL,
        notification_method TEXT NOT NULL,
        is_enabled INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `;

    db.serialize(() => {
      db.run(createUsersTable);
      db.run(createProjectsTable);
      db.run(createUsageRecordsTable);
      db.run(createAlertSettingsTable, (err) => {
        if (err) {
          logger.error('数据表创建失败:', err);
          reject(err);
        } else {
          logger.info('数据表创建成功');
          resolve();
        }
      });
    });
  });
}

// 确保数据目录存在
import fs from 'fs';
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}