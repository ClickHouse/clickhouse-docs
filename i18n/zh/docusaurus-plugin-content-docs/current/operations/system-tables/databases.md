包含当前用户可用数据库的信息。

列：

- `name` ([String](../../sql-reference/data-types/string.md)) — 数据库名称。
- `engine` ([String](../../sql-reference/data-types/string.md)) — [数据库引擎](../../engines/database-engines/index.md)。
- `data_path` ([String](../../sql-reference/data-types/string.md)) — 数据路径。
- `metadata_path` ([String](../../sql-reference/data-types/enum.md)) — 元数据路径。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 数据库 UUID。
- `comment` ([String](../../sql-reference/data-types/enum.md)) — 数据库注释。
- `engine_full` ([String](../../sql-reference/data-types/enum.md)) — 数据库引擎的参数。
- `database` ([String](../../sql-reference/data-types/string.md)) – `name` 的别名。

此系统表中的 `name` 列用于实现 `SHOW DATABASES` 查询。

**示例**

创建一个数据库。

```sql
CREATE DATABASE test;
```

检查用户可用的所有数据库。

```sql
SELECT * FROM system.databases;
```

```text
┌─name────────────────┬─engine─────┬─data_path────────────────────┬─metadata_path─────────────────────────────────────────────────────────┬─uuid─────────────────────────────────┬─engine_full────────────────────────────────────────────┬─comment─┐
│ INFORMATION_SCHEMA  │ Memory     │ /data/clickhouse_data/       │                                                                       │ 00000000-0000-0000-0000-000000000000 │ Memory                                                 │         │
│ default             │ Atomic     │ /data/clickhouse_data/store/ │ /data/clickhouse_data/store/f97/f97a3ceb-2e8a-4912-a043-c536e826a4d4/ │ f97a3ceb-2e8a-4912-a043-c536e826a4d4 │ Atomic                                                 │         │
│ information_schema  │ Memory     │ /data/clickhouse_data/       │                                                                       │ 00000000-0000-0000-0000-000000000000 │ Memory                                                 │         │
│ replicated_database │ Replicated │ /data/clickhouse_data/store/ │ /data/clickhouse_data/store/da8/da85bb71-102b-4f69-9aad-f8d6c403905e/ │ da85bb71-102b-4f69-9aad-f8d6c403905e │ Replicated('some/path/database', 'shard1', 'replica1') │         │
│ system              │ Atomic     │ /data/clickhouse_data/store/ │ /data/clickhouse_data/store/b57/b5770419-ac7a-4b67-8229-524122024076/ │ b5770419-ac7a-4b67-8229-524122024076 │ Atomic                                                 │         │
└─────────────────────┴────────────┴──────────────────────────────┴───────────────────────────────────────────────────────────────────────┴──────────────────────────────────────┴────────────────────────────────────────────────────────┴─────────┘

```
