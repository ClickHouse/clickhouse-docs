---
slug: /sql-reference/statements/alter/order-by
sidebar_position: 41
sidebar_label: ORDER BY
---

# キー式の操作

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

このコマンドは、テーブルの[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)を `new_expression` （式または式のタプル）に変更します。主キーはそのままです。

このコマンドは、メタデータのみを変更するため、軽量です。データ部分の行がソートキー式によって順序付けられたプロパティを維持するためには、ソートキーに既存のカラムを含む式を追加することはできません（同じ `ALTER` クエリ内で `ADD COLUMN` コマンドによって追加されたカラムのみ、デフォルトのカラム値なしで可）。

:::note    
これは、[`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブル（[レプリケートされた](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む） に対してのみ機能します。
:::
