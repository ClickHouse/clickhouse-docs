---
'slug': '/managing-data/delete_mutations'
'sidebar_label': '删除变动'
'title': '删除变动'
'hide_title': false
'description': '描述删除变动的页面 - 通过删除操作来操作表数据的ALTER查询'
---

import DeleteMutations from '@site/docs/sql-reference/statements/alter/delete.md';

删除变更是指通过删除操作修改表数据的 `ALTER` 查询。最显著的例子是 `ALTER TABLE DELETE` 等查询。执行此类查询会生成数据部分的新的变更版本。这意味着，这类语句会触发对所有在变更之前插入的数据的整个数据部分的重写，这会导致大量的写请求。

:::info
对于删除操作，您可以通过使用专业的表引擎，例如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)，来避免这些大量的写请求，而不是使用默认的 MergeTree 表引擎。
:::

<DeleteMutations/>
