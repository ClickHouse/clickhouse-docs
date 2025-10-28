import React from 'react';
import { galaxyOnClick } from '../../lib/galaxy/galaxy';

interface TrackedLinkProps {
  href: string;
  eventName: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
  className?: string;
}

export const TrackedLink: React.FC<TrackedLinkProps> = ({ 
  href, 
  eventName,
  children,
  ...rest 
}) => {
  return (
    <a 
      href={href}
      onClick={galaxyOnClick(eventName)}
      {...rest}
    >
      {children}
    </a>
  );
};