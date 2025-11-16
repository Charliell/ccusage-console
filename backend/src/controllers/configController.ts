import { Request, Response } from 'express';
import { ConfigService } from '../services/configService';
import { logger } from '../utils/logger';

const configService = new ConfigService();

export class ConfigController {
  /**
   * 获取配置列表
   */
  async getConfigList(req: Request, res: Response) {
    try {
      const configs = await configService.listConfigs();

      res.json({
        success: true,
        message: '获取配置列表成功',
        data: configs
      });

    } catch (error) {
      logger.error('获取配置列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取配置列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取当前配置
   */
  async getCurrentConfig(req: Request, res: Response) {
    try {
      const config = await configService.getCurrentConfig();

      if (!config) {
        return res.status(404).json({
          success: false,
          message: '未找到当前配置'
        });
      }

      res.json({
        success: true,
        message: '获取当前配置成功',
        data: config
      });

    } catch (error) {
      logger.error('获取当前配置失败:', error);
      res.status(500).json({
        success: false,
        message: '获取当前配置失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 切换配置
   */
  async switchConfig(req: Request, res: Response) {
    try {
      const { configId } = req.body;

      // 验证参数
      if (!configId || typeof configId !== 'string') {
        return res.status(400).json({
          success: false,
          message: '参数错误: configId 不能为空'
        });
      }

      logger.info(`开始切换配置: ${configId}`);

      // 执行切换
      const result = await configService.switchConfig(configId);

      logger.info(`配置切换成功: ${result.previous} -> ${result.current}`);

      res.json({
        success: true,
        message: '配置切换成功',
        data: result
      });

    } catch (error) {
      logger.error('配置切换失败:', error);

      if (error instanceof Error && error.message.includes('配置')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: '配置切换失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取所有备份
   */
  async listBackups(req: Request, res: Response) {
    try {
      const backups = await configService.listBackups();

      res.json({
        success: true,
        message: '获取备份列表成功',
        data: backups
      });

    } catch (error) {
      logger.error('获取备份列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取备份列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 恢复备份
   */
  async restoreBackup(req: Request, res: Response) {
    try {
      const { backupFile } = req.body;

      if (!backupFile || typeof backupFile !== 'string') {
        return res.status(400).json({
          success: false,
          message: '参数错误: backupFile 不能为空'
        });
      }

      logger.info(`开始恢复备份: ${backupFile}`);

      await configService.restoreBackup(backupFile);

      logger.info(`备份恢复成功: ${backupFile}`);

      res.json({
        success: true,
        message: '备份恢复成功',
        data: { backupFile }
      });

    } catch (error) {
      logger.error('恢复备份失败:', error);

      if (error instanceof Error) {
        if (error.message.includes('不存在')) {
          return res.status(404).json({
            success: false,
            message: error.message
          });
        }
        if (error.message.includes('格式')) {
          return res.status(400).json({
            success: false,
            message: error.message
          });
        }
      }

      res.status(500).json({
        success: false,
        message: '恢复备份失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 创建新配置
   */
  async createConfig(req: Request, res: Response) {
    try {
      const { id, name, config } = req.body;

      // 验证参数
      if (!id || !name || !config) {
        return res.status(400).json({
          success: false,
          message: '缺少必要参数：id、name 和 config 不能为空'
        });
      }

      // 验证 config 对象的必填字段
      if (!config.baseUrl || !config.apiKey) {
        return res.status(400).json({
          success: false,
          message: '缺少必要参数：baseUrl 和 apiKey 不能为空'
        });
      }

      logger.info(`开始创建配置: ${id}`);

      // 创建配置
      const result = await configService.createConfig(id, name, config);

      logger.info(`配置创建成功: ${id}`);

      res.json({
        success: true,
        message: '配置创建成功',
        data: result
      });

    } catch (error) {
      logger.error('创建配置失败:', error);

      if (error instanceof Error) {
        if (error.message.includes('已存在')) {
          return res.status(409).json({
            success: false,
            message: error.message
          });
        }
      }

      res.status(500).json({
        success: false,
        message: '创建配置失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 删除配置
   */
  async deleteConfig(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: '参数错误：id 不能为空'
        });
      }

      logger.info(`开始删除配置: ${id}`);

      await configService.deleteConfig(id);

      logger.info(`配置删除成功: ${id}`);

      res.json({
        success: true,
        message: '配置删除成功',
        data: { id }
      });

    } catch (error) {
      logger.error('删除配置失败:', error);

      if (error instanceof Error) {
        if (error.message.includes('激活')) {
          return res.status(403).json({
            success: false,
            message: error.message
          });
        }
        if (error.message.includes('存在')) {
          return res.status(404).json({
            success: false,
            message: error.message
          });
        }
      }

      res.status(500).json({
        success: false,
        message: '删除配置失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}
