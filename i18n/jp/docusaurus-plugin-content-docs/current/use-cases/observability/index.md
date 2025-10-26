---
'slug': '/use-cases/observability'
'title': 'Observability'
'pagination_prev': null
'pagination_next': null
'description': 'Observability ユースケースガイドのランディングページ'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'doc_type': 'guide'
---

ClickHouseは、可視化のために比類のない速度、スケール、およびコスト効率を提供します。このガイドでは、あなたのニーズに応じて2つのパスを提供します。

## ClickStack - ClickHouseの可視化スタック {#clickstack}

ClickHouseの可視化スタックは、ほとんどのユーザーに対する**推奨アプローチ**です。

**ClickStack**は、ClickHouseとOpenTelemetry (OTel)に基づいた生産グレードの可視化プラットフォームで、ログ、トレース、メトリクス、およびセッションを単一の高性能スケーラブルソリューションに統合し、単一ノードのデプロイから**マルチペタバイト**スケールまで機能します。

| セクション | 説明 |
|---------|-------------|
| [概要](/use-cases/observability/clickstack/overview) | ClickStackとその主要機能の紹介 |
| [はじめに](/use-cases/observability/clickstack/getting-started) | クイックスタートガイドと基本的なセットアップ手順 |
| [サンプルデータセット](/use-cases/observability/clickstack/sample-datasets) | サンプルデータセットとユースケース |
| [アーキテクチャ](/use-cases/observability/clickstack/architecture) | システムアーキテクチャとコンポーネントの概要 |
| [デプロイメント](/use-cases/observability/clickstack/deployment) | デプロイメントガイドとオプション |
| [設定](/use-cases/observability/clickstack/config) | 詳細な設定オプションと設定内容 |
| [データの取り込み](/use-cases/observability/clickstack/ingesting-data) | ClickStackへのデータ取り込みに関するガイドライン |
| [検索](/use-cases/observability/clickstack/search) | 可視化データの検索とクエリの方法 |
| [本番環境](/use-cases/observability/clickstack/production) | 本番デプロイメントのベストプラクティス |

## 自分でスタックを構築する {#build-your-own-stack}

**カスタム要件**を持つユーザー（特に特化した取り込みパイプライン、スキーマ設計、または極端なスケーリングニーズなど）には、ClickHouseを中核データベースとして使用したカスタム可視化スタックの構築に関する指針を提供します。

| ページ                                                        | 説明                                                                                                                                                                       |
|-------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [導入](/use-cases/observability/introduction)            | このガイドは、ログとトレースを中心にClickHouseを使用して独自の可視化ソリューションを構築することを考えているユーザーを対象としています。                              |
| [スキーマ設計](/use-cases/observability/schema-design)          | ユーザーがログとトレース用に独自のスキーマを作成することが推奨される理由とそのためのベストプラクティスを学びます。                                                  |
| [データの管理](/observability/managing-data)          | 可視化のためのClickHouseのデプロイは、大規模なデータセットを伴うことが多く、それを管理する必要があります。ClickHouseはデータ管理をサポートする機能を提供しています。           |
| [OpenTelemetryの統合](/observability/integrating-opentelemetry) | ClickHouseを使用したOpenTelemetryによるログとトレースの収集およびエクスポートに関する説明。                                                                                |
| [可視化ツールの使用](/observability/grafana)    | ClickHouseのための可視化ツールの使用方法を学びます。HyperDXやGrafanaを含みます。                                                                                        |
| [デモアプリケーション](/observability/demo-application)    | ClickHouseでのログとトレースに対応するためにフォークされたOpenTelemetryデモアプリケーションを探ります。                                                                       |
