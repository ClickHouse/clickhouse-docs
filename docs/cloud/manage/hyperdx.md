---
sidebar_label: 'HyperDX'
slug: /cloud/manage/hyperdx
title: 'HyperDX'
description: 'Provides HyperDX, the UI for ClickStack - a  production-grade observability platform built on ClickHouse and OpenTelemetry (OTel), unifying logs, traces, metrics, and sessions in a single high-performance scalable solution.'
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge/>

HyperDX is the user interface for [**ClickStack**](/use-cases/observability/clickstack) - a production-grade observability platform built on ClickHouse and OpenTelemetry (OTel), unifying logs, traces, metrics and session in a single high-performance solution. Designed for monitoring and debugging complex systems, ClickStack enables developers and SREs to trace issues end-to-end without switching between tools or manually stitching together data using timestamps or correlation IDs.

HyperDX is a purpose-built frontend for exploring and visualizing observability data, supporting both Lucene-style and SQL queries, interactive dashboards, alerting, trace exploration, and more—all optimized for ClickHouse as the backend.

HyperDX in ClickHouse Cloud allows users to enjoy a more turnkey ClickStack experience - no infrastructure to manage, no separate authentication to configure. 
HyperDX can be launched with a single click and connected to your data -  fully integrated into the ClickHouse Cloud authentication system for seamless, secure access to your observability insights.

## Deployment {#main-concepts}

HyperDX in ClickHouse Cloud is currently in private preview and must be enabled at the organization level. Once enabled, users will find HyperDX available in the main left navigation menu when selecting any service.

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

To get started with HyperDX in ClickHouse Cloud, we recommend our dedicated [getting started guide](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud).

For further details on ClickStack, see the [full documentation](/use-cases/observability/clickstack). 
