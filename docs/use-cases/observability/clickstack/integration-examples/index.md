---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'Data ingestion for ClickStack - The ClickHouse Observability Stack'
title: 'Integration guides'
doc_type: 'landing-page'
keywords: ['ClickStack data ingestion', 'observability data ingestion', 'ClickStack integration guides']
---

ClickStack provides multiple ways to ingest observability data into your ClickHouse instance. This section contains quick start guides for various log, trace, and metrics sources.

:::note
Several of these integration guides use ClickStack's built-in OpenTelemetry Collector for quick testing. For production deployments, we recommend running your own OTel Collector and sending data to ClickStack's OTLP endpoint. See [Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry) for production configuration.
:::

| Section | Description |
|------|-------------|
| [Generic Host Logs](/use-cases/observability/clickstack/integrations/host-logs) | Quick start guide for Generic Host Logs |
| [EC2 Host Logs](/use-cases/observability/clickstack/integrations/host-logs/ec2) | Quick start guide for EC2 Host Logs |
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Quick start guide for Kafka Metrics |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | Quick start guide for Kubernetes |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Quick start guide for Nginx Logs |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Quick start guide for Nginx Traces |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | Quick start guide for PostgreSQL Logs |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | Quick start guide for PostgreSQL Metrics |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Quick start guide for Redis Logs |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Quick start guide for Redis Metrics |
| [AWS Lambda Logs using Rotel](/use-cases/observability/clickstack/integrations/aws-lambda) | Quick start guide for AWS Lambda Logs using Rotel |
