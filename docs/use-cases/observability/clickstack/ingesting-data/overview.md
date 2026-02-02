---
slug: /use-cases/observability/clickstack/ingesting-data/overview
title: 'Ingesting data into ClickStack'
sidebar_label: 'Overview'
sidebar_position: 0
pagination_prev: null
pagination_next: use-cases/observability/clickstack/ingesting-data/opentelemetry
description: 'Overview for ingesting data to ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'observability', 'logs', 'monitoring', 'platform']
---

import Image from '@theme/IdealImage';
import oss_architecture_with_flow from '@site/static/images/use-cases/observability/clickstack-oss-architecture-with-flow.png';
import managed_architecture_with_flow from '@site/static/images/use-cases/observability/clickstack-managed-architecture-with-flow.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

All data is ingested into ClickStack Open Source or Managed ClickStack via an **OpenTelemetry (OTel) collector**. This acts as the primary entry point for logs, metrics, traces, and session data.

The key difference between the architectures lies in where the components are hosted. In both cases, you run an OpenTelemetry Collector to receive telemetry data from your applications. With ClickStack Open Source, you also manage and host both ClickHouse and the ClickStack UI (HyperDX) yourself. With Managed ClickStack, ClickHouse and the HyperDX UI are hosted and managed in ClickHouse Cloud, with integrated authentication and operational management handled for you.

<Tabs groupId="architecture">
    <TabItem value="managed-clickstack" label="Managed ClickStack" default>
        <Image img={managed_architecture_with_flow} alt="Managed architecture with flow" size="md"/>
    </TabItem>
    <TabItem value="oss-clickstack" label="Open Source ClickStack">
    <Image img={oss_architecture_with_flow} alt="Simple architecture with flow" size="md" />
    </TabItem>
</Tabs>

In both deployment models, the collector exposes two OTLP endpoints:

- **HTTP** - port `4318`
- **gRPC** - port `4317`

You can send data to these endpoints either directly from [language SDKs](/use-cases/observability/clickstack/sdks) or OTel-compatible data collection agents e.g. other OTel collectors collecting infrastructure metrics and logs.

More specifically:

- [**Language SDKs**](/use-cases/observability/clickstack/sdks) are responsible for collecting telemetry from within your application - most notably **traces** and **logs** - and exporting this data to the OpenTelemetry collector, via the OTLP endpoint, which handles ingestion into ClickHouse. For more details on the language SDKs available with ClickStack see [SDKs](/use-cases/observability/clickstack/sdks). 

- **Data collection agents** are agents deployed at the edge — on servers, Kubernetes nodes, or alongside applications. They collect infrastructure telemetry (e.g. logs, metrics) or receive events directly from applications instrumented with SDKs. In this case, the agent runs on the same host as the application, often as a sidecar or DaemonSet. These agents forward data to the central ClickStack OTel collector, which acts as a [gateway](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles), typically deployed once per cluster, data center, or region. The [gateway](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) receives OTLP events from agents or applications and handles ingestion into ClickHouse. See [OTel collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) for more details. These agents can be other instances of the OTel collector or alternative technologies such as [Fluentd](https://www.fluentd.org/) or [Vector](https://vector.dev/).

:::note OpenTelemetry compatibility
While ClickStack offers its own language SDKs and a custom OpenTelemetry, with enhanced telemetry and features, you can also use their existing OpenTelemetry SDKs and agents seamlessly.
:::
