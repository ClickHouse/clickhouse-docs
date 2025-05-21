---
description: 'データスキッピングインデックスの操作に関するドキュメント'
sidebar_label: 'インデックス'
sidebar_position: 42
slug: /sql-reference/statements/alter/skipping-index
title: 'データスキッピングインデックスの操作'
toc_hidden_folder: true
---


# データスキッピングインデックスの操作

次の操作が可能です：

## インデックスを追加 {#add-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` - インデックスの説明をテーブルのメタデータに追加します。

## インデックスを削除 {#drop-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` - テーブルのメタデータからインデックスの説明を削除し、ディスクからインデックスファイルを削除します。これは[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

## インデックスをマテリアライズ {#materialize-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 指定された`partition_name`のために、二次インデックス`name`を再構築します。これは[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。`IN PARTITION`の部分が省略されると、テーブル全体のデータに対してインデックスを再構築します。

## インデックスをクリア {#clear-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 説明を削除することなく、ディスクから二次インデックスファイルを削除します。これは[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

これらのコマンド`ADD`、`DROP`、および`CLEAR`は、メタデータを変更するかファイルを削除するだけなので、軽量です。また、インデックスのメタデータをClickHouse KeeperまたはZooKeeperを介して同期するため、レプリケートされます。

:::note    
インデックス操作は、[`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md)エンジン（[レプリケーション](/engines/table-engines/mergetree-family/replication.md)バリアントを含む）を持つテーブルのみでサポートされています。
:::
