import React, { useState, useEffect } from 'react';

interface ConfigInfo {
  id: string;
  name: string;
  file: string;
  isActive: boolean;
  preview: {
    model: string;
    baseUrl: string;
  };
}

interface SwitchResult {
  previous: string;
  current: string;
  backupCreated: string;
}

interface ConfigSwitcherProps {
  onConfigChange?: (config: ConfigInfo, switchResult: SwitchResult) => void;
  onRestartNeeded?: (switchResult: SwitchResult) => void;
  onAddConfig?: () => void;
}

const ConfigSwitcher: React.FC<ConfigSwitcherProps> = ({ onConfigChange, onRestartNeeded, onAddConfig }) => {
  const [configs, setConfigs] = useState<ConfigInfo[]>([]);
  const [currentConfig, setCurrentConfig] = useState<ConfigInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // 加载配置列表
  const loadConfigs = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('开始加载配置列表...');

      const response = await fetch('http://localhost:3001/api/config/list');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('配置列表响应:', result);

      if (result.success) {
        console.log('收到的配置数据:', result.data);
        setConfigs(result.data);
        const current = result.data.find((c: ConfigInfo) => c.isActive);
        console.log('当前配置:', current);
        setCurrentConfig(current || null);
      } else {
        setError(result.message || '获取配置列表失败');
      }

    } catch (err) {
      console.error('加载配置失败:', err);
      setError(`加载配置失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 切换配置
  const handleSwitchConfig = async (configId: string) => {
    try {
      setSwitching(true);
      setError('');
      setSuccess('');

      console.log(`切换到配置: ${configId}`);

      const response = await fetch('http://localhost:3001/api/config/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ configId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const switchResult = result.data as SwitchResult;

        console.log('配置切换成功:', switchResult);

        setSuccess(`配置已切换: ${currentConfig?.name || '未知'} → ${configs.find(c => c.id === configId)?.name || '未知'}`);

        // 更新当前配置
        await loadConfigs();

        // 回调通知
        const newConfig = configs.find(c => c.id === configId) || null;
        if (newConfig && onConfigChange) {
          onConfigChange(newConfig, switchResult);
        }

        // 通知需要重启
        if (onRestartNeeded) {
          onRestartNeeded(switchResult);
        }

        // 关闭下拉菜单
        setTimeout(() => setIsOpen(false), 2000);

      } else {
        setError(result.message || '配置切换失败');
      }

    } catch (err) {
      console.error('配置切换失败:', err);
      setError(`配置切换失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setSwitching(false);
    }
  };

  // 初始化时加载配置
  useEffect(() => {
    console.log('ConfigSwitcher 组件已挂载，开始加载配置...');
    loadConfigs();
  }, []);

  // 删除配置
  const handleDeleteConfig = async (configId: string) => {
    try {
      setLoading(true);
      setError('');

      console.log(`删除配置: ${configId}`);

      const response = await fetch(`http://localhost:3001/api/config/${configId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        console.log('配置删除成功:', result);
        setSuccess(`配置已删除: ${configId}`);

        // 重新加载配置列表
        await loadConfigs();

        // 3秒后关闭下拉菜单
        setTimeout(() => setIsOpen(false), 3000);
      } else {
        setError(result.message || '删除配置失败');
      }

    } catch (err) {
      console.error('删除配置失败:', err);
      setError(`删除配置失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 调试输出
  console.log('ConfigSwitcher 渲染状态:', {
    configsLength: configs.length,
    loading,
    currentConfig,
    isOpen
  });

  // 如果没有配置且加载完成，不显示组件
  if (configs.length === 0 && !loading) {
    console.log('ConfigSwitcher: 没有配置，不显示组件');
    return null;
  }

  return (
    <div style={{
      position: 'relative',
    }}>
      {/* 当前配置显示 */}
      <div
        onClick={() => {
          if (!switching) {
            setIsOpen(!isOpen);
          }
        }}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
          border: `1px solid ${currentConfig?.isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(139, 92, 246, 0.3)'}`,
          borderRadius: '16px',
          padding: '14px 20px',
          cursor: switching ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: '220px',
          opacity: switching ? 0.7 : 1,
          backdropFilter: 'blur(12px)',
          boxShadow: currentConfig?.isActive
            ? '0 8px 32px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 4px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
        onMouseOver={(e) => {
          if (!switching) {
            e.currentTarget.style.borderColor = currentConfig?.isActive ? 'rgba(16, 185, 129, 0.6)' : 'rgba(139, 92, 246, 0.5)';
            e.currentTarget.style.boxShadow = currentConfig?.isActive
              ? '0 12px 40px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)'
              : '0 8px 30px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = currentConfig?.isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(139, 92, 246, 0.3)';
          e.currentTarget.style.boxShadow = currentConfig?.isActive
            ? '0 8px 32px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 4px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '2px',
        }}>
          <div style={{
            color: '#94a3b8',
            fontSize: '11px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            AI 提供商
          </div>
          <div style={{
            color: currentConfig?.isActive ? '#10b981' : '#f1f5f9',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            {currentConfig?.name || (loading ? '加载中...' : '未选择')}
          </div>
          {currentConfig?.preview.model && (
            <div style={{
              color: currentConfig?.isActive ? '#10b981' : '#94a3b8',
              fontSize: '11px',
              fontWeight: '500',
            }}>
              {currentConfig.preview.model}
            </div>
          )}
          {!switching ? (
            <div style={{
              fontSize: '12px',
              color: '#94a3b8',
              marginTop: '4px',
            }}>
              ▼
            </div>
          ) : (
            <div style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              border: '2px solid #334155',
              borderTop: '2px solid #8b5cf6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginTop: '4px',
            }} />
          )}
        </div>
      </div>

      {/* 下拉菜单 */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '12px',
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
          zIndex: 1000,
          maxHeight: '320px',
          overflowY: 'auto',
          backdropFilter: 'blur(20px)',
          animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {/* 加载中 */}
          {loading && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#94a3b8',
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #334155',
                borderTop: '2px solid #8b5cf6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px',
              }} />
              加载配置...
            </div>
          )}

          {/* 错误消息 */}
          {error && !loading && (
            <div style={{
              padding: '12px',
              margin: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '6px',
              color: '#fecaca',
              fontSize: '12px',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* 成功消息 */}
          {success && !loading && (
            <div style={{
              padding: '12px',
              margin: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '6px',
              color: '#a7f3d0',
              fontSize: '12px',
            }}>
              ✅ {success}
            </div>
          )}

          {/* 配置列表 */}
          {!loading && configs.map((config, index) => (
            <div
              key={config.id}
              onClick={() => {
                if (!config.isActive && !switching) {
                  handleSwitchConfig(config.id);
                }
              }}
              style={{
                padding: '12px 16px',
                cursor: config.isActive || switching ? 'not-allowed' : 'pointer',
                borderBottom: index < configs.length - 1 ? '1px solid rgba(148, 163, 184, 0.08)' : 'none',
                background: config.isActive
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))'
                  : 'transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: config.isActive || switching ? 0.7 : 1,
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseOver={(e) => {
                if (!config.isActive && !switching) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.06))';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = config.isActive
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))'
                  : 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}>
                <div style={{
                  color: '#94a3b8',
                  fontSize: '10px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '2px',
                }}>
                  AI提供商
                </div>
                <div style={{
                  color: config.isActive ? '#10b981' : '#f1f5f9',
                  fontWeight: config.isActive ? '600' : '500',
                  fontSize: '14px',
                  marginBottom: '2px',
                }}>
                  {config.name}
                </div>
                <div style={{
                  color: config.isActive ? '#10b981' : '#94a3b8',
                  fontSize: '11px',
                  fontWeight: '500',
                }}>
                  {config.preview.model}
                </div>
              </div>

              {!config.isActive && config.id !== 'default' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`确定要删除配置 "${config.name}" 吗？此操作不可恢复。`)) {
                      handleDeleteConfig(config.id);
                    }
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: '#fecaca',
                    opacity: 0.7,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.opacity = '0.7';
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  }}
                >
                  删除
                </button>
              )}
            </div>
          ))}

          {/* 添加新供应商按钮 */}
          {!loading && onAddConfig && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddConfig();
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.08))',
                border: '1px dashed rgba(139, 92, 246, 0.3)',
                borderRadius: '0',
                cursor: 'pointer',
                color: '#a78bfa',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.15))';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.color = '#c4b5fd';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.08))';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.color = '#a78bfa';
              }}
            >
              <span style={{
                fontSize: '16px',
                fontWeight: 'bold',
              }}>+</span>
              添加AI供应商
            </button>
          )}
        </div>
      )}

      {/* 点击外部关闭 */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 添加动画样式 */}
      <style>{`
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        /* 自定义滚动条 */
        div::-webkit-scrollbar {
          width: 6px;
        }

        div::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }

        div::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ConfigSwitcher;
