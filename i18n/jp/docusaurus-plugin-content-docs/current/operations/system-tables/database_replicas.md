---
'description': 'システムテーブルは、レプリケートされたデータベースに関する情報とステータスを含んでいます。'
'keywords':
- 'system table'
- 'database_replicas'
'slug': '/operations/system-tables/database_replicas'
'title': 'system.database_replicas'
'doc_type': 'reference'
---

各レプリケートデータベースのレプリカに関する情報を含みます。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — レプリケートデータベースの名前。

- `is_readonly` ([UInt8](../../sql-reference/data-types/int-uint.md)) - データベースレプリカが読み取り専用モードにあるかどうか。
    このモードは、設定にZookeeper/ClickHouse Keeperのセクションがない場合にオンになります。

- `is_session_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) - ClickHouse Keeperとのセッションが期限切れになりました。基本的には `is_readonly` と同じです。

- `max_log_ptr` ([UInt32](../../sql-reference/data-types/int-uint.md)) - 一般的な活動のログにおける最大エントリ番号。

- `zookeeper_path` ([String](../../sql-reference/data-types/string.md)) - ClickHouse Keeperにおけるデータベースデータへのパス。

- `replica_name` ([String](../../sql-reference/data-types/string.md)) - ClickHouse Keeperにおけるレプリカ名。

- `replica_path` ([String](../../sql-reference/data-types/string.md)) - ClickHouse Keeperにおけるレプリカデータへのパス。

- `zookeeper_exception` ([String](../../sql-reference/data-types/string.md)) - ClickHouse Keeperから情報を取得する際にエラーが発生した場合に得られる最後の例外メッセージ。

- `total_replicas` ([UInt32](../../sql-reference/data-types/int-uint.md)) - このデータベースの既知のレプリカの総数。

- `log_ptr` ([UInt32](../../sql-reference/data-types/int-uint.md)) - レプリカが実行キューにコピーした一般的な活動のログにおける最大エントリ番号に1を加えたもの。

**例**

```sql
SELECT * FROM system.database_replicas FORMAT Vertical;
```

```text
Row 1:
──────
database:            db_2
is_readonly:         0
max_log_ptr:         2
replica_name:        replica1
replica_path:        /test/db_2/replicas/shard1|replica1
zookeeper_path:      /test/db_2
shard_name:          shard1
log_ptr:             2
total_replicas:      1
zookeeper_exception: 
is_session_expired:  0
```
