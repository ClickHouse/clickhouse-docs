---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'ClickStack へのデータインジェスト - ClickHouse Observability Stack'
title: 'インテグレーションガイド'
doc_type: 'landing-page'
keywords: ['ClickStack data ingestion', 'observability data ingestion', 'ClickStack integration guides']
---

ClickStack では、可観測性データを ClickHouse インスタンスに取り込むための複数の方法を提供しています。このセクションでは、さまざまなログ、トレース、メトリクスソース向けのクイックスタートガイドを掲載しています。

:::note
これらのインテグレーションガイドの一部では、手早くテストを行うために ClickStack に組み込まれている OpenTelemetry Collector を使用します。本番環境へのデプロイでは、独自の OTel collector を稼働させ、ClickStack の OTLP エンドポイントにデータを送信することを推奨します。本番向けの構成については、[OpenTelemetry データの送信](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。
:::

| セクション | 説明 |
|------|-------------|
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Kafka メトリクス向けクイックスタートガイド |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | Kubernetes 向けクイックスタートガイド |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Nginx ログ向けクイックスタートガイド |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Nginx トレース向けクイックスタートガイド |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | PostgreSQL ログ向けクイックスタートガイド |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | PostgreSQL メトリクス向けクイックスタートガイド |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Redis ログ向けクイックスタートガイド |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Redis メトリクス向けクイックスタートガイド |