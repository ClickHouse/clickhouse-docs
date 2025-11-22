---
description: 'データスキッピングインデックスの操作方法に関するドキュメント'
sidebar_label: 'INDEX'
sidebar_position: 42
slug: /sql-reference/statements/alter/skipping-index
title: 'データスキッピングインデックスの操作'
toc_hidden_folder: true
doc_type: 'reference'
---



# データスキッピングインデックスの操作

次の操作が利用できます。



## ADD INDEX {#add-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` - テーブルのメタデータにインデックスの記述を追加します。


## DROP INDEX {#drop-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` - テーブルのメタデータからインデックスの記述を削除し、ディスクからインデックスファイルを削除します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。


## MATERIALIZE INDEX {#materialize-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 指定された `partition_name` のセカンダリインデックス `name` を再構築します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。`IN PARTITION` 句を省略した場合は、テーブル全体のデータに対してインデックスを再構築します。


## CLEAR INDEX {#clear-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` - インデックス定義を削除せずに、ディスクからセカンダリインデックスファイルを削除します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

`ADD`、`DROP`、`CLEAR`コマンドは、メタデータの変更またはファイルの削除のみを行うため軽量です。
また、これらのコマンドはレプリケートされ、ClickHouse KeeperまたはZooKeeperを介してインデックスメタデータを同期します。

:::note  
インデックス操作は、[`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md)エンジンを使用するテーブル([レプリケート](/engines/table-engines/mergetree-family/replication.md)バリアントを含む)でのみサポートされています。
:::
