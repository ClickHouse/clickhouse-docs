---
'sidebar_label': 'FAQ'
'description': 'MongoDBのためのClickPipesに関するよくある質問。'
'slug': '/integrations/clickpipes/mongodb/faq'
'sidebar_position': 2
'title': 'ClickPipes for MongoDB FAQ'
'doc_type': 'reference'
---


# ClickPipes for MongoDB FAQ

### JSONデータ型の個々のフィールドをクエリできますか？ {#can-i-query-for-individual-fields-in-the-json-datatype}

直接フィールドにアクセスする場合、例えば`{"user_id": 123}`のように、**ドット表記**を使用できます：
```sql
SELECT doc.user_id as user_id FROM your_table;
```
ネストされたオブジェクトフィールドに直接アクセスするには、例えば`{"address": { "city": "San Francisco", "state": "CA" }}`のように、`^`演算子を使用します：
```sql
SELECT doc.^address.city AS city FROM your_table;
```
集約を行うには、`CAST`関数または`::`構文でフィールドを適切な型にキャストします：
```sql
SELECT sum(doc.shipping.cost::Float32) AS total_shipping_cost FROM t1;
```
JSONの操作に関する詳細は、[JSONの操作ガイド](./quickstart)をご覧ください。

### ClickHouseでネストされたMongoDBドキュメントをフラット化するにはどうすればよいですか？ {#how-do-i-flatten-the-nested-mongodb-documents-in-clickhouse}

MongoDBドキュメントはデフォルトでJSON型としてClickHouseにレプリケートされ、ネストされた構造を保持します。このデータをフラット化するためのいくつかのオプションがあります。データをカラムにフラット化したい場合は、通常のビュー、マテリアライズドビュー、またはクエリ時アクセスを使用できます。

1. **通常のビュー**: 通常のビューを使用してフラット化ロジックをカプセル化します。
2. **マテリアライズドビュー**: 小規模なデータセットの場合は、[`FINAL`修飾子](/sql-reference/statements/select/from#final-modifier)を使用して定期的にデータをフラット化し、重複を排除することができるリフレッシュ可能なマテリアライズドビューを使用できます。大規模なデータセットには、リアルタイムでデータをフラット化し、クエリ時にデータを重複排除するために、`FINAL`なしのインクリメンタルマテリアライズドビューの使用をお勧めします。
3. **クエリ時アクセス**: フラット化する代わりに、ドット表記を使用してクエリ内でネストされたフィールドに直接アクセスします。

詳細な例については、[JSONの操作ガイド](./quickstart)をご覧ください。

### 公開IPがないMongoDBデータベースやプライベートネットワークに接続できますか？ {#can-i-connect-mongodb-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

公開IPがないMongoDBデータベースやプライベートネットワークに接続するためにAWS PrivateLinkをサポートしています。現在、Azure Private LinkおよびGCP Private Service Connectはサポートしていません。

### MongoDBデータベースからデータベース/テーブルを削除した場合はどうなりますか？ {#what-happens-if-i-delete-a-database-table-from-my-mongodb-database}

MongoDBからデータベース/テーブルを削除すると、ClickPipesは引き続き実行されますが、削除されたデータベース/テーブルは変更のレプリケーションを停止します。ClickHouseの対応するテーブルは保持されます。

### MongoDB CDCコネクタはトランザクションをどのように処理しますか？ {#how-does-mongodb-cdc-connector-handle-transactions}

トランザクション内の各ドキュメント変更は、ClickHouseに個別に処理されます。変更はoplogに現れる順序で適用され、コミットされた変更のみがClickHouseにレプリケートされます。MongoDBのトランザクションがロールバックされた場合、その変更は変更ストリームには現れません。

詳細な例については、[JSONの操作ガイド](./quickstart)をご覧ください。

### `resume of change stream was not possible, as the resume point may no longer be in the oplog.`エラーをどのように処理しますか？ {#resume-point-may-no-longer-be-in-the-oplog-error}

このエラーは通常、oplogが切り詰められ、ClickPipeが予想されるポイントで変更ストリームを再開できない場合に発生します。この問題を解決するには、[ClickPipeを再同期](./resync.md)してください。この問題が再発しないように、[oplog保持期間を延長することをお勧めします](./source/atlas#enable-oplog-retention)（またはセルフマネージドMongoDBを利用している場合は[こちら](./source/generic#enable-oplog-retention)を参照してください）。

### レプリケーションはどのように管理されていますか？ {#how-is-replication-managed}

MongoDBのネイティブなChange Streams APIを使用して、データベースの変更を追跡します。Change Streams APIはMongoDBのoplog（操作ログ）を利用して、データベース変更の再開可能なストリームを提供します。ClickPipeはMongoDBの再開トークンを使用してoplog内の位置を追跡し、すべての変更がClickHouseにレプリケートされることを確実にします。

### どの読み取り優先順位を使用すべきですか？ {#which-read-preference-should-i-use}

使用する読み取り優先順位は特定のユースケースによります。プライマリノードへの負荷を最小限に抑えたい場合は、`secondaryPreferred`読み取り優先順位の使用をお勧めします。インジェスト遅延を最適化したい場合は、`primaryPreferred`読み取り優先順位の使用をお勧めします。詳細については、[MongoDBのドキュメント](https://www.mongodb.com/docs/manual/core/read-preference/#read-preference-modes-1)をご覧ください。

### MongoDB ClickPipeはシャーディッドクラスターをサポートしていますか？ {#does-the-mongodb-clickpipe-support-sharded-cluster}
はい、MongoDB ClickPipeはレプリカセットとシャーディッドクラスターの両方をサポートしています。
