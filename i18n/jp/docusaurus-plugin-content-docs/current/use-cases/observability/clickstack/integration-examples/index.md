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
| [Generic Host Logs](/use-cases/observability/clickstack/integrations/host-logs) | ホストシステムのログを収集する |
| [EC2 Host Logs](/use-cases/observability/clickstack/integrations/host-logs/ec2) | EC2 インスタンスのログを監視する |
| [AWS Lambda Logs using Rotel](/use-cases/observability/clickstack/integrations/aws-lambda) | Rotel で Lambda ログを転送する |
| [AWS CloudWatch](/use-cases/observability/clickstack/integrations/aws-cloudwatch-logs) | CloudWatch のロググループを転送する |
| [JVM Metrics](/use-cases/observability/clickstack/integrations/jvm-metrics) | JVM のパフォーマンスを監視する |
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Kafka のパフォーマンスを監視する |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | K8s クラスターを監視する |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Nginx のアクセス/エラーログを収集する |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Nginx の HTTP リクエストをトレースする |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | Postgres ログを収集する |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | Postgres のパフォーマンスを監視する |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Redis サーバーログを収集する |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Redis のパフォーマンスを監視する |
| [Temporal Metrics](/use-cases/observability/clickstack/integrations/temporal-metrics)| Temporal Cloud のメトリクスを監視する |