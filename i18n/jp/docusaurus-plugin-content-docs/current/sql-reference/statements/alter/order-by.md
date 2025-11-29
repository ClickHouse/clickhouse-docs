---
description: 'キー式の操作方法に関するドキュメント'
sidebar_label: 'ORDER BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/order-by
title: 'キー式の操作'
doc_type: 'reference'
---

# キー式の操作 {#manipulating-key-expressions}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

このコマンドは、テーブルの [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md) を `new_expression`（式、または式のタプル）に変更します。プライマリキーはそのまま変更されません。

このコマンドはメタデータだけを変更するため、処理は軽量です。データパーツ内の行がソートキーの式で並び替えられているという性質を保つために、既存の列を含む式をソートキーに追加することはできません（同じ `ALTER` クエリ内の `ADD COLUMN` コマンドで追加された列のみ、かつデフォルト値を持たない列だけを使用できます）。

:::note\
このコマンドは、[`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[レプリケート](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む）のテーブルに対してのみ動作します。
:::
