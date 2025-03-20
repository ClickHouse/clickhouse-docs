---
description: '包含关于每个分离表的信息的系统表。'
slug: /operations/system-tables/detached_tables
title: 'system.detached_tables'
keywords: ['系统表', 'detached_tables']
---

包含关于每个分离表的信息。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。

- `table` ([String](../../sql-reference/data-types/string.md)) — 表名。

- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 表的 uuid（原子数据库）。

- `metadata_path` ([String](../../sql-reference/data-types/string.md)) - 文件系统中表元数据的路径。

- `is_permanently` ([UInt8](../../sql-reference/data-types/int-uint.md)) - 表示表是永久分离的标志。

**示例**

```sql
SELECT * FROM system.detached_tables FORMAT Vertical;
```

```text
Row 1:
──────
database:                   base
table:                      t1
uuid:                       81b1c20a-b7c6-4116-a2ce-7583fb6b6736
metadata_path:              /var/lib/clickhouse/store/461/461cf698-fd0b-406d-8c01-5d8fd5748a91/t1.sql
is_permanently:             1
```
