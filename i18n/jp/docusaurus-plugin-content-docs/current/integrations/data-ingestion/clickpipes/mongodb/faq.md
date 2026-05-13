---
sidebar_label: 'よくある質問'
description: 'MongoDB向けClickPipesのよくある質問。'
slug: /integrations/clickpipes/mongodb/faq
sidebar_position: 2
title: 'MongoDB向けClickPipesのよくある質問'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'CDC', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

### JSONデータ型の個々のフィールドに対してクエリできますか？ \{#can-i-query-for-individual-fields-in-the-json-datatype\}

`{"user_id": 123}` のようにフィールドに直接アクセスするには、**ドット記法**を使用できます。

```sql
SELECT doc.user_id as user_id FROM your_table;
```

`{"address": { "city": "San Francisco", "state": "CA" }}` のようなネストされたオブジェクトのフィールドに直接アクセスするには、`^` 演算子を使用します。

```sql
SELECT doc.^address.city AS city FROM your_table;
```

集計する場合は、`CAST` 関数または `::` 構文を使用して、フィールドを適切な型に変換します。

```sql
SELECT sum(doc.shipping.cost::Float32) AS total_shipping_cost FROM t1;
```

JSON の扱いについて詳しくは、[JSON の操作ガイド](./quickstart)を参照してください。

### ClickHouseでネストされたMongoDBドキュメントをフラット化するにはどうすればよいですか？ \{#how-do-i-flatten-the-nested-mongodb-documents-in-clickhouse\}

MongoDBドキュメントは、デフォルトではネスト構造を保持したまま、ClickHouseにJSON型としてレプリケートされます。このデータをフラット化する方法はいくつかあります。データをカラムにフラット化したい場合は、通常のビュー、materialized view、またはクエリ時アクセスを使用できます。

1. **通常のビュー**: フラット化ロジックをカプセル化するには、通常のビューを使用します。
2. **Materialized Views**: 小規模なデータセットでは、[`FINAL` modifier](/sql-reference/statements/select/from#final-modifier) を使用する refreshable materialized view により、データを定期的にフラット化して重複排除できます。大規模なデータセットでは、データをリアルタイムでフラット化するために `FINAL` を使わないインクリメンタルmaterialized view を使用し、その後クエリ時にデータを重複排除することを推奨します。
3. **クエリ時アクセス**: フラット化の代わりに、ドット記法を使用してクエリ内でネストされたフィールドに直接アクセスします。

詳細な例については、[JSON の操作ガイド](./quickstart) を参照してください。

### パブリック IP を持たない、またはプライベートネットワーク内にあるMongoDBデータベースに接続できますか？ \{#can-i-connect-mongodb-databases-that-dont-have-a-public-ip-or-are-in-private-networks\}

パブリック IP を持たない、またはプライベートネットワーク内にあるMongoDBデータベースへの接続では、AWS PrivateLink をサポートしています。Azure Private Link および GCP Private Service Connect は現在サポートされていません。

### MongoDB データベースでデータベース/テーブルを削除するとどうなりますか？ \{#what-happens-if-i-delete-a-database-table-from-my-mongodb-database\}

MongoDB からデータベース/テーブルを削除すると、ClickPipes は引き続き動作しますが、削除されたデータベース/テーブルについては以後の変更がレプリケートされなくなります。ClickHouse 内の対応するテーブルは保持されます。

### MongoDB CDC コネクタはトランザクションをどのように処理しますか？ \{#how-does-mongodb-cdc-connector-handle-transactions\}

トランザクション内の各ドキュメントの変更は、ClickHouse に個別に処理されます。変更は oplog に現れる順序で適用され、コミットされた変更のみが ClickHouse にレプリケートされます。MongoDB のトランザクションがロールバックされた場合、それらの変更は変更ストリームには現れません。

その他の例については、[JSON の操作ガイド](./quickstart)を参照してください。

### `resume of change stream was not possible, as the resume point may no longer be in the oplog.` エラーはどのように対処すればよいですか？ \{#resume-point-may-no-longer-be-in-the-oplog-error\}

このエラーは通常、oplog が切り詰められ、ClickPipe が想定した位置から 変更ストリーム を再開できなくなった場合に発生します。この問題を解決するには、[ClickPipe を再同期します](./resync.md)。再発を防ぐには、oplog の保持期間を延長することを推奨します。[MongoDB Atlas](./source/atlas#enable-oplog-retention)、[セルフマネージド MongoDB](./source/generic#enable-oplog-retention)、または [Amazon DocumentDB](./source/documentdb#configure-change-stream-log-retention) の手順を参照してください。

### レプリケーションはどのように管理されますか？ \{#how-is-replication-managed\}

データベース内の変更を追跡するために、MongoDBのネイティブ Change Streams API を使用します。Change Streams API は、MongoDB の oplog (operations log) を利用して、再開可能なデータベース変更ストリームを提供します。ClickPipe は MongoDB の resume token を使用して oplog 内の位置を追跡し、すべての変更が確実に ClickHouse にレプリケートされるようにします。

### どの read preference を使用すればよいですか？ \{#which-read-preference-should-i-use\}

どの read preference を使用するかは、具体的なユースケースによって異なります。プライマリノードの負荷を最小限に抑えたい場合は、`secondaryPreferred` read preference の使用を推奨します。インジェストのレイテンシを最適化したい場合は、`primaryPreferred` read preference の使用を推奨します。詳細については、[MongoDB のドキュメント](https://www.mongodb.com/docs/manual/core/read-preference/#read-preference-modes-1)を参照してください。

### MongoDB ClickPipe は分片クラスターに対応していますか？ \{#does-the-mongodb-clickpipe-support-sharded-cluster\}

はい、MongoDB ClickPipe は Replica Set と分片クラスターの両方に対応しています。

### MongoDB ClickPipe は Amazon DocumentDB をサポートしていますか？ \{#documentdb-support\}

はい、MongoDB ClickPipe は Amazon DocumentDB 5.0 をサポートしています。詳細は、[Amazon DocumentDB ソースセットアップガイド](./source/documentdb.md)を参照してください。

### MongoDB ClickPipe は PrivateLink をサポートしていますか？ \{#privatelink-support\}

AWS の MongoDB (および DocumentDB) クラスターでのみ、PrivateLink をサポートしています。

単一ノードのリレーショナルデータベースとは異なり、MongoDB クライアントは、設定された `ReadPreference` を有効に機能させるために、レプリカセットの検出に成功する必要がある点に注意してください。そのため、MongoDB クライアントがレプリカセット接続を正常に確立し、接続先のノードが停止した場合に別のノードへ切り替えられるようにするには、クラスター内のすべてのノードで PrivateLink をセットアップする必要があります。

クラスター内の単一ノードへの接続を優先する場合は、ClickPipes のセットアップ時に接続文字列で `/?directConnection=true` を指定することで、レプリカセットの検出を省略できます。この場合の PrivateLink のセットアップは、単一ノードのリレーショナルデータベースの場合と同様で、PrivateLink を利用する最も簡単な方法です。

レプリカセット接続の場合、MongoDB の PrivateLink は VPC Resource または VPC Endpoint Service のいずれかでセットアップできます。VPC Resource を使用する場合は、`GROUP` リソース設定に加えて、クラスター内の各ノードごとに `CHILD` リソース設定を作成する必要があります。VPC Endpoint Service を使用する場合は、クラスター内の各ノードごとに個別の Endpoint Service (および個別の NLB) を作成する必要があります。

詳細については、[AWS PrivateLink for ClickPipes](../aws-privatelink.md) のドキュメントを参照してください。支援が必要な場合は、ClickHouse Support までお問い合わせください。