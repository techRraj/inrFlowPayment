export default function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const items = [];
  for (let i = start; i < start + 5 && i <= pages; i++) items.push(i);
  return (
    <div className="flex-between mt-2" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
      <div className="muted small">Showing {Math.min(total, (page - 1) * pageSize + 1)}–{Math.min(total, page * pageSize)} of {total}</div>
      <div className="flex" style={{ gap: '.3rem' }}>
        <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => onChange(page - 1)}>Prev</button>
        {items.map((p) => (
          <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline'}`} onClick={() => onChange(p)}>{p}</button>
        ))}
        <button className="btn btn-outline btn-sm" disabled={page === pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}