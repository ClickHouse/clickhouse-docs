---
slug: '/managing-data/delete_mutations'
sidebar_label: '削除ミューテーション'
title: '削除ミューテーション'
hide_title: false
description: 'テーブルデータを削除によって操作するALTERクエリを説明するページ'
---

import DeleteMutations from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/statements/alter/delete.md';

Delete mutations refers to `ALTER` クエリのことを指し、テーブルデータを削除を通じて操作します。特に、`ALTER TABLE DELETE` などのクエリがこれに該当します。このようなクエリを実行すると、データパーツの新しい変異バージョンが生成されます。これは、これらのステートメントが変異の前に挿入されたすべてのデータのために、全データパーツの再書き込みをトリガーすることを意味し、大量の書き込みリクエストにつながります。

:::info
削除の場合、デフォルトの MergeTree テーブルエンジンの代わりに、[ReplacingMergeTree](/guides/replacing-merge-tree) や [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) のような特殊なテーブルエンジンを使用することで、これらの大量の書き込みリクエストを回避できます。
:::

<DeleteMutations/>
