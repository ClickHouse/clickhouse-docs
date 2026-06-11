---
title: 'ClickHouse データアクセス (BYOC)'
slug: /cloud/reference/byoc/reference/clickhouse_data_access
sidebar_label: 'ClickHouse データアクセス'
keywords: ['BYOC', 'bring your own cloud', 'データアクセス', '従業員アクセス', 'system.query_log', 'アクセスのトラブルシューティング', 'コンプライアンス']
description: 'BYOC デプロイメントにおいて ClickHouse の従業員が顧客データに対して持つアクセス'
doc_type: 'reference'
---

ClickHouse の従業員は、デフォルトではお客様のデータにアクセスできません。すべてのユーザーテーブルとクエリ結果を含むお客様の ClickHouse データは、お客様の VPC 内に保持されます。ClickHouse がお客様のデプロイメントとやり取りする経路は、以下で説明するものに限られます。これらのいずれも、顧客テーブルデータへのアクセスを許可するものではありません。

## 定常運用 \{#routine-operations\}

ClickHouse Cloud のコントロールプレーンは、顧客データを読み取ることなく BYOC デプロイメントを運用します。VPC の外部にデータを送信するコンポーネントが扱うのは、運用メタデータのみです。

| コンポーネント         | VPC から外部に送信されるもの                                            |
| --------------- | ----------------------------------------------------------- |
| State exporter  | ClickHouse Cloud が所有する `SQS` キューに送信されるサービスの状態 (正常性、ステータス) 。 |
| Billing scraper | ClickHouse Cloud が所有する S3 バケットに送信される CPU とメモリのメトリクス。        |
| AlertManager    | ClickHouse Cloud に送信されるクラスターの正常性アラート。                       |

クエリトラフィック、テーブルの内容、スキーマがこれらのチャネルを通ることはありません。ログとメトリクスは BYOC VPC 内にとどまります。

## トラブルシューティングアクセス \{#troubleshooting-access\}

ClickHouseのエンジニアがデプロイメントの問題を診断する必要がある場合は、社内のエスカレーションおよび承認ワークフローを通じて、必要な時点に限ったアクセスを申請します。承認されたアクセスは、有効期限付きの証明書を使って付与され、[Tailscale](/cloud/reference/byoc/reference/network_security#tailscale-private-network) 経由でルーティングされます。公開インターネットを経由することはありません。

### エンジニアが閲覧できるもの \{#what-engineers-can-see\}

承認されたトラブルシューティングアクセスがある場合、エンジニアは ClickHouse のシステムテーブルのみを参照できます。これには次のものが含まれます。

* `system.query_log` — サービスに対して実行されたクエリのクエリテキストと実行メタデータ
* `system.tables`、`system.columns`、および同様のシステムテーブル — スキーマとメタデータ
* 診断に使用されるその他の `system.*` テーブル (例: パーツ、ミューテーション、レプリカ)

### エンジニアが参照できないもの \{#what-engineers-cant-see\}

エンジニアは顧客のユーザーテーブルを参照できません。アクセスできるのはシステムテーブルのみです。

### アクセス制御の仕組み \{#how-access-is-enforced\}

* **承認が必要**: すべてのアクセス要求は、指定された承認者による社内承認プロセスを経る必要があります。エンジニアが自分でアクセス権を付与することはできません。
* **有効期限付き証明書**: 承認された各セッションごとに、一時的な有効期限付き証明書が発行されます。アクセスは自動的に失効します。
* **証明書ベースの認証**: BYOC インスタンスへの人によるアクセスはすべて、パスワードベースではなく証明書ベースの認証を使用します。
* **システムテーブルは読み取り専用**: 証明書のIDは、システムテーブル の読み取りのみに限定されます。
* **データはエクスポートされない**: トラブルシューティングセッションの logs やクエリ結果が ClickHouse インフラストラクチャにエクスポートされて戻されることはありません。

## 監査 \{#auditing\}

エンジニアのアクティビティはお客様から確認でき、ClickHouse によって監査されています。

* **お客様から確認可能**: ClickHouse のエンジニアがお客様のインスタンスで実行したすべてのクエリは、クエリテキストと証明書 ID を含めて、お客様自身の `system.query_log` に記録されます。お客様はこれを ClickHouse サービスから直接監査できます。
* **ClickHouse 側**: ClickHouse のセキュリティチームは、すべてのアクセス要求、承認、Tailscale 接続を内部で記録し、監査しています。

## 今後の制御機能 \{#future-controls\}

お客様が各エンジニアのアクセス要求を有効化前に都度承認する「顧客管理の承認」機能は、今後のロードマップに含まれています。現時点では、承認は ClickHouse の社内エスカレーションプロセスを通じて行われます。

## 関連 \{#related\}

* [BYOC ネットワークセキュリティ](/cloud/reference/byoc/reference/network_security) — Tailscale とネットワーク境界の仕組み
* [BYOC 権限](/cloud/reference/byoc/reference/privilege) — BYOC のセットアップ時に作成される IAM ロール