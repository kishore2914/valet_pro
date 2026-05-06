import React from 'react';

const Table = ({ headers, data, className = '' }) => {
  return (
    <div className="overflow-x-auto w-full" style={{ width: '100%', overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'var(--bg-card)' }}>
        <thead style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={rowIdx} style={{ borderBottom: rowIdx === data.length - 1 ? 'none' : '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="hover:bg-slate-50">
                {Object.values(row).map((cell, cellIdx) => (
                  <td key={cellIdx} style={{ padding: '1rem', fontSize: '0.9rem' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>

      </table>
    </div>
  );
};

export default Table;
