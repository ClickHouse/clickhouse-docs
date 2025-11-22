---
description: 'SAMPLE BY 式の操作方法に関するドキュメント'
sidebar_label: 'SAMPLE BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/sample-by
title: 'サンプリングキー式の操作方法'
doc_type: 'reference'
---



# SAMPLE BY 式の操作

次の操作が利用できます。



## MODIFY {#modify}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

このコマンドは、テーブルの[サンプリングキー](../../../engines/table-engines/mergetree-family/mergetree.md)を`new_expression`(式または式のタプル)に変更します。プライマリキーには、新しいサンプリングキーが含まれている必要があります。


## REMOVE {#remove}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] REMOVE SAMPLE BY
```

このコマンドは、テーブルの[サンプリングキー](../../../engines/table-engines/mergetree-family/mergetree.md)を削除します。

`MODIFY`コマンドと`REMOVE`コマンドは、メタデータの変更またはファイルの削除のみを行うため、軽量です。

:::note  
[MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)ファミリーのテーブル([レプリケート](../../../engines/table-engines/mergetree-family/replication.md)テーブルを含む)でのみ動作します。
:::
