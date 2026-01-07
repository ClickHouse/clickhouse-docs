---
sidebar_label: 'リファレンス'
description: 'pg_clickhouse の完全なリファレンスドキュメント'
slug: '/integrations/pg_clickhouse/reference'
title: 'pg_clickhouse リファレンスドキュメント'
doc_type: 'reference'
keywords: ['PostgreSQL', 'Postgres', 'FDW', 'foreign data wrapper', 'pg_clickhouse', 'extension']
---

# pg_clickhouse リファレンス ドキュメント {#pg_clickhouse-reference-documentation}

## 説明 {#description}

pg_clickhouse は、[foreign data wrapper] を含め、ClickHouse データベースに対するリモートでのクエリ実行を可能にする PostgreSQL 拡張機能です。PostgreSQL 13 以降および ClickHouse 23 以降をサポートしています。

## はじめに {#getting-started}

pg&#95;clickhouse を試す最も簡単な方法は、pg&#95;clickhouse 拡張機能を組み込んだ標準 PostgreSQL の [Docker image] を使うことです。

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres
```

ClickHouse テーブルのインポートやクエリのプッシュダウンを始めるには、[チュートリアル](tutorial.md) を参照してください。


## 使用方法 {#usage}

```sql
CREATE EXTENSION pg_clickhouse;
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'default');
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA taxi FROM SERVER taxi_srv INTO taxi;
```


## バージョニングポリシー {#versioning-policy}

pg_clickhouse は公開リリースに対して [Semantic Versioning] に従います。

* メジャーバージョンは API の変更時にインクリメントされます
* マイナーバージョンは後方互換性のある SQL の変更時にインクリメントされます
* パッチバージョンはバイナリのみの変更時にインクリメントされます

インストール後は、PostgreSQL は 2 種類のバージョンを追跡します。

* ライブラリバージョン（PostgreSQL 18 以上では `PG_MODULE_MAGIC` によって定義）は完全なセマンティックバージョンを含み、`pg_get_loaded_modules()` 関数の出力で確認できます。
* 拡張機能バージョン（control ファイルで定義）はメジャーおよびマイナーバージョンのみを含み、`pg_catalog.pg_extension` テーブル、`pg_available_extension_versions()` 関数の出力、そして `\dx
    pg_clickhouse` で確認できます。

実際には、パッチバージョンのみがインクリメントされるリリース、例えば
`v0.1.0` から `v0.1.1` への変更は、`v0.1` をロードしているすべてのデータベースに適用され、アップグレードのために `ALTER EXTENSION` を実行する必要はありません。

一方で、マイナーまたはメジャーバージョンがインクリメントされるリリースには SQL アップグレードスクリプトが伴い、その拡張機能を含む既存のすべてのデータベースは、アップグレードの恩恵を受けるために `ALTER EXTENSION pg_clickhouse UPDATE` を実行する必要があります。

## SQL リファレンス {#sql-reference}

以下の SQL 文は pg_clickhouse を利用します。

### CREATE EXTENSION {#create-extension}

[CREATE EXTENSION] ステートメントを使用して、pg&#95;clickhouse 拡張機能をデータベースに追加します。

```sql
CREATE EXTENSION pg_clickhouse;
```

特定のスキーマにインストールする場合は（推奨）、`WITH SCHEMA` を使用します。

```sql
CREATE SCHEMA ch;
CREATE EXTENSION pg_clickhouse WITH SCHEMA ch;
```


### ALTER EXTENSION {#alter-extension}

[ALTER EXTENSION] を使用して pg_clickhouse を変更します。例：

* 新しいリリースの pg_clickhouse をインストールした後は、`UPDATE` 句を使用します：

    ```sql
    ALTER EXTENSION pg_clickhouse UPDATE;
    ```

* `SET SCHEMA` を使用して、拡張機能を新しいスキーマに移動します：

    ```sql
    CREATE SCHEMA ch;
    ALTER EXTENSION pg_clickhouse SET SCHEMA ch;
    ```

### DROP EXTENSION {#drop-extension}

[DROP EXTENSION] を使用して、データベースから pg&#95;clickhouse 拡張機能を削除します。

```sql
DROP EXTENSION pg_clickhouse;
```

このコマンドは、pg&#95;clickhouse に依存するオブジェクトが存在する場合、失敗します。
それらもまとめて削除するには、`CASCADE` 句を使用してください。

```sql
DROP EXTENSION pg_clickhouse CASCADE;
```


### CREATE SERVER {#create-server}

[CREATE SERVER] を使用して、ClickHouse サーバーへの接続を定義する foreign server（外部サーバー）を作成します。例:

```sql
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
```

サポートされているオプションは次のとおりです:

* `driver`: 使用する ClickHouse 接続ドライバ。&quot;binary&quot; または
  &quot;http&quot; のいずれか。**必須。**
* `dbname`: 接続時に使用する ClickHouse データベース。デフォルトでは
  &quot;default&quot;。
* `host`: ClickHouse サーバーのホスト名。デフォルトでは &quot;localhost&quot;。
* `port`: ClickHouse サーバーに接続するポート。デフォルトは次のとおり:
  * `driver` が &quot;binary&quot; で、`host` が ClickHouse Cloud のホストの場合は 9440
  * `driver` が &quot;binary&quot; で、`host` が ClickHouse Cloud のホストではない場合は 9004
  * `driver` が &quot;http&quot; で、`host` が ClickHouse Cloud のホストの場合は 8443
  * `driver` が &quot;http&quot; で、`host` が ClickHouse Cloud のホストではない場合は 8123


### ALTER SERVER {#alter-server}

[ALTER SERVER] を使用して、外部サーバーの定義を変更します。例:

```sql
ALTER SERVER taxi_srv OPTIONS (SET driver 'http');
```

オプションは [CREATE SERVER](#create-server) の場合と同じです。


### DROP SERVER {#drop-server}

[DROP SERVER] を使用して、外部サーバー定義を削除します。

```sql
DROP SERVER taxi_srv;
```

サーバーに他のオブジェクトが依存している場合、このコマンドは失敗します。それらの依存関係も削除するには、`CASCADE` 句を使用してください。

```sql
DROP SERVER taxi_srv CASCADE;
```


### CREATE USER MAPPING {#create-user-mapping}

[CREATE USER MAPPING] を使用して、PostgreSQL ユーザーを ClickHouse ユーザーにマッピングします。
たとえば、`taxi_srv` フォーリンサーバーに接続する際に、現在の PostgreSQL ユーザーをリモートの ClickHouse ユーザーにマッピングするには、次のようにします。

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'demo');
```

サポートされているオプションは次のとおりです。

* `user`: ClickHouse のユーザー名。既定値は「default」です。
* `password`: ClickHouse のユーザーのパスワード。


### ALTER USER MAPPING {#alter-user-mapping}

ユーザー マッピングの定義を変更するには、[ALTER USER MAPPING] を使用します。

```sql
ALTER USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (SET user 'default');
```

オプションは [CREATE USER MAPPING](#create-user-mapping) の場合と同じです。


### DROP USER MAPPING {#drop-user-mapping}

ユーザーマッピングを削除するには、[DROP USER MAPPING] を使用します。

```sql
DROP USER MAPPING FOR CURRENT_USER SERVER taxi_srv;
```


### IMPORT FOREIGN SCHEMA {#import-foreign-schema}

[IMPORT FOREIGN SCHEMA] を使用して、ClickHouse データベース内で定義されているすべてのテーブルを、外部テーブルとして PostgreSQL のスキーマ内にインポートします。

```sql
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA demo FROM SERVER taxi_srv INTO taxi;
```

`LIMIT TO` を使用して、インポートするテーブルを特定のものに絞り込みます。

```sql
IMPORT FOREIGN SCHEMA demo LIMIT TO (trips) FROM SERVER taxi_srv INTO taxi;
```

`EXCEPT` を使用してテーブルを除外します:

```sql
IMPORT FOREIGN SCHEMA demo EXCEPT (users) FROM SERVER taxi_srv INTO taxi;
```

pg&#95;clickhouse は、指定された ClickHouse データベース（上記の例では &quot;demo&quot;）内のすべてのテーブルの一覧を取得し、各テーブルのカラム定義を取得したうえで、外部テーブルを作成するために [CREATE FOREIGN TABLE](#create-foreign-table) コマンドを実行します。カラムは、[サポートされているデータ型](#data-types) と、検出可能な場合には [CREATE FOREIGN TABLE](#create-foreign-table) でサポートされているオプションを使用して定義されます。


### CREATE FOREIGN TABLE {#create-foreign-table}

[IMPORT FOREIGN SCHEMA] を使用して、ClickHouse データベース内のデータを参照する外部テーブルを作成します。

```sql
CREATE FOREIGN TABLE uact (
    user_id    bigint NOT NULL,
    page_views int,
    duration   smallint,
    sign       smallint
) SERVER taxi_srv OPTIONS(
    table_name 'uact'
    engine 'CollapsingMergeTree'
);
```

サポートされているテーブルオプションは次のとおりです。

* `database`: リモートデータベース名。指定がない場合は、外部サーバーに対して定義されたデータベースが使用されます。
* `table_name`: リモートテーブル名。指定がない場合は、外部テーブルに指定された名前が使用されます。
* `engine`: ClickHouse テーブルで使用される[テーブルエンジン]。`CollapsingMergeTree()` および `AggregatingMergeTree()` の場合、pg&#95;clickhouse はテーブル上で実行される関数式にパラメータを自動的に適用します。

各カラムのリモート ClickHouse 側のデータ型に適した [data type](#data-types) を使用します。[AggregateFunction Type] および [SimpleAggregateFunction Type] カラムについては、データ型を関数に渡される ClickHouse の型にマッピングし、適切なカラムオプションを使用して集約関数名を指定します。

* `AggregateFunction`: [AggregateFunction Type] カラムに適用される集約関数の名前
* `SimpleAggregateFunction`: [SimpleAggregateFunction Type] カラムに適用される集約関数の名前

例:

(aggregatefunction &#39;sum&#39;)

```sql
CREATE FOREIGN TABLE test (
    column1 bigint  OPTIONS(AggregateFunction 'uniq'),
    column2 integer OPTIONS(AggregateFunction 'anyIf'),
    column3 bigint  OPTIONS(AggregateFunction 'quantiles(0.5, 0.9)')
) SERVER clickhouse_srv;
```

`AggregateFunction` 関数を持つカラムに対しては、pg&#95;clickhouse がそのカラムを評価する集約関数に自動的に `Merge` を付与します。


### ALTER FOREIGN TABLE {#alter-foreign-table}

[ALTER FOREIGN TABLE] を使用すると、外部テーブルの定義を変更できます。

```sql
ALTER TABLE table ALTER COLUMN b OPTIONS (SET AggregateFunction 'count');
```

サポートされるテーブルおよびカラムのオプションは、[CREATE FOREIGN TABLE] の場合と同様です。


### DROP FOREIGN TABLE {#drop-foreign-table}

[DROP FOREIGN TABLE] を使用して、外部テーブルを削除します。

```sql
DROP FOREIGN TABLE uact;
```

このコマンドは、外部テーブルに依存するオブジェクトが存在する場合は失敗します。
それらも合わせて削除するには、`CASCADE` 句を使用します。

```sql
DROP FOREIGN TABLE uact CASCADE;
```


## 関数と演算子のリファレンス {#function-and-operator-reference}

### データ型 {#data-types}

pg_clickhouse は、次の ClickHouse データ型を PostgreSQL データ型にマッピングします。

| ClickHouse |    PostgreSQL    |                 備考                  |
| -----------|------------------|--------------------------------------|
| Bool       | boolean          |                                      |
| Date       | date             |                                      |
| DateTime   | timestamp        |                                      |
| Decimal    | numeric          |                                      |
| Float32    | real             |                                      |
| Float64    | double precision |                                      |
| IPv4       | inet             |                                      |
| IPv6       | inet             |                                      |
| Int16      | smallint         |                                      |
| Int32      | integer          |                                      |
| Int64      | bigint           |                                      |
| Int8       | smallint         |                                      |
| JSON       | jsonb            | HTTP エンジンのみ                    |
| String     | text             |                                      |
| UInt16     | integer          |                                      |
| UInt32     | bigint           |                                      |
| UInt64     | bigint           | 値が BIGINT の最大値を超えるとエラー |
| UInt8      | smallint         |                                      |
| UUID       | uuid             |                                      |

### 関数 {#functions}

これらの関数は、ClickHouse データベースに対してクエリを実行するためのインターフェースを提供します。

#### `clickhouse_raw_query` {#clickhouse_raw_query}

```sql
SELECT clickhouse_raw_query(
    'CREATE TABLE t1 (x String) ENGINE = Memory',
    'host=localhost port=8123'
);
```

ClickHouse サービスに HTTP インターフェイス経由で接続し、単一のクエリを実行してから切断します。省略可能な 2 番目の引数には接続文字列を指定でき、指定しない場合のデフォルトは `host=localhost port=8123` です。サポートされている接続パラメータは次のとおりです。

* `host`: 接続先のホスト。必須。
* `port`: 接続先の HTTP ポート。`host` が ClickHouse Cloud のホストでない場合のデフォルトは `8123`、ClickHouse Cloud のホストである場合のデフォルトは `8443`
* `dbname`: 接続先のデータベース名。
* `username`: 接続時に使用するユーザー名。デフォルトは `default`
* `password`: 認証に使用するパスワード。デフォルトはパスワードなし

レコードを返さないクエリに便利ですが、値を返すクエリの場合は、単一のテキスト値として返されます。

```sql
SELECT clickhouse_raw_query(
    'SELECT schema_name, schema_owner from information_schema.schemata',
    'host=localhost port=8123'
);
```

```sql
      clickhouse_raw_query       
---------------------------------
 INFORMATION_SCHEMA      default+
 default default                +
 git     default                +
 information_schema      default+
 system  default                +
 
(1 row)
```


### プッシュダウン関数 {#pushdown-functions}

条件式（`HAVING` および `WHERE` 句）で使用される PostgreSQL のすべての組み込み関数は、ClickHouse 外部テーブルに対してクエリを実行する際、同じ名前とシグネチャのまま自動的に ClickHouse 側へプッシュダウンされます。ただし、一部の関数は名前やシグネチャが異なるため、同等の関数にマッピングする必要があります。`pg_clickhouse` は次の関数をマッピングします:

* `date_part`:
  * `date_part('day')`: [toDayOfMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfMonth)
  * `date_part('doy')`: [toDayOfYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfYear)
  * `date_part('dow')`: [toDayOfWeek](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfWeek)
  * `date_part('year')`: [toYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toYear)
  * `date_part('month')`: [toMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMonth)
  * `date_part('hour')`: [toHour](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toHour)
  * `date_part('minute')`: [toMinute](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMinute)
  * `date_part('second')`: [toSecond](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toSecond)
  * `date_part('quarter')`: [toQuarter](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toQuarter)
  * `date_part('isoyear')`: [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toISOYear)
  * `date_part('week')`: [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toISOWeek)
  * `date_part('epoch')`: [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toUnixTimestamp)
* `date_trunc`:
  * `date_trunc('week')`: [toMonday](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMonday)
  * `date_trunc('second')`: [toStartOfSecond](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfSecond)
  * `date_trunc('minute')`: [toStartOfMinute](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfMinute)
  * `date_trunc('hour')`: [toStartOfHour](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfHour)
  * `date_trunc('day')`: [toStartOfDay](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfDay)
  * `date_trunc('month')`: [toStartOfMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfMonth)
  * `date_trunc('quarter')`: [toStartOfQuarter](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfQuarter)
  * `date_trunc('year')`: [toStartOfYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfYear)
* `array_position`: [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)
* `btrim`: [trimBoth](https://clickhouse.com/docs/sql-reference/functions/string-functions#trimboth)
* `strpos`: [position](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#position)
* `regexp_like`: [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)

### カスタム関数 {#custom-functions}

`pg_clickhouse` によって作成されるこれらのカスタム関数は、PostgreSQL に同等の機能が存在しない一部の ClickHouse 関数に対して、外部クエリのプッシュダウンを可能にします。これらの関数のいずれかがプッシュダウンできない場合は、例外を発生させます。

* [dictGet](https://clickhouse.com/docs/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)

### キャストのプッシュダウン {#pushdown-casts}

pg_clickhouse は、互換性のあるデータ型に対して `CAST(x AS bigint)` のようなキャストをプッシュダウンします。互換性のない型の場合はプッシュダウンが失敗します。この例で `x` が ClickHouse の `UInt64` である場合、ClickHouse はその値のキャストを拒否します。

互換性のないデータ型へのキャストをプッシュダウンするために、pg_clickhouse は次の関数を提供します。これらの関数がプッシュダウンされなかった場合、PostgreSQL で例外をスローします。

* [toUInt8](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint8)
* [toUInt16](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint16)
* [toUInt32](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint32)
* [toUInt64](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint64)
* [toUInt128](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint128)

### プッシュダウンされる集約関数 {#pushdown-aggregates}

これらの PostgreSQL 集約関数は ClickHouse へプッシュダウンされます。

* [count](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/count)

### カスタム集約関数 {#custom-aggregates}

`pg_clickhouse` によって定義されるこれらのカスタム集約関数は、PostgreSQL に同等の機能が存在しない一部の ClickHouse 集約関数に対して、外部クエリのプッシュダウンを可能にします。これらの関数のいずれかをプッシュダウンできない場合は、例外を発生させます。

* [argMax](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/argmax)
* [argMin](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/argmin)
* [uniq](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqCombined64](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqHLL12](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqTheta](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqthetasketch)
* [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)

### プッシュダウンされる順序付き集合集約 {#pushdown-ordered-set-aggregates}

これらの [ordered-set aggregate functions] は、*direct argument* をパラメータとして渡し、`ORDER BY` の式を引数として渡すことで、ClickHouse の [Parametric
aggregate functions] に対応します。例えば、次の PostgreSQL クエリでは：

```sql
SELECT percentile_cont(0.25) WITHIN GROUP (ORDER BY a) FROM t1;
```

これは次の ClickHouse クエリに対応しています：

```sql
SELECT quantile(0.25)(a) FROM t1;
```

デフォルト以外の `ORDER BY` 句の接尾辞である `DESC` および `NULLS FIRST` はサポートされておらず、指定するとエラーになります。

* `percentile_cont(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantile(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantileExact(double)`: [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)


### セッション設定 {#session-settings}

`pg_clickhouse.session_settings` ランタイムパラメーターを設定して、
以降のクエリに適用される [ClickHouse settings] を構成します。例:

```sql
SET pg_clickhouse.session_settings = 'join_use_nulls 1, final 1';
```

デフォルトは `join_use_nulls 1` です。空文字列に設定すると、
ClickHouse サーバー側の設定が使用されます。

```sql
SET pg_clickhouse.session_settings = '';
```

この構文は、カンマ区切りのキーと値のペアのリストで、1つ以上のスペースで区切られます。キーは [ClickHouse settings] に対応している必要があります。値中の空白、カンマ、およびバックスラッシュは、バックスラッシュでエスケープします:

```sql
SET pg_clickhouse.session_settings = 'join_algorithm grace_hash\,hash';
```

スペースやカンマをエスケープせずに済むように値をシングルクォートで囲むか、二重引用符を重ねて書く必要がないように [dollar quoting] の利用を検討してください：

```sql
SET pg_clickhouse.session_settings = $$join_algorithm 'grace_hash,hash'$$;
```

可読性を重視し、設定項目が多い場合は、たとえば次のように複数行に分けて記述してください。

```sql
SET pg_clickhouse.session_settings TO $$
    connect_timeout 2,
    count_distinct_implementation uniq,
    final 1,
    group_by_use_nulls 1,
    join_algorithm 'prefer_partial_merge',
    join_use_nulls 1,
    log_queries_min_type QUERY_FINISH,
    max_block_size 32768,
    max_execution_time 45,
    max_result_rows 1024,
    metrics_perf_events_list 'this,that',
    network_compression_method ZSTD,
    poll_interval 5,
    totals_mode after_having_auto
$$;
```

pg&#95;clickhouse は設定を検証せず、すべてのクエリについて設定をそのまま ClickHouse に渡します。そのため、各 ClickHouse バージョンのすべての設定をサポートします。

なお、`pg_clickhouse.session_settings` を設定する前に pg&#95;clickhouse をロードしておく必要があります。[library preloading] を使用するか、拡張機能内のいずれかのオブジェクトを利用してロードされるようにしてください。


## 著者 {#authors}

* [David E. Wheeler](https://justatheory.com/)
* [Ildus Kurbangaliev](https://github.com/ildus)
* [Ibrar Ahmed](https://github.com/ibrarahmad)

## 著作権 {#copyright}

* Copyright (c) 2025-2026, ClickHouse
* Portions Copyright (c) 2023-2025, Ildus Kurbangaliev
* Portions Copyright (c) 2019-2023, Adjust GmbH
* Portions Copyright (c) 2012-2019, PostgreSQL Global Development Group

  [foreign data wrapper]: https://www.postgresql.org/docs/current/fdwhandler.html
    "PostgreSQL ドキュメント: Foreign Data Wrapper の作成"
  [Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse
    "Docker Hub 上の最新バージョン"
  [ClickHouse]: https://clickhouse.com/clickhouse
  [Semantic Versioning]: https://semver.org/spec/v2.0.0.html
    "セマンティック バージョニング 2.0.0"
  [CREATE EXTENSION]: https://www.postgresql.org/docs/current/sql-createextension.html
    "PostgreSQL ドキュメント: CREATE EXTENSION"
  [ALTER EXTENSION]: https://www.postgresql.org/docs/current/sql-alterextension.html
    "PostgreSQL ドキュメント: ALTER EXTENSION"
  [DROP EXTENSION]: https://www.postgresql.org/docs/current/sql-dropextension.html
    "PostgreSQL ドキュメント: DROP EXTENSION"
  [CREATE SERVER]: https://www.postgresql.org/docs/current/sql-createserver.html
    "PostgreSQL ドキュメント: CREATE SERVER"
  [ALTER SERVER]: https://www.postgresql.org/docs/current/sql-alterserver.html
    "PostgreSQL ドキュメント: ALTER SERVER"
  [DROP SERVER]: https://www.postgresql.org/docs/current/sql-dropserver.html
    "PostgreSQL ドキュメント: DROP SERVER"
  [CREATE USER MAPPING]: https://www.postgresql.org/docs/current/sql-createusermapping.html
    "PostgreSQL ドキュメント: CREATE USER MAPPING"
  [ALTER USER MAPPING]: https://www.postgresql.org/docs/current/sql-alterusermapping.html
    "PostgreSQL ドキュメント: ALTER USER MAPPING"
  [DROP USER MAPPING]: https://www.postgresql.org/docs/current/sql-dropusermapping.html
    "PostgreSQL ドキュメント: DROP USER MAPPING"
  [IMPORT FOREIGN SCHEMA]: https://www.postgresql.org/docs/current/sql-importforeignschema.html
    "PostgreSQL ドキュメント: IMPORT FOREIGN SCHEMA"
  [table engine]: https://clickhouse.com/docs/engines/table-engines
    "ClickHouse ドキュメント: テーブルエンジン"
  [AggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/aggregatefunction
    "ClickHouse ドキュメント: AggregateFunction 型"
  [SimpleAggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/simpleaggregatefunction
    "ClickHouse ドキュメント: SimpleAggregateFunction 型"
  [ordered-set aggregate functions]: https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE
  [Parametric aggregate functions]: https://clickhouse.com/docs/sql-reference/aggregate-functions/parametric-functions
  [ClickHouse settings]: https://clickhouse.com/docs/operations/settings/settings
    "ClickHouse ドキュメント: セッション設定"
  [dollar quoting]: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
    "PostgreSQL ドキュメント: ドル記号で囲まれた文字列定数"
  [library preloading]: https://www.postgresql.org/docs/18/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-PRELOAD
    "PostgreSQL ドキュメント: 共有ライブラリのプリロード"