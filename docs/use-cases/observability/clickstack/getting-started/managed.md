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

<ProviderSelection/>

## Setup ingestion {#setup-ingestion}

Once your service has been provisioned, ensure the the service is selected and click "ClickStack" from the left menu.

<SetupManagedIngestion/>

## Navigate to the ClickStack UI {#navigate-to-clickstack-ui-cloud}

<NavigateClickStackUI/>

## Next Steps {#next-steps}

:::important[Record default credentials]
If you have not recorded your default credentials during the above steps, navigate to the service and select `Connect`, recording the password and HTTP/native endpoints. Store these admin credentials securely, which can be reused in further guides.
:::

<Image img={service_connect} size="lg" alt='Service Connect' border/>

To perform tasks such as provisioning new users or adding further data sources, see the [deployment guide for Managed ClickStack](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud#additional-tasks).

</VerticalStepper>
