---
slug: /use-cases/observability/clickstack/estimating-resources
title: 'Estimating resources'
sidebar_label: 'Estimating resources'
pagination_prev: null
pagination_next: null
description: 'Resource estimation guidance for Managed ClickStack deployments'
doc_type: 'guide'
keywords: ['clickstack', 'resources', 'sizing', 'compute', 'production', 'capacity planning']
---

import ResourceEstimation from '@site/docs/use-cases/observability/clickstack/managing/_snippets/_resource_estimation.md';

<ResourceEstimation/>

:::note Isolation of Queries vs Ingest
In most self-managed deployments, ingest and query roles share the same nodes. In this case, use the **Total CPUs** column from the table below as your baseline. Isolated scaling - where ingest and query compute are provisioned independently - is supported in ClickHouse Cloud through [separate compute pools aka Warehouses](/cloud/reference/warehouses).
:::

## Refining sizing assumptions for your environment {#refining-sizing-assumptions}

The model assumes a sustained average of 1 QPS from ClickStack, aggregating all query types including search, dashboards, and alerting. 

For higher query volumes, scale CPU requirements linearly by dividing by CPU requirements by the target QPS. For example, a deployment ingesting at 100 MB/s with a target of 9 QPS would require 90 query CPUs (10 × 9) rather than the baseline 10, giving a revised total of 100 CPUs (10 ingest + 90 query).

Storage estimates assume a conservative 10x compression ratio. In practice, logs, traces, and metrics often achieve higher compression. We recommend testing on a sample of data to establish your compression ratio and storage requirements in advance of production.

This assumes a relatively balanced query distribution. Workloads skewed toward heavier historical or archival queries may have significantly different compute requirements, and should be validated through load testing.

We plan to introduce a more flexible sizing model that allows extrapolation of query compute based on varying query distribution patterns.

## Isolating observability workloads {#isolating-workloads}

If you're adding ClickStack to an **existing ClickHouse Cloud service** that already supports other workloads, such as real-time application analytics, isolating observability traffic is strongly recommended.

Use [**Managed Warehouses**](/cloud/reference/warehouses) to create a **child service** dedicated to ClickStack. This allows you to:

- Isolate ingest and query load from existing applications
- Scale observability workloads independently
- Prevent observability queries from impacting production analytics
- Share the same underlying datasets across services when needed

This approach ensures your existing workloads remain unaffected while allowing ClickStack to scale independently as observability data grows.

For larger deployments or custom sizing guidance, please contact support for a more precise estimate.
