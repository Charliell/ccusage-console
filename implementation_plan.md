# 新增AI供应商功能实现方案

## 一、功能需求
在Dashboard页面添加"新增AI供应商"功能，允许用户动态添加新的AI模型配置，添加后自动显示在配置切换下拉框中。

## 二、前端实现

### 1. 添加新增按钮
在DashboardDark.tsx的AI供应商切换区域添加按钮：

```tsx
<div style={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '20px',
  gap: '10px'  // 添加间距
}}>
  <ConfigSwitcher
    onConfigChange={handleConfigChange}
    onRestartNeeded={handleRestartNeeded}
  />
  <button
    onClick={() => setShowAddConfigModal(true)}
    style={{
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '12px 20px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
    }}
  >
    ➕ 新增供应商
  </button>
</div>
```

### 2. 创建新增表单组件 (AddConfigModal.tsx)

```tsx
import React, { useState } from 'react';

interface AddConfigForm {
  id: string;           // 唯一标识
  name: string;         // 显示名称
  model: string;        // 模型名称
  baseUrl: string;      // API地址
  apiKey: string;       // API密钥
  description?: string; // 描述
}

interface AddConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddConfigModal: React.FC<AddConfigModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<AddConfigForm>({
    id: '',
    name: '',
    model: '',
    baseUrl: '',
    apiKey: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id || !formData.name || !formData.model || !formData.baseUrl || !formData.apiKey) {
      setError('请填写所有必填字段');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 生成配置文件内容
      const configContent = {
        model: formData.model,
        baseUrl: formData.baseUrl,
        apiKey: formData.apiKey,
        description: formData.description || ''
      };

      const response = await fetch('http://localhost:3001/api/config/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: formData.id,
          name: formData.name,
          config: configContent,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
        // 重置表单
        setFormData({
          id: '',
          name: '',
          model: '',
          baseUrl: '',
          apiKey: '',
          description: ''
        });
      } else {
        setError(result.message || '创建配置失败');
      }
    } catch (err) {
      setError(`创建配置失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <h2 style={{
          color: '#f1f5f9',
          marginBottom: '20px',
          fontSize: '24px',
        }}>
          新增AI供应商
        </h2>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#fecaca',
            fontSize: '14px',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              color: '#94a3b8',
              fontSize: '14px',
              marginBottom: '5px',
              fontWeight: '500',
            }}>
              供应商ID *
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({...formData, id: e.target.value})}
              placeholder="例如: openai, anthropic, 自定义名称"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(100, 116, 139, 0.2)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              color: '#94a3b8',
              fontSize: '14px',
              marginBottom: '5px',
              fontWeight: '500',
            }}>
              显示名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="例如: OpenAI GPT-4"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(100, 116, 139, 0.2)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              color: '#94a3b8',
              fontSize: '14px',
              marginBottom: '5px',
              fontWeight: '500',
            }}>
              模型名称 *
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              placeholder="例如: gpt-4, claude-sonnet"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(100, 116, 139, 0.2)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              color: '#94a3b8',
              fontSize: '14px',
              marginBottom: '5px',
              fontWeight: '500',
            }}>
              Base URL *
            </label>
            <input
              type="text"
              value={formData.baseUrl}
              onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
              placeholder="例如: https://api.openai.com/v1"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(100, 116, 139, 0.2)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              color: '#94a3b8',
              fontSize: '14px',
              marginBottom: '5px',
              fontWeight: '500',
            }}>
              API Key *
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
              placeholder="输入API密钥"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(100, 116, 139, 0.2)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#94a3b8',
              fontSize: '14px',
              marginBottom: '5px',
              fontWeight: '500',
            }}>
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="可选：输入配置描述"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(100, 116, 139, 0.2)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '14px',
                outline: 'none',
                minHeight: '80px',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'rgba(100, 116, 139, 0.2)',
                color: '#94a3b8',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? '创建中...' : '创建配置'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddConfigModal;
```

### 3. 在DashboardDark.tsx中使用

```tsx
import AddConfigModal from './AddConfigModal';

// 添加状态
const [showAddConfigModal, setShowAddConfigModal] = useState(false);

// 在return中添加
<div style={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '20px',
  gap: '10px'
}}>
  <ConfigSwitcher
    onConfigChange={handleConfigChange}
    onRestartNeeded={handleRestartNeeded}
  />
  <button
    onClick={() => setShowAddConfigModal(true)}
    style={{/* 样式 */}}
  >
    ➕ 新增供应商
  </button>
</div>

<AddConfigModal
  isOpen={showAddConfigModal}
  onClose={() => setShowAddConfigModal(false)}
  onSuccess={() => {
    // 刷新配置列表
    // 这里需要调用ConfigSwitcher的loadConfigs方法
  }}
/>
```

## 三、后端实现

### 1. 创建配置文件接口

```typescript
// backend/src/routes/config.ts

import { Router } from 'express';
import * as ConfigService from '../services/configService';

const router = Router();

// 创建新配置
router.post('/create', async (req, res) => {
  try {
    const { id, name, config } = req.body;

    if (!id || !name || !config) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 验证配置文件路径
    const configFileName = `settings.json.${id}`;
    const configPath = path.join(ccUsagePath, configFileName);

    // 检查配置文件是否已存在
    if (fs.existsSync(configPath)) {
      return res.status(409).json({
        success: false,
        message: '配置已存在'
      });
    }

    // 构建完整的配置对象
    const configData = {
      model: config.model,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      description: config.description || '',
      createdAt: new Date().toISOString()
    };

    // 写入配置文件
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

    // 重新加载配置列表
    await ConfigService.loadConfigs();

    res.json({
      success: true,
      message: '配置创建成功',
      data: {
        id,
        name,
        file: configFileName,
        isActive: false,
        preview: {
          model: config.model,
          baseUrl: config.baseUrl
        }
      }
    });
  } catch (error) {
    console.error('创建配置失败:', error);
    res.status(500).json({
      success: false,
      message: '创建配置失败: ' + (error instanceof Error ? error.message : '未知错误')
    });
  }
});

export default router;
```

### 2. 在 index.ts 中注册路由

```typescript
// backend/src/index.ts
import configRoutes from './routes/config';

// 在 app.use('/api/usage', usageRoutes); 之后添加
app.use('/api/config', configRoutes);
```

## 四、配置文件结构

每个供应商的配置文件格式：

```json
{
  "model": "模型名称",
  "baseUrl": "https://api.example.com/v1",
  "apiKey": "sk-xxxxxxxxxxxxxxxx",
  "description": "可选描述",
  "createdAt": "2025-11-16T12:00:00.000Z"
}
```

配置文件命名：
- 主配置: `settings.json`
- 自定义配置: `settings.json.{供应商ID}`

例如：
- `settings.json` (默认)
- `settings.json.kimi`
- `settings.json.glm`
- `settings.json.openai` (新增)

## 五、数据流

1. 用户点击"新增供应商"按钮
2. 弹出表单模态框
3. 用户填写表单并提交
4. 前端调用 POST /api/config/create
5. 后端：
   - 验证参数
   - 检查配置是否已存在
   - 写入配置文件
   - 重新加载配置列表
6. 返回成功后，前端：
   - 关闭模态框
   - 刷新配置列表（调用 ConfigSwitcher 的 loadConfigs）
   - 显示成功提示

## 六、UI/UX 考虑

### 表单验证：
- 所有必填字段验证
- ID 格式验证（只允许字母、数字、下划线、连字符）
- URL 格式验证
- 检查配置是否已存在

### 用户体验：
- 加载状态显示
- 错误提示清晰
- 成功提示并自动刷新列表
- 按 ESC 键关闭模态框
- 点击遮罩层关闭模态框

### 安全性：
- API Key 使用 password 类型输入
- 后端不返回完整的 API Key（只显示掩码）
- 配置文件权限控制（仅当前用户可读）

## 七、实现步骤

### 第1步：完成后端 API
1. 创建 backend/src/routes/config.ts
2. 实现 POST /api/config/create 接口
3. 在 index.ts 中注册路由
4. 测试 API（使用 curl 或 Postman）

**测试命令：**
```bash
curl -X POST http://localhost:3001/api/config/create \
  -H "Content-Type: application/json" \
  -d '{
    "id": "openai",
    "name": "OpenAI GPT-4",
    "config": {
      "model": "gpt-4",
      "baseUrl": "https://api.openai.com/v1",
      "apiKey": "sk-test123",
      "description": "OpenAI GPT-4 API"
    }
  }'
```

### 第2步：前端表单组件
1. 创建 src/components/AddConfigModal.tsx
2. 实现表单 UI 和验证逻辑
3. 添加必要的样式

### 第3步：集成到 Dashboard
1. 在 DashboardDark.tsx 中导入 AddConfigModal
2. 添加按钮和状态管理
3. 实现成功后的刷新逻辑

### 第4步：优化和测试
1. 表单验证优化
2. 错误处理完善
3. 用户体验优化
4. 全面测试

## 八、扩展功能（可选）

### 1. 编辑配置
- 点击编辑按钮修改已有配置
- 需要实现 PUT /api/config/:id 接口

### 2. 删除配置
- 删除自定义配置（不能删除当前激活的配置）
- 需要实现 DELETE /api/config/:id 接口

### 3. 配置模板
- 提供常见供应商的模板（OpenAI、Anthropic、Google等）
- 用户选择模板后自动填充部分字段

### 4. 配置验证
- 测试API连接是否正常
- 验证API Key是否有效

## 九、技术要点

1. **文件操作**：使用 fs 模块读写配置文件
2. **并发控制**：避免多个请求同时修改同一文件
3. **配置热加载**：无需重启服务即可加载新配置
4. **错误恢复**：文件写入失败时的回滚机制
5. **权限管理**：确保配置文件只能被创建者访问

## 十、测试清单

- [ ] 表单验证（必填字段）
- [ ] 创建新配置成功
- [ ] 配置ID重复时提示错误
- [ ] 配置文件正确生成
- [ ] 下拉框自动显示新配置
- [ ] 可以切换到新配置
- [ ] 错误提示清晰
- [ ] 加载状态正确显示
- [ ] 关闭模态框后表单重置
