---
'slug': '/managing-data/delete_mutations'
'sidebar_label': '删除变更'
'title': '删除变更'
'hide_title': false
'description': '页面描述删除变更 - 操作通过删除来操纵表数据的 ALTER 查询'
---

import DeleteMutations from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/statements/alter/delete.md';

Delete mutations refers to `ALTER` 查询，通过删除操作来操纵表数据。最显著的例子是 `ALTER TABLE DELETE` 等查询。执行此类查询将生成数据部分的新变异版本。这意味着这些语句会触发对所有在变更之前插入的数据的整个数据部分的重写，从而产生大量的写请求。

:::info
对于删除操作，您可以通过使用专用的表引擎，如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)，来避免这些大量的写请求，而不是使用默认的 MergeTree 表引擎。
:::

<DeleteMutations/>
