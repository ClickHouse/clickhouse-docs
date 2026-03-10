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
      <input
        id="adopters-filter"
        className={styles.input}
        type="search"
        placeholder="Search by company, industry, or use case"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div ref={tableContainerRef} className={clsx('adopters-table', styles.tableWrapper)}>
        {children}
      </div>
    </div>
  );
}
