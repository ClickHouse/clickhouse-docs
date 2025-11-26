---
slug: /use-cases/observability/clickstack/deployment
title: 'デプロイメントオプション'
pagination_prev: null
pagination_next: null
description: 'ClickStack のデプロイ - ClickHouse オブザーバビリティスタック'
doc_type: 'reference'
keywords: ['ClickStack', 'observability']
---

ClickStack は、さまざまなユースケースに対応する複数のデプロイメントオプションを提供します。

各デプロイメントオプションの概要を以下に示します。[はじめにガイド](/use-cases/observability/clickstack/getting-started)では、特にオプション 1 と 2 を取り上げています。網羅性のため、ここにも含めています。

| Name             | Description                                                                                                          | Suitable For                                                                                         | Limitations                                                                                                 | Example Link                                                                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| All-in-One       | すべての ClickStack コンポーネントをバンドルした単一の Docker コンテナ。                                                      | 本番デプロイメント、デモ、PoC（概念実証）                                                                        | 本番環境での利用は推奨されない                                                                               | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                               |
| ClickHouse Cloud       | ClickHouse Cloud 上で ClickHouse と HyperDX をホスティング。                                                      | デモ、ローカルでのフルスタックテスト                                                                        | 本番環境での利用は推奨されない                                                                               | [ClickHouse Cloud](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)                               |
| Helm             | Kubernetes ベースのデプロイメント向け公式 Helm チャート。ClickHouse Cloud と本番向けスケーリングをサポート。             | Kubernetes 上での本番デプロイメント                                                                   | Kubernetes の知識が必要、カスタマイズは Helm 経由で実施                                                        | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose   | 各 ClickStack コンポーネントを Docker Compose を用いて個別にデプロイ。                                                    | ローカルテスト、PoC、単一サーバーでの本番、BYO ClickHouse                                       | フォールトトレランスなし、複数コンテナの管理が必要                                                    | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only     | 独自の ClickHouse とスキーマと組み合わせて、HyperDX を単独で利用。                                                       | 既存の ClickHouse ユーザー、カスタムイベントパイプライン                                                       | ClickHouse は含まれない、ユーザーがインジェストとスキーマを管理する必要がある                                                | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only  | すべてブラウザ内でローカルストレージのみを使用して実行。バックエンドや永続化はなし。                                          | デモ、デバッグ、HyperDX を用いた開発                                                                     | 認証なし、永続化なし、アラートなし、単一ユーザーのみ                                                      | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |