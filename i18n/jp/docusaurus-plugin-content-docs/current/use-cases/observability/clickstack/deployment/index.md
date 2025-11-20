---
slug: /use-cases/observability/clickstack/deployment
title: 'デプロイメントオプション'
pagination_prev: null
pagination_next: null
description: 'ClickStack のデプロイ - ClickHouse Observability Stack'
doc_type: 'reference'
keywords: ['ClickStack', 'observability']
---

ClickStack は、さまざまなユースケースに対応する複数のデプロイメントオプションを提供します。

各デプロイメントオプションの概要を以下にまとめます。[Getting Started Guide](/use-cases/observability/clickstack/getting-started) では、特にオプション 1 と 2 を取り上げています。網羅性を持たせるため、ここにも含めています。

| Name             | Description                                                                                                          | Suitable For                                                                                         | Limitations                                                                                                 | Example Link                                                                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| All-in-One       | すべての ClickStack コンポーネントをバンドルした単一の Docker コンテナ。                                                      | 本番デプロイメント、デモ、PoC（概念実証）                                                                        | 本番環境には推奨されない                                                                               | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                               |
| ClickHouse Cloud       | ClickHouse と HyperDX を ClickHouse Cloud 上でホスト。                                                      | デモ、ローカルでのフルスタックテスト                                                                        | 本番環境には推奨されない                                                                               | [All-in-One](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)                               |
| Helm             | Kubernetes ベースのデプロイメント向け公式 Helm チャート。ClickHouse Cloud と本番スケーリングをサポート。             | Kubernetes 上での本番デプロイメント                                                                   | Kubernetes の知識が必要、Helm によるカスタマイズが必要                                                        | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose   | 各 ClickStack コンポーネントを個別に Docker Compose でデプロイ。                                                    | ローカルテスト、PoC、単一サーバーでの本番環境、BYO ClickHouse                                       | フォールトトレランスなし、複数コンテナを自分で管理する必要がある                                                    | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only     | 独自の ClickHouse とスキーマを使用して HyperDX を単独で利用。                                                       | 既存の ClickHouse ユーザー、カスタムイベントパイプライン                                                       | ClickHouse は含まれないため、ユーザーが取り込みとスキーマを管理する必要がある                                                | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only  | すべてブラウザ内でローカルストレージのみを利用して動作。バックエンドや永続化はなし。                                          | デモ、デバッグ、HyperDX を用いた開発                                                                     | 認証なし、永続化なし、アラートなし、単一ユーザーのみ                                                      | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |