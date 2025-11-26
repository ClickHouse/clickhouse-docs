---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'ClickStack 向けのデータインジェスト - ClickHouse Observability Stack'
title: 'インテグレーションガイド'
doc_type: 'landing-page'
keywords: ['ClickStack のデータインジェスト', '可観測性データのインジェスト', 'ClickStack インテグレーションガイド']
---

ClickStack は、可観測性データを ClickHouse インスタンスに取り込むための複数の方法を提供します。ここでは、さまざまなログ、トレース、メトリクスのソース向けクイックスタートガイドを紹介します。

:::note
これらのインテグレーションガイドのいくつかでは、簡易なテストのために ClickStack に組み込まれている OpenTelemetry Collector を使用します。本番環境へのデプロイでは、独自の OTel collector を稼働させ、ClickStack の OTLP エンドポイントにデータを送信することを推奨します。本番構成については、[OpenTelemetry データの送信](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。
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