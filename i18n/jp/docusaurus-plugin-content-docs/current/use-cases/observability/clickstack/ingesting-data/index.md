---
slug: /use-cases/observability/clickstack/ingesting-data
pagination_prev: null
pagination_next: null
description: 'ClickStack - ClickHouse Observability Stack におけるデータ取り込み'
title: 'データの取り込み'
doc_type: 'landing-page'
keywords: ['ClickStack データ取り込み', 'オブザーバビリティ データ取り込み
', 'ClickStack OpenTelemetry', 'ClickHouse オブザーバビリティ 取り込み', 'テレメトリ データ収集']
---

ClickStack は、オブザーバビリティデータを ClickHouse インスタンスに取り込むための複数の方法を提供します。ログ、メトリクス、トレース、セッションデータのいずれを収集する場合でも、統合的な取り込みポイントとして OpenTelemetry (OTel) Collector を使用するか、特定のユースケース向けにプラットフォーム固有の連携を活用できます。

| セクション | 説明 |
|------|-------------|
| [Overview](/use-cases/observability/clickstack/ingesting-data/overview) | データ取り込み方法とアーキテクチャの概要 |
| [Ingesting data with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) | OpenTelemetry を利用しており、ClickStack と迅速に連携したいユーザー向け |
| [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) | ClickStack OpenTelemetry Collector に関する高度な詳細情報 |
| [Tables and Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) | ClickStack が使用する ClickHouse テーブルとそのスキーマの概要 |
| [Language SDKs](/use-cases/observability/clickstack/sdks) | プログラミング言語を計装し、テレメトリデータを収集するための各種 ClickStack SDK |