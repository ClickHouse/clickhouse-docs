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
| [Generic Host Logs](/use-cases/observability/clickstack/integrations/host-logs) | Collect host system logs |
| [EC2 Host Logs](/use-cases/observability/clickstack/integrations/host-logs/ec2) | Monitor EC2 instance logs |
| [AWS Lambda Logs using Rotel](/use-cases/observability/clickstack/integrations/aws-lambda) | Forward Lambda logs with Rotel |
| [AWS CloudWatch](/use-cases/observability/clickstack/integrations/aws-cloudwatch-logs) | Forward CloudWatch log groups |
| [JVM Metrics](/use-cases/observability/clickstack/integrations/jvm-metrics) | Monitor JVM performance |
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Monitor Kafka performance |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | Monitor K8s clusters |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Collect Nginx access/error logs |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Trace Nginx HTTP requests |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | Collect Postgres logs |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | Monitor Postgres performance |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Collect Redis server logs |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Monitor Redis performance |
