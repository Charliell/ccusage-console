import React, { useState, useEffect } from 'react';

const TestPage: React.FC = () => {
  const [message, setMessage] = useState<string>('正在初始化...');
  const [apiData, setApiData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // 测试基本渲染
    setMessage('组件已加载');

    // 测试API连接
    const testAPI = async () => {
      try {
        setMessage('正在测试API连接...');

        // 先测试健康检查
        const healthResponse = await fetch('http://localhost:3001/health');
        const healthData = await healthResponse.json();
        console.log('Health check:', healthData);

        setMessage('健康检查通过，正在获取仪表盘数据...');

        // 测试仪表盘API
        const dashboardResponse = await fetch('http://localhost:3001/api/usage/dashboard');
        const dashboardData = await dashboardResponse.json();
        console.log('Dashboard data:', dashboardData);

        setApiData(dashboardData);
        setMessage('✅ 所有API测试通过！');

      } catch (err) {
        console.error('API测试失败:', err);
        setError(`API连接失败: ${err instanceof Error ? err.message : '未知错误'}`);
        setMessage('❌ API测试失败');
      }
    };

    // 延迟一下再测试API，让页面先渲染
    setTimeout(testAPI, 1000);
  }, []);

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>CC Console 测试页面</h1>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>系统状态</h2>
        <p><strong>状态消息:</strong> {message}</p>
        {error && (
          <p style={{ color: 'red' }}><strong>错误信息:</strong> {error}</p>
        )}
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>测试信息</h2>
        <p><strong>前端地址:</strong> http://localhost:5173</p>
        <p><strong>后端地址:</strong> http://localhost:3001</p>
        <p><strong>浏览器:</strong> {navigator.userAgent}</p>
        <p><strong>当前时间:</strong> {new Date().toLocaleString()}</p>
      </div>

      {apiData && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2>API数据 (简化显示)</h2>
          <p><strong>API状态:</strong> {apiData.success ? '✅ 成功' : '❌ 失败'}</p>
          {apiData.success && apiData.data && (
            <div>
              <p><strong>今日成本:</strong> ${apiData.data.today_usage?.total_cost?.toFixed(3) || 'N/A'}</p>
              <p><strong>今日Tokens:</strong> {(apiData.data.today_usage?.total_input_tokens || 0) + (apiData.data.today_usage?.total_output_tokens || 0)}</p>
              <p><strong>会话次数:</strong> {apiData.data.today_usage?.session_count || 0}</p>
            </div>
          )}
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>调试步骤</h2>
        <ol>
          <li>检查浏览器开发者工具的控制台是否有错误</li>
          <li>检查网络面板的API请求状态</li>
          <li>确认后端服务是否正常运行</li>
          <li>检查CORS配置是否正确</li>
        </ol>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          刷新页面
        </button>
      </div>
    </div>
  );
};

export default TestPage;