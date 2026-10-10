import React, { useState, useRef, useEffect } from 'react';

const EMIRATES = [
  'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman',
  'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'
];

export default function EmirateSelect({ value, onChange, error }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = EMIRATES.filter((e) =>
    e.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="form-group" ref={ref}>
      <label>Emirate <span className="req">*</span></label>
      <div className="dropdown-wrap">
        <input
          className="dropdown-input"
          placeholder="Search emirate..."
          value={open ? search : value || ''}
          onFocus={() => { setOpen(true); setSearch(''); }}
          onChange={(e) => setSearch(e.target.value)}
          readOnly={!open}
        />
        {open && (
          <ul className="dropdown-list">
            {filtered.length === 0 && <li>No match</li>}
            {filtered.map((em) => (
              <li
                key={em}
                className={em === value ? 'selected' : ''}
                onClick={() => {
                  onChange(em);
                  setOpen(false);
                  setSearch('');
                }}
              >
                {em}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <span className="error">{error}</span>}
    </div>
  );
}