---
slug: /use-cases/observability/clickstack/deployment
title: 'デプロイメントオプション'
pagination_prev: null
pagination_next: null
description: 'ClickStack のデプロイ - ClickHouse オブザーバビリティスタック'
doc_type: 'reference'
keywords: ['ClickStack', 'オブザーバビリティ']
---

ClickStack には、さまざまなユースケースに対応する複数のデプロイメントオプションがあります。

各デプロイメントオプションの概要を以下に示します。[クイックスタートガイド](/use-cases/observability/clickstack/getting-started) では、特にオプション 1 と 2 を扱っています。網羅性のため、ここにも記載しています。

| Name             | Description                                                                                                          | Suitable For                                                                                         | Limitations                                                                                                 | Example Link                                                                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| All-in-One       | すべての ClickStack コンポーネントをバンドルした単一の Docker コンテナ。                                             | 非本番デプロイメント、デモ、PoC（概念実証）                                                            | 本番利用には非推奨                                                                                           | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                               |
| ClickHouse Cloud       | ClickHouse と HyperDX が ClickHouse Cloud 上にホストされる構成。                                             | デモ、ローカルでのフルスタックテスト                                                                  | 本番利用には非推奨                                                                                           | [All-in-One](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)                               |
| Helm             | Kubernetes ベースのデプロイメント用公式 Helm チャート。ClickHouse Cloud と本番環境向けスケーリングをサポート。     | Kubernetes 上での本番デプロイメント                                                                   | Kubernetes の知識が必要、Helm によるカスタマイズが必要                                                      | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose   | 各 ClickStack コンポーネントを、Docker Compose を使って個別にデプロイ。                                              | ローカルテスト、PoC、単一サーバー上での本番運用、BYO ClickHouse                                      | フォールトトレランスなし、複数コンテナの管理が必要                                                           | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only     | 独自の ClickHouse とスキーマを用いて HyperDX を単独で利用。                                                         | 既存の ClickHouse 利用者、カスタムイベントパイプライン                                                 | ClickHouse は含まれないため、インジェストとスキーマを利用者が管理する必要がある                              | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only  | すべてブラウザ内でローカルストレージを使って動作。バックエンドや永続化はなし。                                      | デモ、デバッグ、HyperDX を用いた開発                                                                  | 認証なし、永続化なし、アラートなし、単一ユーザー専用                                                        | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |