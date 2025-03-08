---
slug: /managing-data/update_mutations
sidebar_label: 更新变更
title: 更新变更
hide_title: false
---

更新变更是指通过更新操作来操纵表数据的 `ALTER` 查询。最显著的例如 `ALTER TABLE UPDATE` 等。执行这样的查询会生成数据部分的新变异版本。这意味着，此类语句会触发对所有在变更之前插入的数据的整个数据部分的重写，从而导致大量的写请求。

:::info
对于更新，可以通过使用专门的表引擎，例如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)，来避免这些大量的写请求，而不是使用默认的 MergeTree 表引擎。
:::

import UpdateMutations from '@site/docs/sql-reference/statements/alter/update.md';

<UpdateMutations/>
