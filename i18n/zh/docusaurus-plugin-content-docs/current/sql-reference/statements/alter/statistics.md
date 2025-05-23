---
'description': '关于操作列统计信息的文档'
'sidebar_label': 'STATISTICS'
'sidebar_position': 45
'slug': '/sql-reference/statements/alter/statistics'
'title': '操作列统计信息'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 操作列统计信息

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

以下操作可用：

-   `ALTER TABLE [db].table ADD STATISTICS [IF NOT EXISTS] (column list) TYPE (type list)` - 将统计信息描述添加到表的元数据中。

-   `ALTER TABLE [db].table MODIFY STATISTICS (column list) TYPE (type list)` - 修改表的元数据中的统计信息描述。

-   `ALTER TABLE [db].table DROP STATISTICS [IF EXISTS] (column list)` - 从指定列的元数据中删除统计信息，并删除所有部分中指定列的所有统计对象。

-   `ALTER TABLE [db].table CLEAR STATISTICS [IF EXISTS] (column list)` - 删除所有部分中指定列的所有统计对象。可以使用 `ALTER TABLE MATERIALIZE STATISTICS` 重建统计对象。

-   `ALTER TABLE [db.]table MATERIALIZE STATISTICS [IF EXISTS] (column list)` - 重建列的统计信息。实现为 [mutation](../../../sql-reference/statements/alter/index.md#mutations)。

前两个命令是轻量级的，因为它们只更改元数据或删除文件。

此外，它们是被复制的，通过 ZooKeeper 同步统计元数据。

## 示例: {#example}

向两个列添加两种统计信息类型：

```sql
ALTER TABLE t1 MODIFY STATISTICS c, d TYPE TDigest, Uniq;
```

:::note
统计信息仅支持 [`*MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 引擎表（包括 [复制](../../../engines/table-engines/mergetree-family/replication.md) 变体）。
:::
