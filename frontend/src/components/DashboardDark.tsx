import React, { useState, useEffect } from 'react';
import RealTimeTable from './RealTimeTable';
import ConfigSwitcher from './ConfigSwitcher';
import RestartGuide from './RestartGuide';
import AddConfigModal from './AddConfigModal';

const DashboardDark: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showRestartGuide, setShowRestartGuide] = useState(false);
  const [showAddConfigModal, setShowAddConfigModal] = useState(false);
  const [switchResult, setSwitchResult] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`开始加载数据 (日期: ${selectedDate || '今天'})`);

        // 构建API URL，包含日期参数
        const apiUrl = selectedDate
          ? `http://localhost:3001/api/usage/dashboard?date=${encodeURIComponent(selectedDate)}`
          : 'http://localhost:3001/api/usage/dashboard';

        console.log('请求URL:', apiUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        if (result.success) {
          console.log('数据加载成功，设置data:', result.data);
          setData(result.data);
        } else {
          console.error('API返回失败:', result.message);
          setError(result.message || '获取数据失败');
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        console.error('错误类型:', err instanceof Error ? err.name : typeof err);
        console.error('错误消息:', err instanceof Error ? err.message : String(err));

        // 不再使用模拟数据作为fallback，直接显示错误
        setError(`获取数据失败: ${err instanceof Error ? err.message : '未知错误'}`);
      } finally {
        console.log('finally: 设置loading为false');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]); // 添加selectedDate作为依赖

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  // 处理配置切换
  const handleConfigChange = (config: any, switchResult: any) => {
    console.log('配置已切换:', config, switchResult);
    setSwitchResult(switchResult);
  };

  // 处理需要重启
  const handleRestartNeeded = (switchResult: any) => {
    console.log('需要重启:', switchResult);
    setSwitchResult(switchResult);
    setTimeout(() => {
      setShowRestartGuide(true);
    }, 500);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color: string;
    trend?: number;
  }> = ({ title, value, subtitle, icon, color, trend }) => (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: color
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '24px',
          marginRight: '12px',
          filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
        }}>
          {icon}
        </div>
        <div style={{
          color: '#94a3b8',
          fontSize: '14px',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {title}
        </div>
      </div>

      <div style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#f1f5f9',
        marginBottom: '8px',
        textShadow: '0 0 20px rgba(255,255,255,0.5)'
      }}>
        {value}
      </div>

      {subtitle && (
        <div style={{
          color: '#64748b',
          fontSize: '12px'
        }}>
          {subtitle}
        </div>
      )}

      {trend !== undefined && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          fontSize: '12px',
          color: trend >= 0 ? '#10b981' : '#ef4444',
          fontWeight: 'bold'
        }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f1f5f9'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '3px solid #334155',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>加载中...</h2>
          <p style={{ color: '#94a3b8' }}>正在从ccusage获取数据</p>
          <p style={{ color: '#64748b', marginTop: '20px', fontSize: '12px' }}>
            如果长时间没有响应，请按 F12 打开开发者工具，查看 Console 标签页的错误信息
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f1f5f9'
      }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          maxWidth: '500px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px',
            filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))'
          }}>
            ⚠️
          </div>
          <h2 style={{ color: '#ef4444', marginBottom: '15px' }}>连接错误</h2>
          <p style={{ color: '#94a3b8', marginBottom: '25px' }}>
            {error.includes('超时') || error.includes('aborted')
              ? 'ccusage数据查询超时，请稍后重试'
              : error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
            }}
          >
            🔄 重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#f1f5f9',
      padding: '30px'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* 标题 */}
        <div style={{
          marginBottom: '40px',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            margin: '0 0 15px 0',
            background: 'linear-gradient(135deg, #3b82f6, #10b981, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
          }}>
            🤖 Claude Code 用量监控
          </h1>
          <div style={{
            color: '#64748b',
            fontSize: '16px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '30px'
          }}>
            Real-time Usage Monitoring System
          </div>

          {/* AI供应商切换 - 居中显示 */}
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
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
              }}
            >
              ➕ 新增供应商
            </button>
          </div>

          <AddConfigModal
            isOpen={showAddConfigModal}
            onClose={() => setShowAddConfigModal(false)}
            onSuccess={() => {
              // 配置创建成功后的回调
              console.log('配置创建成功');
            }}
          />
        </div>

        {/* 用量统计 */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{
            fontSize: '24px',
            marginBottom: '25px',
            color: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: '#3b82f6' }}>📊</span>
              {selectedDate === new Date().toISOString().split('T')[0]
                ? '今日用量统计'
                : `${new Date(selectedDate).toLocaleDateString('zh-CN', {
                    month: 'long',
                    day: 'numeric'
                  })} 用量统计`}
            </div>

            {/* 日期选择器 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                color: '#94a3b8',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                📅
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(100, 116, 139, 0.2)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  fontWeight: '500',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '140px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.background = 'rgba(15, 23, 42, 0.9)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(100, 116, 139, 0.2)';
                  e.target.style.background = 'rgba(15, 23, 42, 0.6)';
                }}
              />
            </div>
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '25px'
          }}>
            <StatCard
              title="输入 Tokens"
              value={formatNumber(data?.today_usage?.total_input_tokens || 0)}
              subtitle="Input Tokens Today"
              icon="📥"
              color="#3b82f6"
            />
            <StatCard
              title="输出 Tokens"
              value={formatNumber(data?.today_usage?.total_output_tokens || 0)}
              subtitle="Output Tokens Today"
              icon="📤"
              color="#10b981"
            />
            <StatCard
              title="Total Tokens"
              value={formatNumber(data?.today_usage?.total_tokens || (data?.today_usage?.total_input_tokens || 0) + (data?.today_usage?.total_output_tokens || 0))}
              subtitle="Total Tokens Today"
              icon="🔢"
              color="#ec4899"
            />
            <StatCard
              title="会话次数"
              value={data?.today_usage?.session_count || 0}
              subtitle="Sessions Today"
              icon="💬"
              color="#8b5cf6"
            />
            <StatCard
              title="总成本"
              value={formatCost(data?.today_usage?.total_cost || 0)}
              subtitle="Total Cost Today"
              icon="💰"
              color="#f59e0b"
            />
          </div>
        </div>

        {/* 本周用量 */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{
            fontSize: '24px',
            marginBottom: '25px',
            color: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <span style={{ color: '#10b981' }}>📈</span>
            本周用量趋势
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '25px'
          }}>
            <StatCard
              title="周输入 Tokens"
              value={formatNumber(data?.weekly_usage?.total_input_tokens || 0)}
              subtitle="Weekly Input"
              icon="📊"
              color="#06b6d4"
            />
            <StatCard
              title="周输出 Tokens"
              value={formatNumber(data?.weekly_usage?.total_output_tokens || 0)}
              subtitle="Weekly Output"
              icon="📋"
              color="#84cc16"
            />
            <StatCard
              title="周趋势"
              value={`${data?.weekly_usage?.weekly_trend?.toFixed(1) || '0'}%`}
              subtitle="Weekly Trend"
              icon="📈"
              color="#f59e0b"
              trend={data?.weekly_usage?.weekly_trend}
            />
          </div>
        </div>

        {/* 实时记录 */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{
            fontSize: '24px',
            marginBottom: '25px',
            color: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <span style={{ color: '#ef4444' }}>⚡</span>
            实时使用记录
          </h2>
          <RealTimeTable
            records={data?.real_time_usage || []}
            formatNumber={formatNumber}
            formatCost={formatCost}
          />
        </div>

        {/* 热门项目 */}
        {data?.top_projects && data.top_projects.length > 0 && (
          <div style={{ marginBottom: '50px' }}>
            <h2 style={{
              fontSize: '24px',
              marginBottom: '25px',
              color: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <span style={{ color: '#8b5cf6' }}>🔥</span>
              热门项目
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {data.top_projects.map((project: any, index: number) => (
                <div key={index} style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '20px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      color: '#8b5cf6',
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}>
                      {project.project_name}
                    </div>
                    <div style={{
                      color: '#f59e0b',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {formatCost(project.total_cost)}
                    </div>
                  </div>
                  <div style={{
                    color: '#94a3b8',
                    fontSize: '14px'
                  }}>
                    Tokens: {formatNumber(project.total_tokens)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 系统状态 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '16px',
          padding: '30px',
          backdropFilter: 'blur(10px)',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '30px',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>数据源</div>
              <div style={{ color: '#10b981', fontSize: '16px', fontWeight: 'bold' }}>ccusage 实时数据</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>API状态</div>
              <div style={{ color: '#10b981', fontSize: '16px', fontWeight: 'bold' }}>✅ 正常</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>最后更新</div>
              <div style={{ color: '#3b82f6', fontSize: '16px', fontWeight: 'bold' }}>
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* 重启引导 */}
        {showRestartGuide && (
          <RestartGuide
            switchResult={switchResult}
            onClose={() => setShowRestartGuide(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardDark;