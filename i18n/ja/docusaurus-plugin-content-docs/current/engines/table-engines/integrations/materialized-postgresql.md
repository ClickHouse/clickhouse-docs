---
slug: /engines/table-engines/integrations/materialized-postgresql
sidebar_position: 130
sidebar_label: MaterializedPostgreSQL
title: "MaterializedPostgreSQL"
description: "PostgreSQL テーブルの初期データダンプで ClickHouse テーブルを作成し、レプリケーションプロセスを開始します。"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
ClickHouse Cloud のユーザーは、PostgreSQL の ClickHouse へのレプリケーションに [ClickPipes](/integrations/clickpipes) を使用することが推奨されています。これは、PostgreSQL に対する高性能な変更データキャプチャ (CDC) をネイティブにサポートしています。
:::

PostgreSQL テーブルの初期データダンプで ClickHouse テーブルを作成し、レプリケーションプロセスを開始します。つまり、リモート PostgreSQL データベース内の PostgreSQL テーブルで新しい変更が発生するたびに適用するためのバックグラウンドジョブを実行します。

:::note
このテーブルエンジンは実験的です。使用するには、設定ファイルで `allow_experimental_materialized_postgresql_table` を 1 に設定するか、`SET` コマンドを使用します：
```sql
SET allow_experimental_materialized_postgresql_table=1
```
:::

テーブルが複数必要な場合、テーブルエンジンではなく [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md) データベースエンジンを使用し、レプリケートするテーブルを指定する `materialized_postgresql_tables_list` 設定を使用することを強く推奨します（データベースの `schema` を追加することも可能です）。これにより、CPU の消費が少なく、接続数が減少し、リモート PostgreSQL データベース内のレプリケーションスロットも少なくて済みます。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_table', 'postgres_user', 'postgres_password')
PRIMARY KEY key;
```

**エンジンパラメータ**

- `host:port` — PostgreSQL サーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — PostgreSQL ユーザー。
- `password` — ユーザーのパスワード。

## 要件 {#requirements}

1. [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) 設定の値は `logical` でなければならず、`max_replication_slots` パラメータの値は PostgreSQL 設定ファイル内で少なくとも `2` でなければなりません。

2. `MaterializedPostgreSQL` エンジンを持つテーブルは、PostgreSQL テーブルのレプリカアイデンティティインデックス（デフォルト：主キー）と同じ主キーが必要です（[レプリカアイデンティティインデックスの詳細](../../../engines/database-engines/materialized-postgresql.md#requirements)を参照）。

3. [Atomic](https://en.wikipedia.org/wiki/Atomicity_(database_systems)) データベースのみが許可されています。

4. `MaterializedPostgreSQL` テーブルエンジンは PostgreSQL バージョン >= 11 のみに対応しており、[pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html) PostgreSQL 関数が必要です。

## 仮想カラム {#virtual-columns}

- `_version` — トランザクションカウンター。タイプ: [UInt64](../../../sql-reference/data-types/int-uint.md)。

- `_sign` — 削除マーク。タイプ: [Int8](../../../sql-reference/data-types/int-uint.md)。可能な値：
    - `1` — 行は削除されていない。
    - `-1` — 行は削除されている。

これらのカラムは、テーブル作成時に追加する必要はありません。常に `SELECT` クエリでアクセス可能です。
`_version` カラムは `WAL` 内の `LSN` ポジションに等しいため、レプリケーションがどれほど最新であるかを確認するのに使用できます。

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 値のレプリケーションはサポートされていません。デフォルト値のデータ型が使用されます。
:::
