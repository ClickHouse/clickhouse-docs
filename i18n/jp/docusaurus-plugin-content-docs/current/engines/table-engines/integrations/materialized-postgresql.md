---
description: 'PostgreSQL テーブルの初期データ ダンプを使用して ClickHouse テーブルを作成し、レプリケーションプロセスを開始します。'
sidebar_label: 'MaterializedPostgreSQL'
sidebar_position: 130
slug: /engines/table-engines/integrations/materialized-postgresql
title: 'MaterializedPostgreSQL'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
ClickHouse Cloud ユーザーには、PostgreSQL を ClickHouse にレプリケーションするために [ClickPipes](/integrations/clickpipes) を使用することをお勧めします。これにより、PostgreSQL のための高パフォーマンスな Change Data Capture (CDC) がネイティブにサポートされます。
:::

PostgreSQL テーブルの初期データ ダンプを使用して ClickHouse テーブルを作成し、レプリケーションプロセスを開始します。つまり、リモートの PostgreSQL データベース内の PostgreSQL テーブルで変更が行われると、それを適用するバックグラウンドジョブが実行されます。

:::note
このテーブルエンジンは実験的です。使用するには、設定ファイルで `allow_experimental_materialized_postgresql_table` を 1 に設定するか、`SET` コマンドを使用して設定してください:
```sql
SET allow_experimental_materialized_postgresql_table=1
```
:::


複数のテーブルが必要な場合は、テーブルエンジンの代わりに [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md) データベースエンジンを使用し、レプリケートするテーブルを指定する `materialized_postgresql_tables_list` 設定を使用することを強くお勧めします（データベースの `schema` を追加することも可能です）。これにより、CPU の使用量が少なくなり、接続回数とリモート PostgreSQL データベース内のレプリケーションスロットも削減されます。

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
- `password` — ユーザーパスワード。

## 要件 {#requirements}

1. [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) 設定は `logical` の値を持ち、`max_replication_slots` パラメータは PostgreSQL 設定ファイルで少なくとも `2` の値を持っている必要があります。

2. `MaterializedPostgreSQL` エンジンを持つテーブルは、PostgreSQL テーブルのレプリカアイデンティティインデックス（デフォルトでは主キー）と同じ主キーを持っている必要があります（[レプリカアイデンティティインデックスの詳細](../../../engines/database-engines/materialized-postgresql.md#requirements)を参照）。

3. データベースは [Atomic](https://en.wikipedia.org/wiki/Atomicity_(database_systems)) のみが許可されます。

4. `MaterializedPostgreSQL` テーブルエンジンは、PostgreSQL バージョン >= 11 でのみ機能します。実装には [pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html) PostgreSQL 関数が必要です。

## 仮想カラム {#virtual-columns}

- `_version` — トランザクションカウンター。タイプ: [UInt64](../../../sql-reference/data-types/int-uint.md)。

- `_sign` — 削除フラグ。タイプ: [Int8](../../../sql-reference/data-types/int-uint.md)。可能な値:
    - `1` — 行が削除されていない、
    - `-1` — 行が削除されている。

これらのカラムはテーブル作成時に追加する必要はありません。`SELECT` クエリで常にアクセス可能です。
`_version` カラムは `WAL` の `LSN` ポジションに等しいため、レプリケーションがどれだけ最新であるかを確認するために使用できます。

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 値のレプリケーションはサポートされていません。デフォルト値のデータ型が使用されます。
:::
