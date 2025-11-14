import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { initDatabase } from './config/database';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 导入路由
import usageRoutes from './routes/usage';

// 路由
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/usage', usageRoutes);

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库
    await initDatabase();
    logger.info('数据库初始化完成');

    app.listen(PORT, () => {
      logger.info(`服务器运行在端口 ${PORT}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();