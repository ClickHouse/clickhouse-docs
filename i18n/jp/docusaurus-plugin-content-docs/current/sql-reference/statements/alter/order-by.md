---
description: 'キー式の操作に関するドキュメント'
sidebar_label: 'ORDER BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/order-by
title: 'キー式の操作'
---


# キー式の操作

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

このコマンドは、テーブルの[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)を `new_expression`（式または式のタプル）に変更します。主キーはそのままです。

このコマンドはメタデータのみを変更するため、軽量です。データパートの行がソートキー式によって順序付けられている特性を保つためには、既存のカラムを含む式をソートキーに追加することはできません（同じ`ALTER`クエリ内の`ADD COLUMN`コマンドで追加されたカラムのみが可能です。ただし、デフォルトカラム値は含まれません）。

:::note    
これは[`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md)ファミリーのテーブル（[レプリケートされた](../../../engines/table-engines/mergetree-family/replication.md)テーブルを含む）に対してのみ機能します。
:::
