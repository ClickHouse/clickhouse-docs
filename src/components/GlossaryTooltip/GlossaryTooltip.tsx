import React, { useState } from 'react';
import glossary from './glossary.json';
import Link from '@docusaurus/Link';

const GlossaryTooltip = ({ term, plural = '' }) => {
  const [visible, setVisible] = useState(false);
  
  // Always do case-insensitive lookup
  const foundKey = Object.keys(glossary).find(key => 
    key.toLowerCase() === term.toLowerCase()
  );
  
  if (!foundKey) {
    console.warn(`Glossary term not found: ${term}`);
    return <span>{term}{plural}</span>;
  }

  const definition = glossary[foundKey];
  const displayTerm = term; // Preserve original casing
  const anchorId = foundKey.toLowerCase().replace(/\s+/g, '-');
  const glossarySlug = `/concepts/glossary#${anchorId}`;

  return (
    <span
      className="tooltip"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <Link
        to={glossarySlug}
        className="tooltip-link"
        tabIndex={0}
        onClick={() => setVisible(false)}
      >
        {displayTerm}
        {plural}
      </Link>
      <span className={`tooltipText ${visible ? 'visible' : ''}`}>
        {definition}
      </span>
    </span>
  );
};

export default GlossaryTooltip;