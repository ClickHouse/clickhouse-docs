---
'slug': '/integrations/s3'
'sidebar_position': 1
'sidebar_label': 'ClickHouse との S3 統合'
'title': 'ClickHouse との S3 統合'
'description': 'ClickHouse と S3 を統合する方法について説明したページ'
---

import BucketDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';
import Image from '@theme/IdealImage';

# S3とClickHouseの統合

S3からClickHouseにデータを挿入することができ、またS3をエクスポート先として使用することで、「データレイク」アーキテクチャとの相互作用を実現します。さらに、S3は「コールド」ストレージ層を提供し、ストレージと計算を分離するのに役立ちます。以下のセクションでは、ニューヨーク市のタクシーデータセットを使用して、S3とClickHouse間のデータ移動プロセスを示し、主要な構成パラメータを特定し、パフォーマンスを最適化するためのヒントを提供します。
## S3テーブル関数 {#s3-table-functions}

`s3`テーブル関数を使用すると、S3互換ストレージからファイルの読み書きができます。この構文の概要は以下の通りです：

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

ここで、

* path — ファイルへのパスを含むバケットURL。以下のワイルドカードを読み取り専用モードでサポートします：`*`、`?`、`{abc,def}` および `{N..M}`（ここで `N` と `M` は数値、`'abc'` と `'def'` は文字列）。詳細については、[パスにおけるワイルドカードの使用](/engines/table-engines/integrations/s3/#wildcards-in-path)のドキュメントを参照してください。
* format — ファイルの[フォーマット](/interfaces/formats#formats-overview)。
* structure — テーブルの構造。形式 `'column1_name column1_type, column2_name column2_type, ...'`。
* compression — パラメータはオプションです。サポートされる値：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。デフォルトでは、ファイル拡張子によって圧縮を自動検出します。

パス式でワイルドカードを使用することで、複数のファイルを参照し、並列処理の扉を開きます。
### 準備 {#preparation}

ClickHouseでテーブルを作成する前に、S3バケット内のデータを詳しく見ることをお勧めします。これは、`DESCRIBE`ステートメントを使用してClickHouseから直接行うことができます：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

`DESCRIBE TABLE`ステートメントの出力は、ClickHouseがこのデータをどのように自動的に推論するかを示します。S3バケットで表示された内容に留意してください。また、gzip圧縮形式を自動的に認識し、解凍することも確認してください：

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

私たちのS3ベースのデータセットと対話するために、標準の`MergeTree`テーブルを目的地として準備します。以下のステートメントは、デフォルトデータベースに`trips`という名前のテーブルを作成します。特に推論されたデータ型の一部を変更することに注意してください。特に、余分なストレージデータを引き起こす可能性のある[`Nullable()`](/sql-reference/data-types/nullable)データ型修飾子を使用しないことを選択しました：

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

`pickup_date`フィールドの[パーティショニング](/engines/table-engines/mergetree-family/custom-partitioning-key)の使用に注意してください。通常、パーティションキーはデータ管理用ですが、後でこのキーを使用してS3への書き込みを並列化します。

タクシーデータセット内の各エントリはタクシートリップを含みます。この匿名化されたデータは、S3バケットに圧縮された2000万件のレコードで構成されています。バケットは https://datasets-documentation.s3.eu-west-3.amazonaws.com/ で、フォルダは **nyc-taxi** です。データはTSV形式で、各ファイルに約100万行含まれています。
### S3からのデータ読み取り {#reading-data-from-s3}

S3データをソースとしてクエリし、ClickHouseの永続性を必要とせずに使用できます。以下のクエリでは、10行をサンプリングします。バケットが公開アクセス可能であるため、ここでは認証情報が不要です：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

`TabSeparatedWithNames`フォーマットは、最初の行にカラム名をエンコードしているため、カラムをリストする必要はないことに注意してください。他のフォーマット（例：`CSV`や`TSV`）は、このクエリに対して自動生成されたカラムを返します。例: `c1`、`c2`、`c3`など。

クエリは、バケットパスやファイル名に関する情報を提供する[仮想カラム](../sql-reference/table-functions/s3#virtual-columns)をサポートしています。例えば：

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

このサンプルデータセット内の行数を確認します。ファイル展開のためワイルドカードを使用しているため、すべての20ファイルを考慮します。このクエリは、ClickHouseインスタンスのコア数によって約10秒かかります：

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

これは、データのサンプリングや即席の探索的クエリを実行する際には便利ですが、S3からデータを直接読み取ることは定期的に行うべきではありません。真剣にデータを扱うときは、データをClickHouseの`MergeTree`テーブルにインポートします。
### clickhouse-localの使用 {#using-clickhouse-local}

`clickhouse-local`プログラムを使用すると、ClickHouseサーバーをデプロイおよび構成せずにローカルファイルの高速処理を行うことができます。`s3`テーブル関数を使用するクエリは、このユーティリティを使って実行できます。例えば：

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```
### S3からのデータ挿入 {#inserting-data-from-s3}

ClickHouseの機能を最大限に活用するために、次にデータを読み取り、インスタンスに挿入します。これを達成するために、`s3`関数とシンプルな`INSERT`ステートメントを組み合わせます。ターゲットテーブルが必要な構造を提供するため、カラムをリストする必要はありません。カラムは`SELECT`句の位置に従ってマッピングされます。10M行の挿入には数分かかる場合がありますが、下の例では即時の応答を得るために100万行を挿入します。必要に応じて、`LIMIT`句やカラム選択を調整して部分インポートを行います：

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```
### ClickHouse Localを使用したリモート挿入 {#remote-insert-using-clickhouse-local}

ネットワークセキュリティポリシーにより、ClickHouseクラスターが外向き接続を行えない場合、`clickhouse-local`を使用してS3データを挿入することができます。以下の例では、S3バケットから読み取り、`remote`関数を使用してClickHouseに挿入します：

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
これを安全なSSL接続で実行するには、`remoteSecure`関数を利用してください。
:::
### データのエクスポート {#exporting-data}

`s3`テーブル関数を使用してS3にファイルを書き込むことができます。これには適切な権限が必要です。リクエスト内で必要な認証情報を渡しますが、詳細については[認証情報の管理](#managing-credentials)ページを参照してください。

単純な例では、テーブル関数をソースではなく目的地として使用します。ここでは、`trips`テーブルからバケットに10000行をストリーミングし、`lz4`圧縮および出力タイプとして`CSV`を指定します：

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

ここで、ファイルの形式は拡張子から推測されることに注意してください。また、`s3`関数内でカラムを指定する必要はありません。これも`SELECT`から推測されます。
### 大きなファイルを分割する {#splitting-large-files}

データを単一のファイルとしてエクスポートすることはほとんどないでしょう。ClickHouseを含むほとんどのツールは、並列処理の可能性により、複数のファイルに対して読み書きすることでより高いスループットパフォーマンスを達成します。`INSERT`コマンドを複数回実行し、データのサブセットをターゲットにすることができます。ClickHouseは、`PARTITION`キーを使用してファイルを自動的に分割する手段を提供します。

以下の例では、`rand()`関数の剰余を使用して10ファイルを作成します。結果のパーティションIDがファイル名に参照されていることに注意してください。これにより、数値の接尾辞を持つ10ファイル（例：`trips_0.csv.lz4`, `trips_1.csv.lz4`など）が生成されます：

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

あるいは、データ内のフィールドを参照することもできます。このデータセットの場合、`payment_type`が自然なパーティショニングキーを提供し、その基数は5です。

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
### クラスターの利用 {#utilizing-clusters}

上記の関数はすべて単一ノードでの実行に制限されています。読み取り速度はCPUコアとともに線形にスケールし、他のリソース（通常はネットワーク）が飽和するまで、ユーザーは垂直にスケールすることができます。しかし、このアプローチには限界があります。ユーザーは、`INSERT INTO SELECT`クエリを実行する際に分散テーブルに挿入することでリソース圧力を軽減できますが、依然として単一ノードがデータを読み込み、解析し、処理しています。この課題に対処し、読み取りを水平方向にスケールするために、[s3Cluster](/sql-reference/table-functions/s3Cluster.md)関数があります。

クエリを受け取ったノード（イニシエーター）は、クラスタ内のすべてのノードへの接続を作成します。どのファイルを読み取る必要があるかを決定するためにグロブパターンが解決され、一連のファイルに展開されます。イニシエーターは、クラスタ内のノードにファイルを配布します。これらのノードは、読み取りを完了するたびに処理するファイルを要求します。このプロセスにより、読み取りを水平方向にスケールすることができます。

`s3Cluster`関数は、単一ノードバリアントと同じ形式を取り、ただしターゲットクラスタを指定する必要があります：

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

* `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスタの名前。
* `source` — ファイルまたはファイルのグループへのURL。以下のワイルドカードを読み取り専用モードでサポートします：`*`、`?`、`{'abc','def'}` および `{N..M}`（ここで N, M は数値、abc, def は文字列）。詳細は[パスにおけるワイルドカード](/engines/table-engines/integrations/s3.md/#wildcards-in-path)を参照してください。
* `access_key_id` および `secret_access_key` — 指定されたエンドポイントで使用するための認証情報を指定するキー。オプションです。
* `format` — ファイルの[フォーマット](/interfaces/formats#formats-overview)。
* `structure` — テーブルの構造。形式 'column1_name column1_type, column2_name column2_type, ...'。

`s3`関数と同様に、バケットが安全でない場合、または環境を通じてセキュリティを定義する場合（例：IAMロール）、認証情報はオプションです。しかし、22.3.1以降、`s3Cluster`関数では構造をリクエスト内で指定する必要があります。すなわち、スキーマは推測されません。

この関数は、ほとんどの場合`INSERT INTO SELECT`の一部として使用されます。この場合、ユーザーは分散テーブルに挿入することがよくあります。以下に、`trips_all`が分散テーブルである簡単な例を示します。このテーブルは`events`クラスタを使用していますが、読み込みと書き込みに使用されるノードの一貫性は必須ではありません：

```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

挿入はイニシエーターノードに対して発生します。これは、各ノードで読み取る一方で、結果の行がイニシエーターにルーティングされて配布されることを意味します。高スループットのシナリオでは、これがボトルネックとなる可能性があります。これに対処するために、`s3cluster`関数のための[parallel_distributed_insert_select](/operations/settings/settings/#parallel_distributed_insert_select)パラメータを設定してください。
## S3テーブルエンジン {#s3-table-engines}

`s3`関数はS3に保存されたデータに対して即席クエリを実行することを可能にしますが、構文が冗長です。`S3`テーブルエンジンを使用すると、バケットのURLや認証情報を何度も指定する必要がなくなります。これに対処するために、ClickHouseはS3テーブルエンジンを提供しています。

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

* `path` — ファイルへのパスを含むバケットURL。以下のワイルドカードを読み取り専用モードで支援：`*`、`?`、`{abc,def}` および `{N..M}`（ここで N, M は数値、'abc'、'def' は文字列）。詳細については[こちら](/engines/table-engines/integrations/s3#wildcards-in-path)を参照してください。
* `format` — ファイルの[フォーマット](/interfaces/formats#formats-overview)。
* `aws_access_key_id`, `aws_secret_access_key` - AWSアカウントユーザーの長期的な認証情報。これを使用してリクエストを認証できます。このパラメータはオプションです。認証情報が指定されていない場合、構成ファイルでの値が使用されます。詳細は[認証情報の管理](#managing-credentials)を参照してください。
* `compression` — 圧縮タイプ。サポートされる値：none、gzip/gz、brotli/br、xz/LZMA、zstd/zst。このパラメータはオプションです。デフォルトでは、ファイル拡張子によって圧縮を自動検出します。
### データの読み取り {#reading-data}

以下の例では、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/`バケット内の最初の10個のTSVファイルを使用して、`trips_raw`という名のテーブルを作成します。これらはそれぞれ100万行を含みます：

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

最初の10ファイルに制限するために`{0..9}`パターンを使用していることに注意してください。一度作成されると、このテーブルは他のテーブルと同様にクエリできます：

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

`S3`テーブルエンジンは並列読み取りをサポートしています。テーブル定義にグロブパターンが含まれていない場合、書き込みのみがサポートされます。したがって、上記のテーブルは書き込みをブロックします。

書き込みを示すために、書き込み可能なS3バケットを指すテーブルを作成します：

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

行は新しいファイルにのみ挿入できることに注意してください。マージサイクルやファイル分割操作はありません。ファイルが書き込まれると、その後の挿入は失敗します。ユーザーには以下の2つのオプションがあります：

* 設定 `s3_create_new_file_on_insert=1`を指定してください。これにより、各挿入時に新しいファイルが作成されます。各挿入操作のたびに、数値の接尾辞が各ファイルの末尾に追加されます。上記の例では、次回の挿入により、`trips_1.bin`ファイルが作成されます。
* 設定 `s3_truncate_on_insert=1`を指定してください。これにより、ファイルが切り詰められ、つまり完了後は新たに挿入された行のみが含まれることになります。

これらの設定はデフォルトで0になります。したがって、ユーザーはそのいずれかを設定する必要があります。両方が設定されている場合は、`s3_truncate_on_insert`が優先されます。

`S3`テーブルエンジンに関するいくつかの注意点：

- 従来の`MergeTree`ファミリテーブルとは異なり、`S3`テーブルを削除しても、基になるデータは削除されません。
- このテーブルタイプの完全な設定は[こちら](/engines/table-engines/integrations/s3.md/#settings)で確認できます。
- このエンジンを使用する際に注意すべき点は以下の通りです：
    * ALTERクエリはサポートされていません
    * SAMPLE操作はサポートされていません
    * プライマリーまたはスキップのインデックスという概念はありません。
## 認証情報の管理 {#managing-credentials}

前の例では、`s3`関数または`S3`テーブル定義内に認証情報を渡しました。これは、稀に使用される場合には受け入れられるかもしれませんが、プロダクションではユーザーには明示的な認証メカニズムが求められる必要があります。これに対処するために、ClickHouseは複数のオプションを提供しています。

* **config.xml**または**conf.d**の下にある同等の設定ファイルに接続の詳細を指定します。デビアンパッケージを使用したインストールを前提とした例ファイルの内容は以下の通りです。

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

    これらの認証情報は、上記のエンドポイントがリクエストされたURLの正確な接頭辞一致である場合、任意のリクエストに使用されます。また、この例では、アクセスキーおよびシークレットキーの代替として認証ヘッダーを宣言する能力に注意してください。サポートされている設定の完全なリストは[こちら](/engines/table-engines/integrations/s3.md/#settings)で確認できます。

* 上記の例は、設定パラメータ `use_environment_credentials`の使用可能性を強調しています。この設定パラメータは、`s3`レベルでグローバルに設定することもできます：

    ```xml
    <clickhouse>
        <s3>
        <use_environment_credentials>true</use_environment_credentials>
        </s3>
    </clickhouse>
    ```

    この設定は、環境からS3の認証情報を取得しようとする試みをオンにし、IAMロールを介してアクセス可能にします。具体的には、以下の取得順に従って実施されます：

   * 環境変数 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`および `AWS_SESSION_TOKEN` の検索
   * **$HOME/.aws**におけるチェック
   * AWSセキュリティトークンサービスを通じて取得された一時的な認証情報 - すなわち [`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) APIを介して。
   * ECS環境変数 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` または `AWS_CONTAINER_CREDENTIALS_FULL_URI` および `AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN`での認証情報のチェック。
   * これらの認証情報の取得は、[AWS EC2インスタンスメタデータ](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-metadata.html)を介して行われ、[AWS_EC2_METADATA_DISABLED](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list-AWS_EC2_METADATA_DISABLED)がtrueに設定されていない場合。

   同様の設定を特定のエンドポイントに対して、同じ接頭辞一致ルールを使用して設定することもできます。
## パフォーマンスの最適化 {#s3-optimizing-performance}

S3関数を使用した読み取りおよび挿入の最適化方法については、[専用のパフォーマンスガイド](./performance.md)を参照してください。
### S3ストレージの調整 {#s3-storage-tuning}

内部的に、ClickHouseのマージツリーは、[`Wide`および`Compact`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)の2つの主要ストレージフォーマットを使用します。現在の実装は、ClickHouseのデフォルトの動作（設定 `min_bytes_for_wide_part` と `min_rows_for_wide_part` を通じて制御される）を使用していますが、将来的なリリースでは、S3のために動作が異なることが予想されます。例えば、`min_bytes_for_wide_part`のデフォルト値が大きくなり、より`Compact`形式を推奨し、結果としてファイル数が少なくなることが期待されます。ユーザーは、専らS3ストレージを使用する場合にこれらの設定を調整することを望むかもしれません。
## S3バックにあるMergeTree {#s3-backed-mergetree}

`s3`関数と関連するテーブルエンジンにより、ユーザーはClickHouseの慣れ親しんだ構文を用いてS3内のデータをクエリできます。しかし、データ管理機能やパフォーマンスに関しては、限界があります。プライマリーインデックスのサポートはなく、キャッシュサポートもありません。ファイルの挿入はユーザーによって管理する必要があります。

ClickHouseは、S3が特に「コールド」データに対するクエリパフォーマンスがそれほど重要ではない状況で、ストレージソリューションとして魅力的であり、ユーザーがストレージと計算を分離することを望んでいることを認識しています。この実現を支援するために、MergeTreeエンジンのストレージとしてS3を使用するサポートが提供されます。これにより、ユーザーはS3のスケーラビリティとコストの利点を活用し、MergeTreeエンジンの挿入およびクエリパフォーマンスを享受できます。
### ストレージ層 {#storage-tiers}

ClickHouseストレージボリュームは、物理ディスクをMergeTreeテーブルエンジンから抽象化できます。単一のボリュームは、順序付きのディスクセットで構成されることがあります。データストレージのために複数のブロックデバイスを潜在的に使用できることを主に許可するこの抽象化は、S3などの他のストレージタイプも許可します。ClickHouseのデータパーツは、ストレージポリシーに応じてボリューム間で移動され、充填率が管理され、これによりストレージ層の概念が作成されます。

ストレージ層は、最近のデータをホットコールドアーキテクチャで解除し、通常は最も多くクエリされるデータが高性能ストレージ（例：NVMe SSD）にわずかな空間を必要とすることを可能にします。データが古くなるにつれて、クエリタイムのSLAが増加し、クエリの頻度も高くなります。このデータのファットテールは、HDDやS3などのオブジェクトストレージのような遅い、性能が低いストレージに保存できます。
```
### ディスクの作成 {#creating-a-disk}

S3バケットをディスクとして利用するには、まずClickHouseの設定ファイルにそれを宣言する必要があります。config.xmlを拡張するか、preferably conf.dの下に新しいファイルを提供してください。以下にS3ディスク宣言の例を示します。

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

このディスク宣言に関連する設定の完全なリストは[こちら](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)で確認できます。資格情報は、[資格情報の管理](#managing-credentials)で説明されているのと同じアプローチを使用してここで管理できます。すなわち、上記の設定ブロックでuse_environment_credentialsをtrueに設定することでIAMロールを使用できます。

### ストレージポリシーの作成 {#creating-a-storage-policy}

設定が完了すると、この「ディスク」はポリシー内で宣言されたストレージボリュームで使用できます。以下の例では、s3が唯一のストレージであると仮定します。これは、TTLや充填率に基づいてデータを移動できるより複雑なホットコールドアーキテクチャを無視しています。

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

ディスクに書き込みアクセスのあるバケットを使用するように設定されている場合、以下の例のようなテーブルを作成できるはずです。簡潔さを持たせるために、NYCタクシーのカラムのサブセットを使用し、データを直接s3バックテーブルにストリーミングします。

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

ハードウェアによっては、この1m行の挿入に数分かかる場合があります。進捗はsystem.processesテーブルを介して確認できます。行数を最大10mまで調整し、いくつかのサンプルクエリを試してください。

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_s3 GROUP BY passenger_count;
```

### テーブルの変更 {#modifying-a-table}

ユーザーは特定のテーブルのストレージポリシーを変更する必要がある場合があります。これは可能ですが、制限があります。新しいターゲットポリシーには、以前のポリシーのすべてのディスクとボリュームが含まれている必要があります。すなわち、ポリシーの変更を満たすためにデータは移行されないということです。これらの制約を検証する際には、ボリュームとディスクは名前で識別され、違反しようとするとエラーが発生します。ただし、前の例を使用していると仮定すると、以下の変更は有効です。

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

ここでは、新しいs3_tieredポリシーにメインボリュームを再利用し、新しいホットボリュームを導入します。これは、`<path>`パラメーターを介して設定された1つのディスクで構成されたデフォルトディスクを使用しています。ボリューム名とディスクは変更されません。新たにテーブルに挿入されるものは、デフォルトディスクに残り、そのサイズがmove_factor * disk_sizeに達した時点でデータはS3へ移動されます。

### レプリケーションの処理 {#handling-replication}

S3ディスクとのレプリケーションは、`ReplicatedMergeTree`テーブルエンジンを使用することで実現できます。詳細については[二つのAWSリージョンにまたがる単一シャードをS3オブジェクトストレージで複製する](#s3-multi-region)ガイドを参照してください。

### 読み書き {#read--writes}

以下のノートは、ClickHouseとS3のインタラクションの実装に関するものです。一般的には情報提供を目的としていますが、[パフォーマンスの最適化](#s3-optimizing-performance)を行う際に読者に役立つかもしれません：

* デフォルトでは、クエリ処理パイプラインの任意のステージで使用される最大クエリ処理スレッド数は、コアの数と等しくなっています。一部のステージは他のステージよりも並行処理が可能であるため、この値は上限を提供します。複数のクエリステージは同時に実行される場合があります。データはディスクからストリームされるため、クエリに使用されるスレッド数はこの上限を超える可能性があります。[max_threads](/operations/settings/settings#max_threads)の設定を通じて変更してください。
* S3からの読み取りはデフォルトで非同期です。この動作は、`remote_filesystem_read_method`を設定することで決まります。デフォルトではこの値は`threadpool`に設定されています。リクエストを処理する際、ClickHouseはグラニュールをストライプで読み取ります。これらのストライプは多くのカラムを含む可能性があります。スレッドはそれぞれのグラニュールのカラムを一つずつ読み取ります。この処理は同期的には行われず、データを待つ前にすべてのカラムのプレフェッチが行われます。これにより、各カラムに対する同期的待機よりも大幅なパフォーマンス向上が得られます。ほとんどの場合、この設定を変更する必要はありません - [最適化パフォーマンス](#s3-optimizing-performance)を参照してください。
* 書き込みは並行して行われ、最大100の同時ファイル書き込みスレッドがあります。`max_insert_delayed_streams_for_parallel_write`はデフォルトで1000の値に設定されており、並行して書き込まれるS3ブロブの数を制御します。各ファイルの書き込みにはバッファが必要で（約1MB）、これによりINSERTのメモリ消費が効果的に制限されます。サーバーのメモリが少ないシナリオでは、この値を下げるのが適切かもしれません。

## ClickHouse用にS3オブジェクトストレージをディスクとして使用する {#configuring-s3-for-clickhouse-use}

バケットとIAMロールを作成するためのステップバイステップの指示が必要な場合は、**S3バケットとIAMロールの作成**を展開し、手順に従ってください：

<BucketDetails />
### S3バケットをディスクとして使用するようにClickHouseを設定する {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}
以下の例は、デフォルトのClickHouseディレクトリでサービスとしてインストールされたLinux Debパッケージに基づいています。

1.  ClickHouseの`config.d`ディレクトリに新しいファイルを作成して、ストレージ設定を保存します。
```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```
2. ストレージ設定のために、先ほどの手順からバケットパス、アクセスキー、およびシークレットキーに置き換えた以下を追加します。
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
`<disks>`タグ内の`s3_disk`および`s3_cache`タグは任意のラベルです。これらは他の名前に設定できますが、`<policies>`タブ内の`<disk>`タブで同じラベルを使用してディスクを参照しなければなりません。
`<S3_main>`タグも任意で、ClickHouseでリソースを作成する際に参照されるストレージターゲットの識別子として使用されるポリシーの名前となります。

上記の設定は、ClickHouseバージョン22.8以上用です。古いバージョンを使用している場合は、[データを保存する](/operations/storing-data.md/#using-local-cache)ドキュメントを参照してください。

S3を使用するための詳細については：
統合ガイド: [S3バックのMergeTree](#s3-backed-mergetree)
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
1. ClickHouseクライアントにログインします。以下のようにします。
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

3. テーブルが正しいポリシーで作成されたことを示します。
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
6. AWSコンソールで、バケットに移動し、新しいバケットとフォルダーを選択します。
以下のようなものが表示されるはずです。

<Image img={S3J} size="lg" border alt="S3 bucket view in AWS console showing ClickHouse data files stored in S3" />
## S3オブジェクトストレージを使用して単一のシャードを二つのAWSリージョンで複製する {#s3-multi-region}

:::tip
ClickHouse Cloudではデフォルトでオブジェクトストレージが使用されます。ClickHouse Cloudで実行している場合、この手順を実行する必要はありません。
:::
### 配備の計画 {#plan-the-deployment}
このチュートリアルは、AWS EC2上の二つのClickHouse Serverノードと三つのClickHouse Keeperノードをスピーディに展開することに基づいています。ClickHouseサーバーのデータストアはS3です。それぞれのリージョンにClickHouse ServerとS3バケットが1つ用意されており、災害復旧をサポートします。

ClickHouseテーブルは、二つのサーバー間で複製され、したがって二つのリージョン acrossで複製されます。
### ソフトウェアのインストール {#install-software}
#### ClickHouseサーバーノード {#clickhouse-server-nodes}
ClickHouseサーバーノードに対するデプロイメント手順を実行する際は、[インストール手順](/getting-started/install/install.mdx)を参照してください。
#### ClickHouseをデプロイする {#deploy-clickhouse}

二つのホストにClickHouseをデプロイします。このサンプル設定ではこれらは`chnode1`と`chnode2`と呼ばれています。

`chnode1`を一つのAWSリージョンに配置し、`chnode2`を第二のリージョンに配置します。
#### ClickHouse Keeperをデプロイする {#deploy-clickhouse-keeper}

三つのホストにClickHouse Keeperをデプロイします。このサンプル設定では、これらは`keepernode1`、`keepernode2`、および`keepernode3`と呼ばれています。 `keepernode1`は`chnode1`と同じリージョンにデプロイできます、`keepernode2`は`chnode2`と一緒に、そして`keepernode3`はどちらのリージョンにもデプロイできますが、そのリージョンのClickHouseノードとは異なる可用性ゾーンになります。

ClickHouse Keeperノードのデプロイメント手順を実行する際には[インストール手順](/getting-started/install/install.mdx)を参照してください。
### S3バケットを作成する {#create-s3-buckets}

二つのS3バケットを作成します。一つは`chnode1`が配置されているリージョンに、もう一つは`chnode2`が配置されているリージョンに作成します。

バケットとIAMロールを作成するためのステップバイステップの指示が必要な場合は、**S3バケットとIAMロールの作成**を展開し、手順に従ってください：

<BucketDetails />

その後、設定ファイルは`/etc/clickhouse-server/config.d/`に配置されます。このバケットのためのサンプル設定ファイルは以下の通りで、もう一つは、三つのハイライトされた行が異なる類似のものです。

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
このガイドの多くのステップでは、`/etc/clickhouse-server/config.d/`に設定ファイルを配置するように求められます。これはLinuxシステムで設定上書きファイルのデフォルトの場所です。これらのファイルをそのディレクトリに置くと、ClickHouseはコンテンツを使用してデフォルトの設定を上書きします。これらのファイルを上書きディレクトリに配置することで、アップグレード中に設定が失われるのを避けることができます。
:::
### ClickHouse Keeperを設定する {#configure-clickhouse-keeper}

ClickHouse Keeperをスタンドアロンで実行する（ClickHouseサーバーとは別に）場合の設定は、単一のXMLファイルです。このチュートリアルでは、ファイルは`/etc/clickhouse-keeper/keeper_config.xml`です。すべての三つのKeeperサーバーは、以下の例のように同じ設定を使用しますが、1つの設定が異なります；`<server_id>`です。

`server_id`は、設定ファイルが使用されるホストに割り当てるIDを示します。以下の例では、`server_id`は`3`で、ファイル内の`<raft_configuration>`セクションも見てみると、サーバー3にホスト名`keepernode3`が指定されています。これがClickHouse Keeperプロセスがリーダーを選択する際にどのサーバーに接続するかを知る方法です。

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

ClickHouse Keeperの設定ファイルをコピーします（`<server_id>`を設定するのを忘れずに）：
```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```
### ClickHouseサーバーを設定する {#configure-clickhouse-server}
#### クラスターの定義 {#define-a-cluster}

ClickHouseのクラスターは、設定ファイルの`<remote_servers>`セクションで定義されます。このサンプルでは、`cluster_1S_2R`という1つのクラスターが定義されており、これは一つのシャードと二つのレプリカで構成されています。レプリカは、ホスト`chnode1`と`chnode2`に位置しています。

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

クラスターを使用する際は、DDLクエリにクラスター、シャード、およびレプリカの設定を埋め込むためのマクロを定義すると便利です。このサンプルでは、`shard`および`replica`の詳細を提供せずにレプリケーテッドテーブルエンジンを使用することを指定できます。テーブルを作成すると、`shard`と`replica`のマクロが`system.tables`をクエリすることでどのように使用されるかを見ることができます。

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
上記のマクロは`chnode1`用のものです。`chnode2`では`replica`を`replica_2`に設定してください。
:::
#### ゼロコピーのレプリケーションを無効にする {#disable-zero-copy-replication}

ClickHouseバージョン22.7以下では、`allow_remote_fs_zero_copy_replication`設定は、デフォルトでS3およびHDFSディスクに対して`true`に設定されています。この設定は、この災害復旧シナリオでは`false`に設定する必要があります。バージョン22.8以降では、デフォルトで`false`に設定されています。

この設定は以下の二つの理由から`false`にする必要があります。1) この機能は製品版ではない。2) 災害復旧シナリオでは、データとメタデータの両方を複数のリージョンに保存する必要があります。`allow_remote_fs_zero_copy_replication`を`false`に設定します。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

ClickHouse Keeperは、ClickHouseノード間でのデータのレプリケーションを調整する責任があります。ClickHouseにClickHouse Keeperノードを伝えるために、各ClickHouseノードに設定ファイルを追加します。

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

AWSでサーバーが互いに通信できるようにするためのセキュリティ設定を構成する際は、[ネットワークポート](../../../guides/sre/network-ports.md)リストを確認してください。

すべての三つのサーバーは、ネットワーク接続をリッスンしてできるようにする必要があります。それにより、サーバー間とS3との通信が行われます。ClickHouseはデフォルトではループバックアドレス上でのみリッスンするため、これを変更する必要があります。これらの設定は`/etc/clickhouse-server/config.d/`に構成されます。以下は、ClickHouseとClickHouse KeeperがすべてのIP v4インターフェースでリッスンするように設定するサンプルです。詳細については、ドキュメントまたはデフォルト設定ファイル`/etc/clickhouse/config.xml`を参照してください。

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```
### サーバーの起動 {#start-the-servers}
#### ClickHouse Keeperを実行する {#run-clickhouse-keeper}

各Keeperサーバーで、オペレーティングシステムに応じてコマンドを実行します。例：

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```
#### ClickHouse Keeperのステータスを確認する {#check-clickhouse-keeper-status}

`netcat`を使ってClickHouse Keeperにコマンドを送ります。例えば、`mntr`はClickHouse Keeperクラスターの状態を返します。各Keeperノードでこのコマンドを実行すると、1つがリーダーであり、他の2つがフォロワーであることがわかります。

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
#### ClickHouseサーバーを実行する {#run-clickhouse-server}

各ClickHouseサーバーで実行します。

```bash
sudo service clickhouse-server start
```
#### ClickHouseサーバーを確認する {#verify-clickhouse-server}

[クラスター設定](#define-a-cluster)を追加した際に、二つのClickHouseノードにまたがる単一シャードが複製されるようになりました。この確認ステップでは、ClickHouseが起動した時にクラスタが構築されたことを確認し、そのクラスターを使用して複製されたテーブルを作成します。
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

- `ReplicatedMergeTree`テーブルエンジンを使用してクラスター内にテーブルを作成します：
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
- 先に定義されたマクロの使用を理解する

  マクロ `shard` と `replica` は[前述の通り](#define-a-cluster)で定義されており、ハイライトされた行でクリックハウスノードごとに値が置き換えられるのがわかります。さらに、値 `uuid` が使用されます。`uuid` はシステムによって生成されるため、マクロには定義されません。
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
  上記に示されるzookeeperのパス`'clickhouse/tables/{uuid}/{shard}`は、`default_replica_path`および`default_replica_name`を設定することでカスタマイズできます。詳細は[こちら](/operations/server-configuration-parameters/settings.md/#default_replica_path)をご覧ください。
  :::
### テスト {#testing-1}

これらのテストは、データが二つのサーバー間で複製されていること、そしてそれがローカルディスクではなくS3バケットに格納されていることを確認します。

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

  このクエリはディスク上のデータのサイズと、どのディスクが使用されるかを決定するポリシーを表示します。
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

  ローカルディスク上のデータのサイズを確認します。上記から、保存されたミリオンズ行のディスク上のサイズは36.42 MiBです。これはS3に保存されているはずで、ローカルディスクには保存されていません。このクエリは、ローカルディスクでデータとメタデータが保存されている場所も教えてくれます。ローカルデータを確認します：
  ```response
  root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
  536K  /var/lib/clickhouse/disks/s3_disk/store/551
  ```

  各S3バケット内のS3データを確認します（合計は表示されませんが、両方のバケットには約36 MiBが保存されるはずです）。

<Image img={Bucket1} size="lg" border alt="Size of data in first S3 bucket showing storage usage metrics" />

<Image img={Bucket2} size="lg" border alt="Size of data in second S3 bucket showing storage usage metrics" />
## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/)は、Amazon S3の新しい高性能シングルアベイラビリティゾーンストレージクラスです。

この[ブログ](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/)では、ClickHouseでのS3Expressテストについての私たちの経験を読めます。

:::note
  S3Expressは、単一のAZ内にデータを保存します。つまり、AZの停止の場合、データが利用できなくなります。
:::
### S3ディスク {#s3-disk}

S3Expressバケットでストレージをサポートするテーブルを作成するには、以下の手順が必要です。

1. `Directory`タイプのバケットを作成します。
2. S3ユーザーに必要なすべての権限を付与するために適切なバケットポリシーをインストールします（例えば、 `"Action": "s3express:*"` を指定して無制限のアクセスを許可する）。
3. ストレージポリシーを設定する際には、`region` パラメータを指定してください。

ストレージ構成は通常のS3と同じで、例えば次のようになります。

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

その後、新しいストレージにテーブルを作成します。

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

S3ストレージもサポートされていますが、`Object URL`パスのみ対応しています。例：

``` sql
select * from s3('https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/file.csv', ...)
```

設定ではバケットのリージョンも指定する必要があります。

``` xml
<s3>
    <perf-bucket-url>
        <endpoint>https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com</endpoint>
        <region>eu-north-1</region>
    </perf-bucket-url>
</s3>
```
### バックアップ {#backups}

上記で作成したディスクにバックアップを保存することが可能です。

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
