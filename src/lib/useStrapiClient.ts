import { strapi } from '@strapi/client';
import { useMemo } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const STRAPI_DEFAULT_URL = 'https://staging-cms.clickhouse.com';

export function useStrapiClient(): { client: ReturnType<typeof strapi>; baseUrl: string } {
  const { siteConfig } = useDocusaurusContext();
  const baseUrl = (siteConfig.customFields?.strapiUrl as string) || STRAPI_DEFAULT_URL;
  const auth = (siteConfig.customFields?.strapiToken as string) || undefined;
  const client = useMemo(() => strapi({
    baseURL: `${baseUrl}/api`,
    ...(auth && { auth }),
  }), [baseUrl, auth]);

  return { client, strapiBaseUrl: baseUrl };
}
