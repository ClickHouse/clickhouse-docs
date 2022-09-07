import React from 'react';
import Link from '@docusaurus/Link';
import {findFirstCategoryLink, useDocById} from '@docusaurus/theme-common';
import clsx from 'clsx';
import styles from './styles.module.css';
import isInternalUrl from '@docusaurus/isInternalUrl';
import {translate} from '@docusaurus/Translate';

function CardContainer({href, children}) {
  const className = clsx(
    'card margin-bottom--lg padding--lg',
    styles.cardContainer,
    href && styles.cardContainerLink,
  );
  return href ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  );
}

function CardLayout({href, icon, title, description}) {
  return (
    <CardContainer href={href}>
      <li className='cardLI'>
        <span className='cardTitle' >{title} </span> 
      </li>
    </CardContainer>
  );
}

function CardCategory({item}) {
  const href = findFirstCategoryLink(item);
  return (
    <CardLayout
      href={href}
      icon="🗃️"
      title={item.label}
      description={translate(
        {
          message: '{count} items',
          id: 'theme.docs.DocCard.categoryDescription',
          description:
            'The default description for a category card in the generated index about how many items this category includes',
        },
        {
          count: item.items.length,
          title: item.label,
        },
      )}
    />
  );
}

function CardLink({item}) {
  const icon = isInternalUrl(item.href) ? '📄️' : '🔗';
  const doc = useDocById(item.docId ?? undefined);
  return (
    <CardLayout
      href={item.href}
      icon={icon}
      title={item.label}
      description={doc?.description}
    />
  );
}

export default function DocCard({item}) {
  switch (item.type) {
    case 'link':
      return <CardLink item={item} />;

    case 'category':
      return <CardCategory item={item} />;

    default:
      throw new Error(`unknown item type ${JSON.stringify(item)}`);
  }
}
