---
slug: /integrations/s3
sidebar_position: 1
sidebar_label: 'ClickHouse と S3 の統合'
title: 'ClickHouse と S3 の統合'
description: 'S3 と ClickHouse を統合する方法を説明するページ'
---

import BucketDetails from '@site/docs/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';
import Image from '@theme/IdealImage';

# ClickHouse と S3 の統合

S3 から ClickHouse にデータを挿入することができ、また S3 をエクスポート先として使用することもできるため、「データレイク」アーキテクチャとの相互作用が可能になります。さらに、S3 は「コールド」ストレージ層を提供し、ストレージとコンピュートを分離するのに役立ちます。以下のセクションでは、ニューヨーク市のタクシーデータセットを使用して、S3 と ClickHouse の間でデータを移動するプロセスを示すとともに、主要な設定パラメータを特定し、パフォーマンスを最適化するためのヒントを提供します。

## S3 テーブル関数 {#s3-table-functions}

`s3` テーブル関数を使用すると、S3 互換ストレージからファイルを読み書きすることができます。この構文の概要は次のとおりです:

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

ここで、

* path — ファイルへのパスを含むバケット URL。このモードでは次のワイルドカードをサポートします: `*`, `?`, `{abc,def}` および `{N..M}` で、`N`, `M` は数字、`'abc'`, `'def'` は文字列です。詳細については、[パスでのワイルドカードの使用に関するドキュメント](/engines/table-engines/integrations/s3/#wildcards-in-path)を参照してください。
* format — ファイルの[フォーマット](/interfaces/formats#formats-overview)。
* structure — テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'` です。
* compression — このパラメータはオプションです。サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮を自動検出します。

パス式でワイルドカードを使用すると、複数のファイルを参照でき、並列処理の扉を開きます。

### 準備 {#preparation}

ClickHouse でテーブルを作成する前に、S3 バケット内のデータを詳細に確認したい場合があります。これは、`DESCRIBE` ステートメントを使用して ClickHouse から直接実行できます:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

`DESCRIBE TABLE` ステートメントの出力は、ClickHouse が S3 バケット内でこのデータをどのように自動的に推測するかを示します。また、gzip 圧縮形式を自動的に認識して解凍することに注意してください。

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') SETTINGS describe_compact_output=1

┌─name──────────────────┬─type───────────────┐
│ trip_id               │ Nullable(Int64)    │
│ vendor_id             │ Nullable(Int64)    │
│ pickup_date           │ Nullable(Date)     │
│ pickup_datetime       │ Nullable(DateTime) │
│ dropoff_date          │ Nullable(Date)     │
│ dropoff_datetime      │ Nullable(DateTime) │
│ store_and_fwd_flag    │ Nullable(Int64)    │
│ rate_code_id          │ Nullable(Int64)    │
│ pickup_longitude      │ Nullable(Float64)  │
│ pickup_latitude       │ Nullable(Float64)  │
│ dropoff_longitude     │ Nullable(Float64)  │
│ dropoff_latitude      │ Nullable(Float64)  │
│ passenger_count       │ Nullable(Int64)    │
│ trip_distance         │ Nullable(String)   │
│ fare_amount           │ Nullable(String)   │
│ extra                 │ Nullable(String)   │
│ mta_tax               │ Nullable(String)   │
│ tip_amount            │ Nullable(String)   │
│ tolls_amount          │ Nullable(Float64)  │
│ ehail_fee             │ Nullable(Int64)    │
│ improvement_surcharge │ Nullable(String)   │
│ total_amount          │ Nullable(String)   │
│ payment_type          │ Nullable(String)   │
│ trip_type             │ Nullable(Int64)    │
│ pickup                │ Nullable(String)   │
│ dropoff               │ Nullable(String)   │
│ cab_type              │ Nullable(String)   │
│ pickup_nyct2010_gid   │ Nullable(Int64)    │
│ pickup_ctlabel        │ Nullable(Float64)  │
│ pickup_borocode       │ Nullable(Int64)    │
│ pickup_ct2010         │ Nullable(String)   │
│ pickup_boroct2010     │ Nullable(String)   │
│ pickup_cdeligibil     │ Nullable(String)   │
│ pickup_ntacode        │ Nullable(String)   │
│ pickup_ntaname        │ Nullable(String)   │
│ pickup_puma           │ Nullable(Int64)    │
│ dropoff_nyct2010_gid  │ Nullable(Int64)    │
│ dropoff_ctlabel       │ Nullable(Float64)  │
│ dropoff_borocode      │ Nullable(Int64)    │
│ dropoff_ct2010        │ Nullable(String)   │
│ dropoff_boroct2010    │ Nullable(String)   │
│ dropoff_cdeligibil    │ Nullable(String)   │
│ dropoff_ntacode       │ Nullable(String)   │
│ dropoff_ntaname       │ Nullable(String)   │
│ dropoff_puma          │ Nullable(Int64)    │
└───────────────────────┴────────────────────┘
```

我々の S3 ベースのデータセットと対話するために、目的地として標準的な `MergeTree` テーブルを準備します。以下のステートメントは、デフォルトデータベースに `trips` というテーブルを作成します。特に、上記の推測に基づいていくつかのデータタイプを変更することを選択しました。特に、追加の保存データとパフォーマンスオーバーヘッドを引き起こす可能性のある [`Nullable()`](/sql-reference/data-types/nullable) データ型修飾子を使用しないことにしました。

```sql
CREATE TABLE trips
(
    `trip_id` UInt32,
    `vendor_id` Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
    `pickup_date` Date,
    `pickup_datetime` DateTime,
    `dropoff_date` Date,
    `dropoff_datetime` DateTime,
    `store_and_fwd_flag` UInt8,
    `rate_code_id` UInt8,
    `pickup_longitude` Float64,
    `pickup_latitude` Float64,
    `dropoff_longitude` Float64,
    `dropoff_latitude` Float64,
    `passenger_count` UInt8,
    `trip_distance` Float64,
    `fare_amount` Float32,
    `extra` Float32,
    `mta_tax` Float32,
    `tip_amount` Float32,
    `tolls_amount` Float32,
    `ehail_fee` Float32,
    `improvement_surcharge` Float32,
    `total_amount` Float32,
    `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
    `trip_type` UInt8,
    `pickup` FixedString(25),
    `dropoff` FixedString(25),
    `cab_type` Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
    `pickup_nyct2010_gid` Int8,
    `pickup_ctlabel` Float32,
    `pickup_borocode` Int8,
    `pickup_ct2010` String,
    `pickup_boroct2010` String,
    `pickup_cdeligibil` String,
    `pickup_ntacode` FixedString(4),
    `pickup_ntaname` String,
    `pickup_puma` UInt16,
    `dropoff_nyct2010_gid` UInt8,
    `dropoff_ctlabel` Float32,
    `dropoff_borocode` UInt8,
    `dropoff_ct2010` String,
    `dropoff_boroct2010` String,
    `dropoff_cdeligibil` String,
    `dropoff_ntacode` FixedString(4),
    `dropoff_ntaname` String,
    `dropoff_puma` UInt16
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
```

`pickup_date` フィールドでの [パーティショニング](/engines/table-engines/mergetree-family/custom-partitioning-key) の使用に注意してください。通常、パーティションキーはデータ管理のためのものですが、後でこのキーを使用して S3 への書き込みを並列化します。

タクシーデータセットの各エントリには、タクシートリップが含まれています。この匿名データは、S3 バケット https://datasets-documentation.s3.eu-west-3.amazonaws.com/ の **nyc-taxi** フォルダー内に圧縮された 20M レコードで構成されています。データは TSV 形式で、ファイルあたり約 1M 行です。

### S3 からのデータ読み取り {#reading-data-from-s3}

ClickHouse に永続化を必要とせずに、S3 データをソースとしてクエリできます。次のクエリでは、10 行のサンプルを取得します。ここでは、バケットが公開されているため、認証情報は不要です。

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

`TabSeparatedWithNames` フォーマットでは、カラム名が最初の行にエンコードされるため、カラムをリストする必要がありません。他のフォーマット、例えば `CSV` や `TSV` では、このクエリのために自動生成されたカラムが返されます。例えば、`c1`, `c2`, `c3` などです。

クエリは、バケットパスやファイル名に関する情報を提供する [仮想カラム](../sql-reference/table-functions/s3#virtual-columns)（`_path` と `_file`）もサポートしています。例えば:

```sql
SELECT  _path, _file, trip_id
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_0.gz', 'TabSeparatedWithNames')
LIMIT 5;
```

```response
┌─_path──────────────────────────────────────┬─_file──────┬────trip_id─┐
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999902 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999919 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999944 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999969 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999990 │
└────────────────────────────────────────────┴────────────┴────────────┘
```

このサンプルデータセットにおける行数を確認してください。ファイルの展開にワイルドカードを使用しているため、20 ファイルすべてを考慮しています。このクエリは、ClickHouse インスタンスのコア数に応じて約 10 秒かかります。

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

データをサンプリングし、探索クエリを実行するのには便利ですが、S3 から直接データを読み取るのは、定期的に行いたいことではありません。真剣に取り組む時が来たら、データを ClickHouse の `MergeTree` テーブルにインポートします。

### clickhouse-local の使用 {#using-clickhouse-local}

`clickhouse-local` プログラムを使用すると、ClickHouse サーバーをデプロイおよび構成することなく、ローカルファイル上で高速処理を実行できます。`s3` テーブル関数を使用したクエリはこのユーティリティで実行できます。例えば:

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

### S3 からのデータの挿入 {#inserting-data-from-s3}

ClickHouse のすべての機能を活用するために、次にデータを読み取り、インスタンスに挿入します。
`s3` 関数をシンプルな `INSERT` ステートメントと組み合わせて、これを達成します。ターゲットテーブルが必要な構造を提供するため、カラムをリストする必要はありません。カラムは `SELECT` 句内で指定された配置に従ってマッピングされます。すべての 10M 行の挿入には ClickHouse インスタンスに依存して数分かかる場合があります。以下では、迅速な応答を確保するために 1M 行を挿入します。必要に応じて `LIMIT` 句やカラム選択を調整してサブセットをインポートできます。

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```

### ClickHouse Local を使用したリモート挿入 {#remote-insert-using-clickhouse-local}

ネットワークセキュリティポリシーにより ClickHouse クラスターがアウトバウンド接続を行えない場合、`clickhouse-local` を使用して S3 データを挿入できる可能性があります。以下の例では、S3 バケットから読み込み、ClickHouse に `remote` 関数を使用して挿入します。

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
安全な SSL 接続を介してこれを実行するには、`remoteSecure` 関数を利用してください。
:::

### データのエクスポート {#exporting-data}

`s3` テーブル関数を使用して、S3 のファイルに書き込むことができます。これには適切な権限が必要です。リクエスト内で必要な認証情報を渡しますが、詳細は [認証情報の管理](#managing-credentials) ページを参照してください。

以下のシンプルな例では、ソースの代わりに宛先としてテーブル関数を使用します。ここでは、`trips` テーブルから 10,000 行をバケットにストリーミングし、`lz4` 圧縮および出力タイプの `CSV` を指定しています。

```sql
INSERT INTO FUNCTION
   s3(
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/csv/trips.csv.lz4',
       's3_key',
       's3_secret',
       'CSV'
    )
SELECT *
FROM trips
LIMIT 10000;
```

ここで、ファイルの形式は拡張子から推測されます。また、`s3` 関数内でカラムを指定する必要はありません - これは `SELECT` から推測できます。

### 大きなファイルの分割 {#splitting-large-files}

データを単一のファイルとしてエクスポートすることはないでしょう。ClickHouse を含むほとんどのツールは、複数のファイルに読み書きすることで、より高いスループット性能を得ることができます。ここでは `INSERT` コマンドを複数回実行し、データのサブセットをターゲットにすることができます。ClickHouse には、`PARTITION` キーを使用してファイルを自動的に分割する手段があります。

以下の例では、`rand()` 関数のモジュラスを使用して 10 ファイルを作成します。結果のパーティション ID がファイル名に参照されることに注意してください。これにより、数値サフィックスを持つ 10 ファイル（例: `trips_0.csv.lz4`, `trips_1.csv.lz4` など）が生成されます。

```sql
INSERT INTO FUNCTION
   s3(
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/csv/trips_{_partition_id}.csv.lz4',
       's3_key',
       's3_secret',
       'CSV'
    )
    PARTITION BY rand() % 10
SELECT *
FROM trips
LIMIT 100000;
```

また、データ内のフィールドを参照することもできます。このデータセットでは、`payment_type` が 5 のカーディナリティを持つ自然なパーティショニングキーを提供します。

```sql
INSERT INTO FUNCTION
   s3(
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/csv/trips_{_partition_id}.csv.lz4',
       's3_key',
       's3_secret',
       'CSV'
    )
    PARTITION BY payment_type
SELECT *
FROM trips
LIMIT 100000;
```

### クラスタの利用 {#utilizing-clusters}

上記の関数はすべて、単一ノードでの実行に制限されています。読み取り速度は、CPU コアに応じて線形にスケールしますが、他のリソース（通常はネットワーク）が飽和状態に達すると、それ以上はスケールできません。ユーザーは、`INSERT INTO SELECT` クエリを実行する際に分散テーブルに挿入することで、リソース圧力を軽減できますが、これは依然として単一ノードがデータを読み取り、解析し、処理することを意味します。この課題に対処し、読み取りを水平にスケールさせるために、[s3Cluster](/sql-reference/table-functions/s3Cluster.md) 関数があります。

クエリを受け取るノードはイニシエータと呼ばれ、クラスター内のすべてのノードへの接続を作成します。読み取る必要があるファイルを決定するためのグロブパターンが解決され、イニシエータはクラスター内のノードにファイルを分配します。これらのノードはワーカーとして機能し、読み取りを完了するごとに処理するファイルを要求します。このプロセスにより、読み取りを水平にスケールできます。

`s3Cluster` 関数は単一ノードのバリアントと同じ形式ですが、対象クラスタを指定する必要があり、ワーカーノードを示します:

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

* `cluster_name` — リモートおよびローカルサーバーへの接続パラメータとアドレスのセットを構築するために使用されるクラスタの名前。
* `source` — ファイルまたは複数のファイルへの URL。読み取り専用モードで次のワイルドカードをサポートします: `*`, `?`, `{'abc','def'}` および `{N..M}` で、`N`, `M` は数字、`abc`, `def` は文字列です。詳細については、[パスでのワイルドカード](https://clickhouse.com/docs/ja/engines/table-engines/integrations/s3#wildcards-in-path)を参照してください。
* `access_key_id` および `secret_access_key` — 指定されたエンドポイントで使用する認証情報を指定するキー。オプションです。
* `format` — ファイルの[フォーマット](/interfaces/formats#formats-overview)。
* `structure` — テーブルの構造。形式は 'column1_name column1_type, column2_name column2_type, ...' です。

`s3` 関数と同様に、バケットが不secureの場合、または環境を通じてセキュリティを定義する場合（例: IAM ロール）、認証情報はオプションです。ただし、`s3` 関数とは異なり、22.3.1 以降はリクエスト内で構造を指定する必要があります。すなわち、スキーマは推測されません。

この関数は、ほとんどの場合 `INSERT INTO SELECT` の一部として使用されます。この場合、分散テーブルに挿入することが多いです。以下に、`trips_all` が分散テーブルである単純な例を示します。このテーブルはイベントクラスタを使用していますが、読み取りと書き込みに使用されるノードの一貫性は要件ではありません。

```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

挿入はイニシエータノードに対して行われます。これは、読み取りが各ノードで行われる一方で、結果の行が分配のためにイニシエータにルーティングされることを意味します。高スループットのシナリオでは、これはボトルネックとなる可能性があります。この課題に対処するために、`s3cluster` 関数のためのパラメータ [parallel_distributed_insert_select](/operations/settings/settings/#parallel_distributed_insert_select) を設定してください。

## S3 テーブルエンジン {#s3-table-engines}

`s3` 関数は S3 に保存されたデータに対してアドホッククエリを実行できる一方で、構文が冗長です。これに対処するために、ClickHouse は S3 テーブルエンジンを提供します。

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

* `path` — ファイルへのパスを含むバケット URL。読み取り専用モードで次のワイルドカードをサポートします: `*`, `?`, `{abc,def}` および `{N..M}` で、`N`, `M` は数字、 `'abc'`, `'def'` は文字列です。詳細については、[こちら](/engines/table-engines/integrations/s3#wildcards-in-path)を参照してください。
* `format` — ファイルの[フォーマット](/interfaces/formats#formats-overview)。
* `aws_access_key_id`, `aws_secret_access_key` - AWS アカウントユーザーの長期認証情報。これを使用してリクエストを認証できます。このパラメータはオプションです。認証情報が指定されていない場合、構成ファイルの値が使用されます。詳細については、[認証情報の管理](#managing-credentials)を参照してください。
* `compression` — 圧縮タイプ。サポートされている値: none, gzip/gz, brotli/br, xz/LZMA, zstd/zst。このパラメータはオプションです。デフォルトでは、ファイル拡張子によって圧縮を自動検出します。

### データの読み取り {#reading-data}

以下の例では、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/` バケットにある最初の 10 個の TSV ファイルを使用して `trips_raw` という名前のテーブルを作成します。これらの各ファイルには 1M 行が含まれています。

```sql
CREATE TABLE trips_raw
(
   `trip_id`               UInt32,
   `vendor_id`             Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
   `pickup_date`           Date,
   `pickup_datetime`       DateTime,
   `dropoff_date`          Date,
   `dropoff_datetime`      DateTime,
   `store_and_fwd_flag`    UInt8,
   `rate_code_id`          UInt8,
   `pickup_longitude`      Float64,
   `pickup_latitude`       Float64,
   `dropoff_longitude`     Float64,
   `dropoff_latitude`      Float64,
   `passenger_count`       UInt8,
   `trip_distance`         Float64,
   `fare_amount`           Float32,
   `extra`                 Float32,
   `mta_tax`               Float32,
   `tip_amount`            Float32,
   `tolls_amount`          Float32,
   `ehail_fee`             Float32,
   `improvement_surcharge` Float32,
   `total_amount`          Float32,
   `payment_type_`         Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
   `trip_type`             UInt8,
   `pickup`                FixedString(25),
   `dropoff`               FixedString(25),
   `cab_type`              Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
   `pickup_nyct2010_gid`   Int8,
   `pickup_ctlabel`        Float32,
   `pickup_borocode`       Int8,
   `pickup_ct2010`         String,
   `pickup_boroct2010`     FixedString(7),
   `pickup_cdeligibil`     String,
   `pickup_ntacode`        FixedString(4),
   `pickup_ntaname`        String,
   `pickup_puma`           UInt16,
   `dropoff_nyct2010_gid`  UInt8,
   `dropoff_ctlabel`       Float32,
   `dropoff_borocode`      UInt8,
   `dropoff_ct2010`        String,
   `dropoff_boroct2010`    FixedString(7),
   `dropoff_cdeligibil`    String,
   `dropoff_ntacode`       FixedString(4),
   `dropoff_ntaname`       String,
   `dropoff_puma`          UInt16
) ENGINE = S3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{0..9}.gz', 'TabSeparatedWithNames', 'gzip');
```

`{0..9}` パターンの使用に注意して、最初の 10 ファイルに制限しています。テーブルを作成したら、他のテーブルと同様にこのテーブルをクエリできます。

```sql
SELECT DISTINCT(pickup_ntaname)
FROM trips_raw
LIMIT 10;

┌─pickup_ntaname───────────────────────────────────┐
│ Lenox Hill-Roosevelt Island                      │
│ Airport                                          │
│ SoHo-TriBeCa-Civic Center-Little Italy           │
│ West Village                                     │
│ Chinatown                                        │
│ Hudson Yards-Chelsea-Flatiron-Union Square       │
│ Turtle Bay-East Midtown                          │
│ Upper West Side                                  │
│ Murray Hill-Kips Bay                             │
│ DUMBO-Vinegar Hill-Downtown Brooklyn-Boerum Hill │
└──────────────────────────────────────────────────┘
```

### データの挿入 {#inserting-data}

`S3` テーブルエンジンは並列読み取りをサポートします。テーブル定義にグロブパターンが含まれている場合、書き込みはサポートされません。したがって、上記のテーブルは書き込みをブロックします。

書き込みを実証するために、書き込み可能な S3 バケットを指すテーブルを作成します。

```sql
CREATE TABLE trips_dest
(
   `trip_id`               UInt32,
   `pickup_date`           Date,
   `pickup_datetime`       DateTime,
   `dropoff_datetime`      DateTime,
   `tip_amount`            Float32,
   `total_amount`          Float32
) ENGINE = S3('<bucket path>/trips.bin', 'Native');
```

```sql
INSERT INTO trips_dest
   SELECT
      trip_id,
      pickup_date,
      pickup_datetime,
      dropoff_datetime,
      tip_amount,
      total_amount
   FROM trips
   LIMIT 10;
```

```sql
SELECT * FROM trips_dest LIMIT 5;
```

```response
┌────trip_id─┬─pickup_date─┬─────pickup_datetime─┬────dropoff_datetime─┬─tip_amount─┬─total_amount─┐
│ 1200018648 │  2015-07-01 │ 2015-07-01 00:00:16 │ 2015-07-01 00:02:57 │          0 │          7.3 │
│ 1201452450 │  2015-07-01 │ 2015-07-01 00:00:20 │ 2015-07-01 00:11:07 │       1.96 │        11.76 │
│ 1202368372 │  2015-07-01 │ 2015-07-01 00:00:40 │ 2015-07-01 00:05:46 │          0 │          7.3 │
│ 1200831168 │  2015-07-01 │ 2015-07-01 00:01:06 │ 2015-07-01 00:09:23 │          2 │         12.3 │
│ 1201362116 │  2015-07-01 │ 2015-07-01 00:01:07 │ 2015-07-01 00:03:31 │          0 │          5.3 │
└────────────┴─────────────┴─────────────────────┴─────────────────────┴────────────┴──────────────┘
```

新しいファイルにのみ行を挿入できることに注意してください。マージサイクルやファイル分割操作はありません。ファイルが書き込まれた後、後続の挿入は失敗します。ここでユーザーには2つの選択肢があります：

* 設定 `s3_create_new_file_on_insert=1` を指定します。これにより、各挿入時に新しいファイルが作成されます。各挿入操作の最後には数値サフィックスが付加されます。上記の例では、後続の挿入により `trips_1.bin` ファイルが作成されます。
* 設定 `s3_truncate_on_insert=1` を指定します。これにより、ファイルが切り詰められ、つまりファイルが完全に新しい挿入行のみを含むようになります。

これらの設定はデフォルトで0であるため、ユーザーはそのいずれかを設定する必要があります。`s3_truncate_on_insert` は、どちらも設定されている場合は優先されます。

`S3` テーブルエンジンに関しての注意点：

- 伝統的な `MergeTree` ファミリーテーブルとは異なり、`S3` テーブルを削除しても基盤データは削除されません。
- このテーブルタイプの完全な設定については、[こちら](/engines/table-engines/integrations/s3.md/#settings)を参照してください。
- このエンジンを使用する際の以下の注意点に注意してください：
    * ALTER クエリはサポートされていません。
    * SAMPLE 操ーションはサポートされていません。
    * インデックス（主キーやスキップなど）はありません。

## 認証情報の管理 {#managing-credentials}

前述の例では、`s3` 関数や `S3` テーブル定義に認証情報を渡しました。これは一時的な使用には適切かもしれませんが、ユーザーは本番環境でのより明示的ではない認証メカニズムを必要とします。これに対処するために、ClickHouse にはいくつかのオプションがあります：

* **config.xml** または **conf.d** 下の同等の構成ファイルに接続詳細を指定します。以下に、Debian パッケージを使用してインストールした場合の例ファイルの内容を示します。

    ```xml
    ubuntu@single-node-clickhouse:/etc/clickhouse-server/config.d$ cat s3.xml
    <clickhouse>
        <s3>
            <endpoint-name>
                <endpoint>https://dalem-files.s3.amazonaws.com/test/</endpoint>
                <access_key_id>key</access_key_id>
                <secret_access_key>secret</secret_access_key>
                <!-- <use_environment_credentials>false</use_environment_credentials> -->
                <!-- <header>Authorization: Bearer SOME-TOKEN</header> -->
            </endpoint-name>
        </s3>
    </clickhouse>
    ```

    これらの認証情報は、エンドポイントがリクエスト URL に正確に一致する場合に使用されます。また、こちらの例ではアクセストークンに代わって認証ヘッダーを宣言できることにも注意してください。サポートされている設定の完全なリストは、[こちら](/engines/table-engines/integrations/s3.md/#settings)で確認できます。

* 上記の例は、`use_environment_credentials` 構成パラメータの可用性を強調しています。この構成パラメータは、`s3` レベルでグローバルに設定することもできます：

    ```xml
    <clickhouse>
        <s3>
        <use_environment_credentials>true</use_environment_credentials>
        </s3>
    </clickhouse>
    ```

    この設定は、環境から S3 認証情報を取得しようとする試みをオンにし、IAM ロールを通じてのアクセスを可能にします。具体的には、次の取得の順序が実行されます：

   * 環境変数 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN` の検索
   * **$HOME/.aws** でのチェック
   * AWS セキュリティトークンサービス経由での一時認証情報の取得 - すなわち、[`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) API によるもの
   * ECS 環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` または `AWS_CONTAINER_CREDENTIALS_FULL_URI` と `AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN` における認証情報のチェック
   * [AWS_EC2_METADATA_DISABLED](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list-AWS_EC2_METADATA_DISABLED) が true でない場合に提供される [Amazon EC2 インスタンスメタデータ](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-metadata.html)による認証情報の取得。
   * これらの設定は、特定のエンドポイントにも設定でき、同じ接頭辞一致ルールが使用されます。

## パフォーマンスの最適化 {#s3-optimizing-performance}

S3 関数を使用して読み込みと挿入を最適化する方法については、[専用のパフォーマンスガイド](./performance.md)を参照してください。

### S3 ストレージの調整 {#s3-storage-tuning}

内部的に、ClickHouse マージツリーは主に2つのストレージフォーマットを使用します: [`Wide` と `Compact`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)。現在の実装は、ClickHouse のデフォルト動作（`min_bytes_for_wide_part` と `min_rows_for_wide_part` 設定を通じて制御）を使用していますが、今後のリリースでは S3 に対する動作が分岐すると期待されます。例えば、より大きなデフォルト値の `min_bytes_for_wide_part` により、`Compact` 形式を奨励し、ファイルを減少させることができます。ユーザーは、専ら S3 ストレージを使用する場合、これらの設定を調整したいと考えるかもしれません。

## S3 バックの MergeTree {#s3-backed-mergetree}

`s3` 関数および関連テーブルエンジンは、一般的な ClickHouse 構文を使用して S3 にデータをクエリできるようにします。しかし、データ管理機能およびパフォーマンスに関しては、制限があります。主インデックスのサポート、キャッシュサポートはなく、ファイルの挿入をユーザーが管理する必要があります。

ClickHouse は、S3 が魅力的なストレージソリューションであることを認識しており、特に「コールド」データに対するクエリパフォーマンスがあまり重要でない場合、ユーザーがストレージとコンピュートを分離することを望んでいると考えています。この達成を支援するために、S3 を MergeTree エンジンのストレージとして使用できるようにサポートが提供されています。これにより、ユーザーは S3 のスケーラビリティとコストメリット、および MergeTree エンジンの挿入およびクエリパフォーマンスを活用できるようになります。

### ストレージティア {#storage-tiers}

ClickHouseのストレージボリュームは、MergeTreeテーブルエンジンから物理ディスクを抽象化することができます。単一のボリュームは、ディスクの整列されたセットで構成されることができます。これは、データストレージに複数のブロックデバイスを使用できるようにする原則に加え、S3を含む他のストレージタイプも許可します。ClickHouseのデータパーツは、ストレージポリシーに従ってボリューム間で移動でき、その充填率に応じて、ストレージティアの概念を作成します。

ストレージティアは、最新のデータをホットコールドアーキテクチャで利用できるようにし、通常は最もクエリされるデータが高性能なストレージ（例えば、NVMe SSD）上でごく少量のスペースのみを必要とします。データが古くなるにつれて、クエリ時間のSLAが増加し、クエリ頻度も増加します。この「太い尾」のデータは、HDDやS3のようなオブジェクトストレージのような、より遅くパフォーマンスの低いストレージに保存できます。

### ディスクの作成 {#creating-a-disk}

S3バケットをディスクとして利用するには、まずClickHouseの設定ファイル内で宣言する必要があります。config.xmlを拡張するか、好ましくはconf.dに新しいファイルを提供します。以下に示すのは、S3ディスクの宣言の例です。

```xml
<clickhouse>
    <storage_configuration>
        ...
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>https://sample-bucket.s3.us-east-2.amazonaws.com/tables/</endpoint>
                <access_key_id>your_access_key_id</access_key_id>
                <secret_access_key>your_secret_access_key</secret_access_key>
                <region></region>
                <metadata_path>/var/lib/clickhouse/disks/s3/</metadata_path>
            </s3>
            <s3_cache>
                <type>cache</type>
                <disk>s3</disk>
                <path>/var/lib/clickhouse/disks/s3_cache/</path>
                <max_size>10Gi</max_size>
            </s3_cache>
        </disks>
        ...
    </storage_configuration>
</clickhouse>
```

このディスク宣言に関連する設定の完全なリストは[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で見つけることができます。認証情報は、[Managing credentials](#managing-credentials)で説明されているのと同じ方法で管理できます。すなわち、上記設定ブロックでuse_environment_credentialsをtrueに設定することでIAMロールを使用できます。

### ストレージポリシーの作成 {#creating-a-storage-policy}

構成後、この「ディスク」はポリシー内で宣言されたストレージボリュームによって使用されます。以下の例では、s3が唯一のストレージであると仮定します。これは、TTLや充填率に基づいてデータを移動させることが可能なより複雑なホットコールドアーキテクチャを無視しています。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
            ...
            </s3>
            <s3_cache>
            ...
            </s3_cache>
        </disks>
        <policies>
            <s3_main>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3_main>
        </policies>
    </storage_configuration>
</clickhouse>
```

### テーブルの作成 {#creating-a-table}

ディスクが書き込みアクセスを持つバケットを使用するように構成されていると仮定すると、以下の例のようにテーブルを作成できるはずです。簡潔さを保つため、NYCタクシーのカラムのサブセットを使用し、データを直接s3バックテーブルにストリームします。

```sql
CREATE TABLE trips_s3
(
   `trip_id` UInt32,
   `pickup_date` Date,
   `pickup_datetime` DateTime,
   `dropoff_datetime` DateTime,
   `pickup_longitude` Float64,
   `pickup_latitude` Float64,
   `dropoff_longitude` Float64,
   `dropoff_latitude` Float64,
   `passenger_count` UInt8,
   `trip_distance` Float64,
   `tip_amount` Float32,
   `total_amount` Float32,
   `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
SETTINGS storage_policy='s3_main'
```

```sql
INSERT INTO trips_s3 SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

ハードウェアに依存しますが、この1百万行の挿入は数分かかる場合があります。進行状況はsystem.processesテーブルで確認できます。行数を最大10百万まで調整し、サンプルクエリを探索してください。

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_s3 GROUP BY passenger_count;
```

### テーブルの変更 {#modifying-a-table}

時折、ユーザーが特定のテーブルのストレージポリシーを変更する必要があります。これは可能ではありますが、制限があります。新しいターゲットポリシーは、前のポリシーのすべてのディスクとボリュームを含める必要があり、データはポリシーの変更を満たすために移行されません。これらの制約を検証する際、ボリュームとディスクはその名前で識別され、違反を試みるとエラーが発生します。しかし、前の例を使用する場合、以下の変更は有効です。

```xml
<policies>
   <s3_main>
       <volumes>
           <main>
               <disk>s3</disk>
           </main>
       </volumes>
   </s3_main>
   <s3_tiered>
       <volumes>
           <hot>
               <disk>default</disk>
           </hot>
           <main>
               <disk>s3</disk>
           </main>
       </volumes>
       <move_factor>0.2</move_factor>
   </s3_tiered>
</policies>
```

```sql
ALTER TABLE trips_s3 MODIFY SETTING storage_policy='s3_tiered'
```

ここでは新しいs3_tieredポリシーにメインボリュームを再利用し、新しいホットボリュームを導入します。これには、パラメータ`<path>`経由で構成された1つのディスクのみを含むデフォルトディスクが使用されます。ボリューム名とディスクは変更されないことに注意してください。新しい挿入は、この移動因子*ディスクサイズに達するまでデフォルトディスクに残り、その時点でデータはS3に移動されます。

### レプリケーションの処理 {#handling-replication}

S3ディスクを用いたレプリケーションは、`ReplicatedMergeTree`テーブルエンジンを使用することで実現できます。詳細は、[S3オブジェクトストレージを使用して2つのAWSリージョンにわたって単一のシャードをレプリケートする](#s3-multi-region)ガイドを参照ください。

### 読み書き {#read--writes}

以下のノートは、ClickHouseとのS3インタラクションの実装に関するものです。一般的には情報提供に過ぎませんが、[パフォーマンス最適化](#s3-optimizing-performance)の際に読者にとって役立つかもしれません：

* デフォルトでは、クエリ処理パイプラインの任意のステージで使用される最大クエリ処理スレッド数は、コア数と等しいです。一部のステージは他よりも並列化されやすいため、この値は上限を提供します。ディスクからデータがストリームされるため、複数のクエリステージが同時に実行されることがあります。したがって、クエリに使用されるスレッドの正確な数はこれを超える場合があります。この値は、[max_threads](/operations/settings/settings#max_threads)設定を通じて変更可能です。
* S3での読み込みはデフォルトで非同期です。この動作は、デフォルトで`threadpool`として設定されている`remote_filesystem_read_method`により決定されます。リクエストを処理する際、ClickHouseはストライプの中でグラニュールを読み込みます。これらのストライプには、潜在的に多くのカラムが含まれています。スレッドは、グラニュールのカラムを1つずつ読み込みます。これを同期的に行うのではなく、データを待つ前にすべてのカラムのプリフェッチを行います。これにより、各カラムの同期的待機よりも大幅なパフォーマンス向上が実現されます。ユーザーはほとんどの場合、この設定を変更する必要はありません - [パフォーマンスの最適化](#s3-optimizing-performance)を参照してください。
* 書き込みは並行して行われ、最大100の同時ファイル書き込みスレッドが使用されます。`max_insert_delayed_streams_for_parallel_write`はデフォルト値1000で設定されており、並行して書き込まれるS3ブロブの数を制御します。書き込まれる各ファイルに対してバッファが必要であるため（おおよそ1MB）、これはINSERTのメモリ消費を制限します。サーバーメモリが少ないシナリオではこの値を下げることが適切です。

## ClickHouseディスクとしてS3オブジェクトストレージを使用する {#configuring-s3-for-clickhouse-use}

バケットとIAMロールを作成するための手順を必要とする場合は、**S3バケットとIAMロールを作成**を展開し、続けてください：

<BucketDetails />
### ClickHouseをS3バケットをディスクとして使用するように設定 {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}
以下の例は、デフォルトのClickHouseディレクトリでサービスとしてインストールされたLinux Debianパッケージに基づいています。

1. ClickHouseの`config.d`ディレクトリに新しいファイルを作成してストレージ設定を保存します。
```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```
2. ストレージ設定のために以下を追加します。以前の手順からバケットパス、アクセスキー、シークレットキーを置き換えます。
```xml
<clickhouse>
  <storage_configuration>
    <disks>
      <s3_disk>
        <type>s3</type>
        <endpoint>https://mars-doc-test.s3.amazonaws.com/clickhouse3/</endpoint>
        <access_key_id>ABC123</access_key_id>
        <secret_access_key>Abc+123</secret_access_key>
        <metadata_path>/var/lib/clickhouse/disks/s3_disk/</metadata_path>
      </s3_disk>
      <s3_cache>
        <type>cache</type>
        <disk>s3_disk</disk>
        <path>/var/lib/clickhouse/disks/s3_cache/</path>
        <max_size>10Gi</max_size>
      </s3_cache>
    </disks>
    <policies>
      <s3_main>
        <volumes>
          <main>
            <disk>s3_disk</disk>
          </main>
        </volumes>
      </s3_main>
    </policies>
  </storage_configuration>
</clickhouse>
```

:::note
`<disks>`タグ内の`s3_disk`と`s3_cache`タグは任意のラベルです。これを他の名前に設定することもできますが、`<policies>`タグ内の`<disk>`タブで同じラベルを使用してディスクを参照する必要があります。`<S3_main>`タグも任意で、ClickHouse内のリソース作成時の識別子として使用されるポリシーの名前です。

上記の設定は、ClickHouseバージョン22.8以降のものです。古いバージョンを使用している場合は、[データの保存](/operations/storing-data.md/#using-local-cache)ドキュメントを参照してください。

S3使用についての詳細は次のとおりです：
統合ガイド：[S3バッキングのMergeTree](#s3-backed-mergetree)
:::

3. ファイルの所有者を`clickhouse`ユーザーおよびグループに更新します。
```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```
4. 変更を有効にするためにClickHouseインスタンスを再起動します。
```bash
service clickhouse-server restart
```
### テスト {#testing}
1. ClickHouseクライアントでログインします。以下のようなコマンドを使用します。
```bash
clickhouse-client --user default --password ClickHouse123!
```
2. 新しいS3ストレージポリシーを指定してテーブルを作成します。
```sql
CREATE TABLE s3_table1
           (
               `id` UInt64,
               `column1` String
           )
           ENGINE = MergeTree
           ORDER BY id
           SETTINGS storage_policy = 's3_main';
```

3. テーブルが正しいポリシーで作成されたことを確認します。
```sql
SHOW CREATE TABLE s3_table1;
```
```response
┌─statement────────────────────────────────────────────────────
│ CREATE TABLE default.s3_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = MergeTree
ORDER BY id
SETTINGS storage_policy = 's3_main', index_granularity = 8192
└──────────────────────────────────────────────────────────────
```

4. テスト行をテーブルに挿入します。
```sql
INSERT INTO s3_table1
           (id, column1)
           VALUES
           (1, 'abc'),
           (2, 'xyz');
```
```response
INSERT INTO s3_table1 (id, column1) FORMAT Values

Query id: 0265dd92-3890-4d56-9d12-71d4038b85d5

Ok.

2 rows in set. Elapsed: 0.337 sec.
```
5. 行を表示します。
```sql
SELECT * FROM s3_table1;
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

2 rows in set. Elapsed: 0.284 sec.
```
6. AWSコンソールでバケットに移動し、新しいバケットとフォルダーを選択します。次のようなものが表示されるはずです。

<Image img={S3J} size="lg" border alt="S3 bucket view in AWS console showing ClickHouse data files stored in S3" />
## S3オブジェクトストレージを介して単一のシャードを2つのAWSリージョンにレプリケートする {#s3-multi-region}

:::tip
ClickHouse Cloudではオブジェクトストレージがデフォルトで使用されるため、ClickHouse Cloudで実行している場合はこの手順に従う必要はありません。
:::
### デプロイメントの計画 {#plan-the-deployment}
このチュートリアルは、AWS EC2に2つのClickHouse Serverノードと3つのClickHouse Keeperノードを展開することに基づいています。ClickHouseサーバーのデータストアはS3です。それぞれのリージョンにClickHouse ServerとS3バケットがあり、災害復旧をサポートするために利用されます。

ClickHouseテーブルは2つのサーバー間で、したがって2つのリージョン間でレプリケートされます。
### ソフトウェアのインストール {#install-software}
#### ClickHouseサーバーノード {#clickhouse-server-nodes}
ClickHouseサーバーノードのデプロイ手順を実行する際は、[インストール手順](/getting-started/install/install.mdx)を参照してください。
#### ClickHouseのデプロイ {#deploy-clickhouse}

2つのホストにClickHouseをデプロイします。サンプル構成では、`chnode1`と`chnode2`と呼ばれます。

`chnode1`を1つのAWSリージョンに、`chnode2`を別のリージョンに配置します。
#### ClickHouse Keeperのデプロイ {#deploy-clickhouse-keeper}

3つのホストにClickHouse Keeperをデプロイします。サンプル構成では、これらは`keepernode1`、`keepernode2`、および`keepernode3`と呼ばれます。`keepernode1`は`chnode1`と同じリージョンに、`keepernode2`は`chnode2`と、`keepernode3`はどちらのリージョンにも配置できますが、そのリージョンにあるClickHouseノードとは異なるアベイラビリティゾーンに配置します。

ClickHouse Keeperノードのデプロイ手順を実行する際は、[インストール手順](/getting-started/install/install.mdx)を参照してください。
### S3バケットの作成 {#create-s3-buckets}

`chnode1`と`chnode2`を配置した各リージョンに1つずつ、2つのS3バケットを作成します。

バケットとIAMロールを作成する手順が必要な場合は、**S3バケットとIAMロールを作成**を展開し、続けてください：

<BucketDetails />

その後、構成ファイルは`/etc/clickhouse-server/config.d/`に配置されます。以下は、1つのバケットのサンプル構成ファイルで、他のものは3行が異なる点を除いて類似しています。

```xml title="/etc/clickhouse-server/config.d/storage_config.xml"
<clickhouse>
  <storage_configuration>
     <disks>
        <s3_disk>
           <type>s3</type>
        <!--highlight-start-->
           <endpoint>https://docs-clickhouse-s3.s3.us-east-2.amazonaws.com/clickhouses3/</endpoint>
           <access_key_id>ABCDEFGHIJKLMNOPQRST</access_key_id>
           <secret_access_key>Tjdm4kf5snfkj303nfljnev79wkjn2l3knr81007</secret_access_key>
        <!--highlight-end-->
           <metadata_path>/var/lib/clickhouse/disks/s3_disk/</metadata_path>
        </s3_disk>

        <s3_cache>
           <type>cache</type>
           <disk>s3</disk>
           <path>/var/lib/clickhouse/disks/s3_cache/</path>
           <max_size>10Gi</max_size>
        </s3_cache>
     </disks>
        <policies>
            <s3_main>
                <volumes>
                    <main>
                        <disk>s3_disk</disk>
                    </main>
                </volumes>
            </s3_main>
    </policies>
   </storage_configuration>
</clickhouse>
```
:::note
このガイドの多くの手順では、構成ファイルを`/etc/clickhouse-server/config.d/`に配置するように求められます。これはLinuxシステムにおける構成のオーバーライドファイルのデフォルトの場所です。これらのファイルをそのディレクトリに配置すると、ClickHouseはその内容を使用してデフォルトの構成をオーバーライドします。このオーバーライドディレクトリにファイルを配置することで、アップグレード中に構成を失うのを避けることができます。
:::
### ClickHouse Keeperの設定 {#configure-clickhouse-keeper}

ClickHouse Keeperをスタンドアロン（ClickHouseサーバーとは別に）で実行する場合、設定は単一のXMLファイルになります。このチュートリアルでは、ファイルは`/etc/clickhouse-keeper/keeper_config.xml`です。すべてのKeeperサーバーは、1つの設定が異なる状態で同じ構成を使用します；`<server_id>`です。

`server_id`は、この構成ファイルが使用されるホストに割り当てられるIDを示します。以下の例では、`server_id`は`3`であり、ファイル内の`<raft_configuration>`セクションのさらに下に進むと、サーバー3にはホスト名`keepernode3`が設定されています。これにより、ClickHouse Keeperプロセスはリーダーを選択する際に接続すべき他のサーバーを認識します。

```xml title="/etc/clickhouse-keeper/keeper_config.xml"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
<!--highlight-next-line-->
        <server_id>3</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>warning</raft_logs_level>
        </coordination_settings>

        <raft_configuration>
            <server>
                <id>1</id>
                <hostname>keepernode1</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>2</id>
                <hostname>keepernode2</hostname>
                <port>9234</port>
            </server>
<!--highlight-start-->
            <server>
                <id>3</id>
                <hostname>keepernode3</hostname>
                <port>9234</port>
            </server>
<!--highlight-end-->
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

ClickHouse Keeperの構成ファイルを配置します（`<server_id>`を設定することを忘れずに）：
```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```
### ClickHouseサーバーの設定 {#configure-clickhouse-server}
#### クラスタ定義 {#define-a-cluster}

ClickHouseクラスタは、構成の`<remote_servers>`セクションで定義されます。このサンプルでは、`cluster_1S_2R`という1つのクラスタが定義されており、これは1つのシャードで2つのレプリカで構成されています。レプリカは`chnode1`と`chnode2`に配置されています。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>chnode2</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
</clickhouse>
```

クラスタ作成時には、DDLクエリ内にクラスタ、シャード、レプリカの設定を埋め込むためのマクロを定義することが便利です。このサンプルでは、`shard`や`replica`の詳細を指定せずに、レプリケートテーブルエンジンの使用を指定できます。テーブルを作成する際には、`system.tables`をクエリして`shard`と`replica`のマクロがどのように使用されるかを確認できます。

```xml title="/etc/clickhouse-server/config.d/macros.xml"
<clickhouse>
    <distributed_ddl>
            <path>/clickhouse/task_queue/ddl</path>
    </distributed_ddl>
    <macros>
        <cluster>cluster_1S_2R</cluster>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
</clickhouse>
```
:::note
上記のマクロは`chnode1`用であり、`chnode2`では`replica`を`replica_2`に設定します。
:::
#### ゼロコピー複製を無効にする {#disable-zero-copy-replication}

ClickHouseのバージョン22.7以下では、`allow_remote_fs_zero_copy_replication`設定は、S3およびHDFSディスクに対してデフォルトで`true`に設定されています。この設定は、この災害復旧シナリオのために`false`に設定する必要があり、バージョン22.8以降はデフォルトで`false`に設定されています。

この設定は2つの理由から`false`である必要があります：1）この機能はプロダクション用ではない；2）災害復旧シナリオでは、データとメタデータの両方が複数のリージョンに保存される必要があります。`allow_remote_fs_zero_copy_replication`を`false`に設定します。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

ClickHouse Keeperは、ClickHouseノード間でのデータの複製を調整します。ClickHouseにClickHouse Keeperノードを通知するために、各ClickHouseノードに設定ファイルを追加します。

```xml title="/etc/clickhouse-server/config.d/use_keeper.xml"
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>keepernode1</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>keepernode2</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>keepernode3</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```
### ネットワーキングの設定 {#configure-networking}

AWSでのセキュリティ設定を構成する際には、[ネットワークポート](../../../guides/sre/network-ports.md)リストを参照し、サーバー間で通信できるようにし、またそれらと通信できるようにします。

すべての3つのサーバーがネットワーク接続をリッスンする必要があります。これにより、それらはサーバー間及びS3との通信を行うことができます。デフォルトでは、ClickHouseはループバックアドレスでのみリッスンするため、これを変更する必要があります。これは`/etc/clickhouse-server/config.d/`で設定されます。以下は、ClickHouseとClickHouse KeeperがすべてのIP v4インターフェースでリッスンするように設定するサンプルです。詳細は、ドキュメントやデフォルトの構成ファイル`/etc/clickhouse/config.xml`を参照してください。

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```
### サーバーの起動 {#start-the-servers}
#### ClickHouse Keeperを実行 {#run-clickhouse-keeper}

各Keeperサーバーで、オペレーティングシステムに応じたコマンドを実行します。たとえば：

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```
#### ClickHouse Keeperのステータスチェック {#check-clickhouse-keeper-status}

`netcat`でClickHouse Keeperにコマンドを送信します。例えば、`mntr`はClickHouse Keeperクラスタの状態を返します。このコマンドを各Keeperノードで実行すると、1つがリーダーで、他の2つがフォロワーであることが確認できます。

```bash
echo mntr | nc localhost 9181
```
```response
zk_version      v22.7.2.15-stable-f843089624e8dd3ff7927b8a125cf3a7a769c069
zk_avg_latency  0
zk_max_latency  11
zk_min_latency  0
zk_packets_received     1783
zk_packets_sent 1783

# highlight-start
zk_num_alive_connections        2
zk_outstanding_requests 0
zk_server_state leader

# highlight-end
zk_znode_count  135
zk_watch_count  8
zk_ephemerals_count     3
zk_approximate_data_size        42533
zk_key_arena_size       28672
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   182
zk_max_file_descriptor_count    18446744073709551615

# highlight-start
zk_followers    2
zk_synced_followers     2

# highlight-end
```
#### ClickHouseサーバーを実行 {#run-clickhouse-server}

各ClickHouseサーバーで実行します。

```bash
sudo service clickhouse-server start
```
#### ClickHouseサーバーの確認 {#verify-clickhouse-server}

[クラスタの構成](#define-a-cluster)を追加した際に、2つのClickHouseノードにわたって単一のシャードがレプリケートされることが定義されました。この検証ステップでは、ClickHouseが起動したときにクラスタが構築されていたことを確認し、そのクラスタを使用してレプリケートテーブルを作成します。
- クラスタが存在することを確認します：
  ```sql
  show clusters
  ```
  ```response
  ┌─cluster───────┐
  │ cluster_1S_2R │
  └───────────────┘

  1 row in set. Elapsed: 0.009 sec. `
  ```

- クラスタ内にテーブルを作成します。`ReplicatedMergeTree`テーブルエンジンを使用します：
  ```sql
  create table trips on cluster 'cluster_1S_2R' (
   `trip_id` UInt32,
   `pickup_date` Date,
   `pickup_datetime` DateTime,
   `dropoff_datetime` DateTime,
   `pickup_longitude` Float64,
   `pickup_latitude` Float64,
   `dropoff_longitude` Float64,
   `dropoff_latitude` Float64,
   `passenger_count` UInt8,
   `trip_distance` Float64,
   `tip_amount` Float32,
   `total_amount` Float32,
   `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4))
  ENGINE = ReplicatedMergeTree
  PARTITION BY toYYYYMM(pickup_date)
  ORDER BY pickup_datetime
  SETTINGS storage_policy='s3_main'
  ```
  ```response
  ┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
  │ chnode1 │ 9000 │      0 │       │                   1 │                0 │
  │ chnode2 │ 9000 │      0 │       │                   0 │                0 │
  └─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
  ```
- 以前に定義したマクロの使用を理解する

  マクロの`shard`と`replica`は[前述の通り](#define-a-cluster)定義されており、以下の強調された行では、各ClickHouseノードで値が置き換えられていることがわかります。また、値の`uuid`も使用されています。`uuid`はマクロには定義されていませんが、システムによって生成されます。
  ```sql
  SELECT create_table_query
  FROM system.tables
  WHERE name = 'trips'
  FORMAT Vertical
  ```
  ```response
  Query id: 4d326b66-0402-4c14-9c2f-212bedd282c0

  Row 1:
  ──────
  create_table_query: CREATE TABLE default.trips (`trip_id` UInt32, `pickup_date` Date, `pickup_datetime` DateTime, `dropoff_datetime` DateTime, `pickup_longitude` Float64, `pickup_latitude` Float64, `dropoff_longitude` Float64, `dropoff_latitude` Float64, `passenger_count` UInt8, `trip_distance` Float64, `tip_amount` Float32, `total_amount` Float32, `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4))
  # highlight-next-line
  ENGINE = ReplicatedMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
  PARTITION BY toYYYYMM(pickup_date) ORDER BY pickup_datetime SETTINGS storage_policy = 's3_main'

  1 row in set. Elapsed: 0.012 sec.
  ```
  :::note
  上記の`clickhouse/tables/{uuid}/{shard}`で示されたZookeeperパスは、`default_replica_path`と`default_replica_name`を設定することでカスタマイズ可能です。詳細は[こちら](/operations/server-configuration-parameters/settings.md/#default_replica_path)を参照してください。
  :::
### テスト {#testing-1}

これらのテストは、データが2つのサーバー間でレプリケートされ、S3バケットに保存されていることを確認します。ローカルディスクには保存されていません。

- ニューヨーク市タクシーデータセットからデータを追加します：
  ```sql
  INSERT INTO trips
  SELECT trip_id,
         pickup_date,
         pickup_datetime,
         dropoff_datetime,
         pickup_longitude,
         pickup_latitude,
         dropoff_longitude,
         dropoff_latitude,
         passenger_count,
         trip_distance,
         tip_amount,
         total_amount,
         payment_type
     FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
  ```
- データがS3に保存されていることを確認します。

  このクエリは、ディスク上のデータのサイズと、どのディスクが使用されているかを確認するために使用されます。
  ```sql
  SELECT
      engine,
      data_paths,
      metadata_path,
      storage_policy,
      formatReadableSize(total_bytes)
  FROM system.tables
  WHERE name = 'trips'
  FORMAT Vertical
  ```
  ```response
  Query id: af7a3d1b-7730-49e0-9314-cc51c4cf053c

  Row 1:
  ──────
  engine:                          ReplicatedMergeTree
  data_paths:                      ['/var/lib/clickhouse/disks/s3_disk/store/551/551a859d-ec2d-4512-9554-3a4e60782853/']
  metadata_path:                   /var/lib/clickhouse/store/e18/e18d3538-4c43-43d9-b083-4d8e0f390cf7/trips.sql
  storage_policy:                  s3_main
  formatReadableSize(total_bytes): 36.42 MiB

  1 row in set. Elapsed: 0.009 sec.
  ```

  ローカルディスク上のデータのサイズをチェックします。上記から、保存された百万行のサイズは36.42 MiBです。これはS3に保存されているはずで、ローカルディスクには保存されていません。上記のクエリは、ローカルディスクのデータとメタデータの保存場所も示します。ローカルデータを確認してください：
  ```response
  root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
  536K  /var/lib/clickhouse/disks/s3_disk/store/551
  ```

  各S3バケット内のS3データを確認します（合計は示されていませんが、挿入後、両方のバケットに約36 MiBが保存されています）：

<Image img={Bucket1} size="lg" border alt="Size of data in first S3 bucket showing storage usage metrics" />

<Image img={Bucket2} size="lg" border alt="Size of data in second S3 bucket showing storage usage metrics" />
## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/)は、Amazon S3内の新しい高パフォーマンスな単一アベイラビリティゾーンストレージクラスです。

こちらの[ブログ](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/)を参考にして、ClickHouseでのS3Expressテストについての経験をお読みいただけます。

:::note
  S3Expressはデータを単一のAZ内に保存します。これは、AZの障害が発生した場合、データは利用できなくなることを意味します。
:::
```
### S3ディスク {#s3-disk}

S3Expressバケットを使用してストレージをバックアップするテーブルを作成するには、以下のステップが必要です。

1. `Directory`タイプのバケットを作成します
2. S3ユーザーに必要なすべての権限を付与するための適切なバケットポリシーをインストールします（例えば、`"Action": "s3express:*"` は無制限のアクセスを単純に許可します）
3. ストレージポリシーを設定する際は、`region`パラメータを指定してください

ストレージ設定は通常のS3と同様で、以下のようになります。

``` sql
<storage_configuration>
    <disks>
        <s3_express>
            <type>s3</type>
            <endpoint>https://my-test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/store/</endpoint>
            <region>eu-north-1</region>
            <access_key_id>...</access_key_id>
            <secret_access_key>...</secret_access_key>
        </s3_express>
    </disks>
    <policies>
        <s3_express>
            <volumes>
                <main>
                    <disk>s3_express</disk>
                </main>
            </volumes>
        </s3_express>
    </policies>
</storage_configuration>
```

そして、新しいストレージ上にテーブルを作成します。

``` sql
CREATE TABLE t
(
    a UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY a
SETTINGS storage_policy = 's3_express';
```
### S3ストレージ {#s3-storage}

S3ストレージもサポートされていますが、`Object URL`パスのみ使用可能です。例：

``` sql
select * from s3('https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/file.csv', ...)
```

設定でバケットのリージョンを指定する必要もあります。

``` xml
<s3>
    <perf-bucket-url>
        <endpoint>https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com</endpoint>
        <region>eu-north-1</region>
    </perf-bucket-url>
</s3>
```
### バックアップ {#backups}

前述のディスクにバックアップを保存することが可能です。

``` sql
BACKUP TABLE t TO Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status─────────┐
│ c61f65ac-0d76-4390-8317-504a30ba7595 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

``` sql
RESTORE TABLE t AS t_restored FROM Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status───┐
│ 4870e829-8d76-4171-ae59-cffaf58dea04 │ RESTORED │
└──────────────────────────────────────┴──────────┘
```
