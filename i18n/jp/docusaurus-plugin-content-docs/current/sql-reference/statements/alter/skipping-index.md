---
description: 'データスキッピングインデックスの操作に関するドキュメント'
sidebar_label: 'インデックス'
sidebar_position: 42
slug: /sql-reference/statements/alter/skipping-index
title: 'データスキッピングインデックスの操作'
toc_hidden_folder: true
doc_type: 'reference'
---

# データスキッピングインデックスの操作 {#manipulating-data-skipping-indices}

次の操作を行うことができます。

## ADD INDEX {#add-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` - テーブルのメタデータにインデックス定義を追加します。

## DROP INDEX {#drop-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` - テーブルのメタデータからインデックスの定義を削除し、ディスク上のインデックスファイルも削除します。これは [mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

## MATERIALIZE INDEX {#materialize-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 指定された `partition_name` に対してセカンダリインデックス `name` を再構築します。[mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。`IN PARTITION` 句を省略した場合、テーブル全体のデータに対してインデックスを再構築します。

## CLEAR INDEX {#clear-index}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` - セカンダリインデックスの定義は残したまま、そのファイルをディスクから削除します。[mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

`ADD`、`DROP`、`CLEAR` コマンドは、メタデータの変更またはファイルの削除のみを行うという意味で軽量です。
また、これらのコマンドはレプリケートされ、ClickHouse Keeper または ZooKeeper を通じてインデックスのメタデータが同期されます。

:::note    
インデックスの操作がサポートされるのは、[`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) エンジン（[replicated](/engines/table-engines/mergetree-family/replication.md) バリアントを含む）のテーブルのみです。
:::
