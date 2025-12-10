---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'ClickStack 向けデータインジェスト - ClickHouse オブザーバビリティスタック'
title: '連携ガイド'
doc_type: 'landing-page'
keywords: ['ClickStack データインジェスト', 'オブザーバビリティ データインジェスト', 'ClickStack 連携ガイド']
---

ClickStack は、オブザーバビリティデータを ClickHouse インスタンスへインジェストするための複数の方法を提供しています。このセクションには、さまざまなログ・トレース・メトリクスソース向けのクイックスタートガイドが含まれます。

:::note
これらの連携ガイドの一部では、簡単なテスト用に ClickStack の組み込み OpenTelemetry Collector を使用します。本番環境のデプロイメントでは、独自の OTel Collector を実行し、ClickStack の OTLP エンドポイントにデータを送信することを推奨します。本番構成については、[Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。
:::

| Section | Description |
|------|-------------|
| [Generic Host Logs](/use-cases/observability/clickstack/integrations/host-logs) | Generic Host Logs 向けクイックスタートガイド |
| [EC2 Host Logs](/use-cases/observability/clickstack/integrations/host-logs/ec2) | EC2 Host Logs 向けクイックスタートガイド |
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Kafka メトリクス向けクイックスタートガイド |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | Kubernetes 向けクイックスタートガイド |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Nginx ログ向けクイックスタートガイド |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Nginx トレース向けクイックスタートガイド |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | PostgreSQL ログ向けクイックスタートガイド |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | PostgreSQL メトリクス向けクイックスタートガイド |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Redis ログ向けクイックスタートガイド |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Redis メトリクス向けクイックスタートガイド |
| [AWS Lambda Logs using Rotel](/use-cases/observability/clickstack/integrations/aws-lambda) | Rotel を利用した AWS Lambda ログ向けクイックスタートガイド |