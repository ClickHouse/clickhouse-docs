---
'description': 'システムテーブルは、クラスターで実行された分散 ddl クエリ（ON CLUSTER 句を使用するクエリ）に関する情報を含みます。'
'keywords':
- 'system table'
- 'distributed_ddl_queue'
'slug': '/operations/system-tables/distributed_ddl_queue'
'title': 'system.distributed_ddl_queue'
'doc_type': 'reference'
---

クラスタで実行された [distributed ddl queries (ON CLUSTER clause)](../../sql-reference/distributed-ddl.md) に関する情報を含みます。

カラム:

- `entry` ([String](../../sql-reference/data-types/string.md)) — クエリ ID.
- `entry_version` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) - エントリのバージョン
- `initiator_host` ([Nullable(String)](../../sql-reference/data-types/string.md)) - DDL 操作を開始したホスト
- `initiator_port` ([Nullable(UInt16)](../../sql-reference/data-types/int-uint.md)) - イニシエータによって使用されるポート
- `cluster` ([String](../../sql-reference/data-types/string.md)) — クラスタ名.
- `query` ([String](../../sql-reference/data-types/string.md)) — 実行されたクエリ.
- `settings` ([Map(String, String)](../../sql-reference/data-types/map.md)) - DDL 操作で使用された設定
- `query_create_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — クエリ作成時間.
- `host` ([String](../../sql-reference/data-types/string.md)) — ホスト名
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — ホストポート.
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — クエリのステータス.
- `exception_code` ([Enum8](../../sql-reference/data-types/enum.md)) — 例外コード.
- `exception_text` ([Nullable(String)](../../sql-reference/data-types/string.md)) - 例外メッセージ
- `query_finish_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — クエリ終了時間.
- `query_duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — クエリ実行時間 (ミリ秒単位).

**例**

```sql
SELECT *
FROM system.distributed_ddl_queue
WHERE cluster = 'test_cluster'
LIMIT 2
FORMAT Vertical

Query id: f544e72a-6641-43f1-836b-24baa1c9632a

Row 1:
──────
entry:             query-0000000000
entry_version:     5
initiator_host:    clickhouse01
initiator_port:    9000
cluster:           test_cluster
query:             CREATE DATABASE test_db UUID '4a82697e-c85e-4e5b-a01e-a36f2a758456' ON CLUSTER test_cluster
settings:          {'max_threads':'16','use_uncompressed_cache':'0'}
query_create_time: 2023-09-01 16:15:14
host:              clickhouse-01
port:              9000
status:            Finished
exception_code:    0
exception_text:    
query_finish_time: 2023-09-01 16:15:14
query_duration_ms: 154

Row 2:
──────
entry:             query-0000000001
entry_version:     5
initiator_host:    clickhouse01
initiator_port:    9000
cluster:           test_cluster
query:             CREATE DATABASE test_db UUID '4a82697e-c85e-4e5b-a01e-a36f2a758456' ON CLUSTER test_cluster
settings:          {'max_threads':'16','use_uncompressed_cache':'0'}
query_create_time: 2023-09-01 16:15:14
host:              clickhouse-01
port:              9000
status:            Finished
exception_code:    630
exception_text:    Code: 630. DB::Exception: Cannot drop or rename test_db, because some tables depend on it:
query_finish_time: 2023-09-01 16:15:14
query_duration_ms: 154

2 rows in set. Elapsed: 0.025 sec.
```
