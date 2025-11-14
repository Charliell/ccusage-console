import { Router } from 'express';
import { UsageController } from '../controllers/usageController';

const router = Router();
const usageController = new UsageController();

// 临时中间件，模拟用户认证
const mockAuth = (req: any, res: any, next: any) => {
  req.user = { id: 'user1', username: 'test_user' };
  next();
};

// 应用认证中间件
router.use(mockAuth);

// 获取仪表盘数据
router.get('/dashboard', usageController.getDashboard.bind(usageController));

// 获取使用统计数据
router.get('/statistics', usageController.getStatistics.bind(usageController));

// 创建使用记录（测试用）
router.post('/records', usageController.createRecord.bind(usageController));

export default router;