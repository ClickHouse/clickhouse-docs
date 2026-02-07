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

各デプロイメントオプションの概要を以下に示します。[Getting Started Guide](/use-cases/observability/clickstack/getting-started) では、特にオプション 1 と 2 を取り上げています。網羅性を期すため、ここでもあらためて一覧に含めています。

| Name             | Description                                                                                                          | Suitable For                                                                                         | Limitations                                                                                                 | Example Link                                                                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| Managed ClickStack       | ClickHouse と ClickStack UI (HyperDX) が ClickHouse Cloud 上でホストされます。                                                      | 本番環境でのデプロイメント、デモ、PoC (概念実証)                                                                        | なし                                                                               | [Managed](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)                               |
| All-in-One       | すべての ClickStack コンポーネントをバンドルした単一の Docker コンテナです。                                                      | 非本番環境でのデプロイメント、デモ、PoC (概念実証)                                                                        | 本番環境での使用は推奨されません                                                                               | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                               |
| Helm             | Kubernetes ベースのデプロイメント向け公式 Helm チャートです。ClickHouse Cloud および本番規模へのスケーリングをサポートします。             | Kubernetes 上での本番環境デプロイメント                                                                   | Kubernetes の知識が必要、Helm によるカスタマイズ前提                                                        | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose   | 各 ClickStack コンポーネントを Docker Compose 経由で個別にデプロイします。                                                    | ローカルテスト、PoC (概念実証)、単一サーバーでの本番環境、既存の ClickHouse 環境の活用                                       | フォールトトレランスがない、複数コンテナの管理が必要                                                    | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only     | 独自の ClickHouse およびスキーマと組み合わせて HyperDX のみを使用します。                                                       | 既存の ClickHouse ユーザー、カスタムイベントパイプライン                                                       | ClickHouse は含まれず、ユーザーがインジェストとスキーマを管理する必要がある                                                | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only  | すべてブラウザ内でローカルストレージを使って実行します。バックエンドや永続化はありません。                                          | デモ、デバッグ、HyperDX を利用した開発                                                                     | 認証なし、永続化なし、アラートなし、単一ユーザーのみ                                                      | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |