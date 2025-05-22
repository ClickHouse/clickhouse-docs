---
'slug': '/managing-data/delete_mutations'
'sidebar_label': 'Delete Mutations'
'title': '删除变更'
'hide_title': false
'description': '页面描述删除变更 - ALTER 查询，通过删除操作来操作表数据'
---

import DeleteMutations from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/statements/alter/delete.md';

Delete mutations 指的是通过删除操作操纵表数据的 `ALTER` 查询。最显著的查询如 `ALTER TABLE DELETE` 等。执行这样的查询将产生数据部分的新变异版本。这意味着这样的语句会触发对所有在变异之前插入的数据的整个数据部分的重写，从而产生大量的写入请求。

:::info
对于删除，可以通过使用专门的表引擎，如 [ReplacingMergeTree](/guides/replacing-merge-tree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)，来避免这些大量的写入请求，而不是使用默认的 MergeTree 表引擎。
:::

<DeleteMutations/>
