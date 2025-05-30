---
'slug': '/managing-data/update_mutations'
'sidebar_label': '更新变更'
'title': '更新变更'
'hide_title': false
'description': '页面描述更新变更 - ALTER 查询通过更新操作表数据'
---

import UpdateMutations from '@site/i18n/zh/docusaurus-plugin-content-docs/current/sql-reference/statements/alter/update.md';

更新突变是指通过更新操作 manipulates 表数据的 `ALTER` 查询。最显著的是，像 `ALTER TABLE UPDATE` 这样的查询。执行此类查询会生成数据片段的新突变版本。这意味着，这些语句会触发对所有在突变之前插入的数据的整个数据片段的重写，从而导致大量的写请求。

:::info
对于更新，您可以通过使用专用的表引擎，如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)，来避免这些大量的写请求，而不是使用默认的 MergeTree 表引擎。
:::

<UpdateMutations/>
