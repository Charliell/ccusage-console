import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

export interface ConfigInfo {
  id: string;
  name: string;
  file: string;
  isActive: boolean;
  preview: {
    model: string;
    baseUrl: string;
  };
}

export interface ConfigFile {
  env: {
    ANTHROPIC_AUTH_TOKEN?: string;
    ANTHROPIC_BASE_URL?: string;
    ANTHROPIC_MODEL?: string;
    ANTHROPIC_SMALL_FAST_MODEL?: string;
    ANTHROPIC_DEFAULT_HAIKU_MODEL?: string;
    ANTHROPIC_DEFAULT_SONNET_MODEL?: string;
    ANTHROPIC_DEFAULT_OPUS_MODEL?: string;
    [key: string]: any;
  };
  alwaysThinkingEnabled?: boolean;
  [key: string]: any;
}

export interface SwitchResult {
  previous: string;
  current: string;
  backupCreated: string;
}

export class ConfigService {
  private readonly configDir = path.join(os.homedir(), '.claude');
  private readonly defaultConfig = 'settings.json';

  /**
   * 获取所有可用配置
   */
  async listConfigs(): Promise<ConfigInfo[]> {
    try {
      // 检查配置目录是否存在
      try {
        await fs.access(this.configDir);
      } catch {
        logger.warn(`配置目录不存在: ${this.configDir}`);
        return [];
      }

      // 读取目录中的所有配置文件
      const files = await fs.readdir(this.configDir);
      const configFiles = files.filter(file =>
        file.startsWith('settings.json')
      );

      if (configFiles.length === 0) {
        logger.warn('未找到任何配置文件');
        return [];
      }

      // 读取当前活跃配置
      const activeConfig = this.defaultConfig;
      const activeConfigPath = path.join(this.configDir, activeConfig);

      // 读取所有配置并提取信息
      const configs: ConfigInfo[] = [];

      for (const file of configFiles) {
        const filePath = path.join(this.configDir, file);

        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const config: ConfigFile = JSON.parse(content);

          // 提取配置 ID（从文件名）
          let configId = 'default';
          if (file === 'settings.json') {
            // 判断是哪种配置
            if (config.env?.ANTHROPIC_MODEL?.includes('kimi')) {
              configId = 'kimi';
            } else if (config.env?.ANTHROPIC_BASE_URL?.includes('minimax')) {
              configId = 'minimax';
            } else if (config.env?.ANTHROPIC_BASE_URL?.includes('glm')) {
              configId = 'glm';
            } else {
              configId = 'default';
            }
          } else {
            // 从文件名提取，如 settings.json.miniMax -> miniMax
            const match = file.match(/settings\.json\.(.+)$/);
            configId = match ? match[1] : 'unknown';
          }

          // 提取模型名称
          const model = config.env?.ANTHROPIC_MODEL ||
                       config.env?.ANTHROPIC_DEFAULT_SONNET_MODEL ||
                       config.env?.ANTHROPIC_DEFAULT_HAIKU_MODEL ||
                       'unknown';

          configs.push({
            id: configId,
            name: this.getDisplayName(configId),
            file: file,
            isActive: file === activeConfig,
            preview: {
              model: model,
              baseUrl: config.env?.ANTHROPIC_BASE_URL || 'not set'
            }
          });

        } catch (error) {
          logger.error(`读取配置文件失败: ${file}`, error);
          // 跳过无效的配置文件
          continue;
        }
      }

      return configs.sort((a, b) => {
        if (a.isActive) return -1;
        if (b.isActive) return 1;
        return a.name.localeCompare(b.name);
      });

    } catch (error) {
      logger.error('获取配置列表失败', error);
      throw error;
    }
  }

  /**
   * 获取配置显示名称
   */
  private getDisplayName(configId: string): string {
    const nameMap: { [key: string]: string } = {
      'default': '默认配置',
      'kimi': 'Kimi',
      'minimax': 'MiniMax',
      'glm': 'GLM',
      'anthropic': 'Anthropic',
    };
    return nameMap[configId] || configId.charAt(0).toUpperCase() + configId.slice(1);
  }

  /**
   * 获取当前激活的配置
   */
  async getCurrentConfig(): Promise<ConfigInfo | null> {
    try {
      const configs = await this.listConfigs();
      return configs.find(c => c.isActive) || null;
    } catch (error) {
      logger.error('获取当前配置失败', error);
      return null;
    }
  }

  /**
   * 切换配置
   */
  async switchConfig(configId: string): Promise<SwitchResult> {
    try {
      // 获取所有配置
      const configs = await this.listConfigs();
      const currentConfig = configs.find(c => c.isActive);
      const targetConfig = configs.find(c => c.id === configId);

      if (!targetConfig) {
        throw new Error(`配置不存在: ${configId}`);
      }

      if (targetConfig.isActive) {
        throw new Error(`配置已经是激活状态: ${configId}`);
      }

      // 将当前配置重命名为模型名称
      let backupName = 'none';
      if (currentConfig && currentConfig.id !== 'default') {
        backupName = await this.renameCurrentConfig(currentConfig);
        logger.info(`当前配置已重命名: ${backupName}`);
      }

      // 复制目标配置到 settings.json
      const sourcePath = path.join(this.configDir, targetConfig.file);
      const targetPath = path.join(this.configDir, this.defaultConfig);

      // 验证源配置文件存在
      try {
        await fs.access(sourcePath);
      } catch {
        throw new Error(`源配置文件不存在: ${sourcePath}`);
      }

      // 读取源配置
      const content = await fs.readFile(sourcePath, 'utf-8');

      // 验证配置格式
      this.validateConfig(content);

      // 写入目标位置（覆盖）
      await fs.writeFile(targetPath, content, 'utf-8');

      logger.info(`配置切换成功: ${currentConfig?.id || 'unknown'} -> ${configId}`);

      return {
        previous: currentConfig?.id || 'unknown',
        current: configId,
        backupCreated: backupName
      };

    } catch (error) {
      logger.error('配置切换失败', error);
      throw error;
    }
  }

  /**
   * 将当前配置重命名为模型名称
   */
  private async renameCurrentConfig(currentConfig: ConfigInfo): Promise<string> {
    try {
      const configPath = path.join(this.configDir, this.defaultConfig);
      const newFileName = `settings.json.${currentConfig.id}`;
      const newPath = path.join(this.configDir, newFileName);

      // 检查配置文件是否存在
      try {
        await fs.access(configPath);
      } catch {
        // 如果源文件不存在，返回空
        return 'none';
      }

      // 读取当前配置
      const content = await fs.readFile(configPath, 'utf-8');

      // 写入新位置
      await fs.writeFile(newPath, content, 'utf-8');

      logger.info(`配置已重命名: settings.json -> ${newFileName}`);
      return newFileName;

    } catch (error) {
      logger.error('重命名配置失败', error);
      throw error;
    }
  }

  /**
   * 创建备份（保留原有的时间戳备份功能作为备用）
   */
  private async createBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5); // 移除毫秒和 Z

      const backupName = `settings.json.backup.${timestamp}`;
      const backupPath = path.join(this.configDir, backupName);
      const configPath = path.join(this.configDir, this.defaultConfig);

      // 检查配置文件是否存在
      try {
        await fs.access(configPath);
      } catch {
        // 如果源文件不存在，返回空备份名
        return 'none';
      }

      // 读取当前配置
      const content = await fs.readFile(configPath, 'utf-8');

      // 写入备份
      await fs.writeFile(backupPath, content, 'utf-8');

      logger.info(`备份已创建: ${backupName}`);
      return backupName;

    } catch (error) {
      logger.error('创建备份失败', error);
      throw error;
    }
  }

  /**
   * 验证配置文件格式
   */
  private validateConfig(content: string): void {
    try {
      const config = JSON.parse(content);

      // 验证基本结构
      if (!config || typeof config !== 'object') {
        throw new Error('配置必须是有效的 JSON 对象');
      }

      // env 字段应该是对象（如果存在）
      if (config.env !== undefined && typeof config.env !== 'object') {
        throw new Error('env 字段必须是对象');
      }

      // 必须包含 ANTHROPIC_AUTH_TOKEN
      if (config.env && !config.env.ANTHROPIC_AUTH_TOKEN) {
        throw new Error('配置缺少 ANTHROPIC_AUTH_TOKEN');
      }

      logger.debug('配置验证通过');

    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`配置文件格式错误: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 获取所有备份文件
   */
  async listBackups(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.configDir);
      const backupFiles = files
        .filter(file => file.startsWith('settings.json.backup.'))
        .sort()
        .reverse(); // 最新的在前

      return backupFiles;
    } catch (error) {
      logger.error('获取备份列表失败', error);
      return [];
    }
  }

  /**
   * 恢复备份
   */
  async restoreBackup(backupFile: string): Promise<void> {
    try {
      const backupPath = path.join(this.configDir, backupFile);
      const targetPath = path.join(this.configDir, this.defaultConfig);

      // 验证备份文件存在
      try {
        await fs.access(backupPath);
      } catch {
        throw new Error(`备份文件不存在: ${backupFile}`);
      }

      // 读取备份内容
      const content = await fs.readFile(backupPath, 'utf-8');

      // 验证配置格式
      this.validateConfig(content);

      // 创建当前配置的备份（防止恢复出错）
      await this.createBackup();

      // 恢复备份
      await fs.writeFile(targetPath, content, 'utf-8');

      logger.info(`配置已恢复: ${backupFile}`);

    } catch (error) {
      logger.error('恢复备份失败', error);
      throw error;
    }
  }

  /**
   * 创建新配置
   */
  async createConfig(id: string, name: string, configData: any): Promise<ConfigInfo> {
    try {
      const configPath = path.join(this.configDir, `settings.json.${id}`);

      // 检查配置是否已存在
      try {
        await fs.access(configPath);
        throw new Error(`配置已存在: ${id}`);
      } catch (error) {
        if ((error as any).code !== 'ENOENT') {
          throw error;
        }
      }

      // 构建符合 Claude Code 格式的配置对象
      const configFile: ConfigFile = {
        env: {
          ANTHROPIC_AUTH_TOKEN: configData.apiKey,
          ANTHROPIC_BASE_URL: configData.baseUrl,
          API_TIMEOUT_MS: '3000000',
          CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1'
        },
        alwaysThinkingEnabled: true
      };

      // 根据配置设置模型变量
      if (configData.modelType === 'single') {
        // 单模型模式（如Kimi）
        configFile.env.ANTHROPIC_MODEL = configData.model;
        configFile.env.ANTHROPIC_SMALL_FAST_MODEL = configData.smallModel || configData.model;
      } else {
        // 三模型模式（如GLM/MiniMax）
        configFile.env.ANTHROPIC_DEFAULT_HAIKU_MODEL = configData.haikuModel;
        configFile.env.ANTHROPIC_DEFAULT_SONNET_MODEL = configData.sonnetModel;
        configFile.env.ANTHROPIC_DEFAULT_OPUS_MODEL = configData.opusModel;
      }

      // 验证配置格式
      const configContent = JSON.stringify(configFile, null, 2);
      this.validateConfig(configContent);

      // 写入配置文件
      await fs.writeFile(configPath, configContent, 'utf-8');

      logger.info(`配置已创建: ${id} -> settings.json.${id}`);

      // 返回配置信息
      const model = configFile.env.ANTHROPIC_MODEL ||
                   configFile.env.ANTHROPIC_DEFAULT_SONNET_MODEL ||
                   configFile.env.ANTHROPIC_DEFAULT_HAIKU_MODEL ||
                   'unknown';

      return {
        id,
        name: name || this.getDisplayName(id),
        file: `settings.json.${id}`,
        isActive: false,
        preview: {
          model,
          baseUrl: configFile.env.ANTHROPIC_BASE_URL || 'not set'
        }
      };

    } catch (error) {
      logger.error('创建配置失败', error);
      throw error;
    }
  }

  /**
   * 删除配置
   */
  async deleteConfig(id: string): Promise<void> {
    try {
      // 禁止删除当前激活的配置
      const configs = await this.listConfigs();
      const targetConfig = configs.find(c => c.id === id);

      if (!targetConfig) {
        throw new Error(`配置不存在: ${id}`);
      }

      if (targetConfig.isActive) {
        throw new Error('不能删除当前激活的配置，请先切换到其他配置');
      }

      if (targetConfig.file === 'settings.json') {
        throw new Error('不能删除默认配置文件');
      }

      // 删除配置文件
      const configPath = path.join(this.configDir, targetConfig.file);
      await fs.unlink(configPath);

      logger.info(`配置已删除: ${id} (${targetConfig.file})`);

    } catch (error) {
      logger.error('删除配置失败', error);
      throw error;
    }
  }
}

export default ConfigService;
