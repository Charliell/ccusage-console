import React, { useState, useEffect } from 'react';
import { DashboardData } from '../types';

// API配置
const API_BASE_URL = 'http://localhost:3001/api';

const DashboardSimple: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 从API获取数据
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/usage/dashboard`);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || '获取数据失败');
        }
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
        setError('网络连接失败，请检查后端服务是否正常');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 设置定时刷新（每30秒）
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(3)}`;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>加载仪表盘数据中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '18px', color: '#ff4d4f' }}>错误: {error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: '16px', padding: '8px 16px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          重新加载
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>无数据</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#262626' }}>
        Claude Code 用量监控仪表盘
      </h1>

      {/* 今日统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>今日成本</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3f8600' }}>
            ${data.today_usage.total_cost.toFixed(3)}
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>今日Tokens</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
            {formatNumber(data.today_usage.total_input_tokens + data.today_usage.total_output_tokens)}
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>会话次数</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
            {data.today_usage.session_count}
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>平均耗时</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#eb2f96' }}>
            {Math.round(data.today_usage.average_duration)}ms
          </div>
        </div>
      </div>

      {/* 周期对比 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#262626' }}>本周用量</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>成本</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ${data.weekly_usage.total_cost.toFixed(3)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>趋势</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: data.weekly_usage.weekly_trend > 0 ? '#52c41a' : '#ff4d4f' }}>
                {data.weekly_usage.weekly_trend > 0 ? '+' : ''}{data.weekly_usage.weekly_trend.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#262626' }}>本月用量</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>成本</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ${data.monthly_usage.total_cost.toFixed(3)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>趋势</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: data.monthly_usage.monthly_trend > 0 ? '#52c41a' : '#ff4d4f' }}>
                {data.monthly_usage.monthly_trend > 0 ? '+' : ''}{data.monthly_usage.monthly_trend.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#262626' }}>日平均用量</h3>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>日均成本</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fa8c16' }}>
              ${data.monthly_usage.daily_average.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* 实时使用记录和热门项目 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#262626', margin: 0 }}>实时使用记录</h3>
            <span style={{ background: '#52c41a', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>实时更新</span>
          </div>

          {data.real_time_usage.length > 0 ? (
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#666' }}>时间</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#666' }}>项目</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#666' }}>类型</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#666' }}>Tokens</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#666' }}>成本</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', color: '#666' }}>耗时</th>
                  </tr>
                </thead>
                <tbody>
                  {data.real_time_usage.map((record) => (
                    <tr key={record.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '8px', fontSize: '12px' }}>
                        {new Date(record.created_at).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '8px', fontSize: '12px' }}>
                        {data.top_projects.find(p => p.project_id === record.project_id)?.project_name || '未知项目'}
                      </td>
                      <td style={{ padding: '8px', fontSize: '12px' }}>
                        <span style={{
                          background: record.usage_type === 'code_generation' ? '#e6f7ff' : '#f6ffed',
                          color: record.usage_type === 'code_generation' ? '#1890ff' : '#52c41a',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px'
                        }}>
                          {record.usage_type === 'code_generation' ? '代码生成' : '代码审查'}
                        </span>
                      </td>
                      <td style={{ padding: '8px', fontSize: '12px' }}>
                        {formatNumber(record.input_tokens + record.output_tokens)}
                      </td>
                      <td style={{ padding: '8px', fontSize: '12px' }}>
                        {formatCost(record.cost)}
                      </td>
                      <td style={{ padding: '8px', fontSize: '12px' }}>
                        {formatDuration(record.duration || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              暂无使用记录
            </div>
          )}
        </div>

        {/* 热门项目 */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#262626' }}>热门项目</h3>

          {data.top_projects.length > 0 ? (
            <div>
              {data.top_projects.map((project, index) => (
                <div key={project.project_id} style={{
                  padding: '12px 0',
                  borderBottom: index < data.top_projects.length - 1 ? '1px solid #f5f5f5' : 'none'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#262626', marginBottom: '4px' }}>
                    {project.project_name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                    <span>成本: {formatCost(project.total_cost)}</span>
                    <span>Tokens: {formatNumber(project.total_tokens)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              暂无项目数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSimple;