---
slug: /use-cases/observability/clickstack/integration-guides
pagination_prev: null
pagination_next: null
description: 'ClickStack 向けデータインジェスト - ClickHouse オブザーバビリティスタック'
title: 'インテグレーションガイド'
doc_type: 'landing-page'
keywords: ['ClickStack データインジェスト', 'オブザーバビリティ データインジェスト', 'ClickStack インテグレーションガイド']
---

ClickStack は、オブザーバビリティデータを ClickHouse インスタンスにインジェストするための複数の方法を提供します。このセクションでは、さまざまなログ・トレース・メトリクスソース向けのクイックスタートガイドを掲載しています。

:::note
これらのインテグレーションガイドの一部では、迅速なテストおよび評価のために ClickStack Open Source に組み込まれている OpenTelemetry Collector を使用します。

本番環境のデプロイメントでは、ワークロードの近くで OpenTelemetry Collector エージェントとしてインテグレーションを構成して実行することを推奨します。これらのエージェントはテレメトリデータを OTLP 経由で ClickStack OpenTelemetry Collector に転送し、その Collector が ClickStack Open Source ディストリビューション向けのセルフマネージド ClickHouse インスタンス、または Managed ClickStack のいずれかにデータを送信します。本番環境の構成については ["Sending OpenTelemetry data"](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。
:::

| セクション | 説明 |
|------|-------------|
| [Generic Host Logs](/use-cases/observability/clickstack/integrations/host-logs) | ホストシステムログを収集 |
| [EC2 Host Logs](/use-cases/observability/clickstack/integrations/host-logs/ec2) | EC2 インスタンスのログを監視 |
| [AWS Lambda Logs using Rotel](/use-cases/observability/clickstack/integrations/aws-lambda) | Rotel を使用して Lambda ログを転送 |
| [AWS CloudWatch](/use-cases/observability/clickstack/integrations/aws-cloudwatch-logs) | CloudWatch ロググループを転送 |
| [JVM Metrics](/use-cases/observability/clickstack/integrations/jvm-metrics) | JVM のパフォーマンスを監視 |
| [Kafka Metrics](/use-cases/observability/clickstack/integrations/kafka-metrics) | Kafka のパフォーマンスを監視 |
| [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) | K8s クラスターを監視 |
| [MySQL Logs](/use-cases/observability/clickstack/integrations/mysql-logs) | MySQL のスロークエリ/エラーログを収集 |
| [Nginx Logs](/use-cases/observability/clickstack/integrations/nginx) | Nginx のアクセス/エラーログを収集 |
| [Nginx Traces](/use-cases/observability/clickstack/integrations/nginx-traces) | Nginx の HTTP リクエストをトレース |
| [Node.js Traces](/use-cases/observability/clickstack/integrations/nodejs-traces) | Node.js の HTTP リクエストをトレース |
| [PostgreSQL Logs](/use-cases/observability/clickstack/integrations/postgresql-logs) | Postgres ログを収集 |
| [PostgreSQL Metrics](/use-cases/observability/clickstack/integrations/postgresql-metrics) | Postgres のパフォーマンスを監視 |
| [Redis Logs](/use-cases/observability/clickstack/integrations/redis) | Redis サーバーログを収集 |
| [Redis Metrics](/use-cases/observability/clickstack/integrations/redis-metrics) | Redis のパフォーマンスを監視 |
| [Systemd Logs](/use-cases/observability/clickstack/integrations/systemd-logs) | Systemd/Journald ログを収集 |
| [Temporal Metrics](/use-cases/observability/clickstack/integrations/temporal-metrics)| Temporal Cloud のメトリクスを監視 |