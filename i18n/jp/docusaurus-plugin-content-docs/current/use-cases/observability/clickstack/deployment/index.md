---
'slug': '/use-cases/observability/clickstack/deployment'
'title': 'デプロイメントオプション'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStackをデプロイする - ClickHouseの可観測性スタック'
'doc_type': 'reference'
---

ClickStackは、さまざまなユースケースに適した複数のデプロイオプションを提供します。

各デプロイオプションの概要は以下の通りです。[Getting Started Guide](/use-cases/observability/clickstack/getting-started)では、特にオプション1と2が示されています。こちらにも完全性のために含めています。

| 名前              | 説明                                                                                                              | 適した用途                                                                                         | 制限事項                                                                                                         | 例のリンク                                                                                                                                     |
|------------------|------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| All-in-One       | すべてのClickStackコンポーネントがバンドルされた単一のDockerコンテナ。                                            | プロダクションデプロイメント、デモ、プロトタイプ                                                      | プロダクションには推奨されません                                                                                | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                                    |
| ClickHouse Cloud       | ClickHouseとHyperDXがClickHouse Cloudでホスティングされる。                                                    | デモ、ローカルのフルスタックテスト                                                                    | プロダクションには推奨されません                                                                                | [All-in-One](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)                                    |
| Helm             | Kubernetesベースのデプロイメント用の公式Helmチャート。ClickHouse Cloudおよびプロダクションスケーリングをサポート。  | Kubernetesでのプロダクションデプロイメント                                                         | Kubernetesの知識が必要、Helmによるカスタマイズ                                                               | [Helm](/use-cases/observability/clickstack/deployment/helm)                                           |
| Docker Compose   | Docker Composeを使用して各ClickStackコンポーネントを個別にデプロイ。                                              | ローカルテスト、プロトタイプ、単一サーバーでのプロダクション、BYO ClickHouse                              | フォールトトレランスなし、複数のコンテナの管理が必要                                                          | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                          |
| HyperDX Only     | 自分のClickHouseおよびスキーマを使用してHyperDXを独立して利用。                                                | 既存のClickHouseユーザー、カスタムイベントパイプライン                                               | ClickHouseは含まれず、ユーザーが取り込みとスキーマの管理を行う必要がある                                      | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                              |
| Local Mode Only  | ブラウザ内で完全に実行され、ローカルストレージを使用。バックエンドや永続性はなし。                               | デモ、デバッグ、HyperDXを使用した開発                                                                  | 認証なし、永続性なし、アラートなし、単一ユーザーのみ                                                        | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                        | 

After comparing the original text with the translation, everything appears accurate, with no content, links, or specific terms omitted or altered incorrectly. All guidelines have been followed.
