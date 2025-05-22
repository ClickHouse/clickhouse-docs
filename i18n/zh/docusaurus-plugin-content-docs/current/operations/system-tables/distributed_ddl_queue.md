包含关于在集群上执行的 [分布式 DDL 查询 (ON CLUSTER 子句)](../../sql-reference/distributed-ddl.md) 的信息。

列:

- `entry` ([String](../../sql-reference/data-types/string.md)) — 查询 ID。
- `entry_version` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) - 入口的版本
- `initiator_host` ([Nullable(String)](../../sql-reference/data-types/string.md)) - 发起 DDL 操作的主机
- `initiator_port` ([Nullable(UInt16)](../../sql-reference/data-types/int-uint.md)) - 发起者使用的端口
- `cluster` ([String](../../sql-reference/data-types/string.md)) — 集群名称。
- `query` ([String](../../sql-reference/data-types/string.md)) — 执行的查询。
- `settings` ([Map(String, String)](../../sql-reference/data-types/map.md)) - 在 DDL 操作中使用的设置
- `query_create_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 查询创建时间。
- `host` ([String](../../sql-reference/data-types/string.md)) — 主机名
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 主机端口。
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — 查询的状态。
- `exception_code` ([Enum8](../../sql-reference/data-types/enum.md)) — 异常代码。
- `exception_text` ([Nullable(String)](../../sql-reference/data-types/string.md)) - 异常消息
- `query_finish_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 查询结束时间。
- `query_duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 查询执行的持续时间（以毫秒为单位）。

**示例**

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
