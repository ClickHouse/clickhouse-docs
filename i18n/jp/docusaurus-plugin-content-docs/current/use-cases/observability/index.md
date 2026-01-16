---
slug: /use-cases/observability
title: 'オブザーバビリティ'
pagination_prev: null
pagination_next: null
description: 'オブザーバビリティ向けユースケースガイドのランディングページ'
keywords: ['オブザーバビリティ', 'ログ', 'トレース', 'メトリクス', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

ClickHouse は、オブザーバビリティにおいて比類のない速度、スケーラビリティ、およびコスト効率を提供します。このガイドでは、ニーズに応じて選択できる 2 つのパスを紹介します。

## ClickStack - ClickHouse オブザーバビリティスタック \\{#clickstack\\}

ClickHouse Observability Stack は、ほとんどのユーザーに対する**推奨構成**です。

**ClickStack** は ClickHouse と OpenTelemetry (OTel) 上に構築された本番運用対応のオブザーバビリティプラットフォームであり、ログ、トレース、メトリクス、セッションを、高性能かつスケーラブルな単一のソリューションに統合し、単一ノードのデプロイメントから **マルチペタバイト** 規模まで対応します。

| Section | Description |
|---------|-------------|
| [Overview](/use-cases/observability/clickstack/overview) | ClickStack とその主要な機能の概要 |
| [Getting Started](/use-cases/observability/clickstack/getting-started) | クイックスタートガイドと基本的なセットアップ手順 |
| [Example Datasets](/use-cases/observability/clickstack/sample-datasets) | サンプルデータセットとユースケース |
| [Architecture](/use-cases/observability/clickstack/architecture) | システムアーキテクチャとコンポーネントの概要 |
| [Deployment](/use-cases/observability/clickstack/deployment) | デプロイメントガイドとオプション |
| [Configuration](/use-cases/observability/clickstack/config) | 詳細な構成オプションと設定 |
| [Ingesting Data](/use-cases/observability/clickstack/ingesting-data) | データを ClickStack に取り込むためのガイドライン |
| [Search](/use-cases/observability/clickstack/search) | オブザーバビリティデータを検索・クエリする方法 |
| [Production](/use-cases/observability/clickstack/production) | 本番運用におけるデプロイメントのベストプラクティス |

## 独自スタックの構築 \\{#build-your-own-stack\\}

**カスタム要件**（高度に特化したインジェストパイプライン、スキーマ設計、非常に大規模なスケーリングニーズなど）を持つユーザー向けに、ClickHouse をコアデータベースとして使用した独自のオブザーバビリティスタックを構築するためのガイドラインを提供します。

| Page                                                        | Description                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | このガイドは、ClickHouse を用いて独自のオブザーバビリティソリューションを構築しようとしているユーザー向けのものであり、ログとトレースに焦点を当てています。                                             |
| [Schema design](/use-cases/observability/schema-design)          | なぜログおよびトレース用に独自のスキーマを作成することを推奨しているのか、その理由と、その際に役立つベストプラクティスについて学びます。                                                  |
| [Managing data](/observability/managing-data)          | オブザーバビリティ用途の ClickHouse デプロイメントでは、必然的に大規模なデータセットを扱うことになり、その管理が必要になります。ClickHouse はデータ管理を支援するさまざまな機能を提供しています。           |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | ClickHouse と OpenTelemetry を用いてログとトレースを収集し、エクスポートする方法について説明します。                                                           |
| [Using Visualization Tools](/observability/grafana)    | HyperDX や Grafana を含む、ClickHouse 向けのオブザーバビリティ可視化ツールの使い方を学びます。                                       |
| [Demo Application](/observability/demo-application)    | ClickHouse のログおよびトレースで動作するようにフォークされた OpenTelemetry Demo Application を紹介します。                                           |