---
slug: /managing-data/update_mutations
sidebar_label: 更新ミューテーション
title: 更新ミューテーション
hide_title: false
---

更新ミューテーションは、テーブルデータを更新するための `ALTER` クエリを指します。特に、`ALTER TABLE UPDATE` のようなクエリが該当します。このようなクエリを実行すると、データパーツの新しいミューテーションバージョンが生成されます。これは、ミューテーションの前に挿入されたすべてのデータに対して、データパーツ全体の書き換えが引き起こされることを意味し、大量の書き込みリクエストにつながります。

:::info
更新を行う際には、デフォルトの MergeTree テーブルエンジンの代わりに、[ReplacingMergeTree](/guides/replacing-merge-tree) や [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) のような専門のテーブルエンジンを使用することで、これらの大量の書き込みリクエストを回避できます。
:::

import UpdateMutations from '@site/i18n/ja/docusaurus-plugin-content-docs/current/sql-reference/statements/alter/update.md';

<UpdateMutations/>
