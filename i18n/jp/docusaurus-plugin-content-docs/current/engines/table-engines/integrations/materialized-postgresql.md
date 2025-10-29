---
'description': 'PostgreSQL テーブルの初期データダンプを使用して ClickHouse テーブルを作成し、レプリケーションプロセスを開始します。'
'sidebar_label': 'MaterializedPostgreSQL'
'sidebar_position': 130
'slug': '/engines/table-engines/integrations/materialized-postgresql'
'title': 'MaterializedPostgreSQL'
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
ClickHouse Cloudのユーザーは、PostgreSQLのレプリケーションのために[ClickPipes](/integrations/clickpipes)を使用することをお勧めします。これにより、PostgreSQLのために高性能な変更データキャプチャ（CDC）がネイティブにサポートされます。
:::

PostgreSQLテーブルの初期データダンプを使用してClickHouseテーブルを作成し、レプリケーションプロセスを開始します。つまり、リモートPostgreSQLデータベース内のPostgreSQLテーブルでの新しい変更が発生するたびに適用する背景ジョブを実行します。

:::note
このテーブルエンジンは実験的です。使用するには、設定ファイルに`allow_experimental_materialized_postgresql_table`を1に設定するか、`SET`コマンドを使用して設定してください：
```sql
SET allow_experimental_materialized_postgresql_table=1
```
:::

複数のテーブルが必要な場合、テーブルエンジンの代わりに[MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md)データベースエンジンを使用し、レプリケーションされるテーブルを指定する`materialized_postgresql_tables_list`設定を使用することを強くお勧めします（データベースの`schema`を追加することも可能）。これにより、CPU使用率が向上し、接続数が減少し、リモートPostgreSQLデータベース内のレプリケーションスロットも少なくなります。

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
- `password` — ユーザーパスワード。

## 要件 {#requirements}

1. [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) の設定は`logical`でなければならず、`max_replication_slots` パラメータはPostgreSQL設定ファイル内で少なくとも`2`以上でなければなりません。

2. `MaterializedPostgreSQL`エンジンを持つテーブルは、PostgreSQLテーブルのレプリカアイデンティティインデックス（デフォルトでは：主キー）と同じ主キーを持たなければなりません（[レプリカアイデンティティインデックスの詳細](../../../engines/database-engines/materialized-postgresql.md#requirements)を参照）。

3. データベースは[Atomic](https://en.wikipedia.org/wiki/Atomicity_(database_systems))のみが許可されています。

4. `MaterializedPostgreSQL`テーブルエンジンは、実装が[pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html) PostgreSQL関数を必要とするため、PostgreSQLバージョン>= 11でのみ機能します。

## 仮想カラム {#virtual-columns}

- `_version` — トランザクションカウンタ。タイプ：[UInt64](../../../sql-reference/data-types/int-uint.md)。

- `_sign` — 削除マーク。タイプ：[Int8](../../../sql-reference/data-types/int-uint.md)。可能な値：
  - `1` — 行は削除されていない、
  - `-1` — 行は削除されている。

これらのカラムはテーブル作成時に追加する必要はありません。`SELECT`クエリで常にアクセスできます。
`_version`カラムは`WAL`の`LSN`位置に等しいため、レプリケーションがどれくらい最新の状態であるかを確認するために使用できます。

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html)値のレプリケーションはサポートされていません。データ型のデフォルト値が使用されます。
:::
