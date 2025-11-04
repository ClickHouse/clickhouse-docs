---
'description': 'Manipulating Key Expressions のドキュメント'
'sidebar_label': 'ORDER BY'
'sidebar_position': 41
'slug': '/sql-reference/statements/alter/order-by'
'title': 'キーエクスプレッションの操作'
'doc_type': 'reference'
---


# キー式の操作

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

このコマンドは、テーブルの [ソーティングキー](../../../engines/table-engines/mergetree-family/mergetree.md) を `new_expression` （式または式のタプル）に変更します。主キーはそのままです。

このコマンドはメタデータのみを変更するため軽量です。データパートの行がソーティングキー式によって順序付けられる性質を維持するためには、ソーティングキーに既存のカラムを含む式を追加することはできません（同じ `ALTER` クエリ内で `ADD COLUMN` コマンドによって追加されたカラムのみが許可され、デフォルト値は指定できません）。

:::note    
これは [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブル（[レプリケートされた](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む）にのみ適用されます。
:::
