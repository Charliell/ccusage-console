import React, { useState, useEffect } from 'react';

const DashboardBasic: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 设置10秒超时，给ccusage更多时间
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch('http://localhost:3001/api/usage/dashboard', {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || '获取数据失败');
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        console.error('错误类型:', err instanceof Error ? err.name : typeof err);
        console.error('错误消息:', err instanceof Error ? err.message : String(err));
        console.error('是否为AbortError:', err instanceof Error && err.name === 'AbortError');

        // 不再使用模拟数据作为fallback，直接显示错误
        setError(`获取数据失败: ${err instanceof Error ? err.message : '未知错误'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Claude Code 用量监控</h1>

      {loading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>加载中...</h2>
          <p>正在从ccusage获取数据</p>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2 style={{ color: 'red' }}>错误</h2>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <div>
          <h2>今日用量</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>输入Tokens</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {formatNumber(data.today_usage?.total_input_tokens || 0)}
              </p>
            </div>

            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>输出Tokens</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {formatNumber(data.today_usage?.total_output_tokens || 0)}
              </p>
            </div>

            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>会话次数</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                {data.today_usage?.session_count || 0}
              </p>
            </div>

            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>总成本</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                ${data.today_usage?.total_cost?.toFixed(4) || '0.0000'}
              </p>
            </div>
          </div>

          <h2>本周用量</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>输入Tokens</h3>
              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {formatNumber(data.weekly_usage?.total_input_tokens || 0)}
              </p>
            </div>

            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>输出Tokens</h3>
              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {formatNumber(data.weekly_usage?.total_output_tokens || 0)}
              </p>
            </div>

            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <h3>周趋势</h3>
              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {data.weekly_usage?.weekly_trend?.toFixed(1) || '0'}%
              </p>
            </div>
          </div>

          <h2>实时记录</h2>
          {data.real_time_usage && data.real_time_usage.length > 0 ? (
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>时间</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>项目</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tokens</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>成本</th>
                  </tr>
                </thead>
                <tbody>
                  {data.real_time_usage.slice(0, 5).map((record: any, index: number) => (
                    <tr key={index}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        {new Date(record.created_at).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        {record.project_id || '未知项目'}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        {formatNumber(record.input_tokens + record.output_tokens)}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        ${record.cost?.toFixed(4) || '0.0000'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              暂无实时记录
            </div>
          )}

          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
            <h3>调试信息</h3>
            <p><strong>数据源:</strong> 真实ccusage数据</p>
            <p><strong>API状态:</strong> 正常</p>
            <p><strong>最后更新:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBasic;