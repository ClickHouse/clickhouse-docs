---
slug: /use-cases/observability/clickstack/ingesting-data
pagination_prev: null
pagination_next: null
description: 'ClickStack 向けのデータ取り込み - ClickHouse Observability Stack'
title: 'データの取り込み'
doc_type: 'landing-page'
keywords: ['ClickStack data ingestion', 'observability data ingestion
', 'ClickStack OpenTelemetry', 'ClickHouse observability ingestion', 'telemetry data collection']
---

ClickStack は、オブザーバビリティ・データを ClickHouse インスタンスに取り込むための複数の方法を提供します。ログ、メトリクス、トレース、セッションデータのいずれを収集する場合でも、統合された取り込みポイントとして OpenTelemetry (OTel) Collector を使用するか、特定のユースケース向けにプラットフォーム固有のインテグレーションを利用できます。

| Section | Description |
|------|-------------|
| [Overview](/use-cases/observability/clickstack/ingesting-data/overview) | データ取り込み方法およびアーキテクチャの概要 |
| [Ingesting data with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) | OpenTelemetry を利用しており、ClickStack と迅速に統合したいユーザー向け |
| [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) | ClickStack OpenTelemetry Collector に関する詳細情報 |
| [Tables and Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) | ClickStack が利用する ClickHouse テーブルおよびそのスキーマの概要 |
| [Language SDKs](/use-cases/observability/clickstack/sdks) | プログラミング言語をインスツルメントし、テレメトリデータを収集するための ClickStack SDK |