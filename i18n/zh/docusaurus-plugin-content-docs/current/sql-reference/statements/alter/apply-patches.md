---
description: '关于从轻量级更新中应用补丁的文档'
sidebar_label: 'APPLY PATCHES'
sidebar_position: 47
slug: /sql-reference/statements/alter/apply-patches
title: '应用轻量级更新补丁'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] APPLY PATCHES [IN PARTITION partition_id]
```

该命令会手动触发由 [轻量级 `UPDATE`](/sql-reference/statements/update) 语句创建的补丁分区片段的物理物化。它通过仅重写受影响的列，强制将待处理补丁应用到数据分区片段上。

:::note

* 该命令仅适用于 [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 系列表（包括[复制](../../../engines/table-engines/mergetree-family/replication.md)表）。
* 这是一种数据变更操作，会在后台异步执行。
  :::


## 何时使用 APPLY PATCHES \{#when-to-use\}

:::tip
通常情况下，你不需要使用 `APPLY PATCHES`
:::

当启用（默认）[`apply_patches_on_merge`](/operations/settings/merge-tree-settings#apply_patches_on_merge) 设置时，补丁分区片段通常会在合并过程中自动应用。不过，在以下场景中，你可能希望手动触发补丁应用：

- 降低在执行 `SELECT` 查询时应用补丁的开销
- 在补丁分区片段累积之前先将多个补丁分区片段合并
- 在备份或导出数据前，将补丁预先物化到数据中
- 当 `apply_patches_on_merge` 被禁用且你希望自行控制补丁应用时

## 示例 \{#examples\}

对某张表应用所有未应用的补丁：

```sql
ALTER TABLE my_table APPLY PATCHES;
```

仅对特定分区应用补丁：

```sql
ALTER TABLE my_table APPLY PATCHES IN PARTITION '2024-01';
```

与其他操作配合使用：

```sql
ALTER TABLE my_table APPLY PATCHES, UPDATE column = value WHERE condition;
```


## 监控补丁应用 \{#monitor\}

您可以通过 [`system.mutations`](/operations/system-tables/mutations) 表监控补丁应用的进度：

```sql
SELECT * FROM system.mutations
WHERE table = 'my_table' AND command LIKE '%APPLY PATCHES%';
```


## 另请参阅 \{#see-also\}

- [轻量级 `UPDATE`](/sql-reference/statements/update) - 通过轻量级更新创建补丁分区片段
- [`apply_patches_on_merge` 设置](/operations/settings/merge-tree-settings#apply_patches_on_merge) - 控制在合并过程中自动应用补丁