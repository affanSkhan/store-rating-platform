export default function SortableHeader({ label, field, sortBy, sortOrder, onSort }) {
  const active = sortBy === field;
  return (
    <button type="button" className="sort-button" onClick={() => onSort(field)}>
      {label}
      <span className={active ? 'sort-indicator active' : 'sort-indicator'}>{active ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
    </button>
  );
}
