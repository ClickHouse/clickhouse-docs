---
slug: /use-cases/observability/clickstack/deployment
title: 'デプロイメントオプション'
pagination_prev: null
pagination_next: null
description: 'ClickStack のデプロイ - ClickHouse オブザーバビリティスタック'
doc_type: 'reference'
keywords: ['ClickStack', 'observability']
---

ClickStack には、さまざまなユースケースに対応する複数のデプロイメントオプションがあります。

各デプロイメントオプションの概要を以下に示します。[Getting Started Guide](/use-cases/observability/clickstack/getting-started) では特にオプション 1 と 2 を取り上げています。ここでは完全性のためにすべてのオプションを記載しています。

| Name             | Description                                                                                                          | Suitable For                                                                                         | Limitations                                                                                                 | Example Link                                                                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| All-in-One       | すべての ClickStack コンポーネントをまとめた単一の Docker コンテナ。                                                      | デモ、PoC（概念実証）、本番相当の評価                                                                        | 本番環境には推奨されない                                                                               | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                               |
| ClickHouse Cloud       | ClickHouse と HyperDX が ClickHouse Cloud 上でホストされる構成。                                                      | デモ、ローカルでのフルスタックテスト                                                                        | 本番環境には推奨されない                                                                               | [ClickHouse Cloud](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)                               |
| Helm             | Kubernetes ベースのデプロイメント向け公式 Helm チャート。ClickHouse Cloud および本番環境でのスケーリングをサポート。             | Kubernetes 上での本番デプロイ                                                                   | Kubernetes に関する知識が必要、Helm によるカスタマイズが必要                                                        | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose   | 各 ClickStack コンポーネントを Docker Compose で個別にデプロイ。                                                    | ローカルテスト、PoC、単一サーバーでの本番運用、BYO（持ち込み）ClickHouse                                       | フォールトトレランスなし、複数コンテナの管理が必要                                                    | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only     | 独自の ClickHouse とスキーマを用いて HyperDX を単独で利用。                                                       | 既存の ClickHouse ユーザー、カスタムイベントパイプライン                                                       | ClickHouse は含まれず、ユーザーがインジェストとスキーマを管理する必要がある                                                | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only  | ブラウザとローカルストレージのみで完全に実行。バックエンドや永続化はなし。                                          | デモ、デバッグ、HyperDX を利用した開発                                                                     | 認証なし、永続化なし、アラートなし、単一ユーザーのみ                                                      | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |