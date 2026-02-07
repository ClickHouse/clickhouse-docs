---
slug: /use-cases/observability/clickstack
title: 'ClickStack - ClickHouse オブザーバビリティスタック'
pagination_prev: null
pagination_next: null
description: 'ClickHouse オブザーバビリティスタックのランディングページ'
keywords: ['ClickStack', 'オブザーバビリティスタック', 'HyperDX', 'OpenTelemetry', 'logs', 'traces', 'metrics']
doc_type: 'landing-page'
---

**ClickStack** は、ClickHouse と OpenTelemetry (OTel) 上に構築されたオープンソースの本番環境対応オブザーバビリティプラットフォームであり、ログ、トレース、メトリクス、セッション情報を単一の高性能なソリューションとして統合します。これにより、開発者と SRE はツール間を行き来したり、手作業でデータの相関付けを行ったりすることなく、複雑なシステムをエンドツーエンドで監視およびデバッグできます。

ClickStack には 2 つのデプロイ方法があります。**ClickStack Open Source** では、ClickHouse、ClickStack UI (HyperDX)、OpenTelemetry Collector を含むすべてのコンポーネントを自分で実行および管理します。**Managed ClickStack** では、認証や運用上の考慮事項を含め、ClickHouse と ClickStack UI (HyperDX) が ClickHouse Cloud 上でフルマネージドとなり、ユーザーはワークロードからテレメトリを受信し、それを OTLP 経由で ClickHouse Cloud に転送する OpenTelemetry Collector のみを実行するだけで済みます。

| セクション | 説明 |
|---------|-------------|
| [Overview](/use-cases/observability/clickstack/overview) | ClickStack とその主な機能の概要 |
| [Getting Started](/use-cases/observability/clickstack/getting-started) | クイックスタートガイドと基本的なセットアップ手順 |
| [Sample Datasets](/use-cases/observability/clickstack/sample-datasets) | サンプルデータセットとユースケース |
| [Architecture](/use-cases/observability/clickstack/architecture) | システムアーキテクチャとコンポーネントの概要 |
| [Deployment](/use-cases/observability/clickstack/deployment) | デプロイメントガイドとオプション |
| [Configuration](/use-cases/observability/clickstack/config) | 詳細な設定オプションとパラメータ |
| [Ingesting Data](/use-cases/observability/clickstack/ingesting-data) | ClickStack にデータを取り込むためのガイドライン |
| [Search](/use-cases/observability/clickstack/search) | オブザーバビリティデータの検索およびクエリ方法 |
| [Production](/use-cases/observability/clickstack/production) | 本番環境へのデプロイメントに関するベストプラクティス |