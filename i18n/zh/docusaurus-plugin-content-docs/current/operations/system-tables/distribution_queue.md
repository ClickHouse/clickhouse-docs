---
'description': '系统表，包含关于在队列中等待发送到分片的本地文件的信息。'
'keywords':
- 'system table'
- 'distribution_queue'
'slug': '/operations/system-tables/distribution_queue'
'title': 'system.distribution_queue'
'doc_type': 'reference'
---

包含有关在队列中待发送到分片的本地文件的信息。这些本地文件包含通过异步模式向分布式表插入新数据而创建的新分区。

列:

- `database` ([String](../../sql-reference/data-types/string.md)) — 数据库名称。

- `table` ([String](../../sql-reference/data-types/string.md)) — 表名称。

- `data_path` ([String](../../sql-reference/data-types/string.md)) — 本地文件所在文件夹的路径。

- `is_blocked` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 标志，指示是否阻止将本地文件发送到服务器。

- `error_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 错误的数量。

- `data_files` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 文件夹中本地文件的数量。

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 本地文件中压缩数据的大小，以字节为单位。

- `broken_data_files` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 被标记为损坏的文件数量（由于错误）。

- `broken_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 损坏文件中压缩数据的大小，以字节为单位。

- `last_exception` ([String](../../sql-reference/data-types/string.md)) — 关于发生的最后一个错误的文本消息（如果有的话）。

**示例**

```sql
SELECT * FROM system.distribution_queue LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
database:              default
table:                 dist
data_path:             ./store/268/268bc070-3aad-4b1a-9cf2-4987580161af/default@127%2E0%2E0%2E2:9000/
is_blocked:            1
error_count:           0
data_files:            1
data_compressed_bytes: 499
last_exception:
```

**另见**

- [分布式表引擎](../../engines/table-engines/special/distributed.md)
