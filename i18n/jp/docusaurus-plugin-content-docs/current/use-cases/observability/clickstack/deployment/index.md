---
slug: /use-cases/observability/clickstack/deployment
title: 'デプロイオプション'
pagination_prev: null
pagination_next: null
description: 'ClickStack のデプロイ方法 - ClickHouse オブザーバビリティスタック'
doc_type: 'reference'
keywords: ['ClickStack', 'observability']
---

ClickStack には、さまざまなユースケースに対応する複数のデプロイオプションがあります。

各デプロイオプションの概要を以下に示します。[Getting Started Guide](/use-cases/observability/clickstack/getting-started) では、特にオプション 1 と 2 を扱っています。完全性を期すために、ここにも掲載しています。

| Name             | Description                                                                                                          | Suitable For                                                                                         | Limitations                                                                                                 | Example Link                                                                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| All-in-One       | すべての ClickStack コンポーネントをバンドルした単一の Docker コンテナ。                                                      | 本番デプロイ、デモ、PoC（概念実証）                                                                        | 本番環境での利用は推奨されない                                                                               | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                               |
| ClickHouse Cloud       | ClickHouse と HyperDX を ClickHouse Cloud 上でホストする構成。                                                      | デモ、ローカルでのフルスタックテスト                                                                        | 本番環境での利用は推奨されない                                                                               | [All-in-One](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)                               |
| Helm             | Kubernetes ベースのデプロイメント向け公式 Helm チャート。ClickHouse Cloud と本番向けスケーリングをサポート。             | Kubernetes 上での本番デプロイ                                                                   | Kubernetes に関する知識が必要、Helm によるカスタマイズが必要                                                        | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose   | 各 ClickStack コンポーネントを個別に Docker Compose でデプロイ。                                                    | ローカルテスト、PoC、単一サーバーでの本番運用、既存 ClickHouse の持ち込み（BYO ClickHouse）                                       | フォールトトレランスなし、複数コンテナの管理が必要                                                    | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only     | 独自の ClickHouse とスキーマを使用して HyperDX を単独で利用。                                                       | 既存の ClickHouse ユーザー、カスタムイベントパイプライン                                                       | ClickHouse は含まれないため、ユーザーが取り込みとスキーマを管理する必要がある                                                | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only  | すべてブラウザ内で動作し、ローカルストレージのみを使用。バックエンドや永続化はなし。                                          | デモ、デバッグ、HyperDX を用いた開発                                                                     | 認証なし、永続化なし、アラートなし、単一ユーザー専用                                                      | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |