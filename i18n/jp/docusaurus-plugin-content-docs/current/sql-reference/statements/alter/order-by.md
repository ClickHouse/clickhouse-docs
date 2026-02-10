---
description: 'キー式の操作に関するドキュメント'
sidebar_label: 'ORDER BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/order-by
title: 'キー式の操作'
doc_type: 'reference'
---

# キー式の操作 \{#manipulating-key-expressions\}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

このコマンドはテーブルの[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)を `new_expression`（1 つの式または式のタプル）に変更します。プライマリキーはそのままです。

このコマンドはメタデータのみを変更するという意味で軽量です。データパートの行がソートキー式で順序付けられているという特性を維持するため、既存のカラムを含む式をソートキーに追加することはできません（同じ `ALTER` クエリ内で `ADD COLUMN` コマンドにより追加されたカラムのみ、かつデフォルト値を持たないカラムに限ります）。

:::note
これは [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[replicated](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む）のテーブルでのみ動作します。
:::
