---
slug: /managing-data/delete_mutations
sidebar_label: '論理削除'
title: '論理削除'
hide_title: false
description: 'テーブルデータを削除するALTERクエリを説明するページ'
---

論理削除は、テーブルデータを削除する `ALTER` クエリを指します。特に、`ALTER TABLE DELETE` のようなクエリが該当します。このようなクエリを実行すると、データパーツの新しい変異バージョンが生成されます。つまり、これらのステートメントは、変異が行われる前に挿入されたすべてのデータに対して、全データパーツの再書き込みをトリガーすることになり、多数の書き込みリクエストが発生します。

:::info
削除のためには、デフォルトの MergeTree テーブルエンジンの代わりに、[ReplacingMergeTree](/guides/replacing-merge-tree) や [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) のような専門のテーブルエンジンを使用することで、これらの大量の書き込みリクエストを回避できます。
:::

import DeleteMutations from '@site/docs/sql-reference/statements/alter/delete.md';

<DeleteMutations/>
