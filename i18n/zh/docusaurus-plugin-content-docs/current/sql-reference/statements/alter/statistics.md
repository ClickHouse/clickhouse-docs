---
description: '用于管理列统计信息的文档'
sidebar_label: '统计信息'
sidebar_position: 45
slug: /sql-reference/statements/alter/statistics
title: '列统计信息管理'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 操作列统计信息

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

可用的操作如下：

-   `ALTER TABLE [db].table ADD STATISTICS [IF NOT EXISTS] (column list) TYPE (type list)` - 将统计信息定义添加到表的元数据中。

-   `ALTER TABLE [db].table MODIFY STATISTICS (column list) TYPE (type list)` - 修改表元数据中的统计信息定义。

-   `ALTER TABLE [db].table DROP STATISTICS [IF EXISTS] (column list)` - 从指定列的元数据中移除统计信息，并删除指定列在所有数据片段（parts）中的所有统计对象。

-   `ALTER TABLE [db].table CLEAR STATISTICS [IF EXISTS] (column list)` - 删除指定列在所有数据片段（parts）中的所有统计对象。可以使用 `ALTER TABLE MATERIALIZE STATISTICS` 重建统计对象。

-   `ALTER TABLE [db.]table MATERIALIZE STATISTICS (ALL | [IF EXISTS] (column list))` - 重建列的统计信息。其实现方式为[变更（mutation）](../../../sql-reference/statements/alter/index.md#mutations)。 

前两个命令开销很小，因为它们只会更改元数据或删除文件。

此外，这些操作会被复制，通过 ZooKeeper 同步统计信息元数据。



## 示例: {#example}

为两列添加两种统计类型：

```sql
ALTER TABLE t1 MODIFY STATISTICS c, d TYPE TDigest, Uniq;
```

:::note
统计功能仅支持 [`*MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 引擎表（包括[复制](../../../engines/table-engines/mergetree-family/replication.md)变体）。
:::
