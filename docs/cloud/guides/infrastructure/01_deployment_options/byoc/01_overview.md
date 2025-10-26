---
title: 'Overview'
slug: /cloud/reference/byoc/overview
sidebar_label: 'Overview'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: 'Deploy ClickHouse on your own cloud infrastructure'
doc_type: 'reference'
---

## Overview {#overview}

BYOC (Bring Your Own Cloud) allows you to deploy ClickHouse Cloud on your own cloud infrastructure. This is useful if you have specific requirements or constraints that prevent you from using the ClickHouse Cloud managed service.

> **If you would like access, please [contact us](https://clickhouse.com/cloud/bring-your-own-cloud).** Refer to our [Terms of Service](https://clickhouse.com/legal/agreements/terms-of-service) for additional information.

BYOC is currently only supported for AWS. You can join the wait list for GCP and Azure [here](https://clickhouse.com/cloud/bring-your-own-cloud).

:::note 
BYOC is designed specifically for large-scale deployments, and requires customers to sign a committed contract.
:::

## Glossary {#glossary}

- **ClickHouse VPC:**  The VPC owned by ClickHouse Cloud.
- **Customer BYOC VPC:** The VPC, owned by the customer's cloud account, is provisioned and managed by ClickHouse Cloud and dedicated to a ClickHouse Cloud BYOC deployment.
- **Customer VPC** Other VPCs owned by the customer cloud account used for applications that need to connect to the Customer BYOC VPC.

## Features {#features}

### Supported features {#supported-features}

- **SharedMergeTree**: ClickHouse Cloud and BYOC use the same binary and configuration. Therefore all features from ClickHouse core are supported in BYOC such as SharedMergeTree.
- **Console access for managing service state**:
  - Supports operations such as start, stop, and terminate.
  - View services and status.
- **Backup and restore.**
- **Manual vertical and horizontal scaling.**
- **Idling.**
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
- ClickPipes for ingest
- Autoscaling
- MySQL interface
