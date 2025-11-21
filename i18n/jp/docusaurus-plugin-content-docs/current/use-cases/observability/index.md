---
slug: /use-cases/observability
title: 'Observability（可観測性）'
pagination_prev: null
pagination_next: null
description: 'Observability（可観測性）ユースケースガイドのランディングページ'
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

ClickHouse は、可観測性において他に類を見ない速度、スケール、コスト効率を提供します。このガイドでは、ニーズに応じて選べる 2 つのパスを用意しています。



## ClickStack - ClickHouse オブザーバビリティスタック {#clickstack}

ClickHouse Observability Stack は、ほとんどのユーザーに**推奨されるアプローチ**です。

**ClickStack** は、ClickHouse と OpenTelemetry (OTel) 上に構築された本番環境対応のオブザーバビリティプラットフォームであり、ログ、トレース、メトリクス、セッションを単一の高性能でスケーラブルなソリューションに統合し、単一ノードのデプロイメントから**マルチペタバイト**規模まで対応します。

| セクション                                                                 | 説明                                     |
| ----------------------------------------------------------------------- | ----------------------------------------------- |
| [概要](/use-cases/observability/clickstack/overview)                | ClickStack とその主要機能の紹介 |
| [はじめに](/use-cases/observability/clickstack/getting-started)  | クイックスタートガイドと基本的なセットアップ手順  |
| [サンプルデータセット](/use-cases/observability/clickstack/sample-datasets) | サンプルデータセットとユースケース                   |
| [アーキテクチャ](/use-cases/observability/clickstack/architecture)        | システムアーキテクチャとコンポーネントの概要     |
| [デプロイメント](/use-cases/observability/clickstack/deployment)            | デプロイメントガイドとオプション                   |
| [設定](/use-cases/observability/clickstack/config)             | 詳細な設定オプションと設定項目     |
| [データの取り込み](/use-cases/observability/clickstack/ingesting-data)    | ClickStack へのデータ取り込みのガイドライン     |
| [検索](/use-cases/observability/clickstack/search)                    | オブザーバビリティデータの検索とクエリ方法 |
| [本番環境](/use-cases/observability/clickstack/production)            | 本番環境デプロイメントのベストプラクティス        |


## 独自スタックの構築 {#build-your-own-stack}

**カスタム要件**を持つユーザー向け — 高度に特化したインジェストパイプライン、スキーマ設計、または極端なスケーリングニーズなど — ClickHouseをコアデータベースとして、カスタムオブザーバビリティスタックを構築するためのガイダンスを提供します。

| ページ                                                                  | 説明                                                                                                                                                         |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [はじめに](/use-cases/observability/introduction)                 | このガイドは、ClickHouseを使用して独自のオブザーバビリティソリューションを構築するユーザー向けに設計されており、ログとトレースに焦点を当てています。                                   |
| [スキーマ設計](/use-cases/observability/schema-design)               | ログとトレース用に独自のスキーマを作成することが推奨される理由と、そのためのベストプラクティスについて学びます。                                        |
| [データ管理](/observability/managing-data)                         | オブザーバビリティ用のClickHouseデプロイメントには必ず大規模なデータセットが含まれ、これらを管理する必要があります。ClickHouseはデータ管理を支援する機能を提供します。 |
| [OpenTelemetryの統合](/observability/integrating-opentelemetry) | ClickHouseでOpenTelemetryを使用したログとトレースの収集およびエクスポート。                                                                                       |
| [可視化ツールの使用](/observability/grafana)                   | HyperDXやGrafanaを含む、ClickHouse用のオブザーバビリティ可視化ツールの使用方法を学びます。                                                                   |
| [デモアプリケーション](/observability/demo-application)                   | ログとトレース用にClickHouseで動作するようにフォークされたOpenTelemetryデモアプリケーションを探索します。                                                                      |
