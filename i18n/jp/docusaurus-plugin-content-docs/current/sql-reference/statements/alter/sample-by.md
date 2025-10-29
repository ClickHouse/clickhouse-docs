---
'description': 'Manipulating SAMPLE BY 式に関するドキュメント'
'sidebar_label': 'SAMPLE BY'
'sidebar_position': 41
'slug': '/sql-reference/statements/alter/sample-by'
'title': '操作サンプリングキー式'
'doc_type': 'reference'
---


# SAMPLE BY式の操作

以下の操作が利用可能です。

## MODIFY {#modify}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

このコマンドは、テーブルの [sampling key](../../../engines/table-engines/mergetree-family/mergetree.md) を `new_expression`（式または式のタプル）に変更します。主キーには新しいサンプリングキーが含まれている必要があります。

## REMOVE {#remove}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] REMOVE SAMPLE BY
```

このコマンドは、テーブルの [sampling key](../../../engines/table-engines/mergetree-family/mergetree.md) を削除します。

コマンド `MODIFY` と `REMOVE` は、メタデータを変更するかファイルを削除するだけで済むため、軽量です。

:::note    
これは、[MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブル（[replicated](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む）にのみ機能します。
:::
