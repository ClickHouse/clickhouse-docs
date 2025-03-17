---
slug: /engines/table-engines/integrations/materialized-postgresql
sidebar_position: 130
sidebar_label: MaterializedPostgreSQL
title: "MaterializedPostgreSQL"
description: "PostgreSQLテーブルの初期データダンプでClickHouseテーブルを作成し、レプリケーションプロセスを開始します。"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
ClickHouse Cloudユーザーは、PostgreSQLをClickHouseにレプリケーションするために[ClickPipes](/integrations/clickpipes)の使用を推奨します。これはPostgreSQLの高性能なChange Data Capture (CDC)をネイティブにサポートします。
:::

PostgreSQLテーブルの初期データダンプを使用してClickHouseテーブルを作成し、レプリケーションプロセスを開始します。つまり、リモートPostgreSQLデータベースのPostgreSQLテーブルで発生する新しい変更を適用するバックグラウンドジョブを実行します。

:::note
このテーブルエンジンは実験的です。使用するには、設定ファイルで`allow_experimental_materialized_postgresql_table`を1に設定するか、`SET`コマンドを使用します：
```sql
SET allow_experimental_materialized_postgresql_table=1
```
:::

複数のテーブルが必要な場合は、テーブルエンジンの代わりに[MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md)データベースエンジンを使用し、レプリケーションするテーブルを指定する`materialized_postgresql_tables_list`設定を使用することを強く推奨します（データベースの`schema`を追加することも可能です）。これにより、CPUの使用量が減少し、接続数やリモートPostgreSQLデータベース内のレプリケーションスロットが減少します。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_table', 'postgres_user', 'postgres_password')
PRIMARY KEY key;
```

**エンジンパラメータ**

- `host:port` — PostgreSQLサーバーのアドレス。
- `database` — リモートデータベースの名前。
- `table` — リモートテーブルの名前。
- `user` — PostgreSQLユーザー。
- `password` — ユーザーのパスワード。

## 要件 {#requirements}

1. [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html)設定は`logical`の値を持ち、`max_replication_slots`パラメータはPostgreSQLの設定ファイルで少なくとも`2`の値を持っていなければなりません。

2. `MaterializedPostgreSQL`エンジンを持つテーブルは、PostgreSQLテーブルのレプリカアイデンティティインデックス（デフォルトでは主キー）と同じ主キーを持っている必要があります（[レプリカアイデンティティインデックスの詳細](../../../engines/database-engines/materialized-postgresql.md#requirements)を参照）。

3. データベースは[Atomic](https://en.wikipedia.org/wiki/Atomicity_(database_systems))のみが許可されています。

4. `MaterializedPostgreSQL`テーブルエンジンは、PostgreSQLバージョン>= 11でのみ動作します。これは実装が[pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html) PostgreSQL関数を必要とするためです。

## 仮想カラム {#virtual-columns}

- `_version` — トランザクションカウンター。タイプ: [UInt64](../../../sql-reference/data-types/int-uint.md)。

- `_sign` — 削除マーク。タイプ: [Int8](../../../sql-reference/data-types/int-uint.md)。可能な値：
    - `1` — 行は削除されていない、
    - `-1` — 行は削除されている。

これらのカラムはテーブル作成時に追加する必要はありません。常に`SELECT`クエリでアクセスできます。
`_version`カラムは`WAL`内の`LSN`位置と等しく、レプリケーションの最新状態を確認するために使用できます。

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html)値のレプリケーションはサポートされていません。データ型のデフォルト値が使用されます。
:::
