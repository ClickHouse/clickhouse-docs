---
description: 'SAMPLE BY 式の操作方法に関するドキュメント'
sidebar_label: 'SAMPLE BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/sample-by
title: 'サンプリングキー式の操作'
doc_type: 'reference'
---

# SAMPLE BY 式の操作 {#manipulating-sample-by-expression}

次の操作が行えます。

## 変更 {#modify}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

このコマンドは、テーブルの[サンプリングキー](../../../engines/table-engines/mergetree-family/mergetree.md)を `new_expression`（式または式のタプル）に変更します。プライマリキーには、新しいサンプリングキーが含まれている必要があります。

## 削除 {#remove}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] REMOVE SAMPLE BY
```

このコマンドはテーブルから[サンプリングキー](../../../engines/table-engines/mergetree-family/mergetree.md)を削除します。

`MODIFY` と `REMOVE` コマンドは、メタデータのみを変更するか、ファイルを削除するだけの軽量なコマンドです。

:::note
これらは [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[replicated](../../../engines/table-engines/mergetree-family/replication.md) テーブルを含む）のテーブルに対してのみ機能します。
:::
