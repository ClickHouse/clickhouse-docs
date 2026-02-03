---
slug: /use-cases/observability/clickstack/getting-started/managed
title: 'Getting Started with Managed ClickStack'
sidebar_label: 'Managed'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'Getting started with Managed ClickStack'
doc_type: 'guide'
keywords: ['Managed ClickStack', 'getting started', 'ClickHouse Cloud']
---

import Image from '@theme/IdealImage';
import signup_page from '@site/static/images/clickstack/getting-started/signup_page.png';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import otel_collector_start from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import advanced_otel_collector from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import BetaBadge from '@theme/badges/BetaBadge';
import SetupManagedIngestion from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_setup_managed_ingestion.md';
import StartManagedIngestion from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_start_managed_ingestion.md';
import ProviderSelection from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_select_provider.md';
import UseCaseSelector from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_select_usecase.md';
import NavigateClickStackUI from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_navigate_managed.md';
import service_connect from '@site/static/images/_snippets/service_connect.png';

<BetaBadge/>

The easiest way to get started is by deploying **Managed ClickStack** on **ClickHouse Cloud**, which provides a fully managed, secure backend while retaining complete control over ingestion, schema, and observability workflows. This removes the need to operate ClickHouse yourself and delivers a range of benefits: 

- Automatic scaling of compute, independent of storage
- Low-cost and effectively unlimited retention based on object storage
- The ability to independently isolate read and write workloads with warehouses.
- Integrated authentication
- Automated backups
- Security and compliance features
- Seamless upgrades

<VerticalStepper headerLevel="h2">

## Signup to ClickHouse Cloud {#signup-to-clickhouse-cloud}

To create a Managed ClickStack service in [ClickHouse Cloud](https://console.clickhouse.cloud) first complete the **first step** of the [ClickHouse Cloud quickstart guide](/getting-started/quick-start/cloud).

:::note Scale vs Enterprise
We recommend this [Scale tier](/cloud/manage/cloud-tiers) for most ClickStack workloads. Choose the Enterprise tier if you require advanced security features such as SAML, CMEK, or HIPAA compliance. It also offers custom hardware profiles for very large ClickStack deployments. In these cases, we recommend contacting support.
:::

When prompted to select CPU and memory, estimate it based on your expected ClickStack ingestion throughput. The table below provides guidance for sizing these resources.

| Monthly ingest volume | Recommended compute |
|-----------------------|---------------------|
| < 10 TB / month       | 2 vCPU × 3 replicas |
| 10–50 TB / month      | 4 vCPU × 3 replicas |
| 50–100 TB / month     | 8 vCPU × 3 replicas |
| 100–500 TB / month   | 30 vCPU × 3 replicas |
| 1 PB+ / month        | 59 vCPU × 3 replicas |

These recommendations are based on the following assumptions:

- Data volume refers to **uncompressed ingest volume** per month and applies to both logs and traces.
- Query patterns are typical for observability use cases, with most queries targeting **recent data**, usually the last 24 hours.
- Ingestion is relatively **uniform across the month**. If you expect bursty traffic or spikes, you should provision additional headroom.
- Storage is handled separately via ClickHouse Cloud object storage and is not a limiting factor for retention. We assume data retained for longer periods is infrequently accessed.

More compute may be required for access patterns that regularly query longer time ranges, perform heavy aggregations, or support a high number of concurrent users.

Although two replicas can meet the CPU and memory requirements for a given ingestion throughput, we recommend using three replicas where possible to achieve the same total capacity and improve service redundancy.

:::note
These values are **estimates only** and should be used as an initial baseline. Actual requirements depend on query complexity, concurrency, retention policies, and variance in ingestion throughput. Always monitor resource usage and scale as needed.
:::

## Setup ingestion {#setup-ingestion}

Once your service has been provisioned, select the service and select "ClickStack" from the left menu.

<SetupManagedIngestion/>

## Start ingestion (OpenTelemetry only) {#start-ingestion}

<StartManagedIngestion/>

## Navigate to the ClickStack UI {#navigate-to-clickstack-ui-cloud}

<NavigateClickStackUI/>

## Next Steps {#next-steps}

:::important[Record default credentials]
If you have not recorded your default credentials during the above steps, navigate to the service and select `Connect`, recording the password and HTTP/native endpoints. Store these admin credentials securely, which can be reused in further guides.
:::

<Image img={service_connect} size="lg" alt='Service Connect' border/>

To perform tasks such as provisioning new users or adding further data sources, see the [deployment guide for Managed ClickStack](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud#additional-tasks).

</VerticalStepper>
