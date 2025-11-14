import { Request, Response } from 'express';
import { UsageService } from '../services/usageService';
import { logger } from '../utils/logger';

const usageService = new UsageService();

export class UsageController {
  // 获取仪表盘数据
  async getDashboard(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id; // 假设中间件设置了用户信息
      const targetDate = req.query.date as string; // 获取日期参数，格式: YYYY-MM-DD
      const dashboardData = await usageService.getDashboardData(userId, targetDate);

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      logger.error('获取仪表盘数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取仪表盘数据失败'
      });
    }
  }

  // 获取使用统计数据
  async getStatistics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const days = parseInt(req.query.days as string) || 30;

      const statistics = await usageService.getUsageStatistics(userId, days);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('获取统计数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取统计数据失败'
      });
    }
  }

  // 创建使用记录（用于测试）
  async createRecord(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const recordData = { ...req.body, user_id: userId };

      const recordId = await usageService.createUsageRecord(recordData);

      res.status(201).json({
        success: true,
        data: { id: recordId }
      });
    } catch (error) {
      logger.error('创建使用记录失败:', error);
      res.status(500).json({
        success: false,
        message: '创建使用记录失败'
      });
    }
  }
}