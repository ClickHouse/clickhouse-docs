---
'description': '系统表，包含在服务器配置中定义的磁盘信息'
'keywords':
- 'system table'
- 'disks'
'slug': '/operations/system-tables/disks'
'title': 'system.disks'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含在 [服务器配置](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure) 中定义的磁盘信息。

列：

- `name` ([String](../../sql-reference/data-types/string.md)) — 服务器配置中磁盘的名称。
- `path` ([String](../../sql-reference/data-types/string.md)) — 文件系统中挂载点的路径。
- `free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 磁盘上的可用空间（以字节为单位）。
- `total_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 磁盘的总容量（以字节为单位）。
- `unreserved_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 未被保留的可用空间（`free_space` 减去因合并、插入及其他当前正在进行的磁盘写入操作而占用的保留空间的大小）。
- `keep_free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 磁盘上应保持的可用空间（以字节为单位）。在磁盘配置的 `keep_free_space_bytes` 参数中定义。

**示例**

```sql
SELECT * FROM system.disks;
```

```response
┌─name────┬─path─────────────────┬───free_space─┬──total_space─┬─keep_free_space─┐
│ default │ /var/lib/clickhouse/ │ 276392587264 │ 490652508160 │               0 │
└─────────┴──────────────────────┴──────────────┴──────────────┴─────────────────┘

1 rows in set. Elapsed: 0.001 sec.
```
