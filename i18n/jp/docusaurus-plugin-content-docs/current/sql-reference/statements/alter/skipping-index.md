---
description: 'データスキッピング索引の操作に関するドキュメント'
sidebar_label: '索引'
sidebar_position: 42
slug: /sql-reference/statements/alter/skipping-index
title: 'データスキッピング索引の操作'
toc_hidden_folder: true
doc_type: 'reference'
---

次の操作を使用できます。

## ADD 索引 \{#add-index\}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] ADD INDEX [IF NOT EXISTS] name expression TYPE type [GRANULARITY value] [FIRST|AFTER name]` - テーブルのメタデータに索引定義を追加します。

## DROP 索引 \{#drop-index\}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] DROP INDEX [IF EXISTS] name` - テーブルのメタデータから索引の定義を削除し、ディスク上の索引ファイルも削除します。これは [mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

## MATERIALIZE 索引 \{#materialize-index\}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] MATERIALIZE INDEX [IF EXISTS] name [IN PARTITION partition_name]` - 指定された `partition_name` に対してセカンダリ索引 `name` を再構築します。[mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。`IN PARTITION` 句を省略した場合、テーブル全体のデータに対して索引を再構築します。

## CLEAR 索引 \{#clear-index\}

`ALTER TABLE [db.]table_name [ON CLUSTER cluster] CLEAR INDEX [IF EXISTS] name [IN PARTITION partition_name]` - セカンダリ索引の定義は残したまま、そのファイルをディスクから削除します。[mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

`ADD`、`DROP`、`CLEAR` コマンドは、メタデータの変更またはファイルの削除のみを行うという意味で軽量です。
また、これらのコマンドはレプリケートされ、ClickHouse Keeper または ZooKeeper を通じて索引のメタデータが同期されます。

:::note
索引の操作がサポートされるのは、[`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) エンジン ([replicated](/engines/table-engines/mergetree-family/replication.md) バリアントを含む) のテーブルのみです。
:::