---
title: 'ClickHouse Government'
slug: /cloud/infrastructure/clickhouse-government
keywords: ['government', 'fips', 'fedramp', 'gov cloud']
description: 'Overview of ClickHouse Government offering'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';

## Overview {#overview}

ClickHouse Government is a self-deployed package consisting of the same proprietary version of ClickHouse that runs on ClickHouse Cloud and our ClickHouse Operator, configured for separation of compute and storage and hardened to meet the rigorous demands of government agencies and public sector organizations. 

:::note Note
ClickHouse Government is designed for government agencies, public sector organizations, or cloud software companies selling to these agencies and organizations, providing full control and management over their dedicated infrastructure. Minimum deployment size is 2 TB. This option is only available by [contacting us](https://clickhouse.com/government).
:::

## Benefits over open-source {#benefits-over-os}

The following features differentiate ClickHouse Government from self-managed open source deployments:

- Native separation of compute and storage
- Proprietary cloud features such as [shared merge tree](/cloud/reference/shared-merge-tree) and [warehouse](/cloud/reference/warehouses) functionality
- ClickHouse database and operator versions fully tested and validated in ClickHouse Cloud
- [NIST Risk Management Framework (RMF)](https://csrc.nist.gov/projects/risk-management/about-rmf) documentation to accelerate your Authorization to Operate (ATO)
- API for prgrammatic operations, including backups and scaling operations

## Architecture {#architecture}

ClickHouse Government is fully self-contained within your deployment environment, offering our cloud native separation of compute and storage. 

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Government Architecture" background='black'/>

<br />

## Supported configurations {#supported-configurations}

ClickHouse Government is currently supported in the following configurations:

| Environment | Orchestration                    | Storage                     | Status       | 
|:------------|:---------------------------------|:----------------------------|:-------------|
| AWS         | Elastic Kubernetes Service (EKS) | Simple Storage Service (S3) | Available    |
| GCP         | Google Kubernetes Service (GKS)  | Google Cloud Storage (GCS)  | Preview      |

## Onboarding process {#onboarding-process}

Customers may [contact us](https://clickhouse.com/company/contact?loc=nav) to request a call to review ClickHouse Government for their use case. Use cases meeting minimum size requirements and deployed to supported configurations will be reviewed. Onboarding is limited. The installation process involves following an install guide for the specific environment where ClickHouse will be deployed using images and Helm charts downloaded from AWS ECR.

