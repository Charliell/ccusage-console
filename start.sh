#!/bin/bash

echo "🚀 启动 CC Console - Claude Code 用量监控系统"
echo "================================================"

# 检查Node.js版本
echo "📋 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js 16+"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js 版本: $NODE_VERSION"

# 启动后端服务
echo ""
echo "🔧 启动后端服务..."
cd backend

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装后端依赖..."
    npm install
fi

# 检查数据库是否存在
if [ ! -f "data/database.sqlite" ]; then
    echo "🗄️ 初始化数据库..."
    npm run build
    npx ts-node src/scripts/seedData.ts
fi

# 启动后端（后台运行）
echo "🚀 启动后端服务在端口 3001..."
npm run dev &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 检查后端是否正常启动
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ 后端服务启动成功"
else
    echo "❌ 后端服务启动失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 启动前端服务
echo ""
echo "🎨 启动前端服务..."
cd ../frontend

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

# 启动前端（后台运行）
echo "🚀 启动前端服务在端口 5173..."
npm run dev &
FRONTEND_PID=$!

# 等待前端启动
sleep 5

echo ""
echo "🎉 CC Console 启动完成！"
echo "================================================"
echo "📱 前端界面: http://localhost:5173"
echo "🔧 API服务: http://localhost:3001"
echo "💚 健康检查: http://localhost:3001/health"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待用户中断
wait

# 清理进程
echo ""
echo "🛑 正在停止服务..."
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
echo "✅ 服务已停止"