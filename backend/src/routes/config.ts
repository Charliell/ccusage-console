import { Router } from 'express';
import { ConfigController } from '../controllers/configController';

const router = Router();
const configController = new ConfigController();

// 临时中间件，模拟用户认证
const mockAuth = (req: any, res: any, next: any) => {
  req.user = { id: 'user1', username: 'test_user' };
  next();
};

// 应用认证中间件
router.use(mockAuth);

// 获取配置列表
router.get('/list', configController.getConfigList.bind(configController));

// 获取当前配置
router.get('/current', configController.getCurrentConfig.bind(configController));

// 切换配置
router.post('/switch', configController.switchConfig.bind(configController));

// 创建新配置
router.post('/create', configController.createConfig.bind(configController));

// 删除配置
router.delete('/:id', configController.deleteConfig.bind(configController));

// 获取备份列表
router.get('/backups', configController.listBackups.bind(configController));

// 恢复备份
router.post('/backups/restore', configController.restoreBackup.bind(configController));

export default router;
