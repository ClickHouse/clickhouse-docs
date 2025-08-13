---
slug: /use-cases/observability/clickstack/migration/elastic/intro
title: 'Migrating to ClickStack from Elastic'
pagination_prev: null
pagination_next: null
sidebar_label: 'Overview'
sidebar_position: 0
description: 'Overview for migrating to the ClickHouse Observability Stack from Elastic'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: 'how-to'
---

## Migrating to ClickStack from Elastic {#migrating-to-clickstack-from-elastic}

This guide is intended for users migrating from the Elastic Stack — specifically those using Kibana to monitor logs, traces, and metrics collected via Elastic Agent and stored in Elasticsearch. It outlines equivalent concepts and data types in ClickStack, explains how to translate Kibana Lucene-based queries to HyperDX's syntax, and provides guidance on migrating both data and agents for a smooth transition.

Before beginning a migration, it's important to understand the tradeoffs between ClickStack and the Elastic Stack.

You should consider moving to ClickStack if:

- You are ingesting large volumes of observability data and find Elastic cost-prohibitive due to inefficient compression and poor resource utilization. ClickStack can reduce storage and compute costs significantly — offering at least 10x compression on raw data.
- You experience poor search performance at scale or face ingestion bottlenecks.
- You want to correlate observability signals with business data using SQL, unifying observability and analytics workflows.
- You are committed to OpenTelemetry and want to avoid vendor lock-in.
- You want to take advantage of the separation of storage and compute in ClickHouse Cloud, enabling virtually unlimited scale — paying only for ingestion compute and object storage during idle periods.

However, ClickStack may not be suitable if:

- You use observability data primarily for security use cases and need a SIEM-focused product.
- Universal profiling is a critical part of your workflow.
- You require a business intelligence (BI) dashboarding platform. ClickStack intentionally has opinionated visual workflows for SREs and developers and is not designed as a Business Intelligence (BI) tool. For equivalent capabilities,m we recommend using [Grafana with the ClickHouse plugin](/integrations/grafana) or [Superset](/integrations/superset).
