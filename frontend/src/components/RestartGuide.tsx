import React, { useState } from 'react';

export interface SwitchResult {
  previous: string;
  current: string;
  backupCreated: string;
}

interface RestartGuideProps {
  switchResult?: SwitchResult;
  onClose?: () => void;
}

const RestartGuide: React.FC<RestartGuideProps> = ({ switchResult, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [showTerminalInfo, setShowTerminalInfo] = useState(false);

  const copyToClipboard = async (text: string, step: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStep(step);
      setTimeout(() => setCopiedStep(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  if (!switchResult) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(5px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* 头部 */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(100, 116, 139, 0.2)',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
          borderRadius: '16px 16px 0 0',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
            }}>
              🔄
            </div>
            <div>
              <h2 style={{
                color: '#f1f5f9',
                fontSize: '24px',
                fontWeight: '700',
                margin: 0,
              }}>
                配置已切换
              </h2>
              <p style={{
                color: '#94a3b8',
                fontSize: '14px',
                margin: '4px 0 0 0',
              }}>
                需要重启 Claude Code 才能生效
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#f1f5f9';
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ✕
          </button>
        </div>

        {/* 内容区 */}
        <div style={{
          padding: '24px',
        }}>
          {/* 切换信息卡片 */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
          }}>
            <h3 style={{
              color: '#f1f5f9',
              fontSize: '16px',
              margin: '0 0 12px 0',
            }}>
              切换信息
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{
                textAlign: 'center',
              }}>
                <div style={{
                  color: '#94a3b8',
                  fontSize: '12px',
                  marginBottom: '4px',
                }}>
                  切换前
                </div>
                <div style={{
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}>
                  {switchResult.previous}
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6',
                fontSize: '20px',
              }}>
                →
              </div>

              <div style={{
                textAlign: 'center',
              }}>
                <div style={{
                  color: '#10b981',
                  fontSize: '12px',
                  marginBottom: '4px',
                }}>
                  切换后
                </div>
                <div style={{
                  color: '#f1f5f9',
                  fontSize: '14px',
                  fontWeight: '700',
                  textTransform: 'capitalize',
                }}>
                  {switchResult.current}
                </div>
              </div>
            </div>
          </div>

          {/* 重要提示 */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05))',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}>
              <div style={{
                fontSize: '20px',
                marginTop: '2px',
              }}>
                ⚠️
              </div>
              <div>
                <div style={{
                  color: '#fbbf24',
                  fontWeight: '600',
                  marginBottom: '4px',
                }}>
                  重启是必需的
                </div>
                <div style={{
                  color: '#94a3b8',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}>
                  Claude Code 在启动时读取配置文件，切换配置后必须重启才能应用新设置。
                </div>
              </div>
            </div>
          </div>

          {/* 重启步骤 */}
          <div style={{
            marginBottom: '24px',
          }}>
            <h3 style={{
              color: '#f1f5f9',
              fontSize: '16px',
              margin: '0 0 16px 0',
            }}>
              📝 重启步骤
            </h3>

            {/* 步骤 1 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))',
              border: '1px solid rgba(100, 116, 139, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  flexShrink: 0,
                }}>
                  1
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: '#f1f5f9',
                    fontWeight: '600',
                    marginBottom: '8px',
                  }}>
                    退出当前 Claude Code
                  </div>
                  <div style={{
                    color: '#94a3b8',
                    fontSize: '14px',
                    marginBottom: '12px',
                  }}>
                    在运行 Claude Code 的终端中，按
                    <span style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      margin: '0 4px',
                    }}>
                      Ctrl + C
                    </span>
                    完全退出程序。
                  </div>
                  <div style={{
                    color: '#64748b',
                    fontSize: '12px',
                  }}>
                    💡 <strong>提示：</strong>简单说“quit”或“exit”并回车也可以退出
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard('exit', 1)}
                  style={{
                    background: copiedStep === 1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                    border: copiedStep === 1 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(100, 116, 139, 0.3)',
                    color: copiedStep === 1 ? '#10b981' : '#94a3b8',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {copiedStep === 1 ? '✅ 已复制' : '📋 复制'}
                </button>
              </div>
            </div>

            {/* 步骤 2 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))',
              border: '1px solid rgba(100, 116, 139, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  flexShrink: 0,
                }}>
                  2
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: '#f1f5f9',
                    fontWeight: '600',
                    marginBottom: '8px',
                  }}>
                    等待程序完全退出
                  </div>
                  <div style={{
                    color: '#94a3b8',
                    fontSize: '14px',
                    marginBottom: '12px',
                  }}>
                    等待 2-3 秒，确保 Claude Code 进程完全关闭。
                  </div>
                  <div style={{
                    color: '#64748b',
                    fontSize: '12px',
                  }}>
                    💡 <strong>提示：</strong>可以运行
                    <span style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      margin: '0 4px',
                    }}>
                      ps aux | grep claude
                    </span>
                    检查进程是否已退出
                  </div>
                </div>
              </div>
            </div>

            {/* 步骤 3 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))',
              border: '1px solid rgba(100, 116, 139, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  background: 'linear-gradient(135deg, #10b981, #84cc16)',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  flexShrink: 0,
                }}>
                  3
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: '#f1f5f9',
                    fontWeight: '600',
                    marginBottom: '8px',
                  }}>
                    重新启动 Claude Code
                  </div>
                  <div style={{
                    color: '#94a3b8',
                    fontSize: '14px',
                    marginBottom: '12px',
                  }}>
                    运行以下命令重新启动：
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                  }}>
                    <div style={{
                      background: '#0f172a',
                      border: '1px solid rgba(100, 116, 139, 0.3)',
                      borderRadius: '6px',
                      padding: '12px 16px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      color: '#10b981',
                      flex: 1,
                    }}>
                      claude
                    </div>
                    <button
                      onClick={() => copyToClipboard('claude', 3)}
                      style={{
                        background: copiedStep === 3 ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        border: 'none',
                        color: 'white',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: '600',
                      }}
                    >
                      {copiedStep === 3 ? '✅ 已复制' : '📋 复制'}
                    </button>
                  </div>
                  <div style={{
                    color: '#64748b',
                    fontSize: '12px',
                  }}>
                    💡 <strong>提示：</strong>如果不在 PATH 中，使用完整路径，例如
                    <span style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      margin: '0 4px',
                    }}>
                      ~/.npm-global/bin/claude
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 步骤 4 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))',
              border: '1px solid rgba(100, 116, 139, 0.2)',
              borderRadius: '8px',
              padding: '16px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  flexShrink: 0,
                }}>
                  4
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: '#f1f5f9',
                    fontWeight: '600',
                    marginBottom: '8px',
                  }}>
                    验证配置
                  </div>
                  <div style={{
                    color: '#94a3b8',
                    fontSize: '14px',
                    marginBottom: '12px',
                  }}>
                    重启后，在对话中输入
                    <span style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      margin: '0 4px',
                    }}>
                      /help
                    </span>
                    确认当前使用的模型是否已更新。
                  </div>
                  <div style={{
                    color: '#64748b',
                    fontSize: '12px',
                  }}>
                    💡 <strong>提示：</strong>也可以在顶部状态栏查看当前配置
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 常见问题 */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.3))',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <h4 style={{
              color: '#f1f5f9',
              fontSize: '14px',
              margin: '0 0 12px 0',
            }}>
              ❓ 常见问题
            </h4>

            <div style={{
              marginBottom: '12px',
            }}>
              <div style={{
                color: '#3b82f6',
                fontSize: '13px',
                fontWeight: '500',
                marginBottom: '4px',
              }}>
                Q: 为什么需要重启？
              </div>
              <div style={{
                color: '#94a3b8',
                fontSize: '12px',
                marginBottom: '12px',
              }}>
                A: Claude Code 在启动时会加载配置文件到内存中，切换文件后需要重新加载。
              </div>
            </div>

            <div style={{
              marginBottom: '12px',
            }}>
              <div style={{
                color: '#3b82f6',
                fontSize: '13px',
                fontWeight: '500',
                marginBottom: '4px',
              }}>
                Q: 能不能不重启？
              </div>
              <div style={{
                color: '#94a3b8',
                fontSize: '12px',
                marginBottom: '12px',
              }}>
                A: 目前不能。桌面应用在启动后不会实时监控配置文件变化，这是出于性能考虑。
              </div>
            </div>

            <div>
              <div style={{
                color: '#3b82f6',
                fontSize: '13px',
                fontWeight: '500',
                marginBottom: '4px',
              }}>
                Q: 配置出错怎么办？
              </div>
              <div style={{
                color: '#94a3b8',
                fontSize: '12px',
              }}>
                A: 备份文件已创建：
                <span style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  margin: '0 4px',
                }}>
                  {switchResult.backupCreated}
                </span>
                ，如有问题可手动恢复。
              </div>
            </div>
          </div>

          {/* 备份信息 */}
          {switchResult.backupCreated !== 'none' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                fontSize: '20px',
              }}>
                💾
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: '#10b981',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '4px',
                }}>
                  自动备份已创建
                </div>
                <div style={{
                  color: '#94a3b8',
                  fontSize: '12px',
                  wordBreak: 'break-all',
                }}>
                  ~/.claude/{switchResult.backupCreated}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid rgba(100, 116, 139, 0.2)',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={() => {
              const content = `Claude Code 配置切换\n\n切换前: ${switchResult.previous}\n切换后: ${switchResult.current}\n备份文件: ${switchResult.backupCreated}\n\n重启步骤:\n1. 在终端按 Ctrl+C 退出\n2. 等待 2-3 秒\n3. 运行: claude\n4. 输入 /help 验证`;
              copyToClipboard(content, 999);
            }}
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              color: '#94a3b8',
              padding: '10px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.5)';
              e.currentTarget.style.color = '#f1f5f9';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            {copiedStep === 999 ? '✅ 已复制全部' : '📋 复制全部'}
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestartGuide;
