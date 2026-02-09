---
slug: /use-cases/observability/clickstack/deployment/oss
title: 'オープンソースのデプロイメントオプション'
pagination_prev: null
pagination_next: null
description: 'オープンソース版 ClickStack のデプロイ - ClickHouse オブザーバビリティ スタック'
doc_type: 'reference'
keywords: ['ClickStack', 'オブザーバビリティ', 'Open Source']
---

オープンソース版 ClickStack では、さまざまなユースケースに対応する複数のデプロイメントオプションを提供しています。

各デプロイメントオプションの概要を以下に示します。[Open Source Getting Started Guide](/use-cases/observability/clickstack/getting-started/oss) では、参考のためここにも記載しているオプション 1 について具体的に説明しています。

| Name             | Description                                                                                                          | Suitable For                                                                                         | Limitations                                                                                                 | Example Link                                                                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| All-in-One       | すべての ClickStack コンポーネントをバンドルした単一の Docker コンテナ。                                                     | 本番以外のデプロイ、デモ、PoC（概念実証）                                                                 | 本番環境には非推奨                                                                                           | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                               |
| Helm             | Kubernetes ベースのデプロイメント向け公式 Helm チャート。ClickHouse Cloud と本番環境でのスケーリングをサポート。            | Kubernetes 上での本番デプロイ                                                                           | Kubernetes に関する知識が必要、カスタマイズは Helm 経由                                                      | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose   | 各 ClickStack コンポーネントを Docker Compose を使って個別にデプロイ。                                                     | ローカルテスト、PoC、単一サーバー上での本番運用、BYO ClickHouse                                          | フォールトトレランスなし、複数コンテナの管理が必要                                                            | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only     | 独自の ClickHouse とスキーマを用いて HyperDX を単独で利用。                                                              | 既存の ClickHouse ユーザー、カスタムイベントパイプライン                                                | ClickHouse は含まれないため、ユーザーがインジェストとスキーマを管理する必要がある                            | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only  | 完全にブラウザ内で動作し、ローカルストレージのみを使用。バックエンドや永続化はなし。                                        | デモ、デバッグ、HyperDX を用いた開発                                                                     | 認証なし、永続化なし、アラートなし、単一ユーザー専用                                                          | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |