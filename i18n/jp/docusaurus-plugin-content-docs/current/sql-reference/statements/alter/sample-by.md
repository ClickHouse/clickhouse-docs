---
slug: /sql-reference/statements/alter/sample-by
sidebar_position: 41
sidebar_label: SAMPLE BY
title: "サンプリングキー式の操作"
---


# サンプリング SAMPLE BY 式の操作

以下の操作が可能です：

## MODIFY {#modify}

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

このコマンドは、テーブルの [サンプリングキー](../../../engines/table-engines/mergetree-family/mergetree.md) を `new_expression`（式または式のタプル）に変更します。主キーは新しいサンプルキーを含む必要があります。

## REMOVE {#remove}

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] REMOVE SAMPLE BY
```

このコマンドは、テーブルの [サンプリングキー](../../../engines/table-engines/mergetree-family/mergetree.md) を削除します。


コマンド `MODIFY` と `REMOVE` は軽量であり、メタデータのみを変更するか、ファイルを削除します。

:::note    
これは、[MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) ファミリー（[レプリケートテーブル](../../../engines/table-engines/mergetree-family/replication.md)を含む）のテーブルでのみ機能します。
:::
