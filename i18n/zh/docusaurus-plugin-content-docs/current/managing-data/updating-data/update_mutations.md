---
'slug': '/managing-data/update_mutations'
'sidebar_label': '更新变更'
'title': '更新变更'
'hide_title': false
'description': '页面描述更新变更 - ALTER 查询通过更新操作来操纵表数据'
---

import UpdateMutations from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/statements/alter/update.md';

Update mutations refers to `ALTER` 查询，通过更新操作来修改表数据。最显著的例子是 `ALTER TABLE UPDATE` 等查询。执行此类查询将生成数据部分的新变异版本。这意味着这些语句会触发对所有在变异之前插入的数据的整个数据部分的重写，导致大量的写请求。

:::info
对于更新，您可以通过使用专门的表引擎，例如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)，来避免这些大量的写请求，而不是使用默认的 MergeTree 表引擎。
:::

<UpdateMutations/>
