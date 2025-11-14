# CCUsage Console

一个基于 ccusage 的本地 Claude Code 用量监控系统，提供实时可视化界面来查看 Claude 使用统计。

## 🌟 功能特性

- **📊 实时数据监控** - 直接集成 ccusage 获取真实的 Claude 使用数据
- **📅 历史数据查询** - 支持按日期查看历史使用记录
- **🎨 科技感界面** - 黑色主题的现代化 UI 设计
- **⚡ 高性能** - 优化的数据获取和展示，支持快速刷新
- **📱 响应式设计** - 适配不同屏幕尺寸
- **🔍 详细统计** - 包含 tokens、成本、会话次数等多维度数据

## 🏗️ 技术架构

- **前端**: React 18 + TypeScript + Vite
- **后端**: Node.js + Express.js + TypeScript
- **数据库**: SQLite (轻量级本地部署)
- **数据源**: ccusage 命令行工具
- **样式**: CSS-in-JS (渐变背景、动画效果)

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- ccusage 工具 (`npx ccusage`)

### 安装 ccusage

ccusage 是 Claude Code 的官方用量统计工具。如果你还没有安装，可以通过以下方式获取：

#### 方法一：使用 npm 全局安装
```bash
npm install -g @anthropic-ai/ccusage
```

#### 方法二：使用 npx 直接运行（推荐）
```bash
# 无需安装，直接使用
npx ccusage --help
```

#### 方法三：从源码安装
```bash
# 克隆官方仓库
git clone https://github.com/anthropics/ccusage.git
cd ccusage
npm install
npm run build
npm link
```

#### 验证安装
```bash
# 检查版本
npx ccusage --version

# 查看帮助
npx ccusage --help

# 测试基本功能
npx ccusage daily
```

> **💡 提示**: 推荐使用 `npx ccusage` 方式，无需全局安装，自动使用最新版本。

更多详细信息请访问：[ccusage 官方仓库](https://github.com/anthropics/ccusage)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd ccconsole
```

2. **安装依赖**

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

3. **启动服务**

```bash
# 启动后端服务 (端口 3001)
cd backend
npm run dev

# 新开终端，启动前端服务 (端口 5173)
cd frontend
npm run dev
```

4. **访问应用**
- 前端界面: http://localhost:5173
- 后端 API: http://localhost:3001

## 📁 项目结构

```
ccconsole/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── services/        # 业务逻辑
│   │   ├── types/           # TypeScript 类型定义
│   │   ├── utils/           # 工具函数
│   │   ├── config/          # 配置文件
│   │   └── routes/          # 路由定义
│   ├── database.sqlite      # SQLite 数据库
│   └── package.json
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── App.tsx          # 主应用组件
│   │   └── main.tsx         # 应用入口
│   ├── public/              # 静态资源
│   └── package.json
├── .gitignore               # Git 忽略文件
└── README.md                # 项目说明文档
```

## 📊 核心功能

### 实时用量统计
- 输入/输出 Tokens 数量
- 总 Tokens 数量（包含缓存读取）
- 使用成本统计
- 会话次数统计

### 历史数据查询
- 按日期筛选历史数据
- 支持查看任意日期的使用情况
- 真实的 ccusage 数据源

### 项目使用分析
- 热门项目排行
- 项目级别的成本统计
- Token 使用分布

## ⚙️ 配置说明

### ccusage 集成
系统通过执行 `npx ccusage` 命令获取真实数据：

```bash
# 今日用量
npx ccusage daily --json

# 指定日期用量
npx ccusage daily --since YYYYMMDD --until YYYYMMDD --json

# 会话记录
npx ccusage session --json
```

### API 端点

- `GET /api/usage/dashboard` - 获取仪表盘数据
- `GET /api/usage/dashboard?date=YYYY-MM-DD` - 获取指定日期数据
- `GET /api/usage/statistics` - 获取使用统计

## 🎨 UI 组件

### DashboardDark - 主仪表盘
- 科技感黑色主题
- 渐变背景和动画效果
- 响应式卡片布局
- 实时数据更新

### RealTimeTable - 实时记录表格
- 简洁的三列布局（项目、Tokens、成本）
- 最多显示 5 条最新记录
- 优化的渲染性能

## 🔧 开发指南

### 开发模式启动

```bash
# 后端开发模式
cd backend
npm run dev

# 前端开发模式
cd frontend
npm run dev
```

### 构建生产版本

```bash
# 构建前端
cd frontend
npm run build

# 预览构建结果
npm run preview
```

### 类型检查

```bash
# 前端类型检查
cd frontend
npm run typecheck

# 后端类型检查
cd backend
npm run typecheck
```

## 🐛 故障排除

### 常见问题

1. **数据获取超时**
   - 检查 ccusage 是否正常安装
   - 确认网络连接正常
   - 查看后端日志了解具体错误

2. **端口冲突**
   - 默认端口：前端 5173，后端 3001
   - 如有冲突，可修改配置文件中的端口设置

3. **ccusage 命令失败**
   ```bash
   # 测试 ccusage 是否可用
   npx ccusage --help

   # 查看 ccusage 版本
   npx ccusage --version
   ```

### 日志调试

- 后端日志：查看控制台输出的详细错误信息
- 前端日志：打开浏览器开发者工具查看 Console
- API 调试：使用 Network 面板检查 API 请求状态

## 📋 手动创建 GitHub 仓库指南

由于环境中未安装 GitHub CLI，请按以下步骤手动创建仓库：

### 1. 创建 GitHub 仓库
1. 访问 [GitHub](https://github.com)
2. 点击右上角的 "+" 号，选择 "New repository"
3. 仓库名称填写：`ccusage-console`
4. 选择 Public 或 Private
5. **不要**勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

### 2. 推送代码到 GitHub
创建仓库后，GitHub 会显示快速设置页面，执行以下命令：

```bash
# 设置远程仓库（替换 <your-username> 为你的 GitHub 用户名）
git remote add origin https://github.com/<your-username>/ccusage-console.git

# 设置主分支
git branch -M main

# 推送代码到 GitHub
git push -u origin main
```

### 3. 首次提交（如果项目还没有 Git 仓库）
```bash
# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 首次提交
git commit -m "🎉 Initial commit: CCUsage Console - Claude Code usage monitoring system

- ✨ Real-time usage monitoring dashboard
- 📊 Integration with ccusage for accurate data
- 🎨 Modern dark-themed UI
- 📅 Historical data filtering
- ⚡ Performance optimizations"

# 设置远程仓库并推送
git remote add origin https://github.com/<your-username>/ccusage-console.git
git branch -M main
git push -u origin main
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📝 更新日志

### v1.0.0
- ✨ 初始版本发布
- 📊 集成 ccusage 实时数据
- 🎨 科技感 UI 设计
- 📅 历史数据查询功能
- ⚡ 性能优化
- 🔄 日期筛选功能
- 📈 真实 totalTokens 数据支持

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [ccusage](https://github.com/anthropics/ccusage) - Claude Code 用量统计工具
- React 团队 - 优秀的前端框架
- Express.js 团队 - 简洁的后端框架