---
title: 'ClickHouse Private'
slug: /cloud/infrastructure/clickhouse-private
keywords: ['private', 'on-prem']
description: 'Overview of ClickHouse Private offering'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';

## Overview {#overview}

ClickHouse Private is a self-deployed package consisting of the same proprietary version of ClickHouse that runs on ClickHouse Cloud and our ClickHouse Operator, configured for separation of compute and storage. 

:::note Note
ClickHouse Private is designed for large enterprises deploying > 2 TB memory requiring full control over their dedicated infrastructure. Customers are responsible for managing all infrastructure and should be knowledgeable on operating ClickHouse at scale. This option is only available by [contacting us](https://clickhouse.com/company/contact?loc=nav).
:::

## Benefits over open-source {#benefits-over-os}

The following features differentiate ClickHouse Private from self-managed open source deployments:

- Native separation of compute and storage
- Proprietary cloud features such as [shared merge tree](/cloud/reference/shared-merge-tree) and [warehouse](/cloud/reference/warehouses) functionality
- ClickHouse database and operator versions fully tested and validated in ClickHouse Cloud
- API for prgrammatic operations, including backups and scaling operations

## Architecture {#architecture}

ClickHouse Private is fully self-contained within your deployment environment, offering our cloud native separation of compute and storage. 

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Private Architecture" background='black'/>

<br />

## Supported configurations {#supported-configurations}

ClickHouse Private is currently supported in the following configurations:

| Environment | Orchestration                    | Storage                     | Status       | 
|:------------|:---------------------------------|:----------------------------|:-------------|
| AWS         | Elastic Kubernetes Service (EKS) | Simple Storage Service (S3) | Available    |
| GCP         | Google Kubernetes Service (GKS)  | Google Cloud Storage (GCS)  | Preview      |
| Bare metal  | Kubernetes                       | AIStor (NVMe required)      | Preview      | 

## Onboarding process {#onboarding-process}

Customers may [contact us](https://clickhouse.com/company/contact?loc=nav) to request a call to review ClickHouse Private for their use case. Use cases meeting minimum size requirements and deployed to supported configurations will be reviewed. Onboarding is limited. The installation process involves following an install guide for the specific environment where ClickHouse will be deployed using images and Helm charts downloaded from AWS ECR.