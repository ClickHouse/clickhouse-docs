description: 'SAMPLE BY式の操作に関するドキュメント'
sidebar_label: 'SAMPLE BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/sample-by
title: 'サンプリングキー式の操作'
```


# Manipulating SAMPLE BY expression

次の操作が可能です：

## MODIFY {#modify}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

このコマンドは、テーブルの [sampling key](../../../engines/table-engines/mergetree-family/mergetree.md) を`new_expression`（式または式のタプル）に変更します。主キーは新しいサンプルキーを含む必要があります。

## REMOVE {#remove}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] REMOVE SAMPLE BY
```

このコマンドは、テーブルの [sampling key](../../../engines/table-engines/mergetree-family/mergetree.md) を削除します。

`MODIFY`と`REMOVE`のコマンドは、メタデータを変更するかファイルを削除するだけの軽量な操作です。

:::note    
これは、[MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブル（[replicated](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む）に対してのみ機能します。
:::
