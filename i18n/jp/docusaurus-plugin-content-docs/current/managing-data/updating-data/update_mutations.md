---
slug: /managing-data/update_mutations
sidebar_label: 更新ミューテーション
title: 更新ミューテーション
hide_title: false
---

更新ミューテーションは、テーブルデータを更新を通じて操作する `ALTER` クエリを指します。特に、`ALTER TABLE UPDATE` などのクエリがこのカテゴリに該当します。このようなクエリを実行すると、データパーツの新しいミューテatedバージョンが生成されます。つまり、これらのステートメントは、ミューテーションが行われる前に挿入されたすべてのデータに対して、全データパーツの書き換えを引き起こすことになり、大量の書き込みリクエストを伴うことになります。

:::info
更新の際には、デフォルトの MergeTree テーブルエンジンの代わりに、[ReplacingMergeTree](/guides/replacing-merge-tree) や [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) のような専門的なテーブルエンジンを使用することで、これらの大量の書き込みリクエストを回避できます。
:::

import UpdateMutations from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/statements/alter/update.md';

<UpdateMutations/>
