---
sidebar_label: 'Data Catalogs'
slug: /manage/data-catalogs
title: 'Data Catalogs'
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

<Image img={data_catalogs_ui} size="md" alt="ClickHouse Cloud UI with data catalog integrations"/>

| Name | Open Table Format Supported | Auth Method                            | Support | Version |
|------|-----------------------------|----------------------------------------|---------|---------|
| AWS Glue Catalog | Iceberg | IAM/Access keys                        | Cloud & [Core](/use-cases/data-lake/glue-catalog) | 25.10+ |
| Lakekeeper | Iceberg  | OAuth client credentials               | [Core](/use-cases/data-lake/lakekeeper-catalog) | 25.10+ |
| Microsoft OneLake | Iceberg | Azure Active Directory (AAD)           | Cloud & [Core](/use-cases/data-lake/onelake-catalog) | 25.12+ |
| Nessie | Iceberg | OAuth client credentials               | [Core](/use-cases/data-lake/nessie-catalog) | 25.10+ |
| Polaris/Open Catalog | Iceberg | OAuth client credentials               | [Core](/use-cases/data-lake/polaris-catalog) | 26.1+ |
| REST catalog | Iceberg | OAuth client credentials, Bearer token | Cloud & [Core](/use-cases/data-lake/rest-catalog) | 25.10+ |
| Unity Catalog | Iceberg (UniForm-enabled and managed), Delta | OAuth client credentials               | Cloud (Iceberg only) & [Core](/use-cases/data-lake/unity-catalog) | 25.10+ |

We have more catalogs planned, including Horizon and S3 tables REST endpoint.