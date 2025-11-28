---
description: 'PostgreSQL テーブルの初期データダンプを用いて ClickHouse テーブルを作成し、レプリケーション処理を開始します。'
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
ClickHouse Cloud のユーザーには、PostgreSQL から ClickHouse へのレプリケーションには [ClickPipes](/integrations/clickpipes) の利用を推奨します。これは PostgreSQL 向けの高性能な Change Data Capture（CDC）をネイティブにサポートします。
:::

PostgreSQL テーブルの初期データダンプを用いて ClickHouse テーブルを作成し、その後レプリケーション処理を開始します。具体的には、リモートの PostgreSQL データベース上の PostgreSQL テーブルで発生する新しい変更を適用するためのバックグラウンドジョブを実行します。

:::note
このテーブルエンジンは実験的機能です。使用するには、設定ファイル内、または `SET` コマンドを使用して `allow_experimental_materialized_postgresql_table` を 1 に設定します。
:::

```sql
SET allow_experimental_materialized_postgresql_table=1
```

:::

複数のテーブルが必要な場合は、テーブルエンジンではなく [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md) データベースエンジンを使用し、レプリケートするテーブルを指定する `materialized_postgresql_tables_list` 設定（将来的にはデータベースの `schema` も追加可能になる予定）を利用することを強く推奨します。これにより、CPU 使用量を抑えつつ、接続数およびリモート PostgreSQL データベース内のレプリケーションスロット数を減らすことができ、はるかに効率的になります。


## テーブルを作成する

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_table', 'postgres_user', 'postgres_password')
PRIMARY KEY key;
```

**エンジンパラメーター**

* `host:port` — PostgreSQL サーバーのアドレス。
* `database` — リモートデータベース名。
* `table` — リモートテーブル名。
* `user` — PostgreSQL ユーザー。
* `password` — ユーザーのパスワード。


## 要件 {#requirements}

1. PostgreSQL の設定ファイルにおいて、[wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) は値 `logical` に設定されており、`max_replication_slots` パラメータは少なくとも `2` に設定されている必要があります。

2. `MaterializedPostgreSQL` エンジンを使用するテーブルには、PostgreSQL テーブルのレプリカ識別インデックス（デフォルトではプライマリキー）と同一のプライマリキーが必要です（[レプリカ識別インデックスの詳細](../../../engines/database-engines/materialized-postgresql.md#requirements)を参照してください）。

3. [Atomic](https://en.wikipedia.org/wiki/Atomicity_(database_systems)) データベースエンジンのみ使用できます。

4. `MaterializedPostgreSQL` テーブルエンジンは、その実装で [pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html) PostgreSQL 関数を必要とするため、PostgreSQL バージョン 11 以上でのみ動作します。



## 仮想カラム

* `_version` — トランザクションカウンター。型: [UInt64](../../../sql-reference/data-types/int-uint.md)。

* `_sign` — 削除マーク。型: [Int8](../../../sql-reference/data-types/int-uint.md)。取りうる値:
  * `1` — 行は削除されていない、
  * `-1` — 行は削除されている。

これらのカラムはテーブル作成時に明示的に追加する必要はありません。`SELECT` クエリで常に参照可能です。
`_version` カラムは `WAL` 内の `LSN` 位置に対応するため、レプリケーションがどの程度最新かを確認するために使用できます。

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 値のレプリケーションはサポートされておらず、データ型のデフォルト値が使用されます。
:::
