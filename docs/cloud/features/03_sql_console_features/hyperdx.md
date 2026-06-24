---
sidebar_label: 'Managed ClickStack'
slug: /cloud/manage/hyperdx
title: 'Managed ClickStack'
description: 'Provides Managed ClickStack, the UI for ClickStack - a production-grade observability platform built on ClickHouse and OpenTelemetry (OTel), unifying logs, traces, metrics, and sessions in a single high-performance, scalable solution.'
doc_type: 'guide'
keywords: ['managed clickstack', 'clickstack', 'observability', 'cloud features', 'monitoring']
---

import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

Managed ClickStack is the UI for [**ClickStack**](/use-cases/observability/clickstack) - a production-grade observability platform built on ClickHouse and OpenTelemetry (OTel), unifying logs, traces, metrics, and session data in a single high-performance solution. Designed for monitoring and debugging complex systems, ClickStack enables developers and SREs to trace issues end-to-end without switching between tools or manually stitching together data using timestamps or correlation IDs.

Managed ClickStack is a purpose-built frontend for exploring and visualizing observability data, supporting both Lucene-style and SQL queries, interactive dashboards, alerting, trace exploration, and more — all optimized for ClickHouse as the backend.

Managed ClickStack in ClickHouse Cloud allows you to enjoy a more turnkey ClickStack experience - no infrastructure to manage, and no separate authentication to configure.
Managed ClickStack can be launched with a single click and connected to your data - fully integrated into the ClickHouse Cloud authentication system for secure access to your observability insights.

## Deployment {#main-concepts}

Managed ClickStack in ClickHouse Cloud is generally available. You will find it in the main left navigation menu when selecting any service.

<Image img={hyperdx_cloud} alt="ClickHouse Cloud Managed ClickStack" size="lg"/>

To get started with Managed ClickStack in ClickHouse Cloud, we recommend our dedicated [getting started guide](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud).

For further details on ClickStack, see the [full documentation](/use-cases/observability/clickstack). 
