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

## Isolating observability workloads {#isolating-workloads}

If you're adding ClickStack to an **existing ClickHouse Cloud service** that already supports other workloads, such as real-time application analytics, isolating observability traffic is strongly recommended.

Use [**Managed Warehouses**](/cloud/reference/warehouses) to create a **child service** dedicated to ClickStack. This allows you to:

- Isolate ingest and query load from existing applications
- Scale observability workloads independently
- Prevent observability queries from impacting production analytics
- Share the same underlying datasets across services when needed

This approach ensures your existing workloads remain unaffected while allowing ClickStack to scale independently as observability data grows.

For larger deployments or custom sizing guidance, please contact support for a more precise estimate.
