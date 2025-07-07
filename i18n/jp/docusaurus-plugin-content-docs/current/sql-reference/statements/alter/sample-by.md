---
'description': 'SAMPLE BY式の操作に関するドキュメント'
'sidebar_label': 'サンプリングキーの操作'
'sidebar_position': 41
'slug': '/sql-reference/statements/alter/sample-by'
'title': 'Sampling-Key Expressions Manipulation'
---




# SAMPLE BY式の操作

以下の操作が可能です。

## MODIFY {#modify}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

このコマンドは、テーブルの [sampling key](../../../engines/table-engines/mergetree-family/mergetree.md) を `new_expression` (式または式のタプル) に変更します。主キーには新しいサンプルキーが含まれている必要があります。

## REMOVE {#remove}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] REMOVE SAMPLE BY
```

このコマンドは、テーブルの [sampling key](../../../engines/table-engines/mergetree-family/mergetree.md) を削除します。

`MODIFY` および `REMOVE` コマンドは、メタデータを変更するかファイルを削除するだけで軽量です。

:::note    
これは [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブル ( [replicated](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む) のみに対して機能します。
:::
