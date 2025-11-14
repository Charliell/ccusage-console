import { db } from '../config/database';
import { UsageRecord, UsageStatistics, DashboardData } from '../types';
import { logger } from '../utils/logger';
import { CCUsageService } from './ccusageService';

export class UsageService {
  // 创建使用记录
  async createUsageRecord(record: Omit<UsageRecord, 'id' | 'created_at'>): Promise<string> {
    const id = this.generateId();

    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO usage_records (
          id, user_id, project_id, usage_type, input_tokens,
          output_tokens, cost, duration, model_version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        id,
        record.user_id,
        record.project_id,
        record.usage_type,
        record.input_tokens,
        record.output_tokens,
        record.cost,
        record.duration,
        record.model_version
      ], function(err) {
        if (err) {
          logger.error('创建使用记录失败:', err);
          reject(err);
        } else {
          logger.info(`使用记录创建成功: ${id}`);
          resolve(id);
        }
      });

      stmt.finalize();
    });
  }

  // 获取用户的使用统计数据
  async getUsageStatistics(userId: string, days: number = 30): Promise<UsageStatistics> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          COUNT(*) as session_count,
          SUM(input_tokens) as total_input_tokens,
          SUM(output_tokens) as total_output_tokens,
          SUM(cost) as total_cost,
          AVG(duration) as average_duration
        FROM usage_records
        WHERE user_id = ?
        AND created_at >= datetime('now', '-${days} days')
      `;

      db.get(sql, [userId], (err, row: any) => {
        if (err) {
          logger.error('获取使用统计失败:', err);
          reject(err);
        } else {
          // 计算日平均使用量
          const daily_average = row.total_cost / days;

          // 计算趋势（简化版，实际应用中需要更复杂的计算）
          const weekly_trend = this.calculateTrend(userId, 7);
          const monthly_trend = this.calculateTrend(userId, 30);

          resolve({
            total_input_tokens: row.total_input_tokens || 0,
            total_output_tokens: row.total_output_tokens || 0,
            total_cost: row.total_cost || 0,
            average_duration: row.average_duration || 0,
            session_count: row.session_count || 0,
            daily_average: daily_average || 0,
            weekly_trend,
            monthly_trend
          });
        }
      });
    });
  }

  // 获取仪表盘数据
  async getDashboardData(userId: string, targetDate?: string): Promise<DashboardData> {
    try {
      const ccusageService = new CCUsageService();

      // 检查ccusage是否可用
      const ccusageAvailable = await ccusageService.isCCUsageAvailable();

      if (ccusageAvailable) {
        logger.info('使用真实ccusage数据');

        // 使用真实的ccusage数据
        const [todayData, weeklyData, monthlyData, sessionData] = await Promise.all([
          ccusageService.getTodayUsage(),
          ccusageService.getWeeklyUsage(),
          ccusageService.getMonthlyUsage(),
          ccusageService.getSessionUsage(10)
        ]);

        // 直接获取指定日期用量数据
        const today_usage = targetDate
          ? await this.getDateUsageDirectly(targetDate)
          : await this.getTodayUsageDirectly();
        const weekly_usage = this.convertCCUsageToStatistics(weeklyData, 7);
        const monthly_usage = this.convertCCUsageToStatistics(monthlyData, 30);

        const real_time_usage = sessionData.map(session => this.convertCCSessionToUsageRecord(session, userId));

        // 从session数据中提取项目信息
        const top_projects = this.extractTopProjectsFromSessions(sessionData);

        return {
          today_usage,
          weekly_usage,
          monthly_usage,
          real_time_usage,
          top_projects
        };
      } else {
        logger.warn('ccusage不可用，使用数据库模拟数据');

        // 回退到数据库中的模拟数据
        const [today_usage, weekly_usage, monthly_usage, real_time_usage, top_projects] = await Promise.all([
          this.getUsageStatistics(userId, 1),
          this.getUsageStatistics(userId, 7),
          this.getUsageStatistics(userId, 30),
          this.getRealTimeUsage(userId),
          this.getTopProjects(userId)
        ]);

        return {
          today_usage,
          weekly_usage,
          monthly_usage,
          real_time_usage,
          top_projects
        };
      }
    } catch (error) {
      logger.error('获取仪表盘数据失败:', error);
      throw error;
    }
  }

  // 转换ccusage每日数据为统计格式
  private convertCCUsageToStatistics(dailyData: any[], days: number): UsageStatistics {
    if (dailyData.length === 0) {
      return {
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_cost: 0,
        average_duration: 0,
        session_count: 0,
        daily_average: 0,
        weekly_trend: 0,
        monthly_trend: 0
      };
    }

    const totals = dailyData.reduce((acc, day) => ({
      inputTokens: acc.inputTokens + day.inputTokens,
      outputTokens: acc.outputTokens + day.outputTokens,
      cost: acc.cost + day.totalCost,
      sessions: acc.sessions + 1 // 假设每天一个会话
    }), {
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
      sessions: 0
    });

    return {
      total_input_tokens: totals.inputTokens,
      total_output_tokens: totals.outputTokens,
      total_cost: totals.cost,
      average_duration: 0, // ccusage没有持续时间数据
      session_count: dailyData.length,
      daily_average: totals.cost / days,
      weekly_trend: Math.random() * 20 - 10, // 临时计算
      monthly_trend: Math.random() * 20 - 10  // 临时计算
    };
  }

  // 专门获取今日用量，直接使用ccusage查询
  private async getTodayUsageDirectly(): Promise<UsageStatistics> {
    const today = new Date().toISOString().split('T')[0];
    return this.getDateUsageDirectly(today);
  }

  // 获取指定日期的用量数据
  private async getDateUsageDirectly(date: string): Promise<UsageStatistics> {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      const dateStr = date.replace(/-/g, '');
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0].replace(/-/g, '');

      const command = `npx ccusage daily --since ${dateStr} --until ${nextDateStr} --json`;
      const { stdout } = await execAsync(command);
      const data = JSON.parse(stdout);

      if (data.daily && data.daily.length > 0) {
        const dayData = data.daily[0];
        return {
          total_input_tokens: dayData.inputTokens,
          total_output_tokens: dayData.outputTokens,
          total_cost: dayData.totalCost,
          average_duration: 0,
          session_count: 1, // 假设每天一个会话
          daily_average: dayData.totalCost,
          weekly_trend: 0, // 单日用量不计算趋势
          monthly_trend: 0,
          // 添加真正的totalTokens字段
          total_tokens: dayData.totalTokens
        };
      }

      // 如果没有指定日期的数据，返回0
      return {
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_cost: 0,
        average_duration: 0,
        session_count: 0,
        daily_average: 0,
        weekly_trend: 0,
        monthly_trend: 0,
        total_tokens: 0
      };
    } catch (error) {
      logger.error(`获取${date}用量失败:`, error);
      // 返回空数据而不是抛出错误
      return {
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_cost: 0,
        average_duration: 0,
        session_count: 0,
        daily_average: 0,
        weekly_trend: 0,
        monthly_trend: 0,
        total_tokens: 0
      };
    }
  }

  // 转换ccusage会话数据为使用记录格式
  private convertCCSessionToUsageRecord(session: any, userId: string): UsageRecord {
    return {
      id: session.sessionId,
      user_id: userId,
      project_id: this.extractProjectFromSessionId(session.sessionId),
      usage_type: 'claude_usage',
      input_tokens: session.inputTokens,
      output_tokens: session.outputTokens,
      cost: session.totalCost,
      duration: 0, // ccusage没有持续时间数据
      model_version: session.modelsUsed?.[0] || 'unknown',
      created_at: new Date(session.lastActivity + 'T12:00:00Z').toISOString()
    };
  }

  // 从sessionId提取项目信息
  private extractProjectFromSessionId(sessionId: string): string | undefined {
    // sessionId格式通常是 "-Users-path-to-project"
    const parts = sessionId.split('-');
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1];
      return lastPart !== 'lichunlei' ? lastPart : undefined;
    }
    return undefined;
  }

  // 从会话数据中提取热门项目
  private extractTopProjectsFromSessions(sessions: any[]): Array<{
    project_id: string;
    project_name: string;
    total_cost: number;
    total_tokens: number;
  }> {
    const projectMap = new Map<string, {
      cost: number;
      tokens: number;
      name: string;
    }>();

    sessions.forEach(session => {
      const projectId = this.extractProjectFromSessionId(session.sessionId);
      if (projectId) {
        const existing = projectMap.get(projectId) || { cost: 0, tokens: 0, name: projectId };
        projectMap.set(projectId, {
          cost: existing.cost + session.totalCost,
          tokens: existing.tokens + session.totalTokens,
          name: projectId
        });
      }
    });

    return Array.from(projectMap.entries())
      .map(([project_id, data]) => ({
        project_id,
        project_name: data.name,
        total_cost: data.cost,
        total_tokens: data.tokens
      }))
      .sort((a, b) => b.total_cost - a.total_cost)
      .slice(0, 5);
  }

  // 获取实时使用记录
  private async getRealTimeUsage(userId: string, limit: number = 10): Promise<UsageRecord[]> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM usage_records
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `;

      db.all(sql, [userId, limit], (err, rows: UsageRecord[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // 获取成本最高的项目
  private async getTopProjects(userId: string, limit: number = 5): Promise<Array<{
    project_id: string;
    project_name: string;
    total_cost: number;
    total_tokens: number;
  }>> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          ur.project_id,
          p.name as project_name,
          SUM(ur.cost) as total_cost,
          SUM(ur.input_tokens + ur.output_tokens) as total_tokens
        FROM usage_records ur
        LEFT JOIN projects p ON ur.project_id = p.id
        WHERE ur.user_id = ?
        AND ur.project_id IS NOT NULL
        GROUP BY ur.project_id, p.name
        ORDER BY total_cost DESC
        LIMIT ?
      `;

      db.all(sql, [userId, limit], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // 计算趋势（简化版）
  private calculateTrend(userId: string, days: number): number {
    // 这里实现一个简单的趋势计算
    // 实际应用中需要对比不同时间段的数据
    return Math.random() * 20 - 10; // 临时返回-10到10之间的随机值
  }

  // 生成ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}