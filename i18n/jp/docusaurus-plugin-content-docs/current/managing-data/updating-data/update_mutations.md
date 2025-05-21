---
slug: /managing-data/update_mutations
sidebar_label: '更新の変異'
title: '更新の変異'
hide_title: false
description: 'テーブルデータを更新を通じて操作する ALTER クエリについて説明するページ'
---

更新の変異は、テーブルデータを更新を通じて操作する `ALTER` クエリを指します。特に `ALTER TABLE UPDATE` のようなクエリです。このようなクエリを実行すると、新しい変異バージョンのデータパーツが生成されます。つまり、これらのステートメントは、変異の前に挿入されたすべてのデータのために、全体のデータパーツの書き換えをトリガーし、大量の書き込みリクエストを生成することになります。

:::info
更新のためには、デフォルトの MergeTree テーブルエンジンの代わりに、[ReplacingMergeTree](/guides/replacing-merge-tree) や [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) などの専門のテーブルエンジンを使用することで、大量の書き込みリクエストを回避できます。
:::

import UpdateMutations from '@site/docs/sql-reference/statements/alter/update.md';

<UpdateMutations/>
