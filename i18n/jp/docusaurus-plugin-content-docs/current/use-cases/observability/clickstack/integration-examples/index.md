---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'ClickStack - ClickHouse Observability Stack 向けデータ取り込み'
title: 'インテグレーションガイド'
doc_type: 'landing-page'
keywords: ['ClickStack data ingestion', 'observability data ingestion', 'ClickStack integration guides']
---

ClickStack は、お使いの ClickHouse インスタンスにオブザーバビリティデータを取り込むための複数の方法を提供します。本セクションでは、さまざまなログ、トレース、メトリクスソース向けのクイックスタートガイドを紹介します。

:::note
これらのインテグレーションガイドのいくつかは、簡易テストのために ClickStack の組み込み OpenTelemetry Collector を使用します。本番環境へのデプロイでは、独自の OTel Collector を実行し、そのデータを ClickStack の OTLP エンドポイントに送信することを推奨します。本番環境での構成については、[Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。
:::

| セクション | 説明 |
|------|-------------|
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Kafka Metrics 向けクイックスタートガイド |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | Kubernetes 向けクイックスタートガイド |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Nginx Logs 向けクイックスタートガイド |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Nginx Traces 向けクイックスタートガイド |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | PostgreSQL Logs 向けクイックスタートガイド |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | PostgreSQL Metrics 向けクイックスタートガイド |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Redis Logs 向けクイックスタートガイド |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Redis Metrics 向けクイックスタートガイド |