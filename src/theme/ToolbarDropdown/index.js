import React, { useState } from 'react';
import styles from './styles.module.css';

const DropdownMenu = () => {
  const [hovered, setHovered] = useState(null);

  const dropdownCategory = {
    title: 'Deployments',
    description: 'Choose a deployment option',
    menuItems: [
      {
        title: 'Single Node Deployment',
        description: 'Deploy ClickHouse on a single server',
      },
      {
        title: 'Cluster Deployment',
        description: 'Deploy ClickHouse using a distributed, fault-tolerant architecture',
      },
      {
        title: 'Cloud',
        description: 'Deploy fully-managed ClickHouse on AWS, GCP, or Azure',
      },
      {
        title: 'Separation of Storage and Compute',
        description: 'Deploy ClickHouse backed by object storage',
      },
      {
        title: 'Cloud',
        description: 'Deploy fully-managed ClickHouse on AWS, GCP, or Azure',
      },
      {
        title: 'Separation of Storage and Compute',
        description: 'Deploy ClickHouse backed by object storage',
      },
    ]
  }

  return (
    <div className={styles.dropdownMenu}>
      <div className={styles.menuHeader}>{dropdownCategory.title}</div>
      <div className={styles.menuDescription}>{dropdownCategory.description}</div>
      <div className={styles.menuItems}>
        {dropdownCategory.menuItems.map((item, index) => (
          <div
            key={index}
            className={`${styles.menuItem} ${hovered === index ? styles.hovered : ''}`}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className={styles.itemTitle}>{item.title}</div>
            <div className={styles.itemDescription}>{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;
