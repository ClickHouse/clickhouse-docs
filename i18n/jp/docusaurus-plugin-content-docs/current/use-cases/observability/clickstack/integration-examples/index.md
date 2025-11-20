---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'ClickStack - ClickHouse Observability Stack 向けのデータ取り込み'
title: 'インテグレーションガイド'
doc_type: 'landing-page'
keywords: ['ClickStack data ingestion', 'observability data ingestion', 'ClickStack integration guides']
---

ClickStack は、観測データを ClickHouse インスタンスに取り込むための複数の方法を提供します。このセクションでは、さまざまなログ・トレース・メトリクスソース向けのクイックスタートガイドを掲載しています。

:::note
これらのインテグレーションガイドの一部では、簡易なテスト用に ClickStack の組み込み OpenTelemetry Collector を使用します。本番環境では、独自の OTel Collector を実行し、データを ClickStack の OTLP エンドポイントに送信することを推奨します。本番環境向けの構成については、[Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。
:::

| Section | Description |
|------|-------------|
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Kafka Metrics 向けクイックスタートガイド |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | Kubernetes 向けクイックスタートガイド |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Nginx Logs 向けクイックスタートガイド |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Nginx Traces 向けクイックスタートガイド |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | PostgreSQL Logs 向けクイックスタートガイド |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | PostgreSQL Metrics 向けクイックスタートガイド |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Redis Logs 向けクイックスタートガイド |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Redis Metrics 向けクイックスタートガイド |