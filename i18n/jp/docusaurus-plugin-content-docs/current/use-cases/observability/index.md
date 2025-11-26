---
slug: /use-cases/observability
title: 'オブザーバビリティ'
pagination_prev: null
pagination_next: null
description: 'オブザーバビリティのユースケースガイド用ランディングページ'
keywords: ['オブザーバビリティ', 'ログ', 'トレース', 'メトリクス', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

ClickHouse は、オブザーバビリティにおいて他に類を見ないスピード、スケール、コスト効率を実現します。このガイドでは、ニーズに応じて選択できる 2 つのアプローチを紹介します。



## ClickStack - ClickHouse オブザーバビリティスタック {#clickstack}

ClickHouse Observability Stack は、ほとんどのユーザーに**推奨されるアプローチ**です。

**ClickStack** は ClickHouse と OpenTelemetry (OTel) 上に構築された本番運用レベルのオブザーバビリティプラットフォームであり、ログ、トレース、メトリクス、セッションデータを単一の高性能かつスケーラブルなソリューションとして統合し、単一ノードでのデプロイから **マルチペタバイト** 規模まで対応します。

| Section | Description |
|---------|-------------|
| [Overview](/use-cases/observability/clickstack/overview) | ClickStack とその主要機能の概要 |
| [Getting Started](/use-cases/observability/clickstack/getting-started) | クイックスタートガイドと基本的なセットアップ手順 |
| [Example Datasets](/use-cases/observability/clickstack/sample-datasets) | サンプルデータセットとユースケース |
| [Architecture](/use-cases/observability/clickstack/architecture) | システムアーキテクチャとコンポーネントの概要 |
| [Deployment](/use-cases/observability/clickstack/deployment) | デプロイ方法とオプション |
| [Configuration](/use-cases/observability/clickstack/config) | 詳細な設定オプションと各種パラメータ |
| [Ingesting Data](/use-cases/observability/clickstack/ingesting-data) | ClickStack にデータを取り込むためのガイドライン |
| [Search](/use-cases/observability/clickstack/search) | オブザーバビリティデータの検索およびクエリ方法 |
| [Production](/use-cases/observability/clickstack/production) | 本番環境へのデプロイに関するベストプラクティス |



## 独自スタックの構築 {#build-your-own-stack}

**カスタム要件**（高度に特化したインジェストパイプライン、スキーマ設計、極端なスケーリングニーズなど）を持つユーザー向けに、コアデータベースとして ClickHouse を用いたカスタム可観測性スタックを構築するためのガイダンスを提供します。

| Page                                                        | Description                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | このガイドは、ClickHouse を用いてログとトレースに重点を置いた独自の可観測性ソリューションを構築したいユーザー向けに設計されています。                                             |
| [Schema design](/use-cases/observability/schema-design)          | なぜログとトレース用に独自スキーマの作成を推奨しているのか、その理由と、実践時のベストプラクティスについて学びます。                                                  |
| [Managing data](/observability/managing-data)          | 可観測性用途の ClickHouse デプロイメントでは、必然的に大規模なデータセットを扱うことになり、その管理が必要です。ClickHouse にはデータ管理を支援する機能が用意されています。           |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | ClickHouse と OpenTelemetry を組み合わせて、ログとトレースを収集・エクスポートする方法について説明します。                                                           |
| [Using Visualization Tools](/observability/grafana)    | HyperDX や Grafana を含む、ClickHouse 向けの可観測性可視化ツールの使い方を学びます。                                       |
| [Demo Application](/observability/demo-application)    | ClickHouse でログとトレースを扱えるようにフォークされた OpenTelemetry Demo Application を使って、その動作を確認します。                                           |
