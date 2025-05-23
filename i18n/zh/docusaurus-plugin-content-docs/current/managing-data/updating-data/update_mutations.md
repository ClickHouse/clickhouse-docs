---
'slug': '/managing-data/update_mutations'
'sidebar_label': '更新变更'
'title': '更新变更'
'hide_title': false
'description': '页面描述更新变更 - ALTER 查询通过更新操作操纵表数据'
---

import UpdateMutations from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/statements/alter/update.md';

更新变更指的是通过更新操作来操纵表数据的 `ALTER` 查询。最显著的是诸如 `ALTER TABLE UPDATE` 的查询。执行这些查询会生成数据部分的新变更版本。这意味着这些语句会触发对在变更之前插入的所有数据的整个数据部分进行重写，从而导致大量写请求。

:::info
对于更新，您可以通过使用专门的表引擎，例如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)，来避免这些大量的写请求，而不是使用默认的 MergeTree 表引擎。
:::

<UpdateMutations/>
