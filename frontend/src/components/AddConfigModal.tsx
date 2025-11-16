import React, { useState } from 'react';

interface AddConfigForm {
  id: string;
  name: string;
  modelType: 'single' | 'triple';
  model: string;
  smallModel: string;
  haikuModel: string;
  sonnetModel: string;
  opusModel: string;
  baseUrl: string;
  apiKey: string;
  description?: string;
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
    modelType: 'single',
    model: '',
    smallModel: '',
    haikuModel: '',
    sonnetModel: '',
    opusModel: '',
    baseUrl: '',
    apiKey: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id || !formData.name || !formData.baseUrl || !formData.apiKey) {
      setError('请填写所有必填字段');
      return;
    }

    if (formData.modelType === 'single' && !formData.model) {
      setError('请填写主模型名称');
      return;
    }

    if (formData.modelType === 'triple') {
      if (!formData.haikuModel || !formData.sonnetModel || !formData.opusModel) {
        setError('请填写所有模型名称（Haiku、Sonnet、Opus）');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');

      const configData: any = {
        baseUrl: formData.baseUrl,
        apiKey: formData.apiKey,
        description: formData.description || '',
        modelType: formData.modelType
      };

      if (formData.modelType === 'single') {
        configData.model = formData.model;
        configData.smallModel = formData.smallModel || formData.model;
      } else {
        configData.haikuModel = formData.haikuModel;
        configData.sonnetModel = formData.sonnetModel;
        configData.opusModel = formData.opusModel;
      }

      const response = await fetch('http://localhost:3001/api/config/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: formData.id,
          name: formData.name,
          config: configData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
        setFormData({
          id: '',
          name: '',
          modelType: 'single',
          model: '',
          smallModel: '',
          haikuModel: '',
          sonnetModel: '',
          opusModel: '',
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
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
      }} onClick={(e) => e.stopPropagation()}>
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

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              color: '#94a3b8',
              fontSize: '14px',
              marginBottom: '5px',
              fontWeight: '500',
            }}>
              模型模式
            </label>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', color: '#e2e8f0', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="single"
                  checked={formData.modelType === 'single'}
                  onChange={() => setFormData({...formData, modelType: 'single'})}
                  style={{ marginRight: '5px' }}
                />
                单模型 (如 Kimi)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', color: '#e2e8f0', cursor: 'pointer' }}>
                <input
                  type="radio"
                  value="triple"
                  checked={formData.modelType === 'triple'}
                  onChange={() => setFormData({...formData, modelType: 'triple'})}
                  style={{ marginRight: '5px' }}
                />
                三模型 (如 GLM/MiniMax)
              </label>
            </div>
          </div>

          {formData.modelType === 'single' ? (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  color: '#94a3b8',
                  fontSize: '14px',
                  marginBottom: '5px',
                  fontWeight: '500',
                }}>
                  主模型名称 *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="例如: gpt-4, kimi-for-coding"
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
                  快速模型（可选）
                </label>
                <input
                  type="text"
                  value={formData.smallModel}
                  onChange={(e) => setFormData({...formData, smallModel: e.target.value})}
                  placeholder="默认与主模型相同"
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
            </>
          ) : (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  color: '#94a3b8',
                  fontSize: '14px',
                  marginBottom: '5px',
                  fontWeight: '500',
                }}>
                  Haiku 模型 *
                </label>
                <input
                  type="text"
                  value={formData.haikuModel}
                  onChange={(e) => setFormData({...formData, haikuModel: e.target.value})}
                  placeholder="例如: glm-4.5-air"
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
                  Sonnet 模型 *
                </label>
                <input
                  type="text"
                  value={formData.sonnetModel}
                  onChange={(e) => setFormData({...formData, sonnetModel: e.target.value})}
                  placeholder="例如: glm-4.6"
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
                  Opus 模型 *
                </label>
                <input
                  type="text"
                  value={formData.opusModel}
                  onChange={(e) => setFormData({...formData, opusModel: e.target.value})}
                  placeholder="例如: glm-4.6"
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
            </>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#94a3b8',
              fontSize: '14px',
              marginBottom: '5px',
              fontWeight: '500',
            }}>
              描述（可选）
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="输入配置描述"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(100, 116, 139, 0.2)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '14px',
                outline: 'none',
                minHeight: '60px',
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
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: 'rgba(100, 116, 139, 0.2)',
                color: '#94a3b8',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.7 : 1,
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
