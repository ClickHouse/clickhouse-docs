---
'slug': '/managing-data/delete_mutations'
'sidebar_label': 'Delete Mutations'
'title': '删除突变'
'hide_title': false
'description': '页面描述删除突变 - ALTER 查询通过删除操作来操控表数据'
---

import DeleteMutations from '@site/i18n/zh/docusaurus-plugin-content-docs/current/sql-reference/statements/alter/delete.md';

Delete mutations refers to `ALTER` 查询，通过删除操作来操纵表数据。最显著的查询是 `ALTER TABLE DELETE` 等。执行此类查询会生成数据片段的新变异版本。这意味着这些语句会触发对所有在变异之前插入的数据的整个数据片段的重写，这将导致大量的写请求。

:::info
对于删除操作，您可以通过使用专用的表引擎，例如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)，来避免这些大量的写请求，而不是使用默认的 MergeTree 表引擎。
:::

<DeleteMutations/>
