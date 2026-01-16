---
sidebar_label: 'FAQ'
description: 'ClickPipes for MongoDB に関するよくある質問。'
slug: /integrations/clickpipes/mongodb/faq
sidebar_position: 2
title: 'ClickPipes for MongoDB FAQ'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'cdc', 'インジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# MongoDB 向け ClickPipes よくある質問 (FAQ) \{#clickpipes-for-mongodb-faq\}

### JSON データ型の個々のフィールドをクエリできますか？ \{#can-i-query-for-individual-fields-in-the-json-datatype\}

`{"user_id": 123}` のようにフィールドに直接アクセスする場合は、**ドット記法**を使用できます。

```sql
SELECT doc.user_id as user_id FROM your_table;
```

`{"address": { "city": "San Francisco", "state": "CA" }}` のような入れ子オブジェクトのフィールドに直接アクセスするには、`^` 演算子を使用します。

```sql
SELECT doc.^address.city AS city FROM your_table;
```

集計を行うには、`CAST` 関数または `::` 構文を使用してフィールドを適切な型にキャストしてください。

```sql
SELECT sum(doc.shipping.cost::Float32) AS total_shipping_cost FROM t1;
```

JSON の扱いについて詳しくは、[JSON の利用ガイド](./quickstart) を参照してください。


### ClickHouse でネストされた MongoDB ドキュメントをフラット化するにはどうすればよいですか？ \{#how-do-i-flatten-the-nested-mongodb-documents-in-clickhouse\}

MongoDB ドキュメントは、デフォルトでは ClickHouse に JSON 型としてレプリケートされ、ネストされた構造が保持されます。このデータをフラット化する方法はいくつかあります。データをカラムにフラット化したい場合は、通常のビュー、マテリアライズドビュー、またはクエリ時のアクセスを使用できます。

1. **通常のビュー**: フラット化ロジックをカプセル化するために通常のビューを使用します。
2. **マテリアライズドビュー**: 小規模なデータセットの場合は、[`FINAL` 修飾子](/sql-reference/statements/select/from#final-modifier) を使用したリフレッシュ可能なマテリアライズドビューを利用して、定期的にデータをフラット化し重複排除できます。大規模なデータセットでは、`FINAL` なしのインクリメンタルmaterialized view を使用してリアルタイムにデータをフラット化し、重複排除はクエリ時に行うことを推奨します。
3. **クエリ時のアクセス**: フラット化の代わりに、ドット記法を使ってクエリ内でネストされたフィールドに直接アクセスします。

詳細なサンプルについては、[JSON の利用ガイド](./quickstart) を参照してください。

### パブリック IP を持たない、またはプライベートネットワーク内にある MongoDB データベースに接続できますか？ \{#can-i-connect-mongodb-databases-that-dont-have-a-public-ip-or-are-in-private-networks\}

パブリック IP を持たない、またはプライベートネットワーク内にある MongoDB データベースへの接続には、AWS PrivateLink による接続をサポートしています。Azure Private Link と GCP Private Service Connect は現時点ではサポートしていません。

### MongoDB データベースからデータベースやテーブルを削除した場合はどうなりますか？ \{#what-happens-if-i-delete-a-database-table-from-my-mongodb-database\}

MongoDB からデータベース／テーブルを削除しても、ClickPipes 自体は動作を継続しますが、削除されたデータベース／テーブルについては変更のレプリケーションが行われなくなります。ClickHouse 側の対応するテーブルは保持されます。

### MongoDB CDC Connector はトランザクションをどのように処理しますか？ \{#how-does-mongodb-cdc-connector-handle-transactions\}

トランザクション内の各ドキュメント変更は、個別に ClickHouse へ送信・処理されます。変更は oplog に現れる順序で適用され、コミットされた変更のみが ClickHouse へレプリケートされます。MongoDB のトランザクションがロールバックされた場合、その変更はチェンジストリームには現れません。

より多くの例については、[JSON の利用ガイド](./quickstart) を参照してください。

### `resume of change stream was not possible, as the resume point may no longer be in the oplog.` エラーはどのように対処すればよいですか？ \{#resume-point-may-no-longer-be-in-the-oplog-error\}

このエラーは通常、oplog が切り詰められ、ClickPipe が期待するポイントからチェンジストリームを再開できない場合に発生します。この問題を解決するには、[ClickPipe を再同期](./resync.md) してください。この問題が再発しないようにするため、oplog の保持期間を延長することを推奨します。詳細な手順は、[MongoDB Atlas](./source/atlas#enable-oplog-retention)、[セルフマネージド MongoDB](./source/generic#enable-oplog-retention)、[Amazon DocumentDB](./source/documentdb#configure-change-stream-log-retention) を参照してください。

### レプリケーションはどのように管理されていますか？ \{#how-is-replication-managed\}

データベース内の変更を追跡するために、MongoDB のネイティブな Change Streams API を使用しています。Change Streams API は、MongoDB の oplog（オペレーションログ）を利用して、データベース変更の再開可能なストリームを提供します。ClickPipe は MongoDB の resume token を使用して oplog 内での位置を追跡し、すべての変更が ClickHouse にレプリケートされることを保証します。

### どの read preference を使用すべきですか？ \{#which-read-preference-should-i-use\}

どの read preference を使用するかは、特定のユースケースによって異なります。プライマリノードへの負荷を最小化したい場合は、`secondaryPreferred` read preference の使用を推奨します。インジェスト遅延を最適化したい場合は、`primaryPreferred` read preference の使用を推奨します。詳細については、[MongoDB ドキュメント](https://www.mongodb.com/docs/manual/core/read-preference/#read-preference-modes-1) を参照してください。

### MongoDB ClickPipe はシャードクラスタをサポートしていますか？ \{#does-the-mongodb-clickpipe-support-sharded-cluster\}

はい、MongoDB ClickPipe は Replica Set と Sharded Cluster の両方をサポートしています。

### MongoDB ClickPipe は Amazon DocumentDB をサポートしていますか？ \{#documentdb-support\}

はい、MongoDB ClickPipe は Amazon DocumentDB 5.0 をサポートしています。詳細は [Amazon DocumentDB source setup guide](./source/documentdb.md) を参照してください。

### MongoDB ClickPipe は PrivateLink をサポートしていますか？ \{#privatelink-support\}

MongoDB（および DocumentDB）クラスタに対する PrivateLink サポートは、AWS 上のみ提供しています。 

単一ノード構成のリレーショナルデータベースとは異なり、MongoDB クライアントは、設定された `ReadPreference` を正しく適用するために、Replica Set の検出に成功している必要がある点に注意してください。これを実現するには、クラスタ内のすべてのノードに対して PrivateLink を設定し、MongoDB クライアントが Replica Set への接続を正常に確立できるようにするとともに、接続中のノードがダウンした際に別ノードへリダイレクトできるようにする必要があります。

クラスタ内の単一ノードに接続したい場合は、ClickPipes のセットアップ時に接続文字列で `/?directConnection=true` を指定することで、Replica Set の検出をスキップできます。この場合の PrivateLink 設定は単一ノード構成のリレーショナルデータベースと同様となり、PrivateLink を利用するうえで最も簡易なオプションです。

Replica Set 接続を行う場合、MongoDB 向けの PrivateLink は VPC Resource または VPC Endpoint Service のいずれかで構成できます。VPC Resource を利用する場合は、`GROUP` リソース構成を 1 つ作成し、さらにクラスタ内の各ノードごとに `CHILD` リソース構成を作成する必要があります。VPC Endpoint Service を利用する場合は、クラスタ内の各ノードごとに個別の Endpoint Service（および個別の NLB）を作成する必要があります。 

詳細については [AWS PrivateLink for ClickPipes](../aws-privatelink.md) ドキュメントを参照してください。支援が必要な場合は ClickHouse サポートまでお問い合わせください。