import React, { useState } from 'react';
import glossary from './glossary.json';
import Link from '@docusaurus/Link';

const GlossaryTooltip = ({ term, capitalize = false, plural = '' }) => {
  const [visible, setVisible] = useState(false);
  
  // Case-insensitive lookup
  let definition = glossary[term]; // Try exact match first
  let matchedKey = term;
  
  if (!definition) {
    // Try to find a case-insensitive match
    const foundKey = Object.keys(glossary).find(key => 
      key.toLowerCase() === term.toLowerCase()
    );
    if (foundKey) {
      definition = glossary[foundKey];
      matchedKey = foundKey;
    }
  }

  if (!definition) {
    console.warn(`Glossary term not found: ${term}`);
    const displayFallback = capitalize
      ? capitalizeWord(term) + plural
      : term.toLowerCase() + plural;
    return <span>{displayFallback}</span>;
  }

  const displayTerm = capitalize ? capitalizeWord(term) : term.toLowerCase();
  const anchorId = matchedKey.toLowerCase().replace(/\s+/g, '-');
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

function capitalizeWord(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export default GlossaryTooltip;