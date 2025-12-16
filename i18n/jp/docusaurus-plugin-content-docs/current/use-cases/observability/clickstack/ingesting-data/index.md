---
slug: /use-cases/observability/clickstack/ingesting-data
pagination_prev: null
pagination_next: null
description: 'ClickStack のデータインジェスト - ClickHouse Observability Stack'
title: 'データのインジェスト'
doc_type: 'landing-page'
keywords: ['ClickStack data ingestion', 'observability data ingestion
', 'ClickStack OpenTelemetry', 'ClickHouse observability ingestion', 'telemetry data collection']
---

ClickStack は、オブザーバビリティデータを ClickHouse インスタンスにインジェストするための複数の方法を提供します。ログ、メトリクス、トレース、セッションデータのいずれを収集する場合でも、統一されたインジェストポイントとして OpenTelemetry (OTel) Collector を使用するか、特定のユースケース向けにプラットフォーム固有の連携機能を活用できます。

| Section | Description |
|------|-------------|
| [Overview](/use-cases/observability/clickstack/ingesting-data/overview) | データインジェスト方法とアーキテクチャの概要 |
| [Ingesting data with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) | OpenTelemetry を利用して ClickStack と迅速に連携したいユーザー向け |
| [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) | ClickStack 用 OpenTelemetry Collector の詳細 |
| [Tables and Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) | ClickStack が使用する ClickHouse テーブルとそのスキーマの概要 |
| [Language SDKs](/use-cases/observability/clickstack/sdks) | プログラミング言語をインスツルメントしてテレメトリデータを収集するための ClickStack SDKs |