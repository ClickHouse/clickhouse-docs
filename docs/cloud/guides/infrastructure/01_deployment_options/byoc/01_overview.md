---
title: 'Overview'
slug: /cloud/reference/byoc/overview
sidebar_label: 'Overview'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: 'Deploy ClickHouse on your own cloud infrastructure'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';

## Overview {#overview}

Bring Your Own Cloud (BYOC) empowers you to deploy ClickHouse services and store your data directly within your own cloud accounts, rather than relying on the default ClickHouse Cloud infrastructure. This approach is particularly well-suited for organizations with stringent security policies or regulatory compliance requirements that demand complete control and sovereignty over their data.

At a high level, BYOC separates the ClickHouse control plane, which runs in the ClickHouse VPC and is managed by ClickHouse Cloud, from the data plane, which runs entirely in your cloud account and contains your ClickHouse clusters, data, and backups. For a detailed view of the components involved and how traffic flows between them, see the [Architecture](/cloud/reference/byoc/architecture) page.

> **If you would like access, please [contact us](https://clickhouse.com/cloud/bring-your-own-cloud).** Refer to our [Terms of Service](https://clickhouse.com/legal/agreements/terms-of-service) for additional information.

:::note 
BYOC is designed specifically for large-scale deployments, and requires customers to sign a committed contract.
:::

**Supported Cloud Service Providers:**
* AWS (GA)
* GCP (Private Preview). Please join the waitlist [here](https://clickhouse.com/cloud/bring-your-own-cloud) if you are interested.
* Azure (Roadmap). Please join the waitlist [here](https://clickhouse.com/cloud/bring-your-own-cloud) if you are interested.

**Supported Cloud Regions:**  
All **public regions** listed in our [supported regions](https://clickhouse.com/docs/cloud/reference/supported-regions) documentation are available for BYOC deployments. Private regions are not currently supported.

## Features {#features}

### Supported features {#supported-features}

- **SharedMergeTree**: ClickHouse Cloud and BYOC use the same binary and configuration. Therefore all features from ClickHouse core are supported in BYOC such as SharedMergeTree.
- **Shared Catalog**
- **Console access for managing service state**:
  - Supports operations such as start, stop, and terminate.
  - View services and status.
- **Managed backup and restore**
- **Manual vertical and horizontal scaling.**
- **Auto Idling**
- **Warehouses**: Compute-Compute Separation
- **Zero Trust Network via Tailscale.**
- **Monitoring**:
  - The Cloud console includes built-in health dashboards for monitoring service health.
  - Prometheus scraping for centralized monitoring with Prometheus, Grafana, and Datadog. See the [Prometheus documentation](/integrations/prometheus) for setup instructions.
- **VPC Peering**
- **Integrations**: See the full list on [this page](/integrations).
- **Secure S3**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)**
- **[GCP Private Service Connect](https://docs.cloud.google.com/vpc/docs/private-service-connect)**
- **ClickPipes**: Kafka, S3(Private Priview)

### Planned features (currently unsupported) {#planned-features-currently-unsupported}

- SQL Console
- ClickPipes (CDC)
- Autoscaling
- MySQL interface
- [AWS KMS](https://aws.amazon.com/kms/) aka CMEK (customer-managed encryption keys)