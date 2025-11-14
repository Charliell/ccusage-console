# CCUsage Console - Frontend

CCUsage Console 的前端应用，基于 React + TypeScript + Vite 构建的 Claude Code 用量监控界面。

## 🌟 功能特性

- **📊 实时数据监控** - 直观展示 Claude 使用统计
- **🎨 科技感界面** - 现代化黑色主题 UI
- **⚡ 高性能渲染** - 优化的组件和状态管理
- **📱 响应式设计** - 适配各种屏幕尺寸

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 类型检查

```bash
npm run typecheck
```

## 📁 项目结构

```
frontend/
├── src/
│   ├── components/
│   │   ├── DashboardDark.tsx    # 主仪表盘组件
│   │   └── RealTimeTable.tsx    # 实时记录表格
│   ├── App.tsx                  # 主应用组件
│   ├── main.tsx                 # 应用入口
│   └── index.css                # 全局样式
├── public/                      # 静态资源
└── package.json
```

## 🎨 主要组件

### DashboardDark
主仪表盘组件，包含：
- 用量统计卡片
- 日期选择器
- 实时使用记录表格
- 热门项目展示
- 系统状态信息

### RealTimeTable
实时使用记录表格，特性：
- 简洁的三列布局（项目、Tokens、成本）
- 最多显示 5 条最新记录
- 使用 React.memo 优化渲染性能

## 🛠️ 技术栈

- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **CSS-in-JS** - 样式解决方案

## 🔧 开发说明

### 状态管理
- 使用 React Hooks (useState, useEffect, useMemo)
- 优化组件渲染性能
- 实现数据缓存和错误处理

### 样式系统
- 线性渐变背景
- CSS 动画效果
- 响应式布局
- 毛玻璃效果 (backdrop-filter)

### API 集成
- 通过 fetch 与后端 API 通信
- 支持请求超时和重试机制
- 错误状态处理和用户反馈

## 📊 数据流

1. 组件挂载时获取仪表盘数据
2. 支持按日期参数获取历史数据
3. 自动格式化数字和成本显示
4. 错误处理和加载状态管理

## 🐛 故障排除

### 常见问题

1. **开发服务器启动失败**
   ```bash
   # 清理依赖重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **类型检查错误**
   ```bash
   # 运行类型检查
   npm run typecheck
   ```

3. **构建失败**
   ```bash
   # 清理 Vite 缓存
   rm -rf node_modules/.vite
   npm run build
   ```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目！

## 📄 许可证

MIT License
