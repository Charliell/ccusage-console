import React, { memo, useMemo } from 'react';

interface Record {
  created_at: string;
  project_id?: string;
  input_tokens: number;
  output_tokens: number;
  cost: number;
}

interface RealTimeTableProps {
  records: Record[];
  formatNumber: (num: number) => string;
  formatCost: (cost: number) => string;
}

const RealTimeTable = memo<RealTimeTableProps>(({ records, formatNumber, formatCost }) => {
  const displayRecords = useMemo(() => {
    return records.slice(0, 5); // 只处理前5条记录
  }, [records]);

  if (!displayRecords || displayRecords.length === 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1e293b, #334155)',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: '#64748b'
      }}>
        暂无实时使用记录
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b, #334155)',
      border: '1px solid #334155',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#334155' }}>
            <th style={{
              padding: '15px',
              textAlign: 'left',
              color: '#60a5fa',
              borderBottom: '1px solid #475569',
              fontSize: '0.875rem'
            }}>
              项目
            </th>
            <th style={{
              padding: '15px',
              textAlign: 'left',
              color: '#60a5fa',
              borderBottom: '1px solid #475569',
              fontSize: '0.875rem'
            }}>
              Tokens
            </th>
            <th style={{
              padding: '15px',
              textAlign: 'left',
              color: '#60a5fa',
              borderBottom: '1px solid #475569',
              fontSize: '0.875rem'
            }}>
              成本
            </th>
          </tr>
        </thead>
        <tbody>
          {displayRecords.map((record, index) => (
            <TableRow
              key={`${record.created_at}-${index}`}
              record={record}
              formatNumber={formatNumber}
              formatCost={formatCost}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

interface TableRowProps {
  record: Record;
  formatNumber: (num: number) => string;
  formatCost: (cost: number) => string;
}

const TableRow = memo<TableRowProps>(({ record, formatNumber, formatCost }) => {
  const totalTokens = useMemo(() =>
    record.input_tokens + record.output_tokens,
    [record.input_tokens, record.output_tokens]
  );

  return (
    <tr style={{
      borderBottom: '1px solid #334155',
      transition: 'background-color 0.2s ease'
    }}>
      <td style={{
        padding: '15px',
        color: '#94a3b8'
      }}>
        {record.project_id || '未知项目'}
      </td>
      <td style={{
        padding: '15px',
        color: '#60a5fa',
        fontWeight: 'bold'
      }}>
        {formatNumber(totalTokens)}
      </td>
      <td style={{
        padding: '15px',
        color: '#f59e0b',
        fontWeight: 'bold'
      }}>
        {formatCost(record.cost || 0)}
      </td>
    </tr>
  );
});

TableRow.displayName = 'TableRow';

RealTimeTable.displayName = 'RealTimeTable';

export default RealTimeTable;