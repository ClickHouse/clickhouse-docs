import React, { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

interface AdoptersFilterProps {
  children: React.ReactNode;
}

export default function AdoptersFilter({ children }: AdoptersFilterProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  useEffect(() => {
    const rows = tableContainerRef.current?.querySelectorAll('tbody tr');

    if (!rows) {
      return;
    }

    rows.forEach((row) => {
      const matches = row.textContent?.toLowerCase().includes(normalizedQuery) ?? false;
      row.toggleAttribute('hidden', !matches);
    });
  }, [normalizedQuery]);

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor="adopters-filter">
        Filter adopters
      </label>
      <div className={styles.inputWrapper}>
        <svg className={styles.icon} viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M17.54 16.46 14.8 13.7a7 7 0 1 0-1.1 1.1l2.76 2.74a.77.77 0 0 0 1.08-1.09ZM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"
            fill="currentColor"
          />
        </svg>
        <input
          id="adopters-filter"
          className={styles.input}
          type="search"
          placeholder="Search by company, industry, or use case"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div ref={tableContainerRef} className={clsx('adopters-table', styles.tableWrapper)}>
        {children}
      </div>
    </div>
  );
}
