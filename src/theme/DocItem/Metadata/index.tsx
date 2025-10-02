/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {type ReactNode} from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';

export default function DocItemMetadata(): ReactNode {
  const {metadata, frontMatter, assets} = useDoc();

  // Extract integration metadata from nested structure
  const integration = frontMatter.integration || [];
  const integrationData: Record<string, string> = {};

  // Convert array format to object
  integration.forEach((item: Record<string, string>) => {
    Object.assign(integrationData, item);
  });

  return (
    <PageMetadata
      title={metadata.title}
      description={metadata.description}
      keywords={frontMatter.keywords}
      image={assets.image ?? frontMatter.image}
    >
      {/* Add custom meta tags from frontmatter.integration */}
      {integrationData.support_level && (
        <meta name="integration_support_level" content={integrationData.support_level} />
      )}
      {integrationData.category && (
        <meta name="integration_category" content={integrationData.category} />
      )}
      {integrationData.website && (
        <meta name="integration_website" content={integrationData.website} />
      )}
    </PageMetadata>
  );
}