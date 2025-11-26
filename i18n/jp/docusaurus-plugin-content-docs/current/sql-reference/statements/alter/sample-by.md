---
description: 'SAMPLE BY 式の操作に関するドキュメント'
sidebar_label: 'SAMPLE BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/sample-by
title: 'サンプリングキー式の操作'
doc_type: 'reference'
---



# SAMPLE BY 式の操作

次の操作を実行できます。



## MODIFY

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

このコマンドはテーブルの[サンプリングキー](../../../engines/table-engines/mergetree-family/mergetree.md)を `new_expression`（式、または式のタプル）に変更します。プライマリキーには新しいサンプリングキーが含まれていなければなりません。


## REMOVE

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] REMOVE SAMPLE BY
```

このコマンドはテーブルの [sampling key](../../../engines/table-engines/mergetree-family/mergetree.md)（サンプリングキー）を削除します。

`MODIFY` と `REMOVE` コマンドは、メタデータの変更またはファイルの削除のみを行う軽量な操作です。

:::note\
これは [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[replicated](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む）のテーブルに対してのみ有効です。
:::
