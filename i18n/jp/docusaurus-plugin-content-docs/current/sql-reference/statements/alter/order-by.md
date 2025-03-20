---
slug: /sql-reference/statements/alter/order-by
sidebar_position: 41
sidebar_label: ORDER BY
---


# キー式の操作

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

このコマンドは、テーブルの [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md) を `new_expression` （表現または表現のタプル）に変更します。主キーはそのままです。

このコマンドは、メタデータのみを変更するという意味で軽量です。データ部分の行がソートキーの式によって順序付けられる特性を保持するためには、ソートキーに既存のカラムを含む式を追加することはできません（同じ `ALTER` クエリ内の `ADD COLUMN` コマンドによって追加されたカラムのみ、デフォルトカラム値なしで可能です）。

:::note    
この機能は [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブル（[レプリケート](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む）にのみ適用されます。
:::
