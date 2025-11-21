---
sidebar_label: 'FAQ'
description: 'ClickPipes for MongoDB に関するよくある質問です。'
slug: /integrations/clickpipes/mongodb/faq
sidebar_position: 2
title: 'ClickPipes for MongoDB に関するよくある質問 (FAQ)'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---



# ClickPipes for MongoDB FAQ

### JSON データ型の個別フィールドをクエリできますか？ {#can-i-query-for-individual-fields-in-the-json-datatype}

`{"user_id": 123}` のような直接的なフィールドアクセスには、**ドット記法**を使用できます：

```sql
SELECT doc.user_id as user_id FROM your_table;
```

`{"address": { "city": "San Francisco", "state": "CA" }}` のようなネストされたオブジェクトフィールドへの直接アクセスには、`^` 演算子を使用します：

```sql
SELECT doc.^address.city AS city FROM your_table;
```

集計処理では、`CAST` 関数または `::` 構文を使用してフィールドを適切な型にキャストします：

```sql
SELECT sum(doc.shipping.cost::Float32) AS total_shipping_cost FROM t1;
```

JSON の操作について詳しくは、[JSON 操作ガイド](./quickstart)を参照してください。

### ClickHouse でネストされた MongoDB ドキュメントをフラット化するにはどうすればよいですか？ {#how-do-i-flatten-the-nested-mongodb-documents-in-clickhouse}

MongoDB ドキュメントはデフォルトで JSON 型として ClickHouse に複製され、ネスト構造が保持されます。このデータをフラット化するにはいくつかの方法があります。データを列にフラット化したい場合は、通常のビュー、マテリアライズドビュー、またはクエリ時アクセスを使用できます。

1. **通常のビュー**：通常のビューを使用してフラット化ロジックをカプセル化します。
2. **マテリアライズドビュー**：小規模なデータセットの場合、[`FINAL` 修飾子](/sql-reference/statements/select/from#final-modifier)を使用した更新可能なマテリアライズドビューで定期的にデータをフラット化および重複排除できます。大規模なデータセットの場合は、`FINAL` を使用せずに増分マテリアライズドビューでリアルタイムにデータをフラット化し、クエリ時にデータを重複排除することを推奨します。
3. **クエリ時アクセス**：フラット化する代わりに、ドット記法を使用してクエリ内でネストされたフィールドに直接アクセスします。

詳細な例については、[JSON 操作ガイド](./quickstart)を参照してください。

### パブリック IP を持たない、またはプライベートネットワーク内にある MongoDB データベースに接続できますか？ {#can-i-connect-mongodb-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

パブリック IP を持たない、またはプライベートネットワーク内にある MongoDB データベースへの接続には AWS PrivateLink をサポートしています。Azure Private Link および GCP Private Service Connect は現在サポートされていません。

### MongoDB データベースからデータベース/テーブルを削除するとどうなりますか？ {#what-happens-if-i-delete-a-database-table-from-my-mongodb-database}

MongoDB からデータベース/テーブルを削除すると、ClickPipes は引き続き実行されますが、削除されたデータベース/テーブルの変更の複製は停止します。ClickHouse 内の対応するテーブルは保持されます。

### MongoDB CDC Connector はトランザクションをどのように処理しますか？ {#how-does-mongodb-cdc-connector-handle-transactions}

トランザクション内の各ドキュメント変更は個別に ClickHouse に処理されます。変更は oplog に現れる順序で適用され、コミットされた変更のみが ClickHouse に複製されます。MongoDB トランザクションがロールバックされた場合、それらの変更は変更ストリームに表示されません。

その他の例については、[JSON 操作ガイド](./quickstart)を参照してください。

### `resume of change stream was not possible, as the resume point may no longer be in the oplog.` エラーを処理するにはどうすればよいですか？ {#resume-point-may-no-longer-be-in-the-oplog-error}

このエラーは通常、oplog が切り詰められ、ClickPipe が期待されるポイントで変更ストリームを再開できない場合に発生します。この問題を解決するには、[ClickPipe を再同期](./resync.md)してください。この問題の再発を防ぐには、oplog 保持期間を延長することを推奨します。[MongoDB Atlas](./source/atlas#enable-oplog-retention)、[セルフマネージド MongoDB](./source/generic#enable-oplog-retention)、または [Amazon DocumentDB](./source/documentdb#configure-change-stream-log-retention) の手順を参照してください。

### レプリケーションはどのように管理されますか？ {#how-is-replication-managed}

データベースの変更を追跡するために MongoDB のネイティブ Change Streams API を使用しています。Change Streams API は、MongoDB の oplog（操作ログ）を活用して、再開可能なデータベース変更のストリームを提供します。ClickPipe は MongoDB の再開トークンを使用して oplog 内の位置を追跡し、すべての変更が ClickHouse に複製されることを保証します。

### どの読み取り設定を使用すればよいですか？ {#which-read-preference-should-i-use}

使用する読み取り設定は、特定のユースケースによって異なります。プライマリノードの負荷を最小限に抑えたい場合は、`secondaryPreferred` 読み取り設定の使用を推奨します。取り込みレイテンシを最適化したい場合は、`primaryPreferred` 読み取り設定の使用を推奨します。詳細については、[MongoDB ドキュメント](https://www.mongodb.com/docs/manual/core/read-preference/#read-preference-modes-1)を参照してください。


### MongoDB ClickPipeはシャーデッドクラスターをサポートしていますか？ {#does-the-mongodb-clickpipe-support-sharded-cluster}

はい、MongoDB ClickPipeはレプリカセットとシャーデッドクラスターの両方をサポートしています。

### MongoDB ClickPipeはAmazon DocumentDBをサポートしていますか？ {#documentdb-support}

はい、MongoDB ClickPipeはAmazon DocumentDB 5.0をサポートしています。詳細については、[Amazon DocumentDBソースセットアップガイド](./source/documentdb.md)を参照してください。

### MongoDB ClickPipeはPrivateLinkをサポートしていますか？ {#privatelink-support}

PrivateLinkは、AWS上のMongoDB(およびDocumentDB)クラスターに対してのみサポートしています。

単一ノードのリレーショナルデータベースとは異なり、MongoDBクライアントは設定された`ReadPreference`を適用するために、レプリカセットの検出が成功する必要があることに注意してください。そのため、MongoDBクライアントがレプリカセット接続を正常に確立し、接続中のノードがダウンした際に別のノードへリダイレクトできるよう、クラスター内のすべてのノードでPrivateLinkを設定する必要があります。

クラスター内の単一ノードへの接続を希望する場合は、ClickPipesセットアップ時に接続文字列に`/?directConnection=true`を指定することで、レプリカセットの検出をスキップできます。この場合のPrivateLinkセットアップは単一ノードのリレーショナルデータベースと同様となり、PrivateLinkサポートの最もシンプルなオプションです。

レプリカセット接続の場合、VPCリソースまたはVPCエンドポイントサービスのいずれかを使用してMongoDBのPrivateLinkを設定できます。VPCリソースを使用する場合は、`GROUP`リソース設定と、クラスター内の各ノードに対する`CHILD`リソース設定を作成する必要があります。VPCエンドポイントサービスを使用する場合は、クラスター内の各ノードに対して個別のエンドポイントサービス(および個別のNLB)を作成する必要があります。

詳細については、[ClickPipes用AWS PrivateLink](../aws-privatelink.md)のドキュメントを参照してください。サポートが必要な場合は、ClickHouseサポートまでお問い合わせください。
