---
slug: /managing-data/delete_mutations
sidebar_label: 削除ミューテーション
title: 削除ミューテーション
hide_title: false
---

削除ミューテーションは、テーブルデータを削除する `ALTER` クエリを指します。特に、`ALTER TABLE DELETE` のようなクエリが含まれます。このようなクエリを実行すると、データパーツの新しいミューテーションバージョンが生成されます。つまり、これらのステートメントはミューテーションが行われる前に挿入された全てのデータに対してデータパーツ全体の書き換えを引き起こすため、大量の書き込みリクエストが発生します。

:::info
削除に関しては、デフォルトの MergeTree テーブルエンジンの代わりに、[ReplacingMergeTree](/guides/replacing-merge-tree) や [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) のような特化したテーブルエンジンを使用することで、これらの大量の書き込みリクエストを回避できます。
:::

import DeleteMutations from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/statements/alter/delete.md';

<DeleteMutations/>
