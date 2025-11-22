---
description: 'PostgreSQL テーブルの初期データダンプを用いて ClickHouse テーブルを作成し、レプリケーションプロセスを開始します。'
sidebar_label: 'MaterializedPostgreSQL'
sidebar_position: 130
slug: /engines/table-engines/integrations/materialized-postgresql
title: 'MaterializedPostgreSQL テーブルエンジン'
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL テーブルエンジン

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::note
ClickHouse Cloud ユーザーには、PostgreSQL から ClickHouse へのレプリケーションには [ClickPipes](/integrations/clickpipes) の利用を推奨します。これは、PostgreSQL 向けの高性能な Change Data Capture (CDC) をネイティブにサポートします。
:::

PostgreSQL テーブルのデータを初回ダンプして ClickHouse テーブルを作成し、その後レプリケーションを開始します。これは、リモートの PostgreSQL データベース内の PostgreSQL テーブルで発生する新しい変更を適用するバックグラウンド ジョブを実行するものです。

:::note
このテーブルエンジンは実験的な機能です。使用するには、設定ファイルで、または `SET` コマンドを使用して `allow_experimental_materialized_postgresql_table` を 1 に設定してください。
:::

```sql
SET allow_experimental_materialized_postgresql_table=1
```

:::

複数のテーブルが必要な場合は、テーブルエンジンの代わりに [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md) データベースエンジンを使用し、レプリケーション対象のテーブルを指定する `materialized_postgresql_tables_list` 設定（将来的にはデータベースの `schema` も追加可能になる予定です）を利用することを強く推奨します。これにより、CPU 使用量が少なくなり、接続数やリモートの PostgreSQL データベース内で必要となるレプリケーションスロット数も削減できます。


## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_table', 'postgres_user', 'postgres_password')
PRIMARY KEY key;
```

**エンジンパラメータ**

- `host:port` — PostgreSQLサーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — PostgreSQLユーザー。
- `password` — ユーザーのパスワード。


## 要件 {#requirements}

1. PostgreSQL設定ファイルにおいて、[wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html)設定を`logical`に、`max_replication_slots`パラメータを少なくとも`2`に設定する必要があります。

2. `MaterializedPostgreSQL`エンジンを使用するテーブルには、PostgreSQLテーブルのレプリカアイデンティティインデックス(デフォルト: プライマリキー)と同じプライマリキーが必要です([レプリカアイデンティティインデックスの詳細](../../../engines/database-engines/materialized-postgresql.md#requirements)を参照)。

3. [Atomic](<https://en.wikipedia.org/wiki/Atomicity_(database_systems)>)データベースのみ使用可能です。

4. `MaterializedPostgreSQL`テーブルエンジンは、[pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html) PostgreSQL関数を必要とするため、PostgreSQLバージョン11以上でのみ動作します。


## 仮想カラム {#virtual-columns}

- `_version` — トランザクションカウンター。型: [UInt64](../../../sql-reference/data-types/int-uint.md)。

- `_sign` — 削除マーク。型: [Int8](../../../sql-reference/data-types/int-uint.md)。取り得る値:
  - `1` — 行は削除されていない
  - `-1` — 行は削除されている

これらのカラムはテーブル作成時に追加する必要はありません。`SELECT`クエリで常にアクセス可能です。
`_version`カラムは`WAL`内の`LSN`位置と等しいため、レプリケーションがどの程度最新の状態であるかを確認するために使用できます。

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html)値のレプリケーションはサポートされていません。データ型のデフォルト値が使用されます。
:::
