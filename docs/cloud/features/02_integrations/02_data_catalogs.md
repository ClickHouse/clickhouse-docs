---
sidebar_label: 'Data catalogs'
slug: /manage/data-catalogs
title: 'Data catalogs'
description: 'Data catalog integrations for ClickHouse Cloud'
doc_type: 'landing-page'
keywords: ['data catalogs', 'cloud features', 'data lake', 'iceberg', 'integrations']
---

import data_catalogs_ui from '@site/static/images/cloud/features/data-catalogs-ui.png';
import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

ClickHouse Cloud can connect directly to your open table format data catalogs, giving you access to your data lake tables without duplicating data.
Through the integration, your catalog's tables will appear as queryable databases inside ClickHouse.
Setup is available both via SQL command ([DataLakeCatalog](/engines/database-engines/datalakecatalog)) and via the ClickHouse Cloud UI on the Data Sources tab.

Using the UI:

- Simplifies setup with a form using fields consistent with your Data Catalog objects
- Provides a single interface for active data catalog integrations
- Tests connections and credentials when saving

For a step-by-step Cloud UI walkthrough, see [Connect a data catalog in ClickHouse Cloud](/integrations/data-catalogs).

| Name              | Open table format | Auth method                            | Cloud                                                      | Core                                             | Version |
| ----------------- | ----------------- | -------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ | ------- |
| AWS Glue Catalog  | Iceberg           | IAM role (26.2+), Access keys          | [Guide](/integrations/data-catalogs?catalog=aws-glue)      | [Guide](/use-cases/data-lake/glue-catalog)       | 25.10+  |
| BigLake Metastore | Iceberg           | Google ADC (OAuth)                     | [Guide](/integrations/data-catalogs?catalog=biglake)       | [Guide](/use-cases/data-lake/biglake-catalog)    | 26.2+   |
| Lakekeeper        | Iceberg           | OAuth client credentials               | —                                                          | [Guide](/use-cases/data-lake/lakekeeper-catalog) | 25.10+  |
| Microsoft OneLake | Iceberg           | Azure Active Directory (AAD)           | [Guide](/integrations/data-catalogs?catalog=onelake)       | [Guide](/use-cases/data-lake/onelake-catalog)    | 25.12+  |
| Nessie            | Iceberg           | OAuth client credentials               | —                                                          | [Guide](/use-cases/data-lake/nessie-catalog)     | 25.10+  |
| Polaris           | Iceberg           | OAuth client credentials               | [Guide](/integrations/data-catalogs?catalog=polaris)       | [Guide](/use-cases/data-lake/polaris-catalog)    | 26.1+   |
| REST catalog      | Iceberg           | OAuth client credentials, Bearer token | [Guide](/integrations/data-catalogs?catalog=rest)          | [Guide](/use-cases/data-lake/rest-catalog)       | 25.10+  |
| Unity Catalog     | Iceberg           | OAuth client credentials               | [Guide](/integrations/data-catalogs?catalog=unity-iceberg) | [Guide](/use-cases/data-lake/unity-catalog)      | 25.10+  |
| Unity Catalog     | Delta             | Personal Access Token (PAT)            | [Guide](/integrations/data-catalogs?catalog=unity-delta)   | [Guide](/use-cases/data-lake/unity-catalog)      | 25.10+  |

We have more catalogs planned, including Horizon and S3 tables REST endpoint.