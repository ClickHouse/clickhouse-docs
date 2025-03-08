---
slug: /managing-data/delete_mutations
sidebar_label: 删除变更
title: 删除变更
hide_title: false
---

删除变更是指通过删除操作操纵表数据的 `ALTER` 查询。最显著的是像 `ALTER TABLE DELETE` 这样的查询。执行这些查询会产生数据片段的新变更版本。这意味着此类语句会触发对所有在变更之前插入的数据整个数据片段的重写，从而导致大量的写请求。

:::info
对于删除操作，您可以通过使用专门的表引擎，如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)，来避免这些大量的写请求，而不是使用默认的 MergeTree 表引擎。
:::

import DeleteMutations from '@site/docs/sql-reference/statements/alter/delete.md';

<DeleteMutations/>
