---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'ClickStack - ClickHouse Observability Stack 向けのデータ取り込み'
title: 'インテグレーションガイド'
doc_type: 'landing-page'
keywords: ['ClickStack data ingestion', 'observability data ingestion', 'ClickStack integration guides']
---

ClickStack は、オブザーバビリティデータを ClickHouse インスタンスに取り込むための複数の方法を提供します。このセクションでは、さまざまなログ、トレース、メトリクスソース向けのクイックスタートガイドを紹介します。

:::note
これらのインテグレーションガイドのいくつかでは、簡易なテスト用に ClickStack 組み込みの OpenTelemetry Collector を使用しています。本番環境でのデプロイでは、独自の OTel Collector を運用し、ClickStack の OTLP エンドポイントにデータを送信することを推奨します。本番向けの構成については、[Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。
:::

| Section | Description |
|------|-------------|
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Kafka メトリクス向けクイックスタートガイド |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | Kubernetes 向けクイックスタートガイド |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Nginx ログ向けクイックスタートガイド |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Nginx トレース向けクイックスタートガイド |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | PostgreSQL ログ向けクイックスタートガイド |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | PostgreSQL メトリクス向けクイックスタートガイド |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Redis ログ向けクイックスタートガイド |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Redis メトリクス向けクイックスタートガイド |