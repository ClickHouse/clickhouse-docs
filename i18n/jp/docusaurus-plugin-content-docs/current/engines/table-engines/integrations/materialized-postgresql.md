---
'description': 'Creates a ClickHouse table with an initial data dump of a PostgreSQL
  table and starts the replication process.'
'sidebar_label': 'MaterializedPostgreSQL'
'sidebar_position': 130
'slug': '/engines/table-engines/integrations/materialized-postgresql'
'title': 'MaterializedPostgreSQL'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
ClickHouse Cloud のユーザーは、PostgreSQL から ClickHouse へのレプリケーションには [ClickPipes](/integrations/clickpipes) の使用を推奨します。これは PostgreSQL に対する高性能なデータ変更キャプチャ (CDC) をネイティブにサポートしています。
:::

ClickHouse テーブルを PostgreSQL テーブルの初期データダンプで作成し、レプリケーションプロセスを開始します。つまり、リモートの PostgreSQL データベース内の PostgreSQL テーブルで新しい変更が行われるたびに適用するバックグラウンドジョブを実行します。

:::note
このテーブルエンジンは実験的です。使用するには、設定ファイルで `allow_experimental_materialized_postgresql_table` を 1 に設定するか、`SET` コマンドを使用してください：
```sql
SET allow_experimental_materialized_postgresql_table=1
```
:::

複数のテーブルが必要な場合は、テーブルエンジンの代わりに [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md) データベースエンジンを使用し、レプリケーションするテーブルを指定する `materialized_postgresql_tables_list` 設定を使用することを強く推奨します（データベースの `schema` を追加することも可能です）。これにより CPU 使用率が改善され、接続数やリモート PostgreSQL データベース内のレプリケーションスロット数が減少します。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_table', 'postgres_user', 'postgres_password')
PRIMARY KEY key;
```

**エンジンのパラメータ**

- `host:port` — PostgreSQL サーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — PostgreSQL ユーザー。
- `password` — ユーザーパスワード。

## 要件 {#requirements}

1. [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) 設定は `logical` に設定されている必要があり、`max_replication_slots` パラメータは PostgreSQL 設定ファイル内で少なくとも `2` に設定されている必要があります。

2. `MaterializedPostgreSQL` エンジンを持つテーブルは、PostgreSQL テーブルのレプリカアイデンティティインデックス（デフォルトでは：主キー）と同じ主キーを持たなければなりません（[レプリカアイデンティティインデックスの詳細はこちら](../../../engines/database-engines/materialized-postgresql.md#requirements)）。

3. データベースは [Atomic](https://en.wikipedia.org/wiki/Atomicity_(database_systems)) のみが許可されています。

4. `MaterializedPostgreSQL` テーブルエンジンは、[pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html) PostgreSQL 関数を必要とするため、PostgreSQL バージョン >= 11 のみで動作します。

## 仮想カラム {#virtual-columns}

- `_version` — トランザクションカウンター。型： [UInt64](../../../sql-reference/data-types/int-uint.md)。

- `_sign` — 削除マーク。型： [Int8](../../../sql-reference/data-types/int-uint.md)。可能な値：
    - `1` — 行は削除されていない、
    - `-1` — 行は削除されている。

これらのカラムはテーブル作成時に追加する必要はありません。常に `SELECT` クエリでアクセス可能です。
`_version` カラムは `WAL` 内の `LSN` ポジションと等しいため、レプリケーションがどれほど最新かをチェックするために使用できます。

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 値のレプリケーションはサポートされていません。データ型のデフォルト値が使用されます。
:::
