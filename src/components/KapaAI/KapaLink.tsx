import React from 'react';

declare global {
  interface Window {
    Kapa?: (action: string, params?: any) => void;
  }
}

export default function KapaLink({ children, query }) {
  const handleClick = (e) => {
    e.preventDefault();
    if (window.Kapa) {
      window.Kapa('open', query ? { query, submit: true } : {});
    }
  };

  return (
    <a href="#" onClick={handleClick}>
      {children}
    </a>
  );
}
