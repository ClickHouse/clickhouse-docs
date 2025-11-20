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

ClickStack は、オブザーバビリティデータを ClickHouse インスタンスに取り込むための複数の方法を提供します。ログ、メトリクス、トレース、セッションデータのいずれを収集する場合でも、OpenTelemetry (OTel) コレクターを一元的な取り込みポイントとして利用することも、特定のユースケース向けにプラットフォーム固有のインテグレーションを活用することもできます。

| Section | Description |
|------|-------------|
| [Overview](/use-cases/observability/clickstack/ingesting-data/overview) | データ取り込み方法とアーキテクチャの概要 |
| [Ingesting data with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) | OpenTelemetry を利用しており、ClickStack との連携をすばやく行いたいユーザー向け |
| [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) | ClickStack OpenTelemetry コレクターに関する詳細な解説 |
| [Tables and Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) | ClickStack で使用される ClickHouse テーブルとそのスキーマの概要 |
| [Language SDKs](/use-cases/observability/clickstack/sdks) | プログラミング言語を計装し、テレメトリーデータを収集するための ClickStack SDK |