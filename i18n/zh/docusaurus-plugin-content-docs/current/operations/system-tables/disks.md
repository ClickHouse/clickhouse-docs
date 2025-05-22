---
'description': '系统表包含关于在服务器配置中定义的磁盘的信息'
'keywords':
- 'system table'
- 'disks'
'slug': '/operations/system-tables/disks'
'title': 'system.disks'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含关于在 [服务器配置](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure) 中定义的磁盘的信息。

列：

- `name` ([String](../../sql-reference/data-types/string.md)) — 服务器配置中磁盘的名称。
- `path` ([String](../../sql-reference/data-types/string.md)) — 文件系统中挂载点的路径。
- `free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 磁盘上的可用空间（以字节为单位）。
- `total_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 磁盘容量（以字节为单位）。
- `unreserved_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 未被保留的可用空间（`free_space` 减去当前正在进行的合并、插入和其他磁盘写操作所占用的保留空间大小）。
- `keep_free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 磁盘上应保持的可用空间量（以字节为单位）。在磁盘配置的 `keep_free_space_bytes` 参数中定义。

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
