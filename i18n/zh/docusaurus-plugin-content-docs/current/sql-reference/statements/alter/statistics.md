---
'description': '有关操作列统计信息的文档'
'sidebar_label': 'STATISTICS'
'sidebar_position': 45
'slug': '/sql-reference/statements/alter/statistics'
'title': '操作列统计信息'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 操作列统计信息

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

以下操作是可用的：

-   `ALTER TABLE [db].table ADD STATISTICS [IF NOT EXISTS] (column list) TYPE (type list)` - 向表元数据添加统计描述。

-   `ALTER TABLE [db].table MODIFY STATISTICS (column list) TYPE (type list)` - 修改表元数据的统计描述。

-   `ALTER TABLE [db].table DROP STATISTICS [IF EXISTS] (column list)` - 从指定列的元数据中删除统计信息，并删除所有分片中指定列的所有统计对象。

-   `ALTER TABLE [db].table CLEAR STATISTICS [IF EXISTS] (column list)` - 删除指定列的所有分片中的所有统计对象。可以使用 `ALTER TABLE MATERIALIZE STATISTICS` 重新构建统计对象。

-   `ALTER TABLE [db.]table MATERIALIZE STATISTICS (ALL | [IF EXISTS] (column list))` - 重建列的统计。作为一种 [mutation](../../../sql-reference/statements/alter/index.md#mutations) 实现。

前两个命令是轻量级的，因为它们只更改元数据或删除文件。

此外，它们是复制的，通过 ZooKeeper 同步统计元数据。

## 示例: {#example}

向两个列添加两种统计类型：

```sql
ALTER TABLE t1 MODIFY STATISTICS c, d TYPE TDigest, Uniq;
```

:::note
统计仅支持 [`*MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 引擎表（包括 [复制的](../../../engines/table-engines/mergetree-family/replication.md) 变体）。
:::
