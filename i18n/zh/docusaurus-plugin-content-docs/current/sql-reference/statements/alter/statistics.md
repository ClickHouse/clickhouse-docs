---
slug: /sql-reference/statements/alter/statistics
sidebar_position: 45
sidebar_label: '统计信息'
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 操作列统计信息

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

以下操作可用：

-   `ALTER TABLE [db].table ADD STATISTICS [IF NOT EXISTS] (column list) TYPE (type list)` - 向表的元数据中添加统计描述。

-   `ALTER TABLE [db].table MODIFY STATISTICS (column list) TYPE (type list)` - 修改表的元数据中的统计描述。

-   `ALTER TABLE [db].table DROP STATISTICS [IF EXISTS] (column list)` - 从指定列的元数据中移除统计信息，并删除所有分区中指定列的所有统计对象。

-   `ALTER TABLE [db].table CLEAR STATISTICS [IF EXISTS] (column list)` - 删除指定列在所有分区中的所有统计对象。可使用 `ALTER TABLE MATERIALIZE STATISTICS` 重建统计对象。

-   `ALTER TABLE [db.]table MATERIALIZE STATISTICS [IF EXISTS] (column list)` - 为列重建统计信息。作为 [mutation](../../../sql-reference/statements/alter/index.md#mutations) 实现。

前两个命令是轻量级的，因为它们仅更改元数据或删除文件。

此外，它们是可复制的，通过 ZooKeeper 同步统计元数据。

## 示例: {#example}

向两个列添加两种统计类型：

```sql
ALTER TABLE t1 MODIFY STATISTICS c, d TYPE TDigest, Uniq;
```

:::note
统计信息仅支持 [`*MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 引擎表（包括 [复制](../../../engines/table-engines/mergetree-family/replication.md) 变体）。
:::
