---
'description': 'Documentation for Manipulating Key Expressions'
'sidebar_label': 'ORDER BY'
'sidebar_position': 41
'slug': '/sql-reference/statements/alter/order-by'
'title': 'Manipulating Key Expressions'
---




# キー表現の操作

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

このコマンドは、テーブルの [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md) を `new_expression` (式または式のタプル) に変更します。主キーはそのままです。

このコマンドはメタデータのみを変更するという意味で軽量です。データ部分の行がソートキーの式によって整列される特性を維持するために、既存のカラムを含む式をソートキーに追加することはできません (同じ `ALTER` クエリ内で `ADD COLUMN` コマンドによって追加されたカラムのみ、デフォルトのカラム値なしで追加可能です)。

:::note    
この操作は [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリのテーブル ( [レプリケート](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む) にのみ適用されます。
:::
