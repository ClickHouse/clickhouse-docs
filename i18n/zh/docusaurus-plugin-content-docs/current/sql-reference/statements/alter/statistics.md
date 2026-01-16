---
description: '列统计信息管理文档'
sidebar_label: '统计信息'
sidebar_position: 45
slug: /sql-reference/statements/alter/statistics
title: '列统计信息管理'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 操作列统计信息 \\{#manipulating-column-statistics\\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

可以执行以下操作：

* `ALTER TABLE [db].table ADD STATISTICS [IF NOT EXISTS] (column list) TYPE (type list)` - 将统计信息描述添加到表的元数据中。

* `ALTER TABLE [db].table MODIFY STATISTICS (column list) TYPE (type list)` - 修改表元数据中的统计信息描述。

* `ALTER TABLE [db].table DROP STATISTICS [IF EXISTS] (column list)` - 从指定列的元数据中删除统计信息，并删除这些列在所有数据片段（parts）中的所有统计对象。

* `ALTER TABLE [db].table CLEAR STATISTICS [IF EXISTS] (column list)` - 删除指定列在所有数据片段（parts）中的所有统计对象。可以使用 `ALTER TABLE MATERIALIZE STATISTICS` 重建统计对象。

* `ALTER TABLE [db.]table MATERIALIZE STATISTICS (ALL | [IF EXISTS] (column list))` - 为列重建统计信息。作为[变更](../../../sql-reference/statements/alter/index.md#mutations)实现。

前两个命令是轻量级的，因为它们只会更改元数据或删除文件。

此外，这些命令会在副本间复制，通过 ZooKeeper 同步统计信息元数据。

## 示例： \\{#example\\}

向两列添加两种统计类型：

```sql
ALTER TABLE t1 MODIFY STATISTICS c, d TYPE TDigest, Uniq;
```

:::note
仅 [`*MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 引擎表（包括 [replicated](../../../engines/table-engines/mergetree-family/replication.md) 变体）支持统计信息。
:::
