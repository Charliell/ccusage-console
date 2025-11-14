import { db } from '../config/database';
import { logger } from '../utils/logger';
import { initDatabase } from '../config/database';

const createMockData = async () => {
  try {
    // 先初始化数据库
    await initDatabase();
    // 创建测试用户
    const userId = 'user1';
    const projectId = 'proj1';

    // 插入用户
    await new Promise<void>((resolve, reject) => {
      db.run(
        `INSERT OR IGNORE INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
        [userId, 'test_user', 'test@example.com', 'hashed_password', 'user'],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // 插入项目
    await new Promise<void>((resolve, reject) => {
      db.run(
        `INSERT OR IGNORE INTO projects (id, user_id, name, description, budget) VALUES (?, ?, ?, ?, ?)`,
        [projectId, userId, '测试项目', '这是一个测试项目', 100.0],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // 插入模拟使用记录
    const mockRecords = [
      {
        id: 'record1',
        user_id: userId,
        project_id: projectId,
        usage_type: 'code_generation',
        input_tokens: 850,
        output_tokens: 420,
        cost: 0.0085,
        duration: 800,
        model_version: 'claude-3-sonnet'
      },
      {
        id: 'record2',
        user_id: userId,
        project_id: projectId,
        usage_type: 'code_review',
        input_tokens: 1200,
        output_tokens: 680,
        cost: 0.012,
        duration: 1200,
        model_version: 'claude-3-sonnet'
      },
      {
        id: 'record3',
        user_id: userId,
        project_id: projectId,
        usage_type: 'code_generation',
        input_tokens: 650,
        output_tokens: 320,
        cost: 0.0065,
        duration: 600,
        model_version: 'claude-3-sonnet'
      }
    ];

    for (const record of mockRecords) {
      await new Promise<void>((resolve, reject) => {
        db.run(
          `INSERT OR IGNORE INTO usage_records (
            id, user_id, project_id, usage_type, input_tokens,
            output_tokens, cost, duration, model_version
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            record.id,
            record.user_id,
            record.project_id,
            record.usage_type,
            record.input_tokens,
            record.output_tokens,
            record.cost,
            record.duration,
            record.model_version
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    logger.info('测试数据创建成功');
  } catch (error) {
    logger.error('创建测试数据失败:', error);
  } finally {
    db.close();
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  createMockData();
}

export { createMockData };