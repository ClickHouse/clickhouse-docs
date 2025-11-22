---
description: 'キー式の操作方法に関するドキュメント'
sidebar_label: 'ORDER BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/order-by
title: 'キー式の操作'
doc_type: 'reference'
---

# キー式の操作

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

このコマンドはテーブルの[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)を `new_expression`（式、または式のタプル）に変更します。プライマリキーは変わりません。

このコマンドはメタデータだけを変更するという意味で軽量です。データパーツ内の行がソートキー式で並んでいるという性質を維持するため、ソートキーには既存カラムを参照する式を追加することはできません（同じ `ALTER` クエリ内の `ADD COLUMN` コマンドで追加されたカラムのみで、デフォルト値を持たないものに限ります）。

:::note\
これは[`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md)ファミリー（[replicated](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む）のテーブルに対してのみ機能します。
:::
