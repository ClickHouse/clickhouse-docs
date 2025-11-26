---
slug: /use-cases/observability/clickstack/ingesting-data
pagination_prev: null
pagination_next: null
description: 'ClickStack 向けデータインジェスト - ClickHouse Observability Stack'
title: 'データのインジェスト'
doc_type: 'landing-page'
keywords: ['ClickStack データインジェスト', 'オブザーバビリティデータのインジェスト', 'ClickStack OpenTelemetry', 'ClickHouse オブザーバビリティインジェスト', 'テレメトリーデータ収集']
---

ClickStack は、オブザーバビリティデータを ClickHouse インスタンスにインジェストするための複数の方法を提供します。ログ、メトリクス、トレース、セッションデータなど、どの種類のデータを収集する場合でも、OpenTelemetry (OTel) コレクターを統一されたインジェストポイントとして利用するか、用途に特化したプラットフォーム固有の連携を活用できます。

| Section | Description |
|------|-------------|
| [Overview](/use-cases/observability/clickstack/ingesting-data/overview) | データインジェスト手法とアーキテクチャの概要 |
| [Ingesting data with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) | OpenTelemetry を利用しており、ClickStack との統合をすばやく行いたいユーザー向け |
| [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) | ClickStack OpenTelemetry コレクターに関する詳細な技術情報 |
| [Tables and Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) | ClickStack が利用する ClickHouse のテーブルおよびそのスキーマの概要 |
| [Language SDKs](/use-cases/observability/clickstack/sdks) | プログラミング言語をインストゥルメントしてテレメトリーデータを収集するための ClickStack SDKs |