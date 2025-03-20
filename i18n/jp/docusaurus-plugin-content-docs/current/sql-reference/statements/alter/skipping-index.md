---
slug: /sql-reference/statements/alter/skipping-index

toc_hidden_folder: true
sidebar_position: 42
sidebar_label: インデックス
---


# データスキッピングインデックスの操作

以下の操作が可能です：

## インデックスの追加 {#add-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` - インデックスの説明をテーブルのメタデータに追加します。

## インデックスの削除 {#drop-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` - インデックスの説明をテーブルのメタデータから削除し、ディスクからインデックスファイルを削除します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

## インデックスのマテリアライズ {#materialize-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 指定された `partition_name` のためにセカンダリインデックス `name` を再構築します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。 `IN PARTITION` 部分が省略された場合、テーブル全体のデータに対してインデックスを再構築します。

## インデックスのクリア {#clear-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 説明を削除せずにディスクからセカンダリインデックスファイルを削除します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

`ADD`、`DROP`、および `CLEAR` コマンドは、メタデータのみを変更するかファイルを削除するため、軽量です。また、これらはレプリケーションされ、ClickHouse Keeper または ZooKeeper を通じてインデックスのメタデータを同期します。

:::note    
インデックス操作は、[`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) エンジン（[レプリケート](/engines/table-engines/mergetree-family/replication.md) バリアントを含む）を持つテーブルのみでサポートされています。
:::
