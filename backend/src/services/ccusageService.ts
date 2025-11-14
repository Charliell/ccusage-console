import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

export interface CCUsageDaily {
  date: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  totalCost: number;
  modelsUsed: string[];
  modelBreakdowns: Array<{
    modelName: string;
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    cost: number;
  }>;
}

export interface CCUsageSession {
  sessionId: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  totalCost: number;
  lastActivity: string;
  modelsUsed: string[];
  modelBreakdowns: Array<{
    modelName: string;
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    cost: number;
  }>;
}

export interface CCUsageData {
  daily: CCUsageDaily[];
  sessions: CCUsageSession[];
  totals: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    totalCost: number;
    totalTokens: number;
  };
}

export class CCUsageService {
  // 获取每日用量数据
  async getDailyUsage(since?: string, until?: string): Promise<CCUsageDaily[]> {
    try {
      let command = 'npx ccusage daily --json';

      if (since) {
        command += ` --since ${since}`;
      }

      if (until) {
        command += ` --until ${until}`;
      }

      const { stdout } = await execAsync(command);
      const data = JSON.parse(stdout);

      logger.info(`获取到 ${data.daily.length} 条每日用量记录`);
      return data.daily;
    } catch (error) {
      logger.error('获取每日用量数据失败:', error);
      throw error;
    }
  }

  // 获取会话用量数据
  async getSessionUsage(limit: number = 20): Promise<CCUsageSession[]> {
    try {
      // 直接使用ccusage获取所有会话数据，然后在代码中限制
      const command = 'npx ccusage session --json --order desc';
      const { stdout } = await execAsync(command);

      const data = JSON.parse(stdout);
      const sessions = data.sessions || [];

      // 限制返回数量
      const limitedSessions = sessions.slice(0, limit);
      logger.info(`获取到 ${limitedSessions.length} 条会话记录`);
      return limitedSessions;
    } catch (error) {
      logger.error('获取会话用量数据失败:', error);
      return [];
    }
  }

  // 获取完整的用量数据
  async getCompleteUsage(days: number = 30): Promise<CCUsageData> {
    try {
      // 计算日期范围
      const until = new Date();
      const since = new Date();
      since.setDate(until.getDate() - days);

      const sinceStr = since.toISOString().split('T')[0].replace(/-/g, '');
      const untilStr = until.toISOString().split('T')[0].replace(/-/g, '');

      // 并行获取数据
      const [dailyData, sessionData] = await Promise.all([
        this.getDailyUsage(sinceStr, untilStr),
        this.getSessionUsage(50)
      ]);

      // 计算总计
      const totals = dailyData.reduce((acc, day) => ({
        inputTokens: acc.inputTokens + day.inputTokens,
        outputTokens: acc.outputTokens + day.outputTokens,
        cacheCreationTokens: acc.cacheCreationTokens + day.cacheCreationTokens,
        cacheReadTokens: acc.cacheReadTokens + day.cacheReadTokens,
        totalCost: acc.totalCost + day.totalCost,
        totalTokens: acc.totalTokens + day.totalTokens
      }), {
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        totalCost: 0,
        totalTokens: 0
      });

      return {
        daily: dailyData,
        sessions: sessionData,
        totals
      };
    } catch (error) {
      logger.error('获取完整用量数据失败:', error);
      throw error;
    }
  }

  // 获取今日用量
  async getTodayUsage(): Promise<CCUsageDaily | null> {
    try {
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0].replace(/-/g, '');

      const dailyData = await this.getDailyUsage(today, tomorrowStr);
      return dailyData.length > 0 ? dailyData[0] : null;
    } catch (error) {
      logger.error('获取今日用量失败:', error);
      return null;
    }
  }

  // 获取本周用量
  async getWeeklyUsage(): Promise<CCUsageDaily[]> {
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // 本周开始（周日）

      const sinceStr = weekStart.toISOString().split('T')[0].replace(/-/g, '');
      const untilStr = now.toISOString().split('T')[0].replace(/-/g, '');

      return await this.getDailyUsage(sinceStr, untilStr);
    } catch (error) {
      logger.error('获取本周用量失败:', error);
      return [];
    }
  }

  // 获取本月用量
  async getMonthlyUsage(): Promise<CCUsageDaily[]> {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const sinceStr = monthStart.toISOString().split('T')[0].replace(/-/g, '');
      const untilStr = now.toISOString().split('T')[0].replace(/-/g, '');

      return await this.getDailyUsage(sinceStr, untilStr);
    } catch (error) {
      logger.error('获取本月用量失败:', error);
      return [];
    }
  }

  // 检查ccusage是否可用
  async isCCUsageAvailable(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('npx ccusage --version');
      logger.info(`ccusage版本: ${stdout.trim()}`);
      return true;
    } catch (error) {
      logger.error('ccusage不可用:', error);
      return false;
    }
  }
}