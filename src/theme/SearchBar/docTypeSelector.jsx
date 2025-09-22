import React from 'react';

const DOC_TYPES = {
  GUIDE: 'guide',
  REFERENCE: 'reference', 
  CHANGELOG: 'changelog',
  LANDINGPAGE: 'landing-page',
};

export function DocTypeSelector({ selectedDocTypes, onSelectionChange, className }) {
  const handleChange = (event) => {
    const value = event.target.value;
    if (value === 'all') {
      onSelectionChange(null);
    } else {
      onSelectionChange([value]);
    }
  };

  const currentValue = selectedDocTypes?.length === 1 ? selectedDocTypes[0] : 'all';

  return (
    <select 
      value={currentValue}
      onChange={handleChange}
      className={className}
      style={{
        padding: '6px 12px',
        borderRadius: '6px',
        border: '1px solid var(--docsearch-searchbox-shadow)',
        backgroundColor: 'var(--docsearch-modal-background)',
        color: 'var(--docsearch-text-color)',
        fontSize: '14px',
        minWidth: '140px',
        cursor: 'pointer'
      }}
    >
      <option value="all">All docs</option>
      <option value={DOC_TYPES.GUIDE}>Guides</option>
      <option value={DOC_TYPES.REFERENCE}>Reference</option>
      <option value={DOC_TYPES.CHANGELOG}>Changelog</option>
      <option value={DOC_TYPES.LANDINGPAGE}>Landing Pages</option>
    </select>
  );
}

export { DOC_TYPES };
