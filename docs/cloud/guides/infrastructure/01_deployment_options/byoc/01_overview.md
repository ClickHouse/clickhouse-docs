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

BYOC (Bring Your Own Cloud) allows you to deploy ClickHouse Cloud on your own cloud infrastructure. This is useful if you have specific requirements or constraints that prevent you from using the ClickHouse Cloud managed service.

> **If you would like access, please [contact us](https://clickhouse.com/cloud/bring-your-own-cloud).** Refer to our [Terms of Service](https://clickhouse.com/legal/agreements/terms-of-service) for additional information.

:::note 
BYOC is designed specifically for large-scale deployments, and requires customers to sign a committed contract.
:::

Supported Cloud Service Providers:
* AWS (GA)
* GCP (Private Preview). Please join the waitlist [here](https://clickhouse.com/cloud/bring-your-own-cloud) if you are interested.
* Azure (Roadmap). Please join the waitlist [here](https://clickhouse.com/cloud/bring-your-own-cloud) if you are interested.

## Glossary {#glossary}

- **ClickHouse VPC:**  The VPC owned by ClickHouse Cloud.
- **Customer BYOC VPC:** The VPC, owned by the customer's cloud account, is provisioned and managed by ClickHouse Cloud and dedicated to a ClickHouse Cloud BYOC deployment.
- **Customer VPC** Other VPCs owned by the customer cloud account used for applications that need to connect to the Customer BYOC VPC.

## Architecture {#architecture}

In the BYOC deployment model, all customer data is hosted in the Customer BYOC VPC on AWS, including data stored on disk, data processed via compute nodes (in memory and local disk cache), and backup data. The only components hosted in the ClickHouse VPC are the web and API interfaces used to manage the organization and services, which handle operations like user management, service start/stop, and scaling.

<br />

<Image img={byoc1} size="lg" alt="BYOC Architecture" background='black'/>

<br />

### Network connectivity {#network-connectivity}

#### Control plane communication

The ClickHouse VPC communicates with your Customer BYOC VPC over HTTPS (port 443) for service management operations including configuration changes, health checks, and deployment commands. This traffic carries only control plane data for orchestration. Critical telemetry and alerts flow from your Customer BYOC VPC to the ClickHouse VPC to enable resource utilization and health monitoring.

#### Client connectivity to ClickHouse

Your applications can connect to ClickHouse services in the Customer BYOC VPC through three methods:

- **Public endpoint:** By default, ClickHouse services are accessible over the public internet using HTTPS (port 8443) or the native protocol with TLS (port 9440). Access is controlled through IP allow lists.
- **VPC Peering:** For private connectivity between your Customer VPC and Customer BYOC VPC, you can establish VPC peering connections. This enables direct communication over all ClickHouse protocols using private IP addresses, providing the lowest latency option.
- **AWS PrivateLink:** Provides secure connectivity without internet exposure, using the same ports as public endpoints (8443 for HTTPS, 9440 for native protocol with TLS) but over private connections.

#### Storage and internal cluster communication

Traffic between your Customer BYOC VPC and S3 uses HTTPS (port 443) via the AWS S3 API for table data, backups, and logs. When using S3 VPC endpoints, this traffic remains within the AWS network.

Internal ClickHouse cluster communication within the Customer BYOC VPC uses the native ClickHouse protocol on port 9000, HTTP/HTTPS on ports 8123/8443, and interserver communication on port 9009 for replication and distributed queries.

### Data storage and observability {#data-storage}

Metrics and logs are stored within the customer's BYOC VPC. Logs are currently stored locally in EBS. In a future update, logs will be stored in LogHouse, which is a ClickHouse service in the customer's BYOC VPC. Metrics are implemented via a Prometheus and Thanos stack stored locally in the customer's BYOC VPC.

## Features {#features}

### Supported features {#supported-features}

- **SharedMergeTree**: ClickHouse Cloud and BYOC use the same binary and configuration. Therefore all features from ClickHouse core are supported in BYOC such as SharedMergeTree.
- **Console access for managing service state**:
  - Supports operations such as start, stop, and terminate.
  - View services and status.
- **Backup and restore.**
- **Manual vertical and horizontal scaling.**
- **Auto Idling.**
- **Warehouses**: Compute-Compute Separation
- **Zero Trust Network via Tailscale.**
- **Monitoring**:
  - The Cloud console includes built-in health dashboards for monitoring service health.
  - Prometheus scraping for centralized monitoring with Prometheus, Grafana, and Datadog. See the [Prometheus documentation](/integrations/prometheus) for setup instructions.
- **VPC Peering.**
- **Integrations**: See the full list on [this page](/integrations).
- **Secure S3.**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/).**

### Planned features (currently unsupported) {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/) aka CMEK (customer-managed encryption keys)
- ClickPipes
- Autoscaling
- MySQL interface
