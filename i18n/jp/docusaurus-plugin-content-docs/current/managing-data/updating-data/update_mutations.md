---
slug: '/managing-data/update_mutations'
sidebar_label: '更新ミューテーション'
title: '更新ミューテーション'
hide_title: false
description: 'テーブルデータを更新を通じて操作するALTERクエリに関するページ'
---

import UpdateMutations from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/statements/alter/update.md';

更新変異は、テーブルデータを更新する `ALTER` クエリを指します。特に `ALTER TABLE UPDATE` のようなクエリが含まれます。このようなクエリを実行すると、データパーツの新しい変異バージョンが生成されます。つまり、これらのステートメントは、変異の前に挿入されたすべてのデータに対して、全データパーツの再書き込みを引き起こすことになります。これは、大量の書き込みリクエストにつながります。

:::info
更新では、デフォルトの MergeTree テーブルエンジンの代わりに、[ReplacingMergeTree](/guides/replacing-merge-tree) や [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) のような専門のテーブルエンジンを使用することで、これらの大量の書き込みリクエストを回避することができます。
:::

<UpdateMutations/>
