---
sidebar_label: 'FAQ'
description: 'ClickPipes for MongoDB に関するよくある質問'
slug: /integrations/clickpipes/mongodb/faq
sidebar_position: 2
title: 'ClickPipes for MongoDB FAQ'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---



# ClickPipes for MongoDB FAQ

### JSON データ型の個別フィールドをクエリできますか? {#can-i-query-for-individual-fields-in-the-json-datatype}

`{"user_id": 123}` のような直接的なフィールドアクセスには、**ドット記法**を使用できます:

```sql
SELECT doc.user_id as user_id FROM your_table;
```

`{"address": { "city": "San Francisco", "state": "CA" }}` のようなネストされたオブジェクトフィールドへの直接アクセスには、`^` 演算子を使用します:

```sql
SELECT doc.^address.city AS city FROM your_table;
```

集計の場合は、`CAST` 関数または `::` 構文を使用してフィールドを適切な型にキャストします:

```sql
SELECT sum(doc.shipping.cost::Float32) AS total_shipping_cost FROM t1;
```

JSON の操作について詳しくは、[JSON 操作ガイド](./quickstart)を参照してください。

### ClickHouse でネストされた MongoDB ドキュメントをフラット化するにはどうすればよいですか? {#how-do-i-flatten-the-nested-mongodb-documents-in-clickhouse}

MongoDB ドキュメントはデフォルトで ClickHouse に JSON 型として複製され、ネスト構造が保持されます。このデータをフラット化するにはいくつかのオプションがあります。データを列にフラット化したい場合は、通常のビュー、マテリアライズドビュー、またはクエリ時アクセスを使用できます。

1. **通常のビュー**: 通常のビューを使用してフラット化ロジックをカプセル化します。
2. **マテリアライズドビュー**: 小規模なデータセットの場合、[`FINAL` 修飾子](/sql-reference/statements/select/from#final-modifier)を使用した更新可能なマテリアライズドビューを使用して、定期的にデータをフラット化および重複排除できます。大規模なデータセットの場合は、`FINAL` を使用せずに増分マテリアライズドビューを使用してリアルタイムでデータをフラット化し、クエリ時にデータを重複排除することを推奨します。
3. **クエリ時アクセス**: フラット化する代わりに、ドット記法を使用してクエリ内でネストされたフィールドに直接アクセスします。

詳細な例については、[JSON 操作ガイド](./quickstart)を参照してください。

### パブリック IP を持たない、またはプライベートネットワーク内にある MongoDB データベースに接続できますか? {#can-i-connect-mongodb-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

パブリック IP を持たない、またはプライベートネットワーク内にある MongoDB データベースへの接続には AWS PrivateLink をサポートしています。Azure Private Link および GCP Private Service Connect は現在サポートされていません。

### MongoDB データベースからデータベース/テーブルを削除するとどうなりますか? {#what-happens-if-i-delete-a-database-table-from-my-mongodb-database}

MongoDB からデータベース/テーブルを削除すると、ClickPipes は実行を継続しますが、削除されたデータベース/テーブルは変更の複製を停止します。ClickHouse 内の対応するテーブルは保持されます。

### MongoDB CDC Connector はトランザクションをどのように処理しますか? {#how-does-mongodb-cdc-connector-handle-transactions}

トランザクション内の各ドキュメント変更は、ClickHouse に個別に処理されます。変更は oplog に表示される順序で適用され、コミットされた変更のみが ClickHouse に複製されます。MongoDB トランザクションがロールバックされた場合、それらの変更は変更ストリームに表示されません。

その他の例については、[JSON 操作ガイド](./quickstart)を参照してください。

### `resume of change stream was not possible, as the resume point may no longer be in the oplog.` エラーを処理するにはどうすればよいですか? {#resume-point-may-no-longer-be-in-the-oplog-error}

このエラーは通常、oplog が切り詰められ、ClickPipe が期待されるポイントで変更ストリームを再開できない場合に発生します。この問題を解決するには、[ClickPipe を再同期](./resync.md)してください。この問題の再発を防ぐために、[oplog 保持期間を延長する](./source/atlas#enable-oplog-retention)ことを推奨します(セルフマネージド MongoDB を使用している場合は[こちら](./source/generic#enable-oplog-retention))。

### レプリケーションはどのように管理されますか? {#how-is-replication-managed}

データベースの変更を追跡するために、MongoDB のネイティブ Change Streams API を使用しています。Change Streams API は、MongoDB の oplog(操作ログ)を活用して、再開可能なデータベース変更のストリームを提供します。ClickPipe は MongoDB の再開トークンを使用して oplog 内の位置を追跡し、すべての変更が ClickHouse に複製されることを保証します。

### どの読み取り優先設定を使用すればよいですか? {#which-read-preference-should-i-use}

使用する読み取り優先設定は、特定のユースケースによって異なります。プライマリノードの負荷を最小限に抑えたい場合は、`secondaryPreferred` 読み取り優先設定の使用を推奨します。取り込みレイテンシを最適化したい場合は、`primaryPreferred` 読み取り優先設定の使用を推奨します。詳細については、[MongoDB ドキュメント](https://www.mongodb.com/docs/manual/core/read-preference/#read-preference-modes-1)を参照してください。


### MongoDB ClickPipeはシャードクラスターをサポートしていますか？ {#does-the-mongodb-clickpipe-support-sharded-cluster}

はい、MongoDB ClickPipeはレプリカセットとシャードクラスターの両方をサポートしています。
