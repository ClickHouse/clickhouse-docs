---
slug: /managing-data/delete_mutations
sidebar_label: 削除変異
title: 削除変異
hide_title: false
---

削除変異とは、テーブルデータを削除を通じて操作する `ALTER` クエリを指します。特に、`ALTER TABLE DELETE` のようなクエリです。このようなクエリを実行すると、データパーツの新しい変異バージョンが生成されます。これは、これらのステートメントが変異前に挿入されたすべてのデータのために、全データパーツの再書き込みを引き起こすことを意味し、大量の書き込みリクエストを必要とします。

:::info
削除の場合、デフォルトの MergeTree テーブルエンジンの代わりに、[ReplacingMergeTree](/guides/replacing-merge-tree) や [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) のような専門のテーブルエンジンを使用することで、これらの大量の書き込みリクエストを回避できます。
:::

import DeleteMutations from '@site/i18n/ja/docusaurus-plugin-content-docs/current/sql-reference/statements/alter/delete.md';

<DeleteMutations/>
